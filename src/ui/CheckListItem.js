import {checkbox, span} from "../../jtml.js";
import ValueTag from "../markup/ValueTag.js";

export default class CheckListItem extends ValueTag {

    constructor(...contents) {
        super("div");
        this._(checkbox(), span(...contents));
        this.classes("jtml-ui jtml-check-list-item");
    }

    get checkbox() {
        return this.children.members[0];
    }

    get label() {
        return this.children.members[1];
    }

    bind(key, initial) {
        this.checkbox.bind(key, initial)
    }

    display(value) {
        return this.checkbox.display(value);
    }

    inspect() {
        return this.checkbox.inspect();
    }
    
    selected(selected) {
        if (selected === undefined) {
            return this.inspect();
        }
        else {
            this.display(selected);
            return this;
        }
    }
}

/**
 * This is another factory that adapts other factories. Specifically, it returns a
 * factory of CheckListItems that wraps another factory, where the latter may or may
 * not produce a CheckListItem. If it does, the metafactory returns it. If it doesn't,
 * the metafactory takes whatever the original factory produces and wraps a CheckListItem
 * around it.
 * 
 * @param {function} factory 
 */
CheckListItem.metafactory = function(factory) {
    return input => {
        const output = factory(input);
        if (output instanceof CheckListItem) {
            if (output.value() === undefined) {
                output.value(input);
            }
            return output;
        }
        else if (Array.isArray(output)) {
            return new CheckListItem(...output).value(input);
        }
        else if (typeof output === "string") {
            return new CheckListItem(output).value(input);
        }
        else {
            return new CheckListItem(output.toString()).value(input);
        }
    }
}