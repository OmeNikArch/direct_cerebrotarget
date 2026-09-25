import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const siteDirectory = path.resolve(scriptDirectory, '..', 'site');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function withinSite(filePath) {
  return filePath === siteDirectory || filePath.startsWith(`${siteDirectory}${path.sep}`);
}

export function createPreviewServer() {
  return http.createServer((request, response) => {
    const requestUrl = new URL(request.url, 'http://127.0.0.1');
    const pathname = decodeURIComponent(requestUrl.pathname);
    const relativePath = pathname === '/' ? 'index.html' : `.${pathname}`;
    const filePath = path.resolve(siteDirectory, relativePath);

    if (!withinSite(filePath)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        response.writeHead(error.code === 'ENOENT' ? 404 : 500);
        response.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
        return;
      }

      response.writeHead(200, {
        'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      });
      response.end(content);
    });
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4173);
  const server = createPreviewServer();

  server.listen(port, '127.0.0.1', () => {
    console.log(`Лендинг открыт: http://localhost:${port}`);
  });
}
