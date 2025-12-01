import {button, div, text} from "../markup/markup.js";
import ContainerTag from "../markup/Tag.js";

export default class Confirm extends ContainerTag {

    constructor(title = "Confirm", message) {
        super("div");
        this._(
            div(title).classes("jtml-title"),
            text(message),
            div(
                button("Confirm").click(this.confirm),
                button("Cancel").click(this.cancel)
            ).classes("jtml-button-panel")
        ).classes("jtml-confirm")
    }

    confirm() {

    }

    cancel() {
        
    }
    
}