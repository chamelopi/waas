import { GUIBase } from "./gui-base";
import { Controls } from "../controls";

export class MapEditor extends GUIBase {

    private html: string;
    private mode: MapEditorMode;

    constructor(private controls: Controls) {
        super();
        this.html = `
        <div class="ui-base ui-top-right">
            <button id="editor-select-mode">Select</button>
            <button id="editor-height-mode">Edit terrain height</button>
            <button id="editor-texture-mode">Edit terrain texture</button>
            <span id="editor-current-mode">select mode</span>
        </div>
        `
        this.mode = MapEditorMode.SelectMode;
    }

    getHtml(): string {
        return this.html;
    }

    onShow(): void {
        super.onShow();
        this.addEvent("click", "editor-height-mode", () => {
            this.setText("editor-current-mode", "height mode");
            this.mode = MapEditorMode.HeightMode;
        });
        this.addEvent("click", "editor-texture-mode", () => {
            this.setText("editor-current-mode", "texture mode");
            this.mode = MapEditorMode.TextureMode;
        });
        this.addEvent("click", "editor-select-mode", () => {
            this.setText("editor-current-mode", "select mode");
            this.mode = MapEditorMode.SelectMode;
        })
    }

    onHide(): void {
        super.onHide();
    }

    onUpdate(dt: Number): void {
        if (this.controls.getMouseState(0)) {
            console.log("up");
        } else if (this.controls.getMouseState(2)) {
            console.log("down");
        }
    }
}

enum MapEditorMode {
    SelectMode,
    HeightMode,
    TextureMode,
}
