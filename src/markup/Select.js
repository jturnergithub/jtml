import Option from "./Option.js" ;
import ChooserTag from "./ChooserTag.js";

/**
 * The JTML peer to an HTML <select> tag. By default, it's rendered as a single-select drop-
 * down. To create a scrolling list, call the .size() method. The contents of a Select are
 * instances of Option.
 * 
 * A Select is a kind of ValueTag: it has a value--the selection--which can be bound. 
 * Selecting an option (or options) from a select changes the bound value. 
 * The bound value does *NOT* determine the select's contents (unlike, e.g., a ListTag)--
 * only which of those contents are selected. 
 * 
 * The DOM model provides two ways to represent the select state: the selectedIndex 
 * property and the value property. In 99% of all cases, it's more useful for users
 * of Select to bind it to a value, rather than to an index. 
 * 
 * There are several ways to create the Select's contents:
 * 
 * - In common use, a Select shows a fixed set of options. To create a fixed list, supply an
 * array as the contents. The array's elements can be strings, Options, objects with
 * sensible toString() methods, or any mixture thereof. Alternatively, you can supply an 
 * array of any arbitrary things, if you also call .toDisplay() with a function that converts
 * an arbitrary thing into a string.
 * 
 * - To make a Select dynamic, bind its children--not the Select itself--to an array. 
 * Adding, removing, or altering array items results in added, removed, or altered options. 
**/
export default class Select extends ChooserTag {

    constructor(factory) {
        super("select");
        this.event = "change";
        // Option.factory() wraps the factory argument in another function which is
        // smart enough to recognize that the original doesn't have to return an Option.
        // This lets us create Selects by providing a factory such as, for example,
        // person => person.name; the factory function provided by Option knows what
        // to do.
        this.factory(Option.factory(factory));
        this.required(true); 
    }

    bindValues(key, initial = []) {
        this.children.bind(key, initial);
        this.always((option, index) => option.bindValue(`${key}[${index}]`));
        return this;
    }

    size(n) {
        return this.attr("size", n);
    }

    /**
     * Gets or sets the selection mode.
     * 
     * @param {Mode.SINGLE|Mode.MULTIPLE} mode 
     * @returns 
     */
    mode(mode) {
        if (mode === undefined) {
            return this.domNode.multiple ? Select.Mode.MULTIPLE : Select.Mode.SINGLE;
        }
        else {
            this.domNode.multiple = mode === Select.Mode.MULTIPLE;
            return this
        }
    }
    
}
