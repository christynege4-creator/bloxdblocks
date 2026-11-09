# About

BloxdBlocks is a client-side visual programming editor for Bloxd.io world code. It is designed to help users compose world callbacks and API calls as blocks, then copy the generated JavaScript into a Bloxd.io custom world.

## Main features

- Event blocks for the Bloxd callback catalog, with callback parameters exposed as draggable local value blocks.
- Searchable toolbox organized into Event, Game API, Custom Styled Text, Logic, Operator, Item Operator, Variable, and Function categories.
- API method blocks generated from the method catalog in `bloxdcodetool.js`; methods with return values can be nested in value sockets.
- Control blocks for `if`, `if / else`, and repeat loops.
- CustomTextStyling builders for plain text, styled text, translated text, icons, progress bars, and key bindings.
- JavaScript source generation, with user-defined variables and functions.
- Workspace zoom, panning, save/load, examples, and a short interactive tutorial.

## Project files

- `bloxdcodetool.html` — editor page and UI structure.
- `bloxdcodetool.css` — visual styling and responsive block layout.
- `bloxdcodetool.js` — block registry, workspace interactions, catalogs, serialization, and JavaScript generation.
- The Markdown files document the supported callbacks, API methods, and block families.

The editor generates source code; it does not connect to a Bloxd.io world, execute the world code, or validate API arguments against the game server. Check generated code and the official Bloxd documentation before using it.