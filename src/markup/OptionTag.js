import ChoiceTag from "./ChoiceTag.js";
import Tag from "./Tag.js";
import JTMLComponentFactory from "../core/JTMLComponentFactory.js";
import JTMLText from "../core/JTMLText.js";

export default class OptionTag extends ChoiceTag {

    constructor(attrs, text = "", value = text) {
        if (typeof attrs === "string") {
            text = attrs;
            attrs = {};
        }
        super("option", attrs);
        this.text(text);
        this.value(value);
    }

    display(text) {
        this.text(text);
    }

    evaluate() {
        return super.evaluate() || this.value();
    }

    text(text) {
        if (text === undefined) {
            return this.domNode.text;
        }
        else {
            this.domNode.text  = text;
            this.domNode.value = this.domNode.value || text;
            return this;
        }
    }

    /**
    This is the .value property associated with the DOM Option object.
    **/
    value(value) {
        if (value === undefined) {
            return this.domNode.value;
        }
        else {
            this.domNode.value = value;
            return this;
        }
    }

    selected(selected) {
        if (selected === undefined) {
            return this.domNode.selected;
        }
        else {
            this.domNode.selected = selected;
            return this;
        }
    }

    // /**
    // Overrides base class method, since the DOM tells us whether this <option> is
    // selected.
    // **/
    // isSelected() {
    //     return this.domNode.selected;
    // }
    //
    // /**
    // Overrides base class method, since we can tell the DOM to select this <option>.
    // **/
    // setSelected(selected) {
    //     this.domNode.selected = selected;
    //     // Need to do this as well so that the binding gets triggered.
    //     super.setSelected(selected);
    // }


    toSelection() {
        let selection   = super.toSelection();
        selection.value = this.value() || this.text();
        selection.text  = this.text();
        // selection.model = this.model || (this.keys.binding && this.get(this.keys.binding));
        return selection;
    }

}

OptionTag.FACTORY = text => JTMLComponentFactory.INSTANCE(text) || new OptionTag().text(text);
