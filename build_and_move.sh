#!/bin/sh

# Chatbot for the assistance system developed as part of the VerDatAs project
# Copyright (C) 2023-2024 TU Dresden (Max Schaible)

# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
else
    echo "Invalid argument. Please provide 'moodle' or 'ilias' as an argument."
fi
