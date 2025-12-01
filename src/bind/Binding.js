import * as BindUtil from "./BindUtil.js";

export {Trigger} from "./BindUtil.js";

let id = 0;
let proxyID = 0;
const evilMethods = ["indexOf", "lastIndexOf"];
/**
 * The base class for several kinds of bindings. A binding consists of a value
 * and a set of callback functions. If the value changes, the callback functions
 * are invoked with the new and old values.
 * 
 * A binding that contains a primitive value is atomic. A binding that contains
 * an object/array, however, can have child bindings. The parent binding notifies
 * its customers if its value object is replaced with a different object. The
 * child bindings notify their customer's if one of the properties of the value
 * object is changed.
 * 
 * External consumers of Bindings should normally use Binding.value.  If a Binding
 * contains a primitive, this is identical to Binding.rawValue. If it contains an
 * object (including an array), however, Binding.value returns a Proxy for that
 * object/array. The Proxy's job is to intercept code that would change the value
 * of an object property, or modify an array item, and notify any *other* bindings
 * (child bindings, that is) that care about such things.
 * 
 * A regrettable consequence of the use of proxies is that an object reference held outside
 * of the binding is not not the same as the binding's value. (This is true, not just of 
 * bindings, but of any case where you have both an object and a proxy for that object. 
 * Anything you do to the object skips the logic in the proxy.) So, for example, given
 * 
 * const jane = { name : "Jane", age : "29" };
 * someBinding.value = jane;
 * 
 * then someBinding.value !== jane. More consequentially, 
 * 
 * jane.age = 30; // DOES NOT trigger someBinding's callbacks.
 * 
 * is not equivalent in effect to 
 * 
 * someBinding.value.age = 30; // DOES trigger someBinding.s callbacks, thanks to the proxy.
 *
 */
export default class Binding {

    #key;

    /**
     * Creates a new Binding with no callbacks or children. If a parent
     * is given, the appropriate hierarchy is set up.
     * 
     * @param {string} key 
     * @param {Binding} parent 
     */
    constructor(key, parent) {
        this.id        = id++;
        this.#key      = key;
        this.parent    = parent;
        this.callbacks = [];
        this.children  = {};
        this.links   = [];
        if (parent) {
            parent.children[key] = this;
        }
    }

    /**
     * Check if the old value and the new value are the same.
     */
    get changed() {
        return this.oldValue !== this.rawValue;
    }

    /**
     * If this binding is part of a hierarchy, appends its key to its parent's
     * key. If not, just returns its own key.
     */
    get key() {
        if (this.parent) {
            return BindUtil.format(this.parent.key, this.#key);
        }
        else {
            return this.#key;
        }
    }

    /**
     * The true value stored in this binding. Must be implemented by subclasses.
     */
    get rawValue() {
        throw new Error("Subclass does not implement Binding.rawValue getter");
    }

    /**
     * The true value stored in this binding. Must be implemented by subclasses.
     */
    set rawValue(value) {
        throw new Error("Subclass does not implement Binding.rawValue setter");
    }

    /**
     * The binding as seen by observers. Returns a Proxy.
     */
    get value() {
        return this.proxify(this.rawValue);
    }
    
    /**
     * The binding as seen by observers. Calls the set() method, q.v.
     */
    set value(value) {
        this.set(value);
    }

    /**
     * Changes the bound value, remembers the previous bound value, and triggers any callbacks.
     * If the value argument is a Proxy, the proxy is stripped away; only code *outside* the
     * binding logic should ever see proxies.
     * 
     * @param {*} value 
     * @param {enum} trigger 
     * @returns 
     */
    set(value, trigger = BindUtil.Trigger.AUTO) {
        // DO. NOT. SAVE. PROXIES.
        value = deproxify(value);
        // If we're always going to trigger, then of course the trigger flag is true.
        let flag = trigger === BindUtil.Trigger.ALWAYS;
        // Do nothing unless there's an actual, you know, change.
        if (this.different(value)) {
            this.oldValue = this.rawValue;
            this.rawValue = value;
            // The default case: trigger the callbacks if and only if a change in value is detected.
            flag = flag || trigger === BindUtil.Trigger.AUTO;
        }
        if (flag) {
            // Trigger all the callbacks
            this.trigger();
        }
        return this;
    }

    /**
     * Detects whether the value has changed from the prior value.
     * 
     * @param {*} value 
     * @returns 
     */
    different(value) {
        return deproxify(value) !== deproxify(this.value);
    }

    /**
     * Determines whether this Binding is "equal to" something. If the something is
     * another value, compares the raw (non-Proxy) values. If the something is a Proxy,
     * deproxifies it and compares to raw value. If it's anything else, does a straight
     * raw-value comparison. NB: uses strict === equality.
     * 
     * @param {*} that 
     * @returns 
     */
    equals(that) {
        if (that instanceof Binding) {
            return this.rawValue === that.rawValue;
        }
        else if (typeof that === "object") {
            // Proxy city.
            return this.rawValue === deproxify(that);
        }
        else {
            return this.rawValue === that;
        }
    }

    /**
     * Monitors this binding for changes, and calls the callback functions if
     * a change in vallue occurs. The callbacks are invoked immediately,
     * so that any consumers of the binding are given an initial value.
     * 
     * @param  {...function} callbacks 
     * @returns 
     */
    monitor(...callbacks) {
        this.callbacks.push(...callbacks);
        // Trigger all the new callbacks, don't bother with the old ones
        this.trigger(callbacks);
        return this;
    }

    /**
     * Triggers some callbacks. By default, all the callbacks associated with
     * the binding are called. If one or more callbacks are passed in, they're 
     * invoked once, but not added to the binding.
     * 
     * @param {function} callbacks 
     */
    trigger(callbacks = this.callbacks) {
        if (!this.triggered) {
            // Avoid circular triggering.
            this.triggered = true;
            // There's a little overhead in this.value, so get it once.
            const value = this.value;
            for (const callback of callbacks) {
                callback(value, this.oldValue, this.rawValue);
            }
            // Trigger all the links currently associated with this binding. E.g., if
            // the binding for "players[3]" is linked to "active-player," then any changes in its value
            // are of interest to anyone who's monitoring the active player.
            for (const link of this.links) {
                link.trigger();
            }
            // Trigger all the child bindings. Because if { name : "Bob" } is replaced by
            // { name : "Mary" }, then anyone who's monitoring the name has to be goosed, right?
            for (const child of Object.values(this.children)) {
                child.trigger();
            }
            this.triggered = false;
        }
    }

    /**
     * Removes the given functions from this Binding, without triggering them.
     * 
     * @param  {...function} callbacks R
     * @returns 
     */
    forget(...callbacks) {
        for (const callback of callbacks) {
            let index = this.callbacks.indexOf(callback);
            if (index !== -1) {
                this.callbacks.splice(index, 1);
            }
        }
        return this;
    }

    /**
     * Remembers that some other binding is linked to this one, so that its callbacks can
     * be triggered when this binding's value changes. Does not trigger the link's callbacks
     * (nor this binding's own callbacks).
     * 
     * @param {Binding} link 
     * @returns 
     */
    link(binding) {
        this.links.push(binding);
        return this;
    }

    /**
     * Forgets a linked binding. Does not trigger callbacks.
     * 
     * @param {Binding} binding 
     * @returns 
     */
    unlink(binding) {
        const index = this.links.indexOf(binding);
        if (index !== -1) {
            this.links.splice(index, 1);
        }
        return this;
    }

    /*** Binding hierarchy ***/

    /**
     * Returns a descendent of this binding by following the path elements. For example,
     * if the path is ["foo", "bar", "baz"], the returned value is 
     *     this.children["foo"].children["bar"].children["baz"]
     * 
     * The descendant binding is created if it doesn't already exist. Callers may specify
     * the kind of binding to create by passing in a Type constructor.
     * 
     * @param {string[]} path 
     * @param {constructor} Type 
     * @returns 
     */
    descendant(path, Type) {
        const key = path.shift();
        // The caller may specify the type (i.e., subclass) of the final, returned binding,
        // but any intermediate descendents should be of the appropriate child type for
        // this binding. So we only worry about the type if the remaining path is length 0.
        const child = this.child(key, path.length ? undefined : Type);
        if (!path.length) {
            return child;
        }
        else {
            return child.descendant(path, Type);
        }
    }

    /**
     * Returns the child selected by the discriminant, first creating it if neceessary.
     * 
     * @param {string} discriminant 
     * @param {class} Type 
     * @returns 
     */
    child(discriminant, Type) {
        if (!this.children[discriminant]) {
            // If the caller specifies a type for the child, instantiate that type. If not,
            // instantiate the default child type for this binding.
            const child        = Type ? new Type(discriminant, this) : this.procreate(discriminant);
            child.discriminant = discriminant;
       }
        return this.children[discriminant];
    }

    /**
     * Creates and returns an instance of the correct subclass for a child binding.
     * Subclasses must implement this.
     */
    procreate() {
        throw new Error("Subclass does not implement Binding.procreate() ");
    }

    /*** Fun with proxies ***/

    /**
     * Wraps a value in a proxy. Primitives are returned unchanged, as are values
     * that are already JTML proxies. Somewhat different proxies are created for arrays
     * vs. non-array objects.
     * 
     * @param {*} value 
     * @returns 
     */
    proxify(value) {
        if (typeof value !== "object") {
            // Thanks to JavaScript, this eliminates objects, arrays, and proxies. Thanks, JavaScript?
            return value;
        }
        else if (value.__target) {
            // Already a proxy
            return value;
        }
        else if (Array.isArray(value)) {
            // Array proxies are special because they have to deal with in-place mutations to the array (push, pop, etc.)
            // as well as sounding off when an array item is replaced.
            return this.arrayProxy(value);
        }
        else {
            // Object proxies just have to notify this binding's monitors when one of the object's properties is
            // changed.
            return this.objectProxy(value);
        }
    }

    /**
     * Creates a proxy for this binding's value when that value is a non-array object. 
     * The proxy traps anything that sets one of the value's properties and refers it to
     * a child binding. This ensures that callbacks that are sensitive to that property
     * get triggered.
     * 
     * @param {object} binding The binding whose CHILDREN are to be notified if one of the thing's
     * properties is changed.
     * @param {object} object The thing that's being wrapped
     * @returns 
     */
    objectProxy(object) {
        if (object.__target) {
            // This is paranoia, but it's the good kind.
            throw new Error("Nested proxy detected");
        }
        const binding = this; // Save for later dining
        const id      = proxyID++;  // For debugging
        return new Proxy(object, {
            get : (target, property) => {
                switch(property) {
                    // Handle several special cases, or otherwise return an appropriate proxy from target.
                    case "__id"      : return id;
                    case "__target"  : return target;
                    case "__binding" : return binding;
                    case "__is"      : return that => target === deproxify(that);
                    case "valueOf"   : return target.valueOf;
                    case "toString"  : return target.toString;
                    default          : return binding.child(property).proxify(target[property]);
                }
            },
            set : (target, property, value) => {
                // If we just set target[property] directly, then anyone who's listeneing for changes
                // won't be notified. Instead, set the value in the child binding, which does the needful
                // and also triggers the child's callbacks.
                binding.child(property).value = value;
                return true;
            }
        });
    }

    /**
     * Creates a proxy for this Binding's value when that value is an array. Similar to an
     * object proxy, setting the value at an array index notifies any child binding that's
     * monitoring that index. In addition, any array method call that modifies the array
     * itself triggers this Binding, as if the array had been replaced with a different one.
     * 
     * @param {*} array 
     * @returns 
     */
    arrayProxy(array) {
        if (array.__target) {
            // This is paranoia, but it's the good kind.
            throw new Error("Nested proxy detected.");
        }
        const binding = this;
        const id      = proxyID++;
        return new Proxy(array, {
            get : (target, property) => {
                if (property === "__id") {
                    return id;
                }
                else if (property === "__target") {
                    return target;
                }
                if (typeof property === "symbol") { // This happens with toString()
                    return target[property];
                }
                else if (!Number.isNaN(Number(property)) || property === "length") {
                    return binding.child(property).proxify(target[property]);
                }
                // HORRIBLE SPECIAL CASE LOGIC
                else if (evilMethods.indexOf(property) === -1) {
                    return target[property];
                }
                else {
                    /*
                    Like everything else to do with proxies, this is complicated.
    
                    When calling a method such as indexOf(foo) or lastIndexOf(foo), it's not great if
                    foo is itself a proxy, because it doesn't match its non-proxied self. Instead of returning
                    the indexOf function/object, therefore, we have to replace it with a wrapper that
                    deproxifies the argument(s). 
                    
                    */
                    return (...args) => 
                        target[property](
                            ...args.map(arg => deproxify(arg)) // Deproxify arguments
                        )
                }
            },
            set : (target, property, value) => {
                value = deproxify(value);
                const index = Number(property);
                if (!Number.isNaN(index)) {
                    if (binding.children[index]) {
                        // Somebody cares about this array item; go through them.
                        binding.children[index].set(value);
                    }
                    else {
                        // Nobody is monitoring the array item. Just change the item in-place.
                        target[index] = value;
                    }
                }
                else {
                    // Executes when changing the *structure* of the array, as in
                    //     binder.get("array-key").length = 3;
                    // In this case, we don't notify the child bindings--that's its own thing--but anyone
                    // who depends on the array itself needs to know that it's changed.
                    // In actual fact this is apparently only called for .length;
                    // push(), pop(), and so forth all involve length-changing
                    // Nasty special case here:
                    value = value ?? 0; // Length can't be set to undefined or null; set to zero instead.
                    target[property] = value;
                    binding.trigger(); // Changing length modifies the array.
                }
                return true;
            }
        });
    }

    toString() {
        return `${this.key} #{this.id}`;
    }
}

/**
 * Non-method function that strips the JTML proxy, if any, from around a value.
 * Recursive, just in case.
 * 
 * @param {*} value 
 * @returns 
 */
export function deproxify(value) {
    if (value?.__target) {
        // Just in case there are any pathological nested proxies here, recurse.
        return deproxify(value.__target);
    }
    else {
        // If it's not a JTML-style proxy, do nothing.
        return value;
    }
}
