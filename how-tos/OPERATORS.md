# Operators and Built-in Blocks

This page covers the built-in operators and helper blocks provided by the editor. The complete callback and API block catalogs are documented in [EVENTS.md](./EVENTS.md) and [API-METHODS.md](./API-METHODS.md).

## Control blocks

| Block | Generated JavaScript |
| --- | --- |
| `if` | `if (condition) { ... }` |
| `if / else` | `if (condition) { ... } else { ... }` |
| `repeat` | A `for` loop that runs the nested blocks the selected number of times |

## Boolean and math operators

| Block | Generated JavaScript |
| --- | --- |
| `=` | Equality comparison (`==`) |
| `<` | Less-than comparison |
| `>` | Greater-than comparison |
| `and` | Logical AND (`&&`) |
| `or` | Logical OR (`||`) |
| `not` | Logical NOT (`!`) |
| `+` | Addition |
| `-` | Subtraction |
| `*` | Multiplication |
| `/` | Division |
| `Random from to` | Random integer in the selected inclusive range |
| `x`, `y`, `z` | Read a component from a three-element vector |

## Value blocks

| Block | Generated value |
| --- | --- |
| `VEC3` | A three-element array: `[x, y, z]` |
| `Get Health` | `api.getHealth(entityId)` |
| `Is Crouching?` | `api.isPlayerCrouching(playerId)` |
| `Is Alive?` | `api.isAlive(lifeformId)` |

Callback argument reporters are local to their event. Only reporters belonging to the enclosing callback can be used there; invalid out-of-scope callback reporters are removed when blocks are placed.

## Variables, functions, and types

Create variables from the Variable category; each gets a reporter, a `set` block, and a type-aware change block. Numeric variables use `+=`, while variables declared as `string` use assignment. Create functions from the Function category to add a definition block and a call block. A call whose definition is not placed in the workspace still generates an empty function stub.

## Built-in action blocks

The editor also includes shortcut action blocks for setting position or velocity, applying an impulse, setting health, sending or broadcasting messages, killing or kicking an entity, logging a value, and giving an item. The full API catalog offers these methods and additional Bloxd methods as well.

## Expressions in inputs

Most text inputs are converted to JavaScript values: numbers and `true`/`false` remain literals, while other unquoted text becomes a quoted string. Inputs marked for JavaScript expressions are emitted as entered, allowing values such as variables, arrays, object literals, and nested API reporter calls.