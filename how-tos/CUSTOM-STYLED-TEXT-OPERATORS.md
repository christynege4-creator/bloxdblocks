# CustomTextStyling Operators

The `Custom Text []` block builds an array accepted by Bloxd parameters typed as `CustomTextStyling`. Place one or more text operators inside the list, then connect the list to a compatible API argument such as a message. The generated output is a JavaScript array.

## Available items

| Toolbox block | Inputs | Generated item |
| --- | --- | --- |
| `Text` | `Text`, `Color`, `Weight` | `{ str: text, style: { color, fontWeight } }` |
| `Text` | `Text` | A plain string |
| `Translated Text` | `Translation Key`, `Params` | `{ translationKey, params }` |
| `Icon` | `Icon`, `Color`, `Font Size`, `Opacity` | `{ icon, style: { color, fontSize, opacity } }` |
| `ProgressBar` | `ProgressBar` | The supplied ProgressBar expression |
| `StyledKeyBinding` | `StyledKeyBinding` | The supplied StyledKeyBinding expression |

The first `Text` operator is the editor's existing styled-text block. Its `Color` and `Weight` fields are emitted as style values; enter values in the form expected by Bloxd (for example `red` and `bold`). The second `Text` operator emits an ordinary string.

For `Translated Text`, enter a translation key and a JavaScript object for the optional parameters. For `Icon`, enter the icon value, a color, a CSS-like font-size string, and an opacity value. The progress-bar and key-binding type shapes are not specified in the published `CustomTextStyling` union itself, so their inputs accept the corresponding Bloxd-supported JavaScript expressions.

## Example

```js
api.sendMessage(playerId, [
  { str: "Welcome, ", style: { color: "gold", fontWeight: "bold" } },
  { entityName: playerName, style: { color: "white" } },
  { icon: "heart", style: { color: "red", fontSize: "16px", opacity: 1 } },
  { translationKey: "welcome.message", params: { count: 3 } }
]);
```

Bloxd documents the union as:

```ts
type CustomTextStyling =
  (string | EntityName | TranslatedText | StyledIcon | StyledText | ProgressBar | StyledKeyBinding)[]
```

The editor currently provides direct builders for plain strings, translated text, icons, progress bars, and key bindings, plus the existing styled-text operator. `EntityName` is not a separate toolbox block; use a JavaScript object expression in a compatible input when a method supports it.

See the official [CustomTextStyling type](https://bloxd.io/docs/types#CustomTextStyling) and [Bloxd API reference](https://bloxd.io/docs/api-reference) for current supported values and method-specific parameter requirements.