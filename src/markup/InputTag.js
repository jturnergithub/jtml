import ValueTag from "./ValueTag.js";

export default class InputTag extends ValueTag {
    constructor(name, type) {
        super(name);
        this.attr("type", type);
    }
}