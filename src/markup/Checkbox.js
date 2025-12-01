import InputTag from "./InputTag.js";

export default class Checkbox extends InputTag {

    constructor() {
        super("input", "checkbox");
        this.toDisplay(checked => !!checked);
    }

    bind(key, initial) {
        return super.bind(key, !!initial);
    }

    display(checked = false) {
        this.domNode.checked = checked;
    }

    inspect() {
        return this.domNode.checked;
    }
}
