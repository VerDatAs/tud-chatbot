# TUD Chatbot

The chatbot for the assistance system developed as part of the VerDatAs project.

## Project setup and development

### Prerequisites

```sh
nvm use # (or `nvm install` if not yet installed)
npm install
```

### Local development

Create a `.env.development` file in order to specify values for the following variables:

```
VITE_BACKEND_URL=TAS_BACKEND_URL # the URL of the tud-tas-backend
VITE_PSEUDO_ID=LMS_PSEUDO_ID # the user identification specified by the LMS that is used by the tud-chatbot
VITE_ALTERNATIVE_PSEUDO_ID=ALTERNATIVE_LMS_PSEUDO_ID # the user identification specified by the LMS that is used by the tud-chatbot when connecting via Safari (this allows simulating a cooperation locally)
```

Start compile and hot-reload for development:

```sh
npm run dev
```

### Compile and minify for production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Type checking

```sh
npm run type-check
```

### Local development with ILIAS

* The folder of the `tud-chatbot` should be located within the same folder such as [tud-chatbot-plugin](https://github.com/VerDatAs/tud-chatbot-plugin).
* In order to build the application and move it into the plugin, run the following command:

```sh
npm run build-move ilias
```

## License

This plugin is licensed under the GPL v3 License (for further information, see [LICENSE](LICENSE)).

## Libraries used

The libraries used in this project are listed in the following table. This information can also be requested by:

```
npm run extract-licenses
```

After that the list of libraries used can be found in `dist/THIRD-PARTY-tud-chatbot.md`.

|    Name    |   Version  |   License  |     URL    |
| ---------- | ---------- | ---------- | ---------- |
| @babel/helper-string-parser | 7.24.8 | MIT | https://github.com/babel/babel |
| @babel/helper-validator-identifier | 7.24.7 | MIT | https://github.com/babel/babel |
| @babel/parser | 7.25.3 | MIT | https://github.com/babel/babel |
| @babel/types | 7.25.2 | MIT | https://github.com/babel/babel |
| @jridgewell/sourcemap-codec | 1.5.0 | MIT | https://github.com/jridgewell/sourcemap-codec |
| @vue/compiler-core | 3.4.38 | MIT | https://github.com/vuejs/core |
| @vue/compiler-dom | 3.4.38 | MIT | https://github.com/vuejs/core |
| @vue/compiler-sfc | 3.4.38 | MIT | https://github.com/vuejs/core |
| @vue/compiler-ssr | 3.4.38 | MIT | https://github.com/vuejs/core |
| @vue/devtools-api | 6.6.3 | MIT | https://github.com/vuejs/vue-devtools |
| @vue/reactivity | 3.4.38 | MIT | https://github.com/vuejs/core |
| @vue/runtime-core | 3.4.38 | MIT | https://github.com/vuejs/core |
| @vue/runtime-dom | 3.4.38 | MIT | https://github.com/vuejs/core |
| @vue/server-renderer | 3.4.38 | MIT | https://github.com/vuejs/core |
| @vue/shared | 3.4.38 | MIT | https://github.com/vuejs/core |
| @vueuse/core | 7.7.1 | MIT | https://github.com/vueuse/vueuse |
| @vueuse/shared | 7.7.1 | MIT | https://github.com/vueuse/vueuse |
| animate.css | 4.1.1 | MIT | https://github.com/animate-css/animate.css |
| asynckit | 0.4.0 | MIT | https://github.com/alexindigo/asynckit |
| axios | 1.7.4 | MIT | https://github.com/axios/axios |
| combined-stream | 1.0.8 | MIT | https://github.com/felixge/node-combined-stream |
| csstype | 3.1.3 | MIT | https://github.com/frenic/csstype |
| delayed-stream | 1.0.0 | MIT | https://github.com/felixge/node-delayed-stream |
| entities | 4.5.0 | BSD-2-Clause | https://github.com/fb55/entities |
| estree-walker | 2.0.2 | MIT | https://github.com/Rich-Harris/estree-walker |
| follow-redirects | 1.15.6 | MIT | https://github.com/follow-redirects/follow-redirects |
| form-data | 4.0.0 | MIT | https://github.com/form-data/form-data |
| magic-string | 0.30.11 | MIT | https://github.com/rich-harris/magic-string |
| mime-db | 1.52.0 | MIT | https://github.com/jshttp/mime-db |
| mime-types | 2.1.35 | MIT | https://github.com/jshttp/mime-types |
| nanoid | 3.3.7 | MIT | https://github.com/ai/nanoid |
| picocolors | 1.1.0 | ISC | https://github.com/alexeyraspopov/picocolors |
| pinia-plugin-persistedstate | 3.2.1 | MIT | https://github.com/prazdevs/pinia-plugin-persistedstate |
| pinia | 2.2.1 | MIT | https://github.com/vuejs/pinia |
| postcss | 8.4.47 | MIT | https://github.com/postcss/postcss |
| proxy-from-env | 1.1.0 | MIT | https://github.com/Rob--W/proxy-from-env |
| source-map-js | 1.2.1 | BSD-3-Clause | https://github.com/7rulnik/source-map-js |
| to-fast-properties | 2.0.0 | MIT | https://github.com/sindresorhus/to-fast-properties |
| typescript | 5.4.5 | Apache-2.0 | https://github.com/Microsoft/TypeScript |
| vue-demi | 0.13.11 | MIT | https://github.com/antfu/vue-demi |
| vue-demi | 0.14.10 | MIT | https://github.com/antfu/vue-demi |
| vue | 3.4.38 | MIT | https://github.com/vuejs/core |
| vuejs-confirm-dialog | 0.5.2 | MIT | https://github.com/harmyderoman/vuejs-confirm-dialog |
