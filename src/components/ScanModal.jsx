import { useState, useRef, useMemo } from 'react';
import { useDrugData } from '../contexts/DrugDataContext';
import { matchPrescription } from '../utils/prescriptionMatch';

const EXTRACT_PROMPT = `You are a pharmacy assistant reading a medical prescription image.
Extract EVERY prescribed medication. For each one provide:
- genericName: the active ingredient(s). If only a brand/trade name is written, give the generic name if you are confident, otherwise repeat the brand name.
- strength: the dose with units exactly as written, e.g. "500 mg", "250 mg/5 ml", "1 g".
- form: the dosage form if stated (tablet, capsule, syrup, injection, drops, cream...). Empty string if not stated.
- quantity: the number prescribed if written, otherwise an empty string.
Return ONLY valid JSON in this exact shape, with no markdown fences and no commentary:
{"medications":[{"genericName":"","strength":"","form":"","quantity":""}]}
If a field is unreadable, use an empty string. Do not invent doses.`;

function dispenseBadge(mode) {
  const m = (mode || '').toLowerCase();
  if (m.includes('controlled') || m.includes('narcotic')) return { label: mode || 'Controlled', cls: 'badge-controlled' };
  if (m.includes('prescription')) return { label: 'Prescription Only', cls: 'badge-prescription' };
  if (m.includes('counter') || m.includes('otc')) return { label: 'OTC', cls: 'badge-otc' };
  return { label: mode || '—', cls: 'badge-default' };
}

/* One prescribed medication: editable fields + ranked packages to dispense. */
function MedicationResult({ med, index, onChange, onPick }) {
  const { drugs } = useDrugData();

  const matches = useMemo(
    () => matchPrescription(drugs, med),
    [drugs, med],
  );

  const best = matches[0];
  const others = matches.slice(1);
  const noExact = best && !best.exactStrength;

  return (
    <div className="rx-med">
      <div className="rx-med-head">
        <span className="rx-med-index">{index + 1}</span>
        <div className="rx-fields">
          <label className="rx-field">
            <span className="rx-field-label">Generic</span>
            <input className="rx-field-input" value={med.genericName}
              onChange={(e) => onChange({ ...med, genericName: e.target.value })} placeholder="active ingredient" />
          </label>
          <label className="rx-field rx-field--sm">
            <span className="rx-field-label">Strength</span>
            <input className="rx-field-input" value={med.strength}
              onChange={(e) => onChange({ ...med, strength: e.target.value })} placeholder="e.g. 500 mg" />
          </label>
          <label className="rx-field rx-field--sm">
            <span className="rx-field-label">Form</span>
            <input className="rx-field-input" value={med.form}
              onChange={(e) => onChange({ ...med, form: e.target.value })} placeholder="tablet" />
          </label>
        </div>
      </div>

      {!best ? (
        <div className="rx-none">
          No formulary match for <strong>{med.genericName || 'this medication'}</strong>. Check the spelling above.
        </div>
      ) : (
        <>
          <div className="rx-dispense-label">
            ✅ Dispense
            {noExact && <span className="rx-warn">no exact-dose match — closest shown</span>}
          </div>

          <DispenseRow cand={best} recommended onPick={onPick} />

          {others.length > 0 && (
            <details className="rx-alts">
              <summary>{others.length} other option{others.length > 1 ? 's' : ''}</summary>
              <div className="rx-alts-list">
                {others.map((c) => <DispenseRow key={c.drug._id} cand={c} onPick={onPick} />)}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}

function DispenseRow({ cand, recommended = false, onPick }) {
  const { drug, confidence, exactStrength } = cand;
  const badge = dispenseBadge(drug.dispenseMode);

  return (
    <div className={`rx-pack ${recommended ? 'rx-pack--best' : ''}`}>
      <div className="rx-pack-main">
        <div className="rx-pack-name">
          {drug.packageName || '—'}
          {recommended && <span className="rx-pack-tag">recommended</span>}
        </div>
        <div className="rx-pack-meta">
          {[drug.strength, drug.dosageForm].filter(Boolean).join(' · ') || '—'}
          {drug.manufacturerName && <span className="rx-pack-mfr">{drug.manufacturerName}</span>}
        </div>
        <div className="rx-pack-badges">
          <span className={`badge badge-sm ${badge.cls}`}>{badge.label}</span>
          {drug.thiqaFormulary === 'Yes' && <span className="badge badge-sm badge-thiqa">Thiqa ✓</span>}
          <span className={`badge badge-sm ${exactStrength ? 'badge-best' : 'badge-default'}`}>
            {exactStrength ? 'exact dose' : 'closest dose'} · {confidence}%
          </span>
        </div>
      </div>
      <div className="rx-pack-right">
        <span className="rx-pack-price">
          {drug.packagePrice !== null ? `AED ${drug.packagePrice.toFixed(2)}` : 'N/A'}
        </span>
        <button className="rx-pack-view" onClick={() => onPick(drug.packageName)}>View in list</button>
      </div>
    </div>
  );
}

export default function ScanModal({ onClose }) {
  const { setQuery } = useDrugData();

  const [apiKey, setApiKey]       = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]     = useState(null);
  const [status, setStatus]       = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg]   = useState('');
  const [medications, setMedications] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setStatus('idle');
    setMedications([]);
    setErrorMsg('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setStatus('idle');
    setMedications([]);
    setErrorMsg('');
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleScan = async () => {
    if (!imageFile) { setErrorMsg('Please select a prescription image first.'); return; }
    if (!apiKey.trim()) { setErrorMsg('Please enter your OpenAI API key.'); return; }

    setStatus('loading');
    setErrorMsg('');
    setMedications([]);

    try {
      const base64 = await toBase64(imageFile);
      const mimeType = imageFile.type || 'image/jpeg';

      const body = {
        model: 'gpt-4o',
        max_tokens: 800,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: EXTRACT_PROMPT },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
            ],
          },
        ],
      };

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey.trim()}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error('Empty response from model');

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new Error('Could not parse the prescription. Try a clearer photo.');
      }

      const meds = Array.isArray(parsed.medications) ? parsed.medications : [];
      const cleaned = meds
        .map((m) => ({
          genericName: String(m.genericName || '').trim(),
          strength: String(m.strength || '').trim(),
          form: String(m.form || '').trim(),
          quantity: String(m.quantity || '').trim(),
        }))
        .filter((m) => m.genericName || m.strength);

      if (cleaned.length === 0) throw new Error('No medications detected. Try a clearer photo.');

      setMedications(cleaned);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Could not read the prescription. Please enter it manually.');
    }
  };

  const updateMed = (i, next) =>
    setMedications((list) => list.map((m, idx) => (idx === i ? next : m)));

  const handlePick = (packageName) => {
    if (packageName) setQuery(packageName);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--wide" role="dialog" aria-modal="true" aria-label="Scan Prescription">
        <div className="modal-header">
          <h2 className="modal-title">📷 Scan Prescription → Dispense</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          {/* API Key */}
          <div className="field-group">
            <label className="field-label" htmlFor="oai-key">
              OpenAI API Key <span className="field-note">(kept in memory only)</span>
            </label>
            <input id="oai-key" className="field-input" type="password" placeholder="sk-..."
              value={apiKey} onChange={(e) => setApiKey(e.target.value)} autoComplete="off" />
          </div>

          {/* Image upload */}
          <div
            className={`image-drop ${preview ? 'has-image' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
              style={{ display: 'none' }} onChange={handleFileChange} />
            {preview ? (
              <img src={preview} alt="Prescription preview" className="image-preview" />
            ) : (
              <div className="image-drop-placeholder">
                <span className="image-drop-icon">🖼️</span>
                <p>Drop a prescription photo, or click to browse / take a picture</p>
              </div>
            )}
          </div>

          {errorMsg && <div className="scan-error" role="alert">⚠️ {errorMsg}</div>}

          {/* Dispensing results */}
          {status === 'success' && medications.length > 0 && (
            <div className="rx-results">
              <p className="rx-results-title">
                {medications.length} medication{medications.length > 1 ? 's' : ''} read — review and correct if needed:
              </p>
              {medications.map((med, i) => (
                <MedicationResult key={i} med={med} index={i}
                  onChange={(next) => updateMed(i, next)} onPick={handlePick} />
              ))}
              <p className="rx-disclaimer">
                Verify against the original prescription before dispensing. OCR can misread doses.
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Close</button>
          <button className="btn-scan-submit" onClick={handleScan} disabled={status === 'loading'}>
            {status === 'loading'
              ? <><span className="btn-spinner" /> Reading…</>
              : (status === 'success' ? '🔄 Re-scan' : '🔍 Read Prescription')}
          </button>
        </div>
      </div>
    </div>
  );
}
