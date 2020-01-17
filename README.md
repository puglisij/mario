# Mario

## Included

- [Vue](https://vuejs.org/) as JS framework
- Hot Reloading (panel updates instantly on every save during `npm run serve`)
- [Vue-CLI-3](https://cli.vuejs.org/) as Node.js tooling (webkit)
- Various utility components that handle context/flyout menus, launching CEF debug, common errors with Webpack

## [Never used Node, Vue CLI-3 or Webpack?](#Getting-Started)

---

## Commands

This panel comes with 5 commands baked in ([see details here](https://github.com/Inventsable/CEP-Self-Signing-Panel#what-do-they-do)):

- `npm run help` - A full list of the commands available and descriptions.
- `npm run switch` - Reports whether in developer or production context and can switch automatically.
- `npm run update` - Reports current version of panel in manifest and prompts to update Major, Minor, or Micro.
- `npm run register` - Reports the current user data (if any) and prompts to save new info to be used in certificates.
- `npm run sign` - Automatically stages and signs the extension, placing it in a `./archive` directory within the current panel.


## Contexts

You can automate this by using `npm run switch`. In case you need to do it manually:

### For development

- Ensure `index-dev.html` is uncommented in `CSXS/manifest.xml`. Use `npm run switch`. 

```xml
  <Resources>
    <MainPath>./public/index-dev.html</MainPath>
    <!-- <MainPath>./dist/index.html</MainPath> -->
```

- Restart Photoshop (Any changes to manifest.xml require a restart).
- Run `npm run serve` in the terminal at the project root
- Launch host application and find in Window > Extensions

> Panel now updates in real time and recompiles every time you save in VSCode

### For production

- Ensure `dist/index.html` is uncommented in `CSXS/manifest.xml`

```xml
  <Resources>
    <!-- <MainPath>./public/index-dev.html</MainPath> -->
    <MainPath>./dist/index.html</MainPath>
```

- Run `npm run build` in the terminal at the project root
- Launch host application and find in Window > Extensions

> Panel is now ready to sign and certify or be used on any client

---

## Components

<br>&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: app.vue (main `route`)
:file_folder: ./src/components
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: jsx.vue 
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • Adobe JSX tab with helpful tools for testing/translating Extendscript code
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: console.vue
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • a convenience view for console logs, including exceptions
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: configurator.vue
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • app configuration tab, including folder watchers
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: pipelines.vue
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • tab for viewing/editing pipeline configurations

---

## Scripting

:file_folder: ./src/host
<br>&nbsp;&nbsp;|\_\_&nbsp;:file_folder: universal (Preloaded before main script)
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: Console.jsx
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • Support for `console.log()` and `CSEvents` in .jsx files
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: json2.jsx
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • Support for `JSON.stringify()` and `JSON.parse()` in .jsx files
<br>&nbsp;&nbsp;|\_\_&nbsp;:file_folder: ILST (optional)
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: host.ts
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • Out of the box support for host DOM in autocomplete
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • Changes to this file compile to `host.jsx` on every save
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: host.jsx
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • No need to edit or touch this file
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • This is the file to run from any CEP/JS
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: tsconfig.json
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • Run `tsc: watch - ./src/host/ILST/tsconfig.json` for DOM and autocompile on save
<br>&nbsp;&nbsp;|\_\_&nbsp;:file_folder: AEFT (optional)
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: host.ts
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: host.jsx
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: tsconfig.json
<br>&nbsp;&nbsp;|\_\_&nbsp;:file_folder: PHXS (optional)
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: host.ts
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: host.jsx
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: tsconfig.json

---

## Getting Started

Other files/folders you should generally not need to modify are shown below:

:file_folder: your-panel-name
<br>&nbsp;&nbsp;|\_\_&nbsp;:file_folder: CSXS
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: manifest.xml
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • Changes have been made to include node context. See the README in `./CSXS`
<br>&nbsp;&nbsp;|\_\_&nbsp;:file_folder: public
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • Any files/folders contained here will be automatically bundled in `./dist/` after `npm run build`
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • You can include any assets (.pngs, scripts, etc) here or `src` for use in the panel
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: CSInterface.js
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: index.html (**Production:** used with `npm run build`)
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: index-dev.html (**Development:** used with `npm run serve`)
<br>&nbsp;&nbsp;|\_\_&nbsp;:file_folder: src
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • This is your development folder, you can place any number of components or files here
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:file_folder: components
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: HelloWorld.vue
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • This is a placeholder component for the main content of your panel
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|\_\_&nbsp;:page_facing_up: App.vue
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • This is the main entry point of your panel
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; • You cannot change this from a `<div>` of `#app`. Add your own components inside it instead of modifying it directly.

---

## Common errors:

### require is not a function/defined

- If wanting to use `require()` or `process` in both Developer and Production, you need to assign them manually in each .vue file (due to being nested in an iframe) like so:

```js
const require = cep_node.require || require;
const fs = require("fs"); // Now available in both
```

### Panel is not updating

- Adding or reorganizing components may cause hot reloading to fail. Many times you will be warned of this in `CEF debug`'s console, fix this by hitting `^C` in your active terminal to `Terminae batch job`, then run `npm run serve` once more and refresh the panel.

### Page Not Found (cannot find page at `localhost:####` displays in panel)

- Must run `npm run serve` and have the `App running at: -Local / -Network` message in your terminal
- If you launched the app before running `npm run serve`, click the localhost URL inside the panel's error message

### Panel is white or blank

- Check your CEF client via `localhost:####` for an error thrown in your code which breaks the panel's rendering
- If in `Production` context and receiving `404` errors in your `index.html`, ensure your `dist/index.html`'s script tags have `src` attributes such as `src=./filepath` or `src=filepath` instead of `src=/filepath` (leading slash is default but will break, should be fixed via `vue.config.js`)

### Sign/Certify is failing

- Including hidden files and repositories in your ZXP/ZIP will cause a misleading error message. Be sure to delete hidden items such as `node_modules/`, `.git/`, and any other hidden files/folders prior to your sign/certify.
