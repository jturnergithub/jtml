import RadioButton from "../markup/RadioButton.js";
import RadioItem from "./RadioItem.js";
import ValueTag from "../markup/ValueTag.js";

export default class Radio extends ValueTag {

    constructor(name, attrs, layout) {
        super("div", attrs);
        this.name = name;
        this.items = [];
        // this.factory = label => new RadioItem(this.name, label);
        this.children.factory = label => new RadioItem(this.name, label);
        this.classes("jtml-ui jtml-radio")
    }

    display(value) {
        for (const item of this.children) {
            if (item.label === value) {
                item.selected = true;
            }
        }
        return this;
    }

    evaluate() {
        for (const item of this.children) {
            if (item.selected) {
                return item.label;
            }
        }
        return undefined;
    }

    appendTo(element) {
        for (let item of this.items) {
            item.appendTo(this);
        }
        super.appendTo(element);
        return this;
    }
}

Radio.Layout = {
    HORIZONTAL : "horizontal",
    VERTICAL   : "vertical"
}
