import ValueTag from "./ValueTag.js";

export default class DiscreteValueTag extends ValueTag {

    #defaultValue = 0;

    constructor(attrs) {
        super("input", attrs || {});
    }

    display(value = this.#defaultValue) {
        this.domNode.value = value;
    }

    evaluate() {
        return this.domNode.valueAsNumber;
    }

    min(value) {
        if (value === undefined) {
            return this.domNode.min;
        }
        else {
            this.domNode.min = value;
            return this;    
        }
    }
    
    max(value) {
        if (value === undefined) {
            return this.domNode.min;
        }
        else {
            this.domNode.max = value;
            return this;    
        }
    }

    bindMin(key) {
        const self = this;
        this.monitor(key, limit => self.min(limit));
        return this;
    }

    bindMax(key) {
        const self = this;
        this.monitor(key, limit => self.max(limit));
        return this;
    }

}