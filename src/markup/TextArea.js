import ValueTag from "./ValueTag.js";

export default class TextArea extends ValueTag {

    constructor(rows, cols) {
        super("textArea");
        if (rows !== undefined) {
            this.attr("rows", rows).attr("cols", cols);
        }
    }

    display(value = "") {
        this.domNode.value = value;
    }

    inspect() {
        return this.domNode.value;
    }
}