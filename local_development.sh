#!/bin/sh
npm i
npm run build
mkdir -p ../verdatasbot/templates
rm -rf ../verdatasbot/templates/assets
cp -r dist/assets ../verdatasbot/templates/assets
cp dist/veri.png ../verdatasbot/templates/veri.png
cd ../ilias-dev || return
sh reload_directories.sh
