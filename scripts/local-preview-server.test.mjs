import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { createPreviewServer } from './local-preview-server.mjs';

function request(server, path) {
  const { port } = server.address();

  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port, path }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => resolve({ body, statusCode: response.statusCode }));
    }).on('error', reject);
  });
}

test('serves the landing page and keeps paths inside site', async (t) => {
  const server = createPreviewServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());

  const landing = await request(server, '/');
  assert.equal(landing.statusCode, 200);
  assert.match(landing.body, /Церебро/);

  const outsideSite = await request(server, '/..%2FPROJECT-CONTEXT.md');
  assert.equal(outsideSite.statusCode, 403);
});

test('starts when invoked by the preview command', async (t) => {
  const testDirectory = path.dirname(fileURLToPath(import.meta.url));
  const scriptPath = path.join(testDirectory, 'local-preview-server.mjs');
  const child = spawn(process.execPath, [scriptPath], {
    env: { ...process.env, PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(() => child.kill());

  const outcome = await Promise.race([
    once(child.stdout, 'data').then(([chunk]) => ({ output: String(chunk) })),
    once(child, 'exit').then(([code]) => ({ code })),
  ]);

  assert.match(outcome.output ?? '', /Лендинг открыт/);
});
