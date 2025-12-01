import {Trigger} from "./Binding.js";
import AliasBinding from "./AliasBinding.js";
import ValueBinding from "./ValueBinding.js";
import * as BindUtil from "./BindUtil.js";

let id = 0;

export default class Binder {
    
    #bindings;

    constructor(progenitor) {
        this.#bindings  = progenitor ? Object.create(progenitor.bindings) : {};
        this.progenitor = progenitor;
        this.synonyms   = {};
        this.id         = id++;
    }

    get bindings() {
        return this.#bindings;
    }

    binding(key, binding) {
        if (key === undefined) {
            // Sanity check
            return undefined;
        }
        else if (binding !== undefined) {
            // Set the binding
            this.bindings[key] = binding;
            return this;
        }
        else {
            return this.getBinding(key);
        }
    }

    /**
     * If there's a binding with the indicated key, returns it. If there isn't, creates it,
     * memoizes it under the key, and returns it. By default, if it's necessary to create
     * bindings, the root of the binding hierarchy is a vanilla ValueBinding instance, and
     * any descendants are ChildBindings. Calling getBinding() with a ValueBinding subclass means
     * that *all* bindings created are of that class; if that's not what you want, create
     * intermediate binding instances first.
     * 
     * The differences between this.binding() and this.getBinding() are that 
     * * this.binding() is used to both get and set;
     * * this.binding() calls this.getBinding();
     * * this.getBinding() is intended for internal use only;
     * * this.getBinding() can specify what type of binding is to be created (if necessary).
     * 
     * @param {string} key 
     * @param {function} Type 
     * @returns 
     */
    getBinding(key, Type /* DO NOT default this to ValueBinding */) {
        const [first, ...rest] = BindUtil.split(key);
        // Ugly hack here.
        const exists = !!(Type === AliasBinding ? Object.hasOwn(this.bindings, first) : this.bindings[first])
        if (!exists) {
            // If given a specific Binding subclass, instantiate it. Otherwise,
            // the root of the binding hierarchy is a straight ValueBinding.
            this.bindings[first] = Type ? new Type(first) : new ValueBinding(first);
        }
        if (!rest.length) {
            // Nothing else to do; return the root.
            return this.bindings[first];
        }
        else {
            // Locate and/or create all the bindings between the root binding
            // and the terminal child. If a specific binding subclass was
            // requested, all created bindings will be of that subclass.
            // If not, the created bindings are of a class appropriate for
            // their parents.
            return this.bindings[first].descendant(rest, Type);
        }
    }

    find(key) {
        const [first, ...rest] = BindUtil.split(key);
        let binding = this.bindings[first];
        while (binding && rest.length) {
            binding = binding.children[rest.shift()];
        }
        return binding;
    }

    /**
     * Retrieves or creates an alias binding and sets it to point to some basis.
     * If the basis binding doesn't exist, it's created; this is to avoid messy
     * behavior in case the basis is created *later*. Passing in undefined for
     * the basis key avoids creating the basis binding.
     * 
     * @param {string} aliasKey 
     * @param {string} basisKey 
     * @returns 
     */
    alias(aliasKey, basisKey) {
        const aliasBinding = this.getBinding(aliasKey, AliasBinding);
        aliasBinding.basis = this.binding(basisKey);
        return aliasBinding;
    }

    /**
     * A synonym is like an alias, in that it introduces a new way to refer to an existing Binding.
     * What's different is that, for a synonym, that's it. There are no callbacks associated with a
     * synonym; changing the synonym is not detected and does not trigger anything. In other words,
     * a synonym is a convenient way of avoiding typing complicated keys, along the lines of 
     * "game.players[" + index + "].resources[" + resource + "].reserve". 
     * 
     * Creating a synonym does create the indicated binding, if it doesn't already exist. If this
     * isn't what you want, be sure that the binding is already present when you create the synonym.
     * 
     * @param {string} synonym 
     * @param {string} key 
     * @returns 
     */
    synonym(synonym, key) {
        if (key === undefined) {
            this.bindings[synonym] = undefined;
        }
        else {
            this.bindings[synonym] = this.getBinding(key);
        }
        return this;

    }

    /*** Values ***/

    /**
    Fetches or creates a binding for the key, then returns its value.
    **/
    get(key, raw) {
        if (!raw) {
            return this.binding(key).value;
        }
        else {
            return this.binding(key).rawValue;
        }
    }

    /**
     * Returns an array of all the values of all the keys, in order.
     * 
     * @param  {...string} keys 
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

    /**
     * Registers *one or more* callback functions which listen for changes in a *single* key.
     * When the value associated with the key changes, each callback is called with the new
     * and old values. The callbacks are invoked immediately by this method so that any effects
     * of the callbacks are initialized.
    **/
    monitor(key, ...callbacks) {
        this.binding(key).monitor(...callbacks);
    }

    /**
     * Registers *one* callback function which listens for changes in *multiple* keys.
     * When the value associated with any key changes, the callback is called with the new
     * (but not old) values of each of the keys. The callback is invoked immediately by this
     * method so that any effects of the callback are initialized.
     * 
     * @param {string[]} keys 
     * @param {function} callback 
     */
    monitorAll(keys, callback) {
        for (const key of keys) {
            this.monitor(key, () => {
                const values = this.getAll(...keys);
                callback(...values);
            });
        }
    }

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
     * @param {string[]} dependencies 
     * @param {function} callback
     */
    define(key, dependencies, evaluator) {
        // Get the ValueBinding whose value will be set according to the evaluator, creating it
        // if necessary.
        const binding = this.binding(key);
        // Create a function that gets the values of all the dependencies, passes them in to the
        // evaluator function, and sets the new binding to the resulting value.
        const callback = () => binding.set(evaluator(...this.getAll(...dependencies)));
        // When any dependency changes, call the callback so that the new binding gets set.
        for (const dependency of dependencies) {
            this.monitor(dependency, callback);
        }
        return binding;
    }

    // /**
    //  * Monitors a key. When the key takes on an appropriate value, perform some action on the associated value.
    // **/
    // when(key, value, action) {
    //     // SANITY CHECK. If passed a boolean instead of a binding key, this is a no-op. Just do
    //     // the action and bail out.
    //     if (typeof key === "boolean") {
    //         return action(key);
    //     }
    //     if (action === undefined) {
    //         action = value;
    //         value = undefined;
    //     }
    //     let test;
    //     if (value === undefined) {
    //         // If no specific predicate is given, pass true to the action callback
    //         // if the newly-bound value is truthy.
    //         test = newValue => !!newValue;
    //     }
    //     else if (typeof value !== "function") {
    //         // Caller has supplied a specific value. The action's argument is true
    //         // when the bound value is equal to the given value.
    //         test = newValue => {
    //             // all of this is accounting for the horrible horrible proxies
    //             if (typeof newValue === "object" && newValue.__original) {
    //                 newValue = newValue.__original;
    //             }
    //             if (typeof value === "object" && value.__original) {
    //                 value = value.__original;
    //             }
    //             return newValue == value;
    //         }
    //     }
    //     else {
    //         // Caller has passed in a function which takes a value and returns
    //         // true or false, which is then passed to the action function.
    //         test = value;
    //     }
    //     this.monitor(key, newValue => 
    //         // Call the action function provided by the caller with true (if the new value calls for action)
    //         // or false (if it doesn't).
    //         action(
    //             // Test the new value to see whether it's an actionable new value.
    //             // test(ProxyFactory.deproxify(newValue), this)
    //             test(newValue, this)
    //         )
    //     );
    //     return this;
    // }

    /**
     * Monitors a key for boolean-ness, optionally using some test function on the
     * associated value; then passes the booleanized value off to an action function.
     * 
     * This method supports a number of signatures. Most of them monitor the key(s) and
     * call the action function, passing the key's value as the argument. They differ in how 
     * they interpret the key's value in the conditional:
     * 
     * signal(boolean): calls action(boolean) and returns.
     * signal(key, action): calls action(value) when value is truthy.
     * signal(key, value, action): calls action(value) when the key's value equals the given value.
     * signal(key, test, action): calls action(value) when test(value) is true.
     * 
     * The action function is *always* called when a key's value changes. Its argument is 
     * a boolean derived from the new value, not necesarily the new value itself.
     * 
     * @param {[string]} keys 
     * @param {function} test 
     * @param {function} action 
     */
    signal(keys, test, action) {
        // If there's just a boolean argument, pass the boolean to the action.
        if (typeof keys === "boolean") {
            action(keys);
        }
        else {
            // Convert the arguments, allowing for the different call signatures.
            [keys, test, action] = toWhenArgs(keys, test, action);
            this.monitorAll(keys, (...values) => action(test(...values)));
        }

    }

    /**
     * Monitors a key with a conditional callback: if the key's value passes some test,
     * take some action.
     * 
     * The valid signatures for calling when() are the same as those for calling signal().
     * 
     * Note that the action function is only called if the test resolves to true. Compare
     * to monitor(), which always executes its callbacks when the key changes.
     * 
     * @param {*} key 
     * @param {*} test 
     * @param {*} action 
     */
    when(keys, test, action) {
        // Convert the arguments, allowing for the different call signatures.
        [keys, test, action] = toWhenArgs(keys, test, action);
        this.monitorAll(keys, (...values) => {
            if (test(...values)) {
                action(...values);
            }
        })
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

    replace(key, newValue) {
        const oldValue = this.get(key);
        this.set(key, newValue);
        return oldValue;
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
    
    trigger(key) {
        this.binding(key).trigger();
        return this;
    }

    any(...keys) {
        for (const value of this.getAll(...keys)) {
            if (value) {
                return true;
            }
        }
        return false;
    }

    all(...keys) {
        for (const value of this.getAll(...keys)) {
            if (!value) {
                return false;
            }
        }
        return true;
    }

    toString() {
        return "Binder";
    }

}

/**
 * FOR INTERNAL USE ONLY. Do not call this function. Do not mess with this function.
 * In fact, don't even read this comment.
 * 
 * Checks the types of the two arguments and converts them into the appropriate signature
 * values.
 * 
 * Possible signatures:
 * * toWhenArgs(keys, actionFn) - if all keys' values are truthy, call actionFn
 * * toWhenArgs(keys, testFn, actionFn) - if testFn(keys) is truthy, call actionFn
 * * toWhenArgs(key, value, actionFn)  - if key's value === value, call actionFn
 * 
 * @param {function} test 
 * @param {function} action 
 */
function toWhenArgs(keys, test, action) {
    if (!Array.isArray(keys)) {
        keys = [keys];
    }
    if (arguments.length < 3) {
        action = test;  // Caller didn't provide a test, just an action.
        test = undefined; // Will be resolved in the next step.
    }
    if (test === undefined) {
        // test = value => !!value; // The default test is "is the key's value truthy?"
        test = (...values) => values.every(v => !!v);
    }
    else if (typeof test !== "function") {
        const expected = test; // Caller's "test" is actually a value. 
        test = value => value == expected; // The real test is "does the key have this value?"
    }
    return [keys, test, action];
}


const stack = [ new Binder() ]; 

/**
 * Returns the zeroth binder in the stack. Does not alter the stack itself.
 * 
 * @returns The global binder
 */
Binder.global = function() {
    return stack[0];
};

/**
 * Returns the topmost binder in the stack. Does not alter the stack itself.
 * 
 * @returns The current binder
 */
Binder.current = function() {
    return stack[stack.length - 1];
};

/**
 * Puts a binder on the binder stack, making it current.
 * 
 * @param {Binder} binder 
 */
Binder.push = function(binder) {
    stack.push(binder);
}

/**
 * Pops the topmost binder off the binder stack, making it inactive and making the previous binder
 * current.
 * 
 * @returns The popped binder
 */
Binder.pop = function() {
    if (stack.length > 1) {
        return stack.pop();
    }
    else {
        throw new Error("Can't pop global binder");
    }
}

Binder.Trigger = Trigger;