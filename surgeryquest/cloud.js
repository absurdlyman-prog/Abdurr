/* ============================================================================
 *  SurgeryQuest — cloud layer (optional, phased)
 *
 *  Adds real accounts + cross-device progress + a cohort leaderboard +
 *  an educator dashboard, using Supabase (hosted Postgres + auth) straight
 *  from the browser. NO server for you to run.
 *
 *  ✏️  TO TURN IT ON:
 *    1) Create a free project at https://supabase.com
 *    2) Project settings → API: copy the Project URL and the "anon public" key
 *    3) Paste them below
 *    4) Run the SQL in SUPABASE_SETUP.md (one paste in the Supabase SQL editor)
 *    5) Auth → URL configuration: add your site URL to "Redirect URLs"
 *
 *  Until URL/anonKey are filled in, the app stays in local mode (nothing
 *  breaks). The anon key is SAFE to ship in the browser — row-level security
 *  in the SQL is what protects the data.
 * ========================================================================= */
window.SUPABASE_CONFIG = {
  url: "",      // e.g. "https://abcdefgh.supabase.co"
  anonKey: "",  // e.g. "eyJhbGciOi..."  (the anon/public key, not the secret)
};

window.CLOUD = (function () {
  const cfg = window.SUPABASE_CONFIG || {};
  let sb = null, ready = false, user = null;

  function enabled() { return !!(cfg.url && cfg.anonKey); }
  function currentUser() { return user; }

  function loadLib() {
    return new Promise((resolve, reject) => {
      if (window.supabase) return resolve();
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function init() {
    if (!enabled()) return false;
    try {
      await loadLib();
      sb = window.supabase.createClient(cfg.url, cfg.anonKey);
      const { data } = await sb.auth.getSession();
      user = data && data.session ? data.session.user : null;
      sb.auth.onAuthStateChange((_evt, session) => {
        user = session ? session.user : null;
        if (typeof window.CLOUD.onAuth === "function") window.CLOUD.onAuth(user);
      });
      ready = true;
      return true;
    } catch (e) { ready = false; return false; }
  }

  async function signIn(email) {
    if (!ready) return { error: { message: "cloud off" } };
    const redirect = location.origin + location.pathname;
    return sb.auth.signInWithOtp({ email: email, options: { emailRedirectTo: redirect } });
  }
  async function signOut() { if (ready) { try { await sb.auth.signOut(); } catch (e) {} } user = null; }

  async function push(rec) {
    if (!ready || !user) return;
    try {
      await sb.from("players").upsert(
        Object.assign({ id: user.id, email: user.email }, rec, { updated_at: new Date().toISOString() })
      );
    } catch (e) { /* ignore */ }
  }
  async function pull() {
    if (!ready || !user) return null;
    try { const { data } = await sb.from("players").select("*").eq("id", user.id).maybeSingle(); return data; }
    catch (e) { return null; }
  }
  async function leaderboard(cohort) {
    if (!ready && !(await init())) return [];
    try {
      let q = sb.from("players").select("display_name,cohort,xp,stars,cases_done,badges")
        .order("xp", { ascending: false }).limit(100);
      if (cohort) q = q.eq("cohort", cohort);
      const { data } = await q;
      return data || [];
    } catch (e) { return []; }
  }

  return { enabled: enabled, init: init, signIn: signIn, signOut: signOut,
           currentUser: currentUser, push: push, pull: pull, leaderboard: leaderboard, onAuth: null };
})();
