import ValueTag from "./ValueTag.js";

export default class DiscreteValueTag extends ValueTag {

    #defaultValue = 0;

    constructor(attrs) {
        super("input", attrs || {});
    }

    display(value = this.#defaultValue) {
        this.domNode.value = value;
    }

    inspect() {
        return this.domNode.valueAsNumber;
    }

    /**
     * Don't permit the user to enter a value that's out of range. If it is, restrict it to a legal min or max.
     * 
     * @param {number} value 
     * @returns A legal numeric value. 
     */
    validate(value) {
        const min = this.min();
        const max = this.max();
        if (min && value < min) {
            console.warn(`${value} is too small; increasing it to ${min}`);
            return min;
        }
        else if (max && value > max) {
            console.warn(`${value} is too large; decreasing it to ${max}`)
            return max;
        }
        else {
            return value;
        }
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
            return this.domNode.max;
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