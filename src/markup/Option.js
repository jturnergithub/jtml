import ValueTag from "./ValueTag.js";

/**
 * The JTML peer to an HTML <option>, used inside a <select>.
 * 
 * An Option has a value, and it's a ValueTag, but the option's
 * value isn't what's returned by ValueTag.invoke() or set by Tag.display().
 * When a user clicks on an option, what changes isn't the tag's value;
 * it's the tag's selection state. The value corresponds, on some level,
 * with what the option displays.
 */
export default class Option extends ValueTag {

    #rawValue;

    constructor(text = "", value = text, transform = value => value) {
        super("option");
        this.update(text, value);
        this.transform = transform;
    }

    update(text, value) {
        this.text(text);
        this.value(value);
        return this;
    }

    /**
     * By definition, the factory function takes in a string and spits out an Option.
     * It's possible that this Option may need to make the text out of a non-text
     * object--by calling its toString(), or reading the .name field, or whatever.
     * That's what the toDisplay function does. 
     * 
     * By default, toDisplay() calls toString(). In the simple case where everything
     * is strings to start with, this is obviously a no-op.
     * 
     * @param {function} factory 
     */
    factory(factory) {
        super.factory(value => factory(this.toDisplay(value)));
    }
    
    rawValue(value) {
        if (value === undefined) {
            return this.#rawValue;
        }
        else {
            this.#rawValue = value;
            return this;
        }
    }

    bind(key, initial) {
        return super.bind(key, !!initial);
    }

    bindValue(key) {
        this.monitor(key, value => {
            this.update(...Option.parse(this.transform, value));
        });
        return this;
    }

    display(selected) {
       this.domNode.selected = selected;
    }

    inspect() {
        return this.domNode.selected;;
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
     * This is the .value property associated with the DOM Option object. Except
     * that it isn't, necessarily. The domNode.value is always a string, but JTML
     * allows Options to refer to any arbitrary value. So when the value is set,
     * we keep it in the #rawValue member, which allows us to return it as a non-
     * string.
     */
    value(value) {
        if (value === undefined) {
            return this.#rawValue || this.domNode.value;
        }
        else {
            this.#rawValue     = value;
            this.domNode.value = value;
            return this;
        }
    }

    evaluate() {
        return this.value();
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

Option.parse = function(transform, value) {
    // Apply the transform function to the soon-to-be option contents.
    const contents = transform(value) ?? "";
    if (Array.isArray(contents)) {
        // Transform produced an array, hopefully of two items, suitable for use as arguments
        // for the Option constructor or for the update() method.
        return contents;
    }
    else if (typeof contents === "string") {
        // Transorm produced a single string; take that as the Option's text, and the pre-transform input 
        // as the value.
        return [ contents, value ];
    }
    else {
        // Whatever transform did, it produced something else. Hopefully that something else can be
        // converted to a meaningful string.
        return [ contents.toString(), value ];
    }
}

/**
 * This is a factory of factories. Its input is the function that transforms
 * a bound value into something displayable; for example, if the Option is
 * bound to a Person object, the transform might be something like person =>
 * person.lastName + "," + person.firstName. Typically this is provided by the
 * Select that contains the Option.
 * 
 * @param {function} transform 
 * @returns 
 */
Option.factory = function(transform = value => value) {
    return value => {
        const option = transform(value);
        if (option instanceof Option) {
            // transform() returned an Option, we're done here
            return option;
        }
        else {
            return new Option(...Option.parse(transform, value));
        }
    }
}

Option.DISPLAYER = value => (value ?? "").toString();

// Default factory function for Options.
Option.FACTORY = option => {
    if (option instanceof Option) {
        return option;
    }
    else if (typeof option === "string") {
        return new Option(option);
    }
    else if (Array.isArray(option)) {
        return new Option(...option);
    }
    else if (typeof option === "object") {
        return new Option(object.toString(), object)
    }
    else {
        return new Option("");
    }
};
