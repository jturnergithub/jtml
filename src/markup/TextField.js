import InputTag from "./InputTag.js";

export default class TextField extends InputTag {

    #format;

    constructor() {
        super("input", "text");
        this.event   = "input";
        this.#format = value => value;
    }

    format(f) {
        this.#format = f;
        return this;
    }
    
    input(callback) {
        this.domNode.addEventListener("input", event => callback(this, event));
        return this;
    }

    display(value = "") {
        this.domNode.value = this.#format(value);
    }

    inspect() {
        return this.domNode.value;
    }

}
