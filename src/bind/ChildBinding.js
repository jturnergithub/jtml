import Binding from "./Binding.js";
import * as BindUtil from "./BindUtil.js";

export default class ChildBinding extends Binding {

    constructor(key, parent) {
        super(key, parent);
        // Special case for array length bindings. Usually, we can assume that
        // modifying a property doesn't change the container object. For example,
        // person.name = "Ralph" doesn't change person; names[3] = "Gus" doesn't
        // change names. In neither case does the parent binding need to be triggered.
        // That is not true when changing the length of an array: names.length = 0
        // *does* change names, and anything bound to names needs to be kicked.
        // If there's a non-array object with a length property, tough luck; we're gonna
        // do some extra work.
        if (key === "length") {
            this.callbacks.push(() => this.parent.trigger());
        }
    }

    get key() {
        return BindUtil.format(this.parent.key, this.discriminant);
    }

    set key(key) {
        this.discriminant = key;
    }

    get rawValue() {
        // This will cause a barf somewhere if the parent's rawValue is not, in fact, raw. 
        // And it *should* cause a barf.
        return this.parent.rawValue?.[this.discriminant];
    }

    /**
     * Implementation of mandatory base-class method.
     * 
     * @param {*} value 
     */
    set rawValue(value) {
        // There's trouble in River City if we try to set the value in the parent when
        // there's no container. For example, if parent.rawValue is undefined, we can't
        // very well go around setting parent.rawValue[3] or whatever. In this case,
        // there's no choice but to create a container--an array or an object--and hope 
        // for the best.
        if (!this.parent.rawValue) {
            // Setting the raw value of the parent means that the parent's callbacks are not
            // triggered.
            this.parent.rawValue = this.container();
        }
        const lengthBinding = this.parent.children["length"];
        const oldLength     = lengthBinding?.rawValue;
        // Special case: can't set length to undefined!
        if (this.discriminant === "length") {
            value = value ?? 0;
        }
        // Update or create the property value.
        this.parent.rawValue[this.discriminant] = value;
        if (lengthBinding && lengthBinding.rawValue !== oldLength) {
            lengthBinding.oldValue = oldLength;
            lengthBinding.trigger();
        }
    }

    container() {
        const number = Number(this.discriminant);
        if (isNaN(number) && this.discriminant !== "length") {
            return {};
        }
        else {
            return [];
        }
    }

    procreate(discriminant) {
        return new ChildBinding(discriminant, this);
    }

    // set value(value) {
    //     if (this.parent && this.different(value)) {
    //         // Sanity check.
    //         value = ProxyFactory.deproxify(value);
    //         console.debug(`Setting ${this.key} = ${JSON.stringify(value)}`);
    //         // We might set the value of the child before we create the parent. In that case, give the parent
    //         // an empty object or array.
    //         if (!this.parent.value) {
    //             // Don't create a value for the parent if we're not setting a meaningful value in the child.
    //             if (value === undefined) {
    //                 return this;
    //             }
    //             this.parent.value = this.container();
    //         }
    //         /*** HACK FOR SPECIAL CASE, get rid of this pronto, it's disgraceful ***/
    //         if (Array.isArray(this.parent.rawValue) && this.discriminant === "length") {
    //             value = value ?? 0;
    //         }
    //         this.oldValue = this.rawValue;
    //         // Modifying the raw value because that way it doesn't trigger bindings. This is good!
    //         // Normally we'd only call binding.value = whatever *from inside the binding.set() method*,
    //         // and that method is where the triggering happens. For example: binder.get("foo.bar").set(42)
    //         // calls this method and then triggers. (The alternative syntax is binder.get("foo").bar = 42,
    //         // and that does trigger bindings, because binder.get("foo").bar is a magic proxy.)
    //         // There is, however, a special case. When the parent's value is being structurally mutated--
    //         // by adding an array item or a property--then the parent's monitors must be notified.
    //         const trigger = !(this.discriminant in this.parent.rawValue);
    //         this.parent.rawValue[this.discriminant] = value;
    //         if (trigger) {
    //             this.parent.trigger();
    //         }
    //     }
    //     return this;
    // }

    // container() {
    //     throw new Error("Subclass does not implement ChildBinding.container()");
    // }

    // childContainer() {
    //     return this.container();
    // }
    
}