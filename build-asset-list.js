//
// This script generates a list of all assets in the 'assets' directory,
// split up by file types. This allows for dynamic loading.
//

const fs = require('fs');
const path = require('path');

const ASSET_DIR = "assets";
const ASSET_LIST = `${ASSET_DIR}/asset-list.json`;
const MODEL_EXTENSIONS = [".glb", ".gltf"];
const TEXTURE_EXTENSIONS = [".png", ".jpg", ".jpeg"];

let assetData = {
    models: [],
    textures: [],
};

const isType = (dirent, extensionList) => {
    return extensionList.indexOf(path.extname(dirent.name)) > -1
};

// Walk asset dir and list all files based on their type
const dirHandler = (curdir, dirent) => {
    const fullName = `${curdir}/${dirent.name}`;
    if (dirent.isDirectory()) {
        // Recurse into directories
        let contents = fs.readdirSync(fullName, { withFileTypes: true });
        contents.forEach(entry => dirHandler(fullName, entry));
    } else if (dirent.isFile()) {
        // Distinguish known file types
        if (isType(dirent, MODEL_EXTENSIONS)) {
            assetData.models.push(fullName);
        } else if (isType(dirent, TEXTURE_EXTENSIONS)) {
            assetData.textures.push(fullName);
        }
    }
}

let contents = fs.readdirSync(ASSET_DIR, { withFileTypes: true });
contents.forEach(entry => dirHandler(ASSET_DIR, entry));

fs.writeFileSync(ASSET_LIST, JSON.stringify(assetData));