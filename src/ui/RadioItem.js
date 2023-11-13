import Tag from "../markup/Tag.js";
import RadioButton from "../markup/RadioButton.js";
import JTMLText from "../core/JTMLText.js";

export default class RadioItem extends Tag {

    #label = "";

    constructor(name, label) {
        super("div", {});
        this.button = new RadioButton({ name : name });
        this.#label = label;
        this.containing(this.button, new JTMLText(label));
        this.classes("jtml-ui jtml-radio-item");
    }

    get selected() {
        return this.button.evaluate();
    }

    set selected(selected) {
        this.button.display(selected);
    }

    get label() {
        return this.#label;
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
}
