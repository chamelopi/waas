export function showDebugCanvas(data: Uint32Array, width: number, height: number) {
    // Remove if existing
    document.getElementById("dbgCanvas")?.remove();

    let dbgCanvas = document.createElement("canvas");
    dbgCanvas.setAttribute("id", "dbgCanvas");
    dbgCanvas.setAttribute("width", "" + width);
    dbgCanvas.setAttribute("height", "" + height);
    // Scale canvas up a bit to show pixel values better
    dbgCanvas.setAttribute("style", `position: absolute; top: 80px; left: 10px; width: ${width*4}px; height: ${height*4}px; z-index: 1000; border: 1px solid black;`);
    document.body.appendChild(dbgCanvas);
    let ctx = dbgCanvas.getContext("2d");
    let img = ctx.getImageData(0, 0, width, height);
    img.data.set(new Uint8Array(data.buffer));
    ctx.putImageData(img, 0, 0);
}