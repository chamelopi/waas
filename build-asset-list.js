//
// This script generates a list of all assets in the 'assets' directory,
// split up by file types. This allows for dynamic loading.
//

const fs = require('fs');
const path = require('path');

const ASSET_DIR = "dist/assets";
const ASSET_LIST = `${ASSET_DIR}/asset-list.json`;
const MODEL_EXTENSIONS = [".glb", ".gltf"];
const TEXTURE_EXTENSIONS = [".png", ".jpg", ".jpeg"];
const SHADER_EXTENSIONS = [".glsl"];

let assetData = {
    models: [],
    textures: [],
    shaders: [],
};

const isType = (dirent, extensionList) => {
    return extensionList.indexOf(path.extname(dirent.name)) > -1
};

const stripBasePath = (path) => {
    return path.replace(ASSET_DIR, "");
}

// Walk asset dir and list all files based on their type
const dirHandler = (curdir, dirent) => {
    const relativeName = path.join(stripBasePath(curdir), dirent.name)
        // Replace backslash with forward slash on windows
        .replace(/\\/g, "/")
        // Remove leading slash
        .replace(/^\//, "");
    const fullName = `${curdir}/${dirent.name}`;
    if (dirent.isDirectory()) {
        // Recurse into directories
        let contents = fs.readdirSync(fullName, { withFileTypes: true });
        contents.forEach(entry => dirHandler(fullName, entry));
    } else if (dirent.isFile()) {
        // Distinguish known file types
        if (isType(dirent, MODEL_EXTENSIONS)) {
            assetData.models.push(relativeName);
        } else if (isType(dirent, TEXTURE_EXTENSIONS)) {
            assetData.textures.push(relativeName);
        } else if (isType(dirent, SHADER_EXTENSIONS)) {
            assetData.shaders.push(relativeName);
        }
    }
}

let contents = fs.readdirSync(ASSET_DIR, { withFileTypes: true });
contents.forEach(entry => dirHandler(ASSET_DIR, entry));

fs.writeFileSync(ASSET_LIST, JSON.stringify(assetData));

console.log("Asset list updated!");