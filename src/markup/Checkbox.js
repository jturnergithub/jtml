import ValueTag from "./ValueTag.js";

export default class Checkbox extends ValueTag {

    constructor(attrs) {
        super("input", attrs || {}, "checkbox");
    }

    bind(key, initial, callback) {
        return super.bind(key, !!initial, callback);
    }

    display(value = false) {
        this.domNode.checked = value;
    }

    evaluate() {
        return this.domNode.checked;
    }
}
