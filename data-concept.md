# Data concept

I will try to lay out the different kinds of data & data storage necessary for the map.

## Types of data

### 1 Map-independent data

Data that has to be present/loaded at the start and is always needed

- (terrain) shaders
- types of and number of terrain textures
  - the `Terrain` class should dynamically load this from assets, there should be no hardcoded filenames in the code
- terrain textures
- types of entities/doodads
  - the `EntityManager` class should know about this (dynamically loaded from assets)

### 2 Map-specific data

Data that is loaded per map, should be saved when the map is changed in the editor, etc.

- **height map**
- **weight map**

(these two can also *vary in size*, our mesh generation should already support that!)

These are the responsibility of the `Terrain` class or a separate `TerrainData` class

- **instances of entities/doodads**, including
  - their transforms (position, rotation, scale?)
  - their owning player (if we do turn this into an actual game later)

These should be stored and managed by the `EntityManager`.

Map-specific storage could also be used for implementing Savegames if this does turn into a game.

## Load/store strategies

This primarily pertains to **map-specific data**, since map-independent data should be stored in the assets.

### 1 server side storage

The client could pack the map data into a suitable container format (JSON with base64, zip, tar, etc.) and transmit it to a server for storage. Maps could be loaded from the server using the same technique.

- (+) storage is centralized, users do not need to have local copies of maps
- (+) maps could be downloaded via an API endpoint (as well as uploaded in theory)
- (+) maps can be trivially shared between users
- (-) backend needs to be added to the project
- (--) authentication, authorization, quota limitation, etc. will be required

### 2 local storage in browser

Map-specific data is stored using `LocalStorage`.

- (+) no need to create a server/setup a DB
- (+) no additional effort for security required
- (-) maps cannot easily be shared between users
- (-) user might clear local storage by accident
- (-) user cannot access stored map in the file system

### 3 file upload/download

Saving a map means downloading it, loading a map means uploading it. For ease of use, this would also require a container format like in (1).
The upload step might require some form of input validation.

- (+) no need to create a server/setup DB
- (+) no additional effort for security required
- (+) maps can be shared between users via file copying
- (-) user can delete local files by accident

