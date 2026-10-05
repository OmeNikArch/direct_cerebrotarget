#!/usr/bin/env bash
# Первая установка тестового стенда лендинга «Церебро Директ» на сервер clickout.
# Запускать с ПК владельца:  bash backend/deploy/first-deploy.sh
#
# Что делает (идемпотентно):
#  1) пишет /home/dev/yd-landing/backend/.env (секреты — из корневого .env платформы, ключи YD_LANDING_*);
#  2) копирует site/ и backend/ вместе с node_modules (npm install на сервере не работает);
#  3) migrate → build → создаёт администратора и редактора (заказчика);
#  4) ставит systemd-юнит ydlanding (127.0.0.1:3002);
#  5) добавляет блок в /etc/caddy/Caddyfile (с бэкапом и caddy validate) и перезагружает Caddy.
# База ydlanding на сервере уже создана (05.10.2026).
set -euo pipefail

HOST=${DEPLOY_HOST:-dev@clickout.cerebrotarget.ru}
REMOTE=/home/dev/yd-landing
DOMAINS=${DOMAINS:-direct-test.161-104-56-78.sslip.io}
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLATFORM_ENV=${PLATFORM_ENV:-"$ROOT/../../../.env"}

val() { grep -m1 "^$1=" "$PLATFORM_ENV" | cut -d= -f2-; }
DB=$(val YD_LANDING_PROD_DATABASE_URL)
ADMIN_EMAIL=$(val YD_LANDING_ADMIN_EMAIL); ADMIN_PASSWORD=$(val YD_LANDING_ADMIN_PASSWORD)
DEMO_EMAIL=$(val YD_LANDING_DEMO_EMAIL); DEMO_PASSWORD=$(val YD_LANDING_DEMO_PASSWORD)
[ -n "$DB" ] && [ -n "$ADMIN_EMAIL" ] && [ -n "$DEMO_EMAIL" ] || { echo "Нет ключей YD_LANDING_* в $PLATFORM_ENV"; exit 1; }

echo "== 1/5 .env на сервере"
ssh "$HOST" "mkdir -p $REMOTE/backend && test -f $REMOTE/backend/.env" 2>/dev/null && echo "   .env уже есть — не трогаю" || {
  umask 077
  printf 'DATABASE_URL=%s\nPAYLOAD_SECRET=%s\nNEXT_PUBLIC_SERVER_URL=\nCORS_ORIGINS=\nLEAD_ENDPOINT=/api/leads/submit\nADMIN_EMAIL=%s\nADMIN_PASSWORD=%s\n' \
    "$DB" "$(openssl rand -hex 32)" "$ADMIN_EMAIL" "$ADMIN_PASSWORD" | ssh "$HOST" "umask 077; cat > $REMOTE/backend/.env"
}

echo "== 2/5 копирую код (с node_modules)"
rsync -a --delete --exclude .next --exclude .env --exclude media --exclude public --exclude site-template \
  "$ROOT/site" "$ROOT/backend" "$HOST:$REMOTE/"

echo "== 3/5 migrate, build, пользователи"
ssh "$HOST" "cd $REMOTE/backend && NODE_ENV=production npm run migrate && npm run build \
  && npm run -s create-admin \
  && ADMIN_ROLE=editor ADMIN_EMAIL='$DEMO_EMAIL' ADMIN_PASSWORD='$DEMO_PASSWORD' npm run -s create-admin"

echo "== 4/5 systemd ydlanding"
ssh "$HOST" "sudo -n cp $REMOTE/backend/deploy/ydlanding.service /etc/systemd/system/ydlanding.service \
  && sudo -n systemctl daemon-reload && sudo -n systemctl enable --now ydlanding && sudo -n systemctl restart ydlanding \
  && sleep 8 && systemctl is-active ydlanding && curl -sf -o /dev/null -w '127.0.0.1:3002 -> HTTP %{http_code}\n' http://127.0.0.1:3002/"

echo "== 5/5 Caddy: $DOMAINS"
ssh "$HOST" "grep -q 'ydlanding' /etc/caddy/Caddyfile && echo '   блок уже есть' || {
  BAK=/etc/caddy/Caddyfile.bak.\$(date +%Y%m%d%H%M)
  sudo -n cp /etc/caddy/Caddyfile \$BAK
  printf '\n# --- Лендинг «Церебро Директ», тестовый стенд (ydlanding, :3002) ---\n%s {\n\tencode zstd gzip\n\treverse_proxy 127.0.0.1:3002\n}\n' '$DOMAINS' | sudo -n tee -a /etc/caddy/Caddyfile >/dev/null
  if sudo -n caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile; then sudo -n systemctl reload caddy
  else sudo -n cp \$BAK /etc/caddy/Caddyfile; echo 'Caddyfile не прошёл проверку — восстановлен из бэкапа'; exit 1; fi
}"

for d in ${DOMAINS//,/ }; do echo "Готово: https://$d  (админка: /admin)"; done
