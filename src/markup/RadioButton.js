import JTMLText from "../core/JTMLText.js";
import Tag from "./Tag.js";
import ValueTag from "./ValueTag.js";

export default class RadioButton extends ValueTag {

    constructor(attrs) {
        super("input", attrs, "radio");
    }

    bind(key, initial, callback) {
        return super.bind(key, !!initial, callback);
    }

    display(selected) {
        this.domNode.checked = selected;
    }

    evaluate() {
        return this.domNode.checked;
    }
}
