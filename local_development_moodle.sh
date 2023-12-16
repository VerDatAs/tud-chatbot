#!/bin/sh
npm i
npm run build
docker cp ./dist/assets/main.js moodle-php-apache-1:/var/www/html/local/verdatasbot/amd/src/verdatasbot.js
docker cp ./dist/assets/main.js moodle-php-apache-1:/var/www/html/local/verdatasbot/amd/build/verdatasbot.min.js
docker cp ./dist/veri.png moodle-php-apache-1:/var/www/html/local/verdatasbot/templates/veri.png