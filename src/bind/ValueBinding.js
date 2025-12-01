import Binding from "./Binding.js";
import ChildBinding from "./ChildBinding.js";

/**
 * A binding containing either a primitive value, or an array, or the root
 * object of a containment hierarchy. 
 * 
 * Bindings that contain primitives are simple; the value is the primitive
 * itself. Bindings that contain objects/arrays are trickier. Internally, the
 * binding's value is indeed the object. Externally, though, getting the binding's
 * value returns a Proxy. The proxy lets us notify other bindings if the bound
 * value's properties change, even if the bound value itself is not replaced.
 * See the Binding class for mroe details.
 * 
 */
export default class ValueBinding extends Binding {

    #rawValue;

    /**
     * Constructor. ValueBindings never have parents, so any second argument is the initial value.
     * 
     * @param {string} key 
     * @param {*} value 
     */
    constructor(key, value) {
        super(key);
        this.value = value;
    }

    /**
     * Raw value is stored explicitly.
     */
    get rawValue() {
        return this.#rawValue;
    }

    /**
     * Raw value is stored explicitly.
     */
    set rawValue(value) {
        this.#rawValue = value;
    }

    /**
     * Implementation of mandatory base-class method.
     * 
     * Returns the raw value, potentially wrapped in a proxy. More precisely:
     * If the bound value is a scalar, returns it. If the bound value is
     * an array or object, returns its proxy.
     */
    get value() {
        return this.proxify(this.#rawValue);
    }

    /**
     * Calls the superclass setter.
     */
    set value(value) {
        super.value = value;
    }

    /**
     * Implements superclass method by creating a ChildBinding instance.
     * 
     * @param {*} discriminant 
     * @returns 
     */
    procreate(discriminant) {
        return new ChildBinding(discriminant, this);
    }

}
