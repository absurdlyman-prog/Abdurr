import { useRef, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { storage } from '../utils/storage';

async function callOpenAI(apiKey, imageBase64) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a pharmacy OCR assistant. Extract every medication from the prescription image. ' +
            'Respond ONLY with minified JSON of shape: ' +
            '{"medications":[{"name":"<generic or brand>","strength":"<e.g. 500 mg>","dose":"<if written>","frequency":"<if written>"}]}. ' +
            'If none detected, return {"medications":[]}. No extra prose.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract medications from this prescription.' },
            { type: 'image_url', image_url: { url: imageBase64 } },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 600,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error('OpenAI request failed (' + res.status + ') ' + errText);
  }
  const json = await res.json();
  const text = json.choices?.[0]?.message?.content || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed.medications) ? parsed.medications : [];
  } catch {
    return [];
  }
}

export default function ScanModal() {
  const { t, showScan, setShowScan, setQuery } = useApp();
  const [apiKey, setApiKey] = useState(() => storage.getApiKey());
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meds, setMeds] = useState([]);
  const inputRef = useRef(null);

  if (!showScan) return null;

  const close = () => {
    setShowScan(false);
    setPreview(null); setMeds([]); setError(null); setLoading(false);
  };

  const handleFile = (f) => {
    if (!f) return;
    setMeds([]);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const analyze = async () => {
    setError(null);
    setMeds([]);
    if (!apiKey) { setError('API key required.'); return; }
    if (!preview) return;
    storage.setApiKey(apiKey);
    setLoading(true);
    try {
      const out = await callOpenAI(apiKey, preview);
      if (out.length === 0) setError(t.scan.error);
      setMeds(out);
    } catch (err) {
      setError(err.message || t.scan.error);
    } finally {
      setLoading(false);
    }
  };

  const pickFromMed = (name) => {
    setQuery(name);
    close();
  };

  return (
    <div className="modal-backdrop no-print" onClick={close}>
      <div className="modal modal--lg" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="modal-head">
          <div>
            <h2 className="modal-title">{t.scan.title}</h2>
            <p className="modal-sub">{t.scan.subtitle}</p>
          </div>
          <button className="icon-btn" onClick={close} aria-label={t.scan.close}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="modal-body">
          <div className="field">
            <label className="field-label">{t.scan.apiKey}</label>
            <input
              type="password"
              className="input"
              placeholder="sk-…"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="field-hint">{t.scan.apiKeyHint}</p>
          </div>

          <div
            className={'dropzone' + (preview ? ' dropzone--has' : '')}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
            role="button"
            tabIndex={0}
          >
            {preview ? (
              <img src={preview} alt="Prescription preview" className="dropzone-preview" />
            ) : (
              <div className="dropzone-empty">
                <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="M17 8l-5-5-5 5" /><path d="M12 3v12" />
                </svg>
                <p>{t.scan.dropzone}</p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          <div className="modal-actions">
            <button
              className="btn btn--primary"
              onClick={analyze}
              disabled={!preview || !apiKey || loading}
            >
              {loading ? t.scan.analyzing : t.scan.analyze}
            </button>
          </div>

          {error && <div className="alert alert--error">{error}</div>}

          {meds.length > 0 && (
            <div className="scan-meds">
              <h4 className="scan-meds-title">{t.scan.detected}</h4>
              <ul className="scan-meds-list">
                {meds.map((m, i) => (
                  <li key={i} className="scan-med">
                    <div className="scan-med-info">
                      <div className="scan-med-name">{m.name || '—'}</div>
                      <div className="scan-med-meta">
                        {[m.strength, m.dose, m.frequency].filter(Boolean).join(' · ') || '—'}
                      </div>
                    </div>
                    <button
                      className="btn btn--outline btn--sm"
                      onClick={() => pickFromMed(m.name)}
                      disabled={!m.name}
                    >
                      {t.scan.useAsSearch}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
