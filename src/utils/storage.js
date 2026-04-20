const PREFIX = 'sdf.';
const KEY = {
  favs: PREFIX + 'favorites.v1',
  recent: PREFIX + 'recent.v1',
  lang: PREFIX + 'lang.v1',
  apiKey: PREFIX + 'openai.session',
};

function read(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore quota */ }
}

export const storage = {
  getFavorites: () => read(KEY.favs, []),
  setFavorites: (list) => write(KEY.favs, list),

  getRecent: () => read(KEY.recent, []),
  setRecent: (list) => write(KEY.recent, list),

  getLang: () => read(KEY.lang, 'en'),
  setLang: (lang) => write(KEY.lang, lang),

  // Session-only OpenAI key (sessionStorage, not persisted)
  getApiKey: () => { try { return sessionStorage.getItem(KEY.apiKey) || ''; } catch { return ''; } },
  setApiKey: (k) => { try { if (k) sessionStorage.setItem(KEY.apiKey, k); else sessionStorage.removeItem(KEY.apiKey); } catch { /* ignore */ } },
};
