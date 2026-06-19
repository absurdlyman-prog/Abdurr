import { useState, useRef } from 'react';
import { useDrugData } from '../contexts/DrugDataContext';

const GPT_PROMPT =
  'Look at this prescription or drug packaging image. Extract the drug name only. Return ONLY the drug name as plain text, nothing else.';

export default function ScanModal({ onClose }) {
  const { setQuery } = useDrugData();

  const [apiKey, setApiKey]   = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus]   = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult]   = useState('');
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setStatus('idle'); setResult(''); setErrorMsg('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleScan = async () => {
    if (!imageFile) { setErrorMsg('Please select an image first.'); return; }
    if (!apiKey.trim()) { setErrorMsg('Please enter your OpenAI API key.'); return; }
    setStatus('loading'); setErrorMsg(''); setResult('');
    try {
      const base64 = await toBase64(imageFile);
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey.trim()}` },
        body: JSON.stringify({
          model: 'gpt-4o', max_tokens: 50,
          messages: [{ role: 'user', content: [
            { type: 'text', text: GPT_PROMPT },
            { type: 'image_url', image_url: { url: `data:${imageFile.type || 'image/jpeg'};base64,${base64}` } },
          ]}],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${res.status}`);
      }
      const data = await res.json();
      const drugName = data.choices?.[0]?.message?.content?.trim();
      if (!drugName) throw new Error('Empty response from model');
      setResult(drugName); setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Could not read drug name. Please search manually.');
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Scan Prescription">
        <div className="modal-header">
          <h2 className="modal-title">Scan Prescription</h2>
          <button className="btn-close-panel" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          <div>
            <label className="field-label" htmlFor="oai-key">
              OpenAI API Key <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(kept in memory only)</span>
            </label>
            <input
              id="oai-key"
              className="field-input"
              type="password"
              placeholder="sk-…"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div
            className={`image-drop ${preview ? 'has-image' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            {preview
              ? <img src={preview} alt="Prescription preview" className="image-preview" />
              : (
                <div className="image-drop-placeholder">
                  <span className="image-drop-icon">🖼️</span>
                  <p>Drop prescription image here or click to browse</p>
                </div>
              )}
          </div>

          {errorMsg && <div className="scan-error" role="alert">⚠️ {errorMsg}</div>}

          {status === 'success' && result && (
            <div className="scan-result">
              <p className="scan-result-label">Detected drug name</p>
              <p className="scan-result-drug">{result}</p>
              <button className="btn-use-result" onClick={() => { setQuery(result); onClose(); }}>
                Search for "{result}"
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-submit" onClick={handleScan} disabled={status === 'loading'}>
            {status === 'loading'
              ? <><span className="btn-spinner" /> Scanning…</>
              : 'Scan Image'}
          </button>
        </div>
      </div>
    </div>
  );
}
