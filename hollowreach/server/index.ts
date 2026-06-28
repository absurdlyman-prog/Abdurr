import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// HOLLOWREACH save backend (optional). A dependency-free Node HTTP server that
// stores cloud saves as JSON on disk, keyed by slot. The frontend works fully
// offline against localStorage; this only adds cross-device sync when present.
//
//   PUT  /api/saves/:slot   -> persist body as the save for :slot
//   GET  /api/saves/:slot   -> return the stored save (404 if none)
//   GET  /api/saves         -> list slot metadata
//   DELETE /api/saves/:slot -> remove a slot
//   GET  /api/health        -> { ok: true }
//
// Run: `npm run server` (defaults to :8787; Vite dev proxies /api here).

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.SAVE_DIR ?? join(__dirname, '.saves');
const PORT = Number(process.env.PORT ?? 8787);
const MAX_BODY = 2 * 1024 * 1024; // 2 MB cap per save

await mkdir(DATA_DIR, { recursive: true });

function send(res: ServerResponse, status: number, body: unknown): void {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,PUT,DELETE,OPTIONS',
    'access-control-allow-headers': 'content-type',
  });
  res.end(json);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('payload too large'));
        req.destroy();
        return;
      }
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const slotOk = (s: string) => /^[a-z0-9_-]{1,40}$/i.test(s);
const slotPath = (slot: string) => join(DATA_DIR, `${slot}.json`);

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
    const parts = url.pathname.split('/').filter(Boolean); // ["api","saves",":slot"]

    if (req.method === 'OPTIONS') return send(res, 204, {});
    if (url.pathname === '/api/health') return send(res, 200, { ok: true, dir: DATA_DIR });

    if (parts[0] !== 'api' || parts[1] !== 'saves') return send(res, 404, { error: 'not found' });

    // /api/saves (list)
    if (parts.length === 2 && req.method === 'GET') {
      const files = (await readdir(DATA_DIR)).filter((f) => f.endsWith('.json'));
      const slots = await Promise.all(
        files.map(async (f) => {
          try {
            const data = JSON.parse(await readFile(join(DATA_DIR, f), 'utf8'));
            return {
              slot: f.replace(/\.json$/, ''),
              name: data?.profile?.name ?? 'Detective',
              day: data?.clock?.day ?? 1,
              minute: data?.clock?.minutes ?? 0,
              savedAt: data?.savedAt ?? null,
              version: data?.version ?? 0,
            };
          } catch {
            return null;
          }
        }),
      );
      return send(res, 200, { slots: slots.filter(Boolean) });
    }

    const slot = parts[2];
    if (!slot || !slotOk(slot)) return send(res, 400, { error: 'bad slot' });

    if (req.method === 'GET') {
      try {
        const data = await readFile(slotPath(slot), 'utf8');
        return send(res, 200, JSON.parse(data));
      } catch {
        return send(res, 404, { error: 'no save' });
      }
    }

    if (req.method === 'PUT') {
      const body = await readBody(req);
      let parsed: unknown;
      try {
        parsed = JSON.parse(body);
      } catch {
        return send(res, 400, { error: 'invalid json' });
      }
      await writeFile(slotPath(slot), JSON.stringify(parsed));
      return send(res, 200, { ok: true, slot });
    }

    if (req.method === 'DELETE') {
      try {
        await writeFile(slotPath(slot), ''); // truncate then unlink-like
        const { unlink } = await import('node:fs/promises');
        await unlink(slotPath(slot));
      } catch {
        /* already gone */
      }
      return send(res, 200, { ok: true });
    }

    return send(res, 405, { error: 'method not allowed' });
  } catch (err) {
    return send(res, 500, { error: (err as Error).message });
  }
});

server.listen(PORT, () => {
  console.log(`HOLLOWREACH save server → http://localhost:${PORT}  (saves in ${DATA_DIR})`);
});
