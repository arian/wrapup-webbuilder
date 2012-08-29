Wrapup WebBuilder
=================

WebBuilder is an experimental builder, which lets you download wrapup'd
JavaScript files. See also [wrapup](https://github.com/kamicane/wrapup) why you
should use wrapup and Node-style Modules for browser JavaScript Code.

### Idea

The idea is that the user will see an JavaScript Editor field (CodeMirror)
where he or she can customize the `main.js` file, using `require()` calls,
export it on `global`, or don't export at all.

With a simple interface with checkboxes and select fields, a main.js file
can be generated in the Editor. By giving the user access to the editor adds
extra power for advanced users.

### Goals

- Add checkboxes to help the user include several packages or not by commenting
  or uncommenting lines in the editor.
- Select which packages and which versions the build should include.
- Download several packages from NPM. It could build a `packages.json` which
  defines the packages and versions.

### This app is built with:

- Node.js
- Express.js
- Jade
- Stylus
- Wrapup
- CodeMirror
