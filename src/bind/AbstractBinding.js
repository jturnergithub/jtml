import * as BindUtil from "./BindUtil.js";
import * as ProxyFactory from "./ProxyFactory.js";

let id = 0;

export default class AbstractBinding {

    #key;

    constructor(key) {
        this.id           = id++;
        this.#key          = key;
        this.discriminant = key;
        this.callbacks    = [];
    }

    get key() {
        if (this.parent) {
            return BindUtil.format(this.parent.key, this.#key);
        }
        else {
            return this.#key;
        }
    }

    get value() {
        throw new Error("Subclass does not implement AbstractBinding.value getter");
    }

    set value(value) {
        throw new Error("Subclass does not implement AbstractBinding.value setter")
    }

    set(value, trigger = BindUtil.Trigger.AUTO) {
        // If we're always going to trigger, then of course the trigger flag is true.
        let flag = trigger === BindUtil.Trigger.ALWAYS;
        if (this.different(value)) {
            this.value = value;
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
     * Forcibly updates the bound value and calls callbacks. We do this for the specific case when a container
     * (parent) value is changed out from under a contained (child) value, because by the time the child gets
     * around to updating itself the "new" value is identical to the value inherited from the parent. For example:
     * 
     * binder.binding("foo.bar").set(0);
     * binder.binding("foo.bar").monitor(callback);
     * binder.binding("foo").set({ bar : 42 });
     * 
     * In this case, by the time callback is invoked, foo.bar is already 42! So it looks like it's unchanged, which
     * leads to woes.
     */
    reset() {
        console.debug("Notifying monitors of " + this.key + " because its parent value has changed");
        this.trigger();
    }

    different(value) {
        return ProxyFactory.deproxify(value) !== ProxyFactory.deproxify(this.value);
    }

    equals(that) {
        if (that instanceof AbstractBinding) {
            return this.rawValue === that.rawValue;
        }
        else if (typeof that === "object") {
            // Proxy city.
            return this.rawValue === ProxyFactory.deproxify(that);
        }
        else {
            return this.rawValue === that;
        }
    }

    monitor(...callbacks) {
        this.callbacks.push(...callbacks);
        // Trigger all the new callbacks, don't bother with the old ones
        this.trigger(callbacks);
        return this;
    }

    trigger(callbacks = this.callbacks) {
        if (!this.triggered) {
            // Avoid circular triggering.
            this.triggered = true;
            for (const callback of callbacks) {
                callback(this.value, this.oldValue);
            }
            if (this.children) {
                // When an object/array is replaced by a different object/array, then all the
                // things bound to properties/items of that object/array are necessarily stale.
                // Trigger all the child bindings.
                for (const child of Object.values(this.children)) {
                    child.trigger();
                }
            }
            this.triggered = false;
        }
    }

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
     * Looks for the descendant specified by the path. True if the descendant exists, false if
     * we run out of path before we find it.
     */
    seek(path) {
        if (!path.length) {
            // Nothing more to seek, presumably this is it.
            return true;
        }
        else if (!this.children) {
            // Nothing more to seek *in*, no luck.
            return false;
        }
        else {
            // Can we go any further?
            const [first, ...rest] = path;
            const child = this.children[BindUtil.parse(first)];
            if (!child) {
                // No, we can't go any further; again, no luck.
                return false;
            }
            else {
                // Recurse
                return child.seek(rest);
            }
        }
    }

    /**
     * Recursively crawls down the path until it finds a binding with no such child,
     * or until it runs out of path. Returns the last binding in the path. SIDE EFFECT
     * (beneficial?): shortens the path array as it goes.
     * 
     * @param {*} path 
     * @returns 
     */
    descend(path) {
        if (!path.length || !this.children) {
            return this;
        }
        else {
            const [first, ...rest] = path;
            const child = this.children[BindUtil.parse(first)];
            if (!child) {
                return this;
            }
            else {
                path.shift();
                return child.descend(path);
            }
        }
    }

    generate(path, factory) {
        if (!path.length) {
            return this;
        }
        else {
            const child = this.spawn(path.shift(), factory);
            return child.generate(path, factory);
        }
    }

    spawn(discriminant, factory = this.factory) {
        discriminant  = BindUtil.parse(discriminant); // Make sure discriminant is the right type
        const child   = factory(discriminant); // Create a child binding
        child.factory = factory; // Give it the factory so that it can create children on its own
        this.child(discriminant, child); // Put it among this binding's children
        return child;
    }

    child(discriminant, binding) {
        if (!binding) {
            // Get or create the child binding.
            if (!this.children || !this.children[discriminant]) {
                this.spawn(discriminant);
            }
            return this.children[discriminant];
        }
        else {
            console.debug(`Setting ${this.key} as parent of ${binding.discriminant}`);
            // Remember the child binding and make this its parent.
            binding.parent                      = this;
            this.children                       = this.children || binding.childContainer(); // Make sure we've got a place to put the child
            this.children[binding.discriminant] = binding; // Add binding to the children
            // IMPORTANT. When the parent binding's value changes--i.e., its value is set to a different array or
            // object--then by definition the child binding is stale. Trigger its callbacks. Consider this sequence:
            // binder.set("parent"  { foo : [1, 2, 3] });
            // binder.monitor("parent.foo", callback);
            // binder.get("parent.foo").push(4);
            // This will only work if the push() call not only modifies the array parent.foo, but notifies anyone who's
            // monitoring that array.
            // this.monitor(() => binding.trigger()); 
            // Here is a thing to NOT DO:
            //     binding.monitor(() => this.trigger());
            // While it might seem natural to notify monitors of the parent when the child changes,
            // it's contractually dubious. Changing an object property, or swapping in a different array
            // item, don't create a *different* container; they modify an *existing* container. As such,
            // anything that's bound to the container object/array only gets notified if the existing object
            // is replaced or structurally modified.
            return this;
        }
    }

    childContainer() {
        return BindUtil.container(this.discriminant);
    }
}


