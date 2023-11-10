#!/bin/sh
npm i
npm run build
cp dist/assets/app.js ../verdatasbot/templates/index.js
cp dist/assets/index.css ../verdatasbot/templates/index.css
cp dist/veri.png ../verdatasbot/templates/veri.png
cd ../ilias-dev
sh reload_directories.sh
