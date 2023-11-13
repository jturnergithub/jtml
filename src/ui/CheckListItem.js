import {text} from "../core.js";
import {checkbox, div, span} from "../markup.js";
import ValueTag from "../markup/ValueTag.js";

export default class CheckListItem extends ValueTag {

    constructor(label, removable) {
        super("div", attrs);
        this.label = text(label);
        this.checkbox = checkbox();
        this._(
            this.checkbox(),
            span(this.label),
            div().classes("jtml-x")
        ).classes("jtml-ui jtml-check-list-item");
    }

    bind(key, initial) {
        this.text.bind(key, initial)
    }

    display(value) {
        return this.checkbox.display(value);
    }

    evaluate() {
        return this.checkbox.evaluate();
    }
}