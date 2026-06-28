/* ============================================================================
 *  SurgeryQuest — AI proxy (Netlify serverless function)
 *
 *  Talks to the Anthropic Messages API on the server side so the API key is
 *  NEVER exposed in the browser. The app runs fully without this (scripted
 *  mode); it "comes alive" the moment you set an ANTHROPIC_API_KEY env var in
 *  Netlify (Site settings → Environment variables).
 *
 *  EDUCATIONAL / SYNTHETIC. Nothing here is real medical advice.
 *
 *  Two roles, mirroring the "medkit" design:
 *    • patient  → Claude Haiku 4.5  (fast, in-character patient voice)
 *    • attending→ Claude Opus 4.8   (clinical teaching feedback)
 * ========================================================================= */

const PATIENT_MODEL = "claude-haiku-4-5"; // fast, cheap, great for persona
const ATTENDING_MODEL = "claude-opus-4-8"; // strongest reasoning for feedback
const API_URL = "https://api.anthropic.com/v1/messages";

async function callClaude(body) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error("Anthropic API " + res.status + ": " + t.slice(0, 300));
  }
  const data = await res.json();
  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(obj),
  };
}

exports.handler = async (event) => {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  let payload = {};
  try { payload = JSON.parse(event.body || "{}"); } catch (e) { /* ignore */ }
  const mode = payload.mode || "status";

  // The frontend pings this on load to decide scripted vs. live-AI.
  if (mode === "status") return json(200, { available: hasKey });
  if (!hasKey) return json(200, { available: false });

  try {
    if (mode === "patient") {
      const p = payload.patient || {};
      const system =
        "You are role-playing a PATIENT in a synthetic surgical training simulation. " +
        "Everything here is fictional and for education only. Stay fully in character as the patient and " +
        "speak naturally in the first person, briefly (1-3 sentences), the way a real patient would. " +
        "Answer only what the doctor asks. Do NOT volunteer or name the diagnosis, do NOT use clinical " +
        "jargon, and do NOT list findings unprompted. If asked about something not in your background, give " +
        "a plausible, mostly-normal answer that fits the scenario. Never mention being an AI or break character.\n\n" +
        "PATIENT: " + (p.who || "an adult patient") + "\n" +
        "REASON FOR VISIT: " + (p.complaint || "") + "\n" +
        "VITALS (context only): " + (p.vitals || "") + "\n" +
        "PRIVATE BACKGROUND (use to answer; never say the diagnosis name):\n" + (p.background || "");

      const messages = [];
      (payload.conversation || []).forEach((m) => {
        messages.push({
          role: m.role === "doctor" ? "user" : "assistant",
          content: [{ type: "text", text: String(m.text || "") }],
        });
      });
      messages.push({
        role: "user",
        content: [{ type: "text", text: String(payload.message || "Hello.") }],
      });
      // The Messages API requires the list to start with a user turn — drop any
      // leading assistant turns (e.g. the patient's opening greeting).
      while (messages.length && messages[0].role !== "user") messages.shift();

      const reply = await callClaude({
        model: PATIENT_MODEL,
        max_tokens: 300,
        thinking: { type: "disabled" }, // keep the patient snappy
        system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
        messages,
      });
      return json(200, { reply });
    }

    if (mode === "attending") {
      const e = payload.encounter || {};
      const system =
        "You are a warm, sharp attending surgeon giving brief teaching feedback to a PGY-2 resident after a " +
        "SYNTHETIC training case (fictional; not real medical advice). Be specific and encouraging, weave in " +
        "guideline-style reasoning, and keep it to 2-3 short paragraphs. Respond with the feedback only — no " +
        "preamble, no headings, no restating the scores.";
      const user =
        "CASE: " + (e.title || "") + "\n" +
        "Correct diagnosis: " + (e.correctDx || "") + "\n" +
        "Resident's diagnosis: " + (e.residentDx || "(none)") + "\n" +
        "Resident's management: " + (e.residentMgmt || "(none)") + " [" + (e.mgmtTier || "?") + "]\n" +
        "Best management: " + (e.correctMgmt || "") + "\n" +
        "Scores — History " + e.history + ", Exam " + e.exam + ", Workup " + e.workup +
        ", Diagnosis " + e.diagnosis + ", Management " + e.management + ", Stewardship " + e.steward +
        " (overall " + e.total + "/100, " + e.stars + " stars).\n" +
        "Missed high-yield items: " + (e.missed || "none") + ".\n" +
        "Low-yield / over-ordered tests: " + (e.wasteful || "none") + ".\n" +
        "Give focused teaching feedback to help this resident improve.";

      const feedback = await callClaude({
        model: ATTENDING_MODEL,
        max_tokens: 700,
        output_config: { effort: "low" }, // fast, concise feedback
        system,
        messages: [{ role: "user", content: [{ type: "text", text: user }] }],
      });
      return json(200, { feedback });
    }

    return json(400, { error: "unknown mode" });
  } catch (err) {
    // Soft-fail so the client falls back to scripted mode gracefully.
    return json(200, { error: String((err && err.message) || err), available: true });
  }
};
