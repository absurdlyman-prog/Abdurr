import { EXTRACT_PROMPT } from '../../src/utils/scanPrompt.js';

const JSON_HEADERS = { 'Content-Type': 'application/json' };
// Base64 of an 8 MB image is ~11 MB of text; anything bigger is not a prescription photo.
const MAX_IMAGE_CHARS = 12 * 1024 * 1024;

const jsonError = (message, status) =>
  new Response(JSON.stringify({ error: message }), { status, headers: JSON_HEADERS });

export default async (req) => {
  if (req.method !== 'POST') return jsonError('Method not allowed', 405);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return jsonError('Scan service not configured', 501);

  let payload;
  try {
    payload = await req.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const { image, mimeType } = payload || {};
  if (typeof image !== 'string' || !image) return jsonError('Missing image', 400);
  if (image.length > MAX_IMAGE_CHARS) return jsonError('Image too large', 413);
  const safeMime = /^image\/[\w.+-]+$/.test(mimeType || '') ? mimeType : 'image/jpeg';

  const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 800,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: EXTRACT_PROMPT },
            { type: 'image_url', image_url: { url: `data:${safeMime};base64,${image}` } },
          ],
        },
      ],
    }),
  });

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return jsonError(data?.error?.message || `Upstream error ${upstream.status}`, 502);
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) return jsonError('Empty response from model', 502);

  return new Response(JSON.stringify({ content }), { status: 200, headers: JSON_HEADERS });
};
