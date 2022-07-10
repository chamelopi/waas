export abstract class GUIBase {

    private events: EventData[] = [];
    private root: HTMLElement;

    abstract getHtml(): string;

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
            elem.addEventListener(eventName, callback);
            this.events.push({ callback, eventName, element: elem});
        }
    }

    setText(elemId: string, text: string) {
        var elem = document.getElementById(elemId);
        if (elem != null && elem.innerHTML) {
            elem.innerHTML = text;
        }
    }
}

interface EventData {
    callback: any;
    eventName: string;
    element: HTMLElement;
}