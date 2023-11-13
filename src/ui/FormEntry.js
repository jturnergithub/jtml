import Tag from "../markup/Tag.js";
import ValueTag from "../markup/ValueTag.js";

export default class FormEntry extends ValueTag {

    constructor(label = "", widget, attrs) {
        super("div", attrs);
        this.classes("jtml-form-entry");
        // Assumes label is a string
        label = label.trim();
        if (label.endsWith(":")) {
            // TODO: other styles, etc.
            label = label.substring(0, label.length - 1);
        }
        this.label  = label;
        this.widget = widget;
        this._(
            new Tag("div").classes("jtml-form-label")._(label),
            new Tag("span").classes("jtml-form-separator")._(":"),
            new Tag("div").classes("jtml-form-field")._(widget)
        );
    }

    bind(key, initial, property) {
        this.widget.bind(initial, property);
    }

    display(value) {
        return this.widget.display(value);
    }

    evaluate() {
        return this.widget.evaluate();
    }
}
