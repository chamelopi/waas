import { Controls } from "../controls";

export abstract class GUIBase {

    private events: EventData[] = [];
    private root: HTMLElement;

    abstract getHtml(): string;

    constructor(protected controls: Controls) {
    }

    // Called when the UI is shown for the first time
    onShow(): void {
        this.root = document.createElement("div");
        this.root.innerHTML = this.getHtml();
        document.body.appendChild(this.root);
    }

    // Called when the UI is removed/hidden
    onHide(): void {
        for (let ev of this.events) {
            ev.element.removeEventListener(ev.eventName, ev.callback);
        }
        document.body.removeChild(this.root);
    }

    // Called on every frame
    abstract onUpdate(dt: Number): void;

    addEvent(eventName: string, elemId: string, callback: any) {
        const elem = document.getElementById(elemId);
        if (elem != null) {
            elem.addEventListener(eventName, (e) => {
                callback(e);
                // Prevents keys being registered as continuously pressed after button clicks
                this.controls.reset();
            });
            this.events.push({ callback, eventName, element: elem});
        }
    }

    getValue(elemId: string): string | null {
        var elem = document.getElementById(elemId);
        if (elem != null && elem instanceof HTMLInputElement && elem.value) {
            return elem.value;
        } else {
            console.warn(`no value for element ${elemId}`);
            return null;
        }
    }

    getSelectedIndex(elemId: string): number {
        var elem = document.getElementById(elemId);
        if (elem != null && elem instanceof HTMLSelectElement) {
            return elem.selectedIndex;
        } else {
            console.warn(`no selected index for element ${elemId}`);
            return null;
        }
    }

    setText(elemId: string, text: string) {
        var elem = document.getElementById(elemId);
        if (elem != null && elem.innerHTML) {
            elem.innerHTML = text;
        } else {
            console.warn(`no innerHTML for element ${elemId}`);
        }
    }

    setVisible(elemId: string, visible: boolean) {
        var elem = document.getElementById(elemId);
        if (elem != null) {
            if (visible) {
                elem.classList.remove("invisible");
            } else {
                elem.classList.add("invisible");
            }
        }
    }
}

interface EventData {
    callback: any;
    eventName: string;
    element: HTMLElement;
}