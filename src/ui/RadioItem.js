import ValueTag from "../markup/ValueTag.js";
import RadioButton from "../markup/RadioButton.js";

export default class RadioItem extends ValueTag {

    #label = "";

    constructor(name, label = (value ?? "").toString()) {
        super("div");
        this.button = new RadioButton(name, label);
        this.#label = label;
        this._(this.button, label);
        this.classes("jtml-ui jtml-radio-item");
    }
    
    selected(selected) {
        if (selected === undefined) {
            return this.button.inspect();
        }
        else {
            this.button.display(selected);
            return this;
        }
    }

    get label() {
        return this.#label;
    }

    evaluate() {
        return this.value();
    }

    value(value) {
        if (value === undefined) {
            return this.button.attr("value");
        }
        else {
            this.button.attr("value", value);
            return this;
        }
    }

    /**
     * Disabling a RadioItem means disabling its button.
     * 
     * @param {boolean} disabled 
     */
    setDisabled(disabled) {
        this.button.domNode.disabled = disabled;
    }
}
