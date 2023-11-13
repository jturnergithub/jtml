import Binder from "../bind/Binder.js";
import Tag from "./Tag.js";

/**
A Tag that has a value, which can change in response to user interactions.
Used for user controls, including checkboxes, text fields, selects, etc.
Subclasses must implement the display() method, which allows one-way binding--
i.e., it lets the widget show a value. To allow for two-way binding, where
values can be changed as well as displayed, subclasses implement the evaluate()
method as well.
**/
export default class ValueTag extends Tag {

    constructor(name, attrs, type) {
        super(name, attrs, type);
        this.event = "change";
    }

    /**
    This is the default behavior for the subclasses, which will supply
    the name and type in their own constructors.
    **/
    toArgs() {
        return [this.attrs()]
    }

    /**
    Automatically adds a type attribute, if one is passed in.
    **/
    toDOMNode(name, attrs, type) {
        if (type) {
            attrs.type = type;
        }
        return super.toDOMNode(name, attrs);
    }

    value(value) {
        if (value === undefined) {
            return this.evaluate();
        }
        else if (value !== this.evaluate()) {
            this.display(value);
        }
    }

    display() {
        // must be implemented by subclasses
        throw new Error("The subclass does not implement ValueTag.display()");
    }

    evaluate() {
        // must be implemented by subclasses
        throw new Error("The subclass does not implement ValueTag.evaluate()");
    }

    /**
    * A ValueTag has a value which can change--a checkbox can be checked, a
    * text field can be typed in, etc. Therefore, any bindings for a ValueTag
    * should be TWO-WAY bindings. I.e., not only does changing the bound value update
    * the display, but changing the display updates the bound value.
    **/
    bind(key, initial, callback) {
        super.bind(key, initial, callback);
        let self = this;
        // When an event that changes the displayed value occurs--such as a click on acheckbox,
        // or the selection of a menu item--do a "backwards" binding. That is, rather than
        // changing the screen to reflect the binding, change the binding to reflect the screen.
        this.domNode.addEventListener(this.event, () => self.binder().set(key, self.evaluate()));
        // TODO: isn't this redundant?
        // this.monitor(key);
        return this;
    }
}
