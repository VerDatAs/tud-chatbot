#!/bin/sh
npm i
npm run build
cp dist/assets/app.js ../VerDatAsBot/templates/index.js
cp dist/assets/index.css ../VerDatAsBot/templates/index.css
cp dist/veri.png ../VerDatAsBot/templates/veri.png
cd ../ilias-8
sh reload_directories.sh
