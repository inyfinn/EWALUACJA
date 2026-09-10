#!/bin/sh
# Instaluje reverse proxy Panelu Ankiet na portach 80/443 DSM.
set -e
SRC="/volume1/web/PANEL ANKIET/deploy/www.panel-ankiet.conf"
DST="/usr/local/etc/nginx/conf.d/www.panel-ankiet.conf"
cp "$SRC" "$DST"
chmod 644 "$DST"
nginx -t
nginx -s reload
echo "OK: https://inyfinn.synology.me/panel-ankiet/"
