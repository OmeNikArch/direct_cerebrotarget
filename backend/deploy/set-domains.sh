#!/usr/bin/env bash
# Меняет список доменов лендинга в /etc/caddy/Caddyfile (блок после метки «Лендинг «Церебро Директ»»).
# Пример: bash backend/deploy/set-domains.sh direct.cerebrotarget.ru direct-test.161-104-56-78.sslip.io
# Бэкап → правка → caddy validate → reload; при ошибке проверки конфиг возвращается из бэкапа.
set -euo pipefail
HOST=${DEPLOY_HOST:-dev@clickout.cerebrotarget.ru}
[ $# -ge 1 ] || { echo "Укажите домены"; exit 1; }
DOMAINS=$(printf '%s, ' "$@"); DOMAINS=${DOMAINS%, }

ssh "$HOST" "set -e
  grep -q 'Лендинг «Церебро Директ»' /etc/caddy/Caddyfile || { echo 'Блок лендинга не найден — сначала first-deploy.sh'; exit 1; }
  BAK=/etc/caddy/Caddyfile.bak.\$(date +%Y%m%d%H%M%S)
  sudo -n cp /etc/caddy/Caddyfile \$BAK
  awk -v d='$DOMAINS' 'f { sub(/^[^{]*\\{/, d \" {\"); f=0 } /Лендинг «Церебро Директ»/ { f=1 } { print }' \$BAK | sudo -n tee /etc/caddy/Caddyfile >/dev/null
  if sudo -n caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile >/dev/null 2>&1; then
    sudo -n systemctl reload caddy; grep -A1 'Лендинг «Церебро Директ»' /etc/caddy/Caddyfile
  else
    sudo -n cp \$BAK /etc/caddy/Caddyfile; echo 'Caddyfile не прошёл проверку — восстановлен из бэкапа'; exit 1
  fi"
for d in "$@"; do echo "Проверка: https://$d"; done
