import BindingManager from "./BindingManager.js";
import {Trigger} from "./Binding.js";
import Binding from "./Binding.js";
import * as ProxyFactory from "./ProxyFactory.js";

// import * as BindUtil from "./BindUtil.js";

export default class Binder {

    constructor(progenitor) {
        const bindings  = progenitor ? Object.create(progenitor.bindings) : {};
        this.manager    = new BindingManager(bindings);
        this.progenitor = progenitor;
        this.suspended  = false;
        this.id         = Binder.id++;
    }

    get bindings() {
        return this.manager.bindings;
    }

    /**
    Fetches or creates a binding for the key, then returns its value.
    **/
    get(key, raw) {
        if (raw) {
            return this.binding(key).rawValue;
        }
        else {
            return this.binding(key).value;
        }
    }

    /**
     * Returns an array of all the values of all the keys, in order.
     * 
     * @param  {...any} keys 
     */
    getAll(...keys) {
        return keys.map(key => this.get(key));
    }

    /**
    Tells the binder that the value associated with key may have changed (or
    is being newly created--same difference) so that the new value can be
    remembered and the listeners notified.
    **/
    set(key, value, trigger = Trigger.AUTO) {
        let binding = this.binding(key);
        if (this.suspended) {
            trigger = Trigger.NEVER;
        }
        binding.set(value, trigger);
        return this;
    }


    /**
     * Sets the initial value of a binding. If (a) the binding already has a non-undefined value,
     * and (b) the caller hasn't provided an initial value, then leave the existing
     * value alone. Otherwise, set the bound value.
    **/
    init(key, initial) {
        const binding = this.binding(key); // Creates the binding (with value of undefined) if necessary
        if (binding.value === undefined && initial !== undefined) {
            this.set(key, initial);
        }
        return this;
    }

    alias(aliasKey, targetKey) {
        return this.manager.aliasBinding(aliasKey, targetKey);
    }

    redirect(aliasKey, targetKey) {
        // Don't automatically create the aliasKey binding, because the BinderManager can't auto-create an
        // AliasBinding. Retrieve it if it exists, create it explicitly otherwise.
        let aliasBinding = this.binding(aliasKey, false);
        if (aliasBinding) {
            aliasBinding.target = this.binding(targetKey);
        }
        else {
            this.alias(aliasKey, targetKey);
        }
        return this;
    }

    binding(key, binding) {
        if (key === undefined) {
            return undefined;
        }
        else if (binding === undefined) {
            return this.manager.binding(key);
        }
        else if (binding === false) {
            // Return binding if it exists, but don't create it
            return this.manager.bindings[key];
        }
        else {
            // Set the binding
            // May not be sufficient if key is itself some weird multipart thing
            // where the various parts need to be created
            // But in the base case (aliasing!) we don't want to create any bindings;
            // we want to refer to an *existing* binding.
            this.manager.bindings[key] = binding;
            return this.manager.bindings[key];
        }
    }

    /**
    Adds a callback function, which responds to changes to the value associated with key.
    Calls the function with the current value so that things can be initialized. If the key
    is an array, the callbacks are triggered when any of the keys changes, and the values of
    all keys are passed in
    **/
    monitor(key, ...callbacks) {
        if (!Array.isArray(key)) {
            this.binding(key).monitor(...callbacks);
        }
        else {
            // Replace each callback with a version that gets ALL the bound values and passes them
            // (in order) into the original.
            for (let i = 0; i < callbacks.length; i++) {
                const callback = callbacks[i];
                callbacks[i] = () => callback(...this.getAll(...key));
            }
            // The callbacks have to be triggered when any of the keys changes.
            for (const k of key) {
                this.binding(k).monitor(...callbacks);
            }
        }
        return this;
    }

    // /**
    //  * Last argument is a function, which is sort of weird, but it's for consistency with the monitor()
    //  * method and general user expectations. Everything else is a key. When any key changes, the callback
    //  * is invoked with the current values of all keys
    //  */
    // monitorAll(...args) {
    //     const self     = this;
    //     const callback = args.pop();
    //     const meta     = () => callback(...self.getAll(...args));
    //     for (let key of args) {
    //         this.monitor(key, meta);
    //     }
    //     return this;
    // }

    /**
    Removes the function that is object-identical to callback from the binding
    for key.
    **/
    ignore(key, callback) {
        this.binding(key).ignore(callback);
    }

    /**
     * Defines a synthetic key in terms of some other keys (the dependencies) and an evaluator function. 
     * When any of the dependency keys changes, the function is called and key is set to the
     * return value. The values of all dependency keys are passed into the evaluator. It's probably not a good idea
     * to alter the value bound to key directly!
     * 
     * @param {string} key 
     * @param  {...string} dependencies 
     */
    define(key, ...dependencies) {
        // The evaluator is the last thing passed in. Yes, it's weird, but trust me: it's for the best.
        const evaluate = dependencies.pop();
        // Create a synthetic binding object to represent key. Why? Because defined keys should be
        // read-only, and should never modify an existing object or array. If we don't do this, a
        // multipart key such as "foo.bar" or "items[3]" will create a ChildBinding, and setting
        // the value of the ChildBinding modifies the container (the object "foo" or the array "items", 
        // in this example.)
        const binding = this.manager.defineBinding(key, () => new Binding(key));
        // evaluate is a function that takes in some bound values and returns a computed value.
        // (E.g. AND or OR all values.) The actual callback that's passed into monitor (and which will
        // be monitoring *each* key in dependencies) calls evaluate() and sets the value bound to
        // key in this binder.
        this.monitor(dependencies, (...values) => binding.set(evaluate(...values)));
        return this;
    }

    /**
    Monitors a key. When the key takes on an appropriate value, perform some action on that
    value.
    **/
    when(key, value, action) {
        // SANITY CHECK. If passed a boolean instead of a binding key, this is a no-op. Just do
        // the action and bail out.
        if (typeof key === "boolean") {
            return action(key);
        }
        if (action === undefined) {
            action = value;
            value = undefined;
        }
        let test;
        if (value === undefined) {
            // If no specific predicate is given, pass true to the action callback
            // if the newly-bound value is truthy.
            test = newValue => !!newValue;
        }
        else if (typeof value !== "function") {
            // Caller has supplied a specific value. The action's argument is true
            // when the bound value is equal to the given value.
            test = newValue => {
                // all of this is accounting for the horrible horrible proxies
                if (typeof newValue === "object" && newValue.__original) {
                    newValue = newValue.__original;
                }
                if (typeof value === "object" && value.__original) {
                    value = value.__original;
                }
                return newValue == value;
            }
        }
        else {
            // Caller has passed in a function which takes a value and returns
            // true or false, which is then passed to the action function.
            test = value;
        }
        this.monitor(key, newValue => 
            // Call the action function provided by the caller with true (if the new value calls for action)
            // or false (if it doesn't).
            action(
                // Test the new value to see whether it's an actionable new value.
                test(ProxyFactory.deproxify(newValue), this)
            )
        );
    }

    seed(basis, expand) { // TODO: expand flag (?)
        this.basis = basis;
        for (let [key, value] of basis) {
            this.set(key, value);
        }
        return this;
    }

    /**
    Updates every key in the original basis object to its current bound value.
    **/
    commit() {
        for (let key in this.basis) {
            this.basis[key] = this.get(key);
        }
        return this;
    }

    /**
    Convenience methods
    **/
    decrement(key, amount = 1) {
        return this.set(key, (this.get(key) || 0) - amount);
    }

    increment(key, amount = 1) {
        return this.set(key, (this.get(key) || 0) + amount);
    }

    toggle(key) {
        return this.set(key, !(this.get(key)));
    }

    /**
     * Compares two bindings' true values to see if they're equal. 
     * 
     * @param {*} key0 
     * @param {*} key1 
     */
    equal(key0, key1) {
        return this.binding(key0).equals(this.binding(key1));
    }

    push(key, item) {
        let list = this.get(key);
        list.push(item);
        // this.binding(key).trigger();
        return this;
    }

    remove(key, item) {
        let list = this.get(key);
        let index = list.indexOf(item);
        if (index != -1) {
            list.splice(index, 1); // Remove the item. Should trigger the binding.
        }
        // this.binding(key).trigger();
        return this;
    }

    suspend() {
        this.suspended = true;
        return this;
    }

    resume(key) {
        this.suspended = false;
        if (key) {
            this.trigger(key);
        }
        return this;
    }

    trigger(key) {
        this.binding(key).trigger();
        return this;
    }

    toString() {
        return "Binder";
    }

}

Binder.id = 0;
Binder.Trigger = Trigger;
