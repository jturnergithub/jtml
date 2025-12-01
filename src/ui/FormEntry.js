import ValueTag from "../markup/ValueTag.js";
import { div, span } from "../../jtml.js";

export default class FormEntry extends ValueTag {

    #label;
    #separator;
    #jtml;

    constructor(label = "", separator, jtml) {
        super("div");
        if (typeof separator !== "string") {
            jtml      = separator;
            separator = "";
        };
        this
            .classes("jtml-ui jtml-form-entry")
            .separator(separator) // Set this before setting label, so we can strip it off the label if need be.
            .label(label)
            .jtml(jtml)
            ._(
                div(label).classes("jtml-form-label jtml-form-text"),
                span(":").classes("jtml-form-separator jtml-form-text"),
                div(jtml).classes("jtml-form-field")
            );
    }

    separator(separator) {
        if (separator === undefined) {
            return this.#separator;
        }
        else {
            this.#separator = separator;
            return this;
        }
    }

    label(label) {
        if (label === undefined) {
            return this.#label;
        }
        else {
            label = label.trim();
            if (label.endsWith(this.separator())) {
                // TODO: other styles, etc.
                label = label.substring(0, label.length - this.separator().length);
            }    
            this.#label = label;
            return this;
        }
    }

    jtml(jtml) {
        if (jtml === undefined) {
            return this.#jtml;
        }
        else {
            this.#jtml = jtml;
            return this;
        }
    }

    bind(key, initial, property) {
        this.jtml().bind(key, initial, property);
    }

    display(value) {
        return this.jtml().display(value);
    }

    inspect() {
        return this.jtml().inspect();
    }
}
