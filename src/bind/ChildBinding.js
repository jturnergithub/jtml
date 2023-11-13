import AbstractBinding from "./AbstractBinding.js";
import * as BindUtil from "./BindUtil.js";
import * as ProxyFactory from "./ProxyFactory.js";

export default class ChildBinding extends AbstractBinding {

    /*
    We need this because a child binding can change its value even if the parent value remains the same.
    For instance, consider child[1] of the parent binding [1, 2, 3]. It's entirely reasonable to change
    child[1] to 999999, or whatever--but this doesn't change the parent binding, either in its old or in
    its new value. (Probably.) The parent is still looking at the same array object, after all.
    */
    #oldValue;

    constructor(discriminant) {
        super(discriminant);
        this.discriminant = BindUtil.parse(discriminant);
    }

    get key() {
        return BindUtil.format(this.parent.key, this.discriminant);
    }

    set key(key) {
        this.discriminant = key;
    }

    get oldValue() {
        return this.#oldValue ?? this.parent?.oldValue?.[this.discriminant];
    }

    set oldValue(value) {
        if (value === undefined || value === this.parent?.oldValue?.[this.discriminant]) {
            this.#oldValue = undefined;
        }
        else {
            this.#oldValue = value;
        }
    }

    get rawValue() {
        // There's a corner case where the parent's "raw" value could have stealth proxies in it.
        // Suppose that this binding is for the key "foo.bar". We're going to return the "bar"
        // member of whatever object is bound to the parent. We get trouble if the
        // parent is bound to something like this:
        //      foo = {
        //          bar : anUnexpectedProxy
        //      } 
        // So let's deproxify the object before we return it.
        return ProxyFactory.deproxify(this.parent?.rawValue?.[this.discriminant]);
    }

    /**
    Delegates to the parent binding, which has a reference (possibly indirect) to the containing
    object or array. Does NOT call this.parent.get() because it's normally called
    BY this.parent.get().
    **/
    get value() {
        return this.parent?.value?.[this.discriminant];
    }

    set value(value) {
        if (this.parent && this.different(value)) {
            // Sanity check.
            value = ProxyFactory.deproxify(value);
            console.debug(`Setting ${this.key} = ${JSON.stringify(value)}`);
            // We might set the value of the child before we create the parent. In that case, give the parent
            // an empty object or array.
            if (!this.parent.value) {
                // Don't create a value for the parent if we're not setting a meaningful value in the child.
                if (value === undefined) {
                    return this;
                }
                this.parent.value = this.container();
            }
            /*** HACK FOR SPECIAL CASE, get rid of this pronto, it's disgraceful ***/
            if (Array.isArray(this.parent.rawValue) && this.discriminant === "length") {
                value = value ?? 0;
            }
            this.oldValue = this.rawValue;
            // Modifying the raw value because that way it doesn't trigger bindings. This is good!
            // Normally we'd only call binding.value = whatever *from inside the binding.set() method*,
            // and that method is where the triggering happens. For example: binder.get("foo.bar").set(42)
            // calls this method and then triggers. (The alternative syntax is binder.get("foo").bar = 42,
            // and that does trigger bindings, because binder.get("foo").bar is a magic proxy.)
            // There is, however, a special case. When the parent's value is being structurally mutated--
            // by adding an array item or a property--then the parent's monitors must be notified.
            const trigger = !(this.discriminant in this.parent.rawValue);
            this.parent.rawValue[this.discriminant] = value;
            if (trigger) {
                this.parent.trigger();
            }
        }
        return this;
    }

    container() {
        throw new Error("Subclass does not implement ChildBinding.container()");
    }

    childContainer() {
        return this.container();
    }
    
}