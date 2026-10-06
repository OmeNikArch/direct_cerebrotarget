#!/usr/bin/env bash
# Деплой лендинга «Церебро Директ» (статический фронт + Payload-бэкенд) на сервер clickout/vk-ads.
# Юнит ydlanding, порт 127.0.0.1:3002, БД ydlanding.
#
# Первый запуск на сервере (один раз, вручную):
#   1) createdb/createuser ydlanding в Postgres сервера;
#   2) /home/dev/yd-landing/backend/.env по образцу .env.example (NEXT_PUBLIC_SERVER_URL=https://домен);
#   3) ./deploy.sh --with-modules; затем на сервере: npm run create-admin;
#   4) sudo cp deploy/ydlanding.service /etc/systemd/system/ && sudo systemctl enable --now ydlanding;
#   5) блок из Caddyfile.snippet в /etc/caddy/Caddyfile, sudo systemctl reload caddy.
#
# Обычный деплой: ./deploy.sh  (node_modules не переносится; после смены зависимостей — --with-modules).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HOST=${DEPLOY_HOST:-dev@clickout.cerebrotarget.ru}
REMOTE_DIR=/home/dev/yd-landing

EXCLUDES=(--exclude .git --exclude .next --exclude .env --exclude media --exclude public --exclude site-template --exclude docs)
if [ "${1:-}" != "--with-modules" ]; then
  EXCLUDES+=(--exclude node_modules)
fi

ssh "$HOST" "mkdir -p $REMOTE_DIR"
rsync -a --delete "${EXCLUDES[@]}" "$ROOT/site" "$ROOT/backend" "$HOST:$REMOTE_DIR/"

ssh "$HOST" "cd $REMOTE_DIR/backend && NODE_ENV=production npm run migrate && npm run build \
  && sudo -n systemctl restart ydlanding && sleep 6 \
  && systemctl is-active ydlanding \
  && curl -sf -o /dev/null -w '127.0.0.1:3002 -> HTTP %{http_code}\n' http://127.0.0.1:3002/"

echo "Deploy OK (админка: /admin)"
