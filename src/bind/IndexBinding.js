import ChildBinding from "./ChildBinding.js";
import PropertyBinding from "./PropertyBinding.js"; // Oy.

/**
 * There's a wrinkle here.
 * 
 * (1) In the normal case, callers will be binding to an array *item*. The discriminant is a number, and the
 * parent binder can safely keep this child in an array of IndexBindings.
 * (2) BUT it's also possible that the caller will do jtml.bind("foo.length"). That's a quandary. or perhaps a 
 * conundrum. Because if the parent binding's children are in an array, what's the array index for the IndexBinding
 * representing the "length" binding? At some point the code will have to get the binding associated with parent.children["length"],
 * only *** THAT IS NOT A BINDING ***. It's the *value* of the length property of children array.
 * 
 * The workaround is that the container for an IndexBinding isn't an array! It's a proxy for an array, and the proxy
 * intercepts gets on the "length" property and relays them to a special PropertyBinding.
 */
export default class IndexBinding extends ChildBinding {

    constructor(index) {
        super(index);
    }

    get index() {
        return this.discriminant;
    }

    format(index) {
        if (index === "length") {
            return ".length";
        }
        else {
            return "[" + index + "]";
        }
    }

    container() {
        return [];
    }

    childContainer() {
        const lengthBinding = new IndexBinding.ArrayLengthBinding(this.parent);
        return new Proxy(super.childContainer(), {
            get : function(target, property) {
                if (property === "length") {
                    return lengthBinding;
                }
                else {
                    return target[property];
                }
            }
        });
    }

}

IndexBinding.ArrayLengthBinding = class extends PropertyBinding {

    constructor(parent) {
        super("length");
        this.parent = parent;
    }

    set value(value) {
        super.value = value ?? 0; // Replace null or undefined with 0, because array.length = undefined is a no-no.
    }
}

export const ARRAY_LENGTH_BINDING = {
    construct : IndexBinding,
    discriminant : "length"
};