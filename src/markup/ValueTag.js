import Tag from "./Tag.js";

/**
A Tag that has a value that can change in response to user interactions.
Used for user controls, including checkboxes, text fields, selects, etc.

As with any Tag, subclasses must implement the display() method. That method by itself
makes an HTML widget show some value. In other words, display() implements one-way binding:
from a value to the screen element showing that value.

What ValueTag adds is a companion method, inspect(), that goes in the other direction: 
not value-to-screen, but screen-to-value. When the user interacts with the widget on the 
page, the inspect() method is called to find out what's been done. Then JTML updates the
bound value to suit. Thus, a ValueTag implements two-way binding.

This isn't to say that non-ValueTag JTML never changes. The distinction is that a basic
Tag CHANGES ITS PRESENTATION when something CHANGES ITS BOUND VALUE, whereas a ValueTag
also CHANGES ITS BOUND VALUE when the user CHANGES ITs PRESENTATION (by clicking or typing
or dragging or what have you). 

A typical ValueTag changes its value in response to a DOM event--often a click.
**/
export default class ValueTag extends Tag {

    #toValue = value => value;

    constructor(name) {
        super(name);
        // If a subclass constructor hasn't defined the event, default it to "change".
        this.event = this.event || "change";
        this.mutable = true;
    }

    /**
    This is the default behavior for the subclasses, which will supply
    the name and type in their own constructors.
    **/
    toArgs() {
        return [this.attrs()]
    }

    /**
     * A toValue function can be supplied to convert this tag's display to an actual
     * value.
     * For example, a ValueTag whose native DOM value is a string could return a non-
     * string value (an object whose key is that string, say) by supplying a
     * toValue() function.
     * 
     * The passed-in toValue function should accept a single value, typically the result of the inspect()
     * method. It Can return anything; it's the caller's job to decide what it
     * wants this ValueTag to represent.
     * 
     * TODO: make get/set accessors or rename or something; this is confusing.
     * 
     * @param {function} toValue 
     * @returns 
     */
    toValue(toValue) {
        if (arguments.length === 0) {
            return this.#toValue;
        }
        else {
            this.#toValue = toValue;
            return this;
        }
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


    /**
     * Updates the DOM model to show a value. Subclasses must implement this.
     */
    display(value) {
        // must be implemented by subclasses
        throw new Error("The subclass does not implement ValueTag.display()");
    }

    /**
     * Returns the DOM model's value that corresponds to this ValueTag. Subclasses
     * must implement this.
     */
    inspect() {
        // must be implemented by subclasses
        throw new Error("The subclass does not implement ValueTag.inspect()");
    }

    /**
     * Gets the value associated with this ValueTag, which isn't as simple as it sounds. If
     * the superclass method doesn't produce anything, ValueTag defaults to the
     * state of this ValueTag's DOM node, as potentially interpreted by a toValue() method.
     * 
     * @returns 
     */
    evaluate() {
        return super.evaluate() ?? this.toValue()(this.inspect());
    }

    /**
     * Called when the ValueTag is modified by the user, after the event fires, but before changing the bound value.
     * Subclasses may implement this to reject or modify values that are out of range or misformatted or mistyped.
     */
    validate(value) {
        // Return the value unchanged.
        return value;
    }

    /**
    * A ValueTag has a value which can change--a checkbox can be checked, a
    * text field can be typed in, etc. Therefore, any bindings for a ValueTag
    * should be TWO-WAY bindings. I.e., not only does changing the bound value update
    * the display, but changing the display updates the bound value.
    **/
    bind(key, initial) {
        // This ensures that if the bound value changes programmatically, the widget gets changed.
        // So far, so good.
        super.bind(key, initial);
        if (this.event) {
            // When an event that changes the displayed value occurs--such as a click on a checkbox,
            // or the selection of a menu item--do a "backwards" binding. That is, rather than
            // changing the screen to reflect the binding, change the binding to reflect the screen.
            this.domNode.addEventListener(this.event, () => {
                // Retrieve what's in the DOM node and convert it, if necessary, to a canonical form.
                const value = this.#toValue(this.inspect());
                // Setting the key, by definition, triggers a call to this.display(). Which is bad,
                // because by definition the widget is *already* showing this value. On the other hand,
                // someone else might need to know about this, so we can't just do nothing. The ugly solution
                // is to set the mutable flag to false, so this particular object doesn't display itself, for
                // the duration of the set() call.
                this.mutable = false;
                this.binder().set(key, value);
                this.mutable = true;
            });
        }
        return this;
    }

    /**
     * Overrides the base class method, because ValueTags may be marked with mutable = false.
     * In practice this is used to prevent a ValueTag modifying its DOM node in response to
     * the user modifying its DOM node.
     * 
     * @param {*} value 
     */
    update(value) {
        if (this.mutable) {     
            super.update(value);   
        }
    }
}
