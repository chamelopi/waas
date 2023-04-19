import { MapEditor } from "./map-editor";
import { GUIBase } from "./gui-base";
import { Controls } from "../controls";

export class GUIManager {

    private views: Record<ViewName, GUIBase>;
    private currentView?: string;

    constructor(controls: Controls) {
        this.views = {
            "map-editor": new MapEditor(controls),
        };
    }

    show(name: ViewName) {
        if (this.currentView) {
            this.views[this.currentView].onHide();
        }
        this.currentView = name;
        this.views[this.currentView].onShow();
    }

    getCurrentView(): ViewName | null {
        return this.views[this.currentView];
    }

    update() {
        if (this.currentView) {
            this.views[this.currentView].onUpdate();
        }
    }
}

export type ViewName = "map-editor";
