#!/bin/sh

if [ "$1" = "moodle" ]; then
    npm i
    npm run build
    docker cp ./dist/assets/main.js moodle-php-apache-1:/var/www/html/local/verdatasbot/amd/src/verdatasbot.js
    docker cp ./dist/assets/main.js moodle-php-apache-1:/var/www/html/local/verdatasbot/amd/build/verdatasbot.min.js
    docker cp ./dist/veri.png moodle-php-apache-1:/var/www/html/local/verdatasbot/templates/veri.png
elif [ "$1" = "ilias" ]; then
    npm i
    npm run build
    mkdir -p ../verdatasbot/templates
    cp dist/assets/main.js ../verdatasbot/templates/main.js
    cp dist/THIRD-PARTY-tud-chatbot.md ../verdatasbot/templates/THIRD-PARTY-tud-chatbot.md
    cp dist/veri.png ../verdatasbot/templates/veri.png
    cd ../ilias-dev || return
    sh reload_directories.sh
else
    echo "Invalid argument. Please provide 'moodle' or 'ilias' as an argument."
fi
