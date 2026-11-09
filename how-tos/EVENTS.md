# Bloxd World Code Callbacks

Callbacks are added to the workspace as green event blocks. The generated JavaScript uses each exact Bloxd callback name. Drag an event block onto the workspace to create its function, then place action blocks inside its body.

Callbacks and parameters below are taken from the callback catalog in `bloxdcodetool.js`. Callback behavior and return-value details can change; consult the [official Bloxd callback documentation](https://bloxd.io/docs/callbacks).

| Callback | Parameters | Supports a return value |
| --- | --- | --- |
| `tick` | `ms` | No return field |
| `onClose` | `serverIsShuttingDown` | No return field |
| `onPlayerJoin` | `playerId` | No return field |
| `onPlayerLeave` | `playerId, serverIsShuttingDown` | No return field |
| `onPlayerJump` | `playerId` | No return field |
| `onRespawnRequest` | `playerId` | Yes; enter a JavaScript expression in the event block return field. |
| `playerCommand` | `playerId, command` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerChat` | `playerId, message` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerAttemptChangeBlock` | `playerId, x, y, z, fromBlock, toBlock, droppedItem, fromBlockInfo, toBlockInfo` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerChangeBlock` | `playerId, x, y, z, fromBlock, toBlock, droppedItem, fromBlockInfo, toBlockInfo, dropsPrevented` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerDropItem` | `playerId, x, y, z, itemName, itemAmount, fromIdx` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerPickedUpItem` | `playerId, itemName, itemAmount, itemEntityId` | No return field |
| `onPlayerSelectInventorySlot` | `playerId, slotIndex` | No return field |
| `onBlockStand` | `playerId, x, y, z, blockName` | No return field |
| `onBlockStandStart` | `playerId, x, y, z, blockName` | No return field |
| `onBlockStandStop` | `playerId, x, y, z, blockName` | No return field |
| `onPlayerAttemptCraft` | `playerId, itemName, craftingIdx, craftTimes` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerCraft` | `playerId, itemName, craftingIdx, recipe, craftTimes` | No return field |
| `onPlayerAttemptOpenChest` | `playerId, x, y, z, isMoonstoneChest, isIronChest` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerOpenedChest` | `playerId, x, y, z, isMoonstoneChest, isIronChest` | No return field |
| `onPlayerMoveItemOutOfInventory` | `playerId, itemName, itemAmount, fromIdx, movementType` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerMoveInvenItem` | `playerId, fromIdx, toStartIdx, toEndIdx, amt` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerMoveItemIntoIdxs` | `playerId, start, end, moveIdx, itemAmount` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerSwapInvenSlots` | `playerId, i, j` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerMoveInvenItemWithAmt` | `playerId, i, j, amt` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerAttemptAltAction` | `playerId, x, y, z, block, targetEId` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerAltAction` | `playerId, x, y, z, block, targetEId` | No return field |
| `onPlayerClick` | `playerId, wasAltClick, x, y, z, block, targetEId` | No return field |
| `onPlayerClickUp` | `playerId, wasAltClick, x, y, z, block, targetEId` | No return field |
| `onClientOptionUpdated` | `playerId, option, value` | No return field |
| `onMobSettingUpdated` | `mobId, setting, value` | No return field |
| `onInventoryUpdated` | `playerId` | No return field |
| `onChestUpdated` | `initiatorEId, isMoonstoneChest, x, y, z` | No return field |
| `onWorldAttemptChangeBlock` | `x, y, z, fromBlock, toBlock, initiatorDbId, extraInfo` | Yes; enter a JavaScript expression in the event block return field. |
| `onWorldChangeBlock` | `x, y, z, fromBlock, toBlock, initiatorDbId, extraInfo, dropsPrevented` | Yes; enter a JavaScript expression in the event block return field. |
| `onCreateBloxdMeshEntity` | `eId, type, initiatorId` | No return field |
| `onEntityCollision` | `eId, otherEId` | No return field |
| `onPlayerAttemptSpawnMob` | `playerId, mobType, x, y, z` | Yes; enter a JavaScript expression in the event block return field. |
| `onWorldAttemptSpawnMob` | `mobType, x, y, z` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerSpawnMob` | `playerId, mobId, mobType, x, y, z, mobHerdId, playSoundOnSpawn` | No return field |
| `onWorldSpawnMob` | `mobId, mobType, x, y, z, mobHerdId, playSoundOnSpawn` | No return field |
| `onWorldAttemptDespawnMob` | `mobId` | Yes; enter a JavaScript expression in the event block return field. |
| `onMobDespawned` | `mobId` | No return field |
| `onPlayerAttemptSpawnVehicle` | `playerId, vehicleType, x, y, z` | Yes; enter a JavaScript expression in the event block return field. |
| `onWorldAttemptSpawnVehicle` | `vehicleType, x, y, z` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerSpawnVehicle` | `playerId, vehicleEId, vehicleType, x, y, z` | No return field |
| `onWorldSpawnVehicle` | `vehicleEId, vehicleType, x, y, z` | No return field |
| `onVehicleDespawned` | `vehicleEId, vehicleType` | No return field |
| `onEntityDeleted` | `eId, entityType` | No return field |
| `onPlayerAttack` | `playerId` | No return field |
| `onPlayerDamagingOtherPlayer` | `attackingPlayer, damagedPlayer, damageDealt, withItem, bodyPartHit, damagerDbId, damageInfo` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerDamagingMob` | `playerId, mobId, damageDealt, withItem, damagerDbId, damageInfo` | Yes; enter a JavaScript expression in the event block return field. |
| `onMobDamagingPlayer` | `attackingMob, damagedPlayer, damageDealt, withItem, damageInfo` | Yes; enter a JavaScript expression in the event block return field. |
| `onMobDamagingOtherMob` | `attackingMob, damagedMob, damageDealt, withItem, damageInfo` | Yes; enter a JavaScript expression in the event block return field. |
| `onAttemptKillPlayer` | `killedPlayer, attackingLifeform` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerKilledOtherPlayer` | `attackingPlayer, killedPlayer, damageDealt, withItem` | Yes; enter a JavaScript expression in the event block return field. |
| `onMobKilledPlayer` | `attackingMob, killedPlayer, damageDealt, withItem` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerKilledMob` | `playerId, mobId, damageDealt, withItem` | Yes; enter a JavaScript expression in the event block return field. |
| `onMobKilledOtherMob` | `attackingMob, killedMob, damageDealt, withItem` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerPotionEffect` | `initiatorId, targetId, effectName` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerDamagingMeshEntity` | `playerId, damagedId, damageDealt, withItem` | No return field |
| `onPlayerBreakMeshEntity` | `playerId, entityId` | No return field |
| `onPlayerUsedThrowable` | `playerId, throwableName, thrownEntityId` | No return field |
| `onPlayerThrowableHitTerrain` | `playerId, throwableName, thrownEntityId` | No return field |
| `onTouchscreenActionButton` | `playerId, touchDown` | No return field |
| `onTaskClaimed` | `playerId, taskId, isPromoTask, claimedRewards` | Yes; enter a JavaScript expression in the event block return field. |
| `onChunkLoaded` | `chunkId, chunk, wasPersistedChunk` | No return field |
| `onPlayerRequestChunk` | `playerId, chunkX, chunkY, chunkZ, chunkId` | No return field |
| `onItemDropCreated` | `itemEId, itemName, itemAmount, x, y, z` | No return field |
| `onPlayerStartChargingItem` | `playerId, itemName` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerFinishChargingItem` | `playerId, used, itemName, duration` | No return field |
| `onPlayerAttemptFish` | `playerId, rodName, x, y, z` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerSucceededFishCatch` | `playerId, rodName, x, y, z, caughtItemName` | Yes; enter a JavaScript expression in the event block return field. |
| `onPlayerFailedFishCatch` | `playerId, rodName, x, y, z, caughtItemName` | No return field |
| `onPlayerFinishQTE` | `playerId, qteId, result` | No return field |
| `onPlayerToggledShopMenu` | `playerId` | No return field |
| `onPlayerPlayedEmote` | `playerId, emoteId` | No return field |
| `onPlayerEnteredVehicle` | `playerId, vehicleType, vehicleEId` | No return field |
| `onPlayerExitedVehicle` | `playerId, vehicleType, vehicleEId` | No return field |
| `onPlayerBoughtShopItem` | `playerId, categoryKey, itemKey, item, userInput` | No return field |
| `onPlayerPressedButton` | `playerId, buttonId` | No return field |
| `onPlayerReleasedButton` | `playerId, buttonId` | No return field |
| `onUiRequestResponded` | `playerId, id, response` | No return field |
| `doPeriodicSave` | `` | No return field |
