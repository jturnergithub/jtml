import ValueTag from "./ValueTag.js";

export default class TextField extends ValueTag {

    constructor(attrs) {
        super("input", attrs);
        this.event = "input";
    }

    display(value = "") {
        this.domNode.value = value;
    }

    evaluate() {
        return this.domNode.value;
    }

}
