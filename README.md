# BloxdBlocks

A browser-based visual editor for building Bloxd.io world code. Arrange event, action, control, and value blocks in the workspace; the editor generates JavaScript world code as you work.

## Open the app

Open [`index.html`](./index.html) for the landing page and [`docs/docs.html`](./docs/docs.html) for the editor guide, then choose **Open the editor**. You can also open [`bloxdcodetool.html`](./bloxdcodetool.html) directly in a modern browser. The editor uses CodeMirror from a CDN for the source editor, so an internet connection is needed to load that dependency. There is no build step.

## Use the editor

1. Drag an event block from the toolbox onto the workspace.
2. Drag actions and control blocks into the event body. Drag value blocks into compatible input sockets.
3. Copy the generated JavaScript source into your Bloxd.io world code.
4. Search the toolbox to find blocks by label, method name, or description.
5. Add variables and functions from their categories.
6. Use **SAVE** to export the complete workspace as a `.bb` file, then **LOAD** to select and restore that file.

`.bb` files stay on your device unless you choose to share them; they are not uploaded or synchronized by the editor.

## Documentation

- [About the project](./about/ABOUT.md)
- [Callbacks and events](./how-tos/EVENTS.md)
- [Bloxd API method blocks](./how-tos/API-METHODS.md)
- [Built-in operators and blocks](./how-tos/OPERATORS.md)
- [CustomTextStyling blocks](./how-tos/CUSTOM-STYLED-TEXT-OPERATORS.md)

The official [Bloxd callbacks](https://bloxd.io/docs/callbacks), [API reference](https://bloxd.io/docs/api-reference), and [type reference](https://bloxd.io/docs/types#CustomTextStyling) are the authoritative sources for runtime behavior and API parameter types.