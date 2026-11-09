# Bloxd API Methods

The toolbox contains the API methods listed below. Void methods are statement blocks; methods with a return value are reporter blocks that can be nested in value inputs. Enter JavaScript expressions for arguments (for example, `playerId`, `10`, `[x, y, z]`, or `{ key: value }`).

Each toolbox block links to its current [official Bloxd API reference](https://bloxd.io/docs/api-reference). The method catalog and argument names below match the implementation in `bloxdcodetool.js`; consult the official reference for parameter types, optional arguments, and behavior.

Catalog entries: 251.

| API method | Arguments | Returns a value |
| --- | --- | --- |
| `api.addCustomKillfeedMessage` | `killer, victim, withItem` | No (action) |
| `api.addFollowingEntityToPlayer` | `playerId, eId, offset, followsPlayerRotation` | No (action) |
| `api.addQTE` | `playerId, qteParameters` | Yes (reporter) |
| `api.addUiRequest` | `playerId, parameters, timeoutAfterMs` | Yes (reporter) |
| `api.addUiRequestPopup` | `playerId, requestText` | Yes (reporter) |
| `api.animateEntity` | `entityId, animation, initialTimeFraction, animationSpeed` | No (action) |
| `api.applyAuraChange` | `playerId, auraDiff` | Yes (reporter) |
| `api.applyEffect` | `lifeformId, effectName, duration, customEffectInfo` | No (action) |
| `api.applyHealthChange` | `lifeformId, changeAmount, whoDidDamage, broadcastLifeformHurt` | Yes (reporter) |
| `api.applyImpulse` | `eId, xImpulse, yImpulse, zImpulse` | No (action) |
| `api.applyMeleeHit` | `hittingEId, hitEId, dirFacing, bodyPartHit, overrides` | Yes (reporter) |
| `api.attemptApplyDamage` | `options` | Yes (reporter) |
| `api.attemptCreateAudioEntity` | `x, y, z, soundName, volume, options` | Yes (reporter) |
| `api.attemptCreateMeshEntity` | `type, opts, name, physicsOptions, initiatorId` | Yes (reporter) |
| `api.attemptCreateThrowable` | `throwerEId, itemName, position, direction, velocityMult, damageMult, gravityMult, attributes` | Yes (reporter) |
| `api.attemptSpawnMob` | `mobType, x, y, z, opts` | Yes (reporter) |
| `api.attemptSpawnVehicle` | `vehicleType, x, y, z, opts` | Yes (reporter) |
| `api.attemptWorldChangeBlock` | `initiatorDbId, x, y, z, blockName, extraInfo` | Yes (reporter) |
| `api.blockCoordToChunkId` | `pos` | Yes (reporter) |
| `api.blockIdToBlockName` | `blockId` | Yes (reporter) |
| `api.blockNameToBlockId` | `blockName, allowInvalidBlock` | Yes (reporter) |
| `api.broadcastMessage` | `message, style` | No (action) |
| `api.broadcastSound` | `soundName, volume, rate, posSettings, exceptPlayerId` | No (action) |
| `api.calcExplosionForce` | `eId, explosionType, knockbackFactor, explosionRadius, explosionPos, ignoreProjectiles` | Yes (reporter) |
| `api.canOpenStandardChest` | `playerId, chestX, chestY, chestZ` | Yes (reporter) |
| `api.changePlayerIntoSkin` | `playerId, cosmeticType, cosmeticName` | No (action) |
| `api.checkValid` | `entityId` | Yes (reporter) |
| `api.chunkIdToBotLeftCoord` | `chunkId` | Yes (reporter) |
| `api.clearDirectionArrow` | `playerId, id` | No (action) |
| `api.clearInventory` | `playerId` | No (action) |
| `api.clearKillstreak` | `playerId` | No (action) |
| `api.closeChestForPlayer` | `playerId` | No (action) |
| `api.configureShopCategory` | `categoryKey, config` | No (action) |
| `api.configureShopCategoryForPlayer` | `playerId, categoryKey, config` | No (action) |
| `api.copyChunk` | `fromPos, toPos` | No (action) |
| `api.createEnchantmentAttributesForItem` | `itemName, enchantmentLevel` | Yes (reporter) |
| `api.createItemDrop` | `x, y, z, itemName, amount, mergeItems, attributes, timeTillDespawn, dropperId, options` | Yes (reporter) |
| `api.createMobHerd` | `` | Yes (reporter) |
| `api.createShopItem` | `categoryKey, itemKey, item` | No (action) |
| `api.createShopItemForPlayer` | `playerId, categoryKey, itemKey, item` | No (action) |
| `api.deleteAllItems` | `` | No (action) |
| `api.deleteAllLobbyDbValues` | `` | No (action) |
| `api.deleteAllPlayerDbValues` | `playerId` | No (action) |
| `api.deleteAudioEntity` | `eId` | No (action) |
| `api.deleteCurrency` | `playerId, currencyId` | No (action) |
| `api.deleteEntity` | `eId` | Yes (reporter) |
| `api.deleteItemDrop` | `itemId` | No (action) |
| `api.deleteLobbyDbValue` | `key` | No (action) |
| `api.deleteMeshEntity` | `eId` | Yes (reporter) |
| `api.deletePlayerDbValue` | `playerId, key` | No (action) |
| `api.deleteQTE` | `playerId, id` | No (action) |
| `api.deleteShopItem` | `categoryKey, itemKey` | No (action) |
| `api.deleteThrowable` | `eId` | Yes (reporter) |
| `api.deleteUiRequest` | `playerId, id` | No (action) |
| `api.despawnMob` | `mobId` | No (action) |
| `api.despawnVehicle` | `vehicleId` | No (action) |
| `api.editItemCraftingRecipes` | `playerId, itemName, recipesForItem` | No (action) |
| `api.exitPlayerVehicle` | `playerId` | No (action) |
| `api.findItem` | `playerId, itemName` | Yes (reporter) |
| `api.findStandardChestItem` | `chestPos, itemName` | Yes (reporter) |
| `api.forceRespawn` | `playerId, respawnPos` | No (action) |
| `api.getAuraInfo` | `playerId` | Yes (reporter) |
| `api.getBlock` | `x, y, z` | Yes (reporter) |
| `api.getBlockCoordinatesPlayerStandingOn` | `playerId` | Yes (reporter) |
| `api.getBlockData` | `x, y, z` | Yes (reporter) |
| `api.getBlockId` | `x, y, z` | Yes (reporter) |
| `api.getBlockSolidity` | `x, y, z` | Yes (reporter) |
| `api.getBlockTypesPlayerStandingOn` | `playerId` | Yes (reporter) |
| `api.getClientOption` | `playerId, option` | Yes (reporter) |
| `api.getCraftingRecipesForPlayer` | `playerId` | Yes (reporter) |
| `api.getCurrencyAmount` | `playerId, currencyId` | Yes (reporter) |
| `api.getCurrentKillstreak` | `playerId` | Yes (reporter) |
| `api.getDefaultMobSetting` | `mobType, setting` | Yes (reporter) |
| `api.getEffectLevel` | `lifeformId, name` | Yes (reporter) |
| `api.getEffects` | `lifeformId` | Yes (reporter) |
| `api.getEmptyChunk` | `` | Yes (reporter) |
| `api.getEntitiesInRect` | `minCoords, maxCoords` | Yes (reporter) |
| `api.getEntityHeading` | `entityId` | Yes (reporter) |
| `api.getEntityName` | `entityId` | Yes (reporter) |
| `api.getEntityRotation` | `entityId` | Yes (reporter) |
| `api.getEntityType` | `entityId` | Yes (reporter) |
| `api.getHealth` | `entityId` | Yes (reporter) |
| `api.getHeldItem` | `playerId` | Yes (reporter) |
| `api.getInitialItemMetadata` | `itemName` | Yes (reporter) |
| `api.getInventoryFreeSlotCount` | `playerId` | Yes (reporter) |
| `api.getInventoryItemAmount` | `playerId, itemName` | Yes (reporter) |
| `api.getItemAmount` | `itemId` | Yes (reporter) |
| `api.getItemDropName` | `itemEId` | Yes (reporter) |
| `api.getItemIDsOverlappingWithPlayer` | `playerId` | Yes (reporter) |
| `api.getItemSlot` | `playerId, itemSlotIndex` | Yes (reporter) |
| `api.getItemStat` | `lifeformId, itemName, stat` | Yes (reporter) |
| `api.getLifeformScale` | `lifeformId` | Yes (reporter) |
| `api.getLobbyDbValue` | `key` | Yes (reporter) |
| `api.getLobbyName` | `` | Yes (reporter) |
| `api.getLobbyType` | `` | Yes (reporter) |
| `api.getMetaInfo` | `blockName` | Yes (reporter) |
| `api.getMobAiState` | `mobId` | Yes (reporter) |
| `api.getMobDbId` | `mobId` | Yes (reporter) |
| `api.getMobIds` | `` | Yes (reporter) |
| `api.getMobSetting` | `mobId, setting, returnDefaultIfNotOverridden` | Yes (reporter) |
| `api.getMoonstoneChestItems` | `playerId` | Yes (reporter) |
| `api.getMoonstoneChestItemSlot` | `playerId, idx` | Yes (reporter) |
| `api.getNumMobs` | `` | Yes (reporter) |
| `api.getNumPlayers` | `` | Yes (reporter) |
| `api.getOtherEntitySetting` | `relevantPlayerId, targetedEntityId, settingName` | Yes (reporter) |
| `api.getPlayerCosmetic` | `playerId, cosmeticType` | Yes (reporter) |
| `api.getPlayerDbId` | `playerId` | Yes (reporter) |
| `api.getPlayerDbValue` | `playerId, key` | Yes (reporter) |
| `api.getPlayerFacingInfo` | `playerId` | Yes (reporter) |
| `api.getPlayerGamemode` | `playerId` | Yes (reporter) |
| `api.getPlayerId` | `playerName` | Yes (reporter) |
| `api.getPlayerIdFromDbId` | `dbId` | Yes (reporter) |
| `api.getPlayerIds` | `` | Yes (reporter) |
| `api.getPlayerPartyWhenJoined` | `playerId` | Yes (reporter) |
| `api.getPlayerPhysicsState` | `playerId` | Yes (reporter) |
| `api.getPlayerTargetInfo` | `playerId` | Yes (reporter) |
| `api.getPosition` | `entityId` | Yes (reporter) |
| `api.getQueuedStatus` | `id` | Yes (reporter) |
| `api.getSchematicDimensions` | `schematicPath` | Yes (reporter) |
| `api.getSelectedInventorySlotI` | `playerId` | Yes (reporter) |
| `api.getShieldAmount` | `entityId` | Yes (reporter) |
| `api.getStandardChestFreeSlotCount` | `chestPos` | Yes (reporter) |
| `api.getStandardChestItemAmount` | `chestPos, itemName` | Yes (reporter) |
| `api.getStandardChestItems` | `chestPos` | Yes (reporter) |
| `api.getStandardChestItemSlot` | `chestPos, idx` | Yes (reporter) |
| `api.getUnitCoordinatesLifeformWithin` | `lifeformId` | Yes (reporter) |
| `api.getVariation` | `` | Yes (reporter) |
| `api.getVehicleSeats` | `vehicleEId` | Yes (reporter) |
| `api.getVehicleSetting` | `vehicleEId, setting, returnDefaultIfNotOverridden` | Yes (reporter) |
| `api.getVelocity` | `eId` | Yes (reporter) |
| `api.giveCurrencyAmount` | `playerId, currencyId, amount` | No (action) |
| `api.giveItem` | `playerId, itemName, itemAmount, attributes` | Yes (reporter) |
| `api.giveStandardChestItem` | `chestPos, itemName, itemAmount, playerId, attributes` | Yes (reporter) |
| `api.hasActiveQTE` | `playerId` | Yes (reporter) |
| `api.hasEffect` | `lifeformId, name, atOrAboveLevel` | Yes (reporter) |
| `api.hasItem` | `playerId, itemName` | Yes (reporter) |
| `api.initiateMiddleScreenBar` | `playerId, duration, chargeExpiresAutomatically, horizontalBarRemOffset` | No (action) |
| `api.inventoryIsFull` | `playerId` | Yes (reporter) |
| `api.isAlive` | `lifeformId` | Yes (reporter) |
| `api.isBlockInLoadedChunk` | `x, y, z` | Yes (reporter) |
| `api.isInsideRect` | `coordsToCheck, pos1, pos2, addOneToMax` | Yes (reporter) |
| `api.isMobile` | `playerId` | Yes (reporter) |
| `api.isNearInterrupt` | `` | Yes (reporter) |
| `api.isPlayerCrouching` | `playerId` | Yes (reporter) |
| `api.isPublicLobby` | `` | Yes (reporter) |
| `api.isUsingCustomGameTexturePack` | `playerId` | Yes (reporter) |
| `api.kickPlayer` | `playerId, reason` | No (action) |
| `api.killLifeform` | `lifeformId, whoKilled` | No (action) |
| `api.matchmakePlayer` | `playerId, game, lobbyName` | No (action) |
| `api.matchmakeToVariation` | `playerId, varname` | No (action) |
| `api.now` | `` | Yes (reporter) |
| `api.openChestForPlayer` | `playerId, x, y, z` | No (action) |
| `api.openShop` | `playerId, toggle, forceCategoryKey, onlyIfNonEmpty` | No (action) |
| `api.passifyHostility` | `mobId, targetLifeformId` | No (action) |
| `api.playClientPredictedSound` | `soundName, volume, rate, posSettings, predictedBy` | No (action) |
| `api.playerIsInGame` | `playerId` | Yes (reporter) |
| `api.playerIsLoggedIn` | `playerId` | Yes (reporter) |
| `api.playParticleEffect` | `opts, clientPredictedBy` | No (action) |
| `api.playSound` | `playerId, soundName, volume, rate, posSettings` | No (action) |
| `api.preventFallDamageNextGrounding` | `playerId` | No (action) |
| `api.progressBarUpdate` | `playerId, toFraction, toDuration` | No (action) |
| `api.queueCrosshairText` | `playerId, text, duration` | Yes (reporter) |
| `api.queueMiddleTextLower` | `playerId, text, duration` | Yes (reporter) |
| `api.queueMiddleTextUpper` | `playerId, text, duration` | Yes (reporter) |
| `api.raycastForBlock` | `fromPos, dirVec` | Yes (reporter) |
| `api.registerAnalyticsEvent` | `playerId, eventType, eventValue, gameCategoryId, gameStartTimeMs, position, numericValue` | No (action) |
| `api.registerAnalyticsPlayerPosition` | `playerId, gameCategoryId, gameStartTimeMs, position` | No (action) |
| `api.removeAppliedSkin` | `playerId` | No (action) |
| `api.removeEffect` | `lifeformId, name` | No (action) |
| `api.removeFollowingEntityFromPlayer` | `playerId, entityEId` | No (action) |
| `api.removeFromQueue` | `id` | No (action) |
| `api.removeItemCraftingRecipes` | `playerId, itemName` | No (action) |
| `api.removeItemName` | `playerId, itemName, amount` | No (action) |
| `api.removeItemNameFromStandardChest` | `chestPos, itemName, amount, playerId` | No (action) |
| `api.removeMiddleScreenBar` | `playerId` | No (action) |
| `api.resetCanChangeBlock` | `playerId, x, y, z` | No (action) |
| `api.resetCanChangeBlockRect` | `playerId, pos1, pos2` | No (action) |
| `api.resetCanChangeBlockType` | `playerId, blockName` | No (action) |
| `api.resetCanPickUpItem` | `playerId, itemId` | No (action) |
| `api.resetItemCraftingRecipes` | `playerId, itemName` | No (action) |
| `api.resetShopItemForPlayer` | `playerId, categoryKey, itemKey` | No (action) |
| `api.scalePlayerMeshNodes` | `playerId, nodeScales` | No (action) |
| `api.sendFlyingMiddleMessage` | `playerId, message, distanceFromAction, lifetimeMs` | No (action) |
| `api.sendHitmarker` | `playerId, isCrit, directionVector` | No (action) |
| `api.sendMessage` | `playerId, message, style` | No (action) |
| `api.sendOverShopInfo` | `playerId, info` | No (action) |
| `api.sendTopRightHelper` | `playerId, icon, text, opts` | No (action) |
| `api.setAuraLevel` | `playerId, level` | No (action) |
| `api.setBlock` | `x, y, z, blockName` | No (action) |
| `api.setBlockData` | `x, y, z, data` | No (action) |
| `api.setBlockRect` | `pos1, pos2, blockName` | No (action) |
| `api.setBlockWalls` | `pos1, pos2, blockName, hasFloor, hasCeiling` | No (action) |
| `api.setCallbackValueFallback` | `cbName, value` | No (action) |
| `api.setCameraDirection` | `playerId, direction` | No (action) |
| `api.setCameraZoom` | `playerId, zoom` | No (action) |
| `api.setCanChangeBlock` | `playerId, x, y, z` | No (action) |
| `api.setCanChangeBlockRect` | `playerId, pos1, pos2` | No (action) |
| `api.setCanChangeBlockType` | `playerId, blockName` | No (action) |
| `api.setCantChangeBlock` | `playerId, x, y, z` | No (action) |
| `api.setCantChangeBlockRect` | `playerId, pos1, pos2` | No (action) |
| `api.setCantChangeBlockType` | `playerId, blockName` | No (action) |
| `api.setCantPickUpItem` | `playerId, itemId` | No (action) |
| `api.setChunkAsSchematic` | `schematicPath, srcCoords, destCoords` | No (action) |
| `api.setClientOption` | `playerId, option, value` | No (action) |
| `api.setClientOptions` | `playerId, optionsObj` | No (action) |
| `api.setClientOptionToDefault` | `playerId, option` | No (action) |
| `api.setCurrency` | `playerId, currencyId, info` | No (action) |
| `api.setCurrencyAmount` | `playerId, currencyId, amount, subtext` | No (action) |
| `api.setDefaultMobSetting` | `mobType, setting, value` | No (action) |
| `api.setDirectionArrow` | `playerId, id, position, text, showDistance, style` | No (action) |
| `api.setEntityHeading` | `entityId, newHeading` | No (action) |
| `api.setEntityRotation` | `entityId, xRotation, yRotation, zRotation` | No (action) |
| `api.setEveryoneSettingForPlayer` | `playerId, settingName, settingValue, includeNewJoiners` | No (action) |
| `api.setHealth` | `entityId, newHealth, whoDidDamage, increaseMaxHealthIfNeeded` | Yes (reporter) |
| `api.setItemAmount` | `itemId, newAmount` | No (action) |
| `api.setItemSlot` | `playerId, itemSlotIndex, itemName, itemAmount, attributes, tellClient` | No (action) |
| `api.setItemStat` | `playerId, itemName, stat, value` | No (action) |
| `api.setLifeformScale` | `lifeformId, scale` | No (action) |
| `api.setLobbyDbValue` | `key, value` | No (action) |
| `api.setMaxPlayers` | `softMaxPlayers, maxPlayers` | No (action) |
| `api.setMobAiState` | `mobId, state, params, opts` | No (action) |
| `api.setMobSetting` | `mobId, setting, value` | No (action) |
| `api.setMoonstoneChestItemSlot` | `playerId, idx, itemName, itemAmount, metadata` | No (action) |
| `api.setOtherEntitySetting` | `relevantPlayerId, targetedEntityId, settingName, settingValue` | No (action) |
| `api.setOtherEntitySettings` | `relevantPlayerId, targetedEntityId, settingsObject` | No (action) |
| `api.setOtherEntitySettingToDefault` | `relevantPlayerId, targetedEntityId, settingName` | No (action) |
| `api.setPlayerDbValue` | `playerId, key, value` | No (action) |
| `api.setPlayerGamemode` | `playerId, gamemode` | No (action) |
| `api.setPlayerOpacity` | `playerId, opacity` | No (action) |
| `api.setPlayerOpacityForOnePlayer` | `playerIdWhoViewsOpacityPlayer, playerIdOfOpacityPlayer, opacity` | No (action) |
| `api.setPlayerPhysicsState` | `playerId, physicsState, positionOffset` | No (action) |
| `api.setPlayerPose` | `playerId, pose, poseOffset` | No (action) |
| `api.setPlayerVehicle` | `playerId, vehicleEId, seatIndex` | No (action) |
| `api.setPosition` | `entityId, x, y, z` | No (action) |
| `api.setSelectedInventorySlotI` | `playerId, newI` | No (action) |
| `api.setShieldAmount` | `lifeformId, newShieldAmount` | No (action) |
| `api.setStandardChestItemSlot` | `chestPos, idx, itemName, itemAmount, playerId, attributes` | No (action) |
| `api.setTargetedPlayerSettingForEveryone` | `targetedPlayerId, settingName, settingValue, includeNewJoiners` | No (action) |
| `api.setTotalAura` | `playerId, totalAura` | No (action) |
| `api.setVehicleSetting` | `vehicleEId, setting, value` | No (action) |
| `api.setVelocity` | `eId, x, y, z` | No (action) |
| `api.setWalkThroughRect` | `playerId, pos1, pos2, updateType` | No (action) |
| `api.setWalkThroughType` | `playerId, blockName, disable` | No (action) |
| `api.shakePlayerCamera` | `playerId, intensity, durationMs` | No (action) |
| `api.showShopTutorial` | `playerId` | No (action) |
| `api.updateAudioEntity` | `eId, opts` | No (action) |
| `api.updateEntityNodeMeshAttachment` | `eId, node, type, opts, offset, rotation` | No (action) |
| `api.updateMeshEntity` | `eId, type, opts` | No (action) |
| `api.updateMeshParticleSystems` | `updates` | No (action) |
| `api.updateShopItem` | `categoryKey, itemKey, changes` | No (action) |
| `api.updateShopItemForPlayer` | `playerId, categoryKey, itemKey, changes` | No (action) |
