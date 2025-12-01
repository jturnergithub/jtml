import Binding from "./Binding.js";

/**
 * JTML has two types of aliases. The simpler sort is an immobile one: it says that
 * for some time, or in some scope, "foo" should be treated as a synonym for "bar.baz",
 * or whatever. AliasBinding supports the other sort: an alias that can be moved so
 * that it points, at different time, to different bindings. An obvious example is the
 * concept of "the active player" in any game, which necessarily switches many times.
 * 
 * An AliasBinding has no value of its own; its value is the value of its basis binding,
 * or undefined if there isn't one. It may have an oldValue property separate from the
 * basis oldValue, because switching the alias to a different basis is equivalent to
 * changing its value.
 * 
 * Callbacks can be attached to an AliasBinding. They're triggered when the alias switches
 * to another basis *or* when the basis callbacks are triggered. See Binding for
 * further details.
 * 
 * AliasBindings may be children of other binding subclasses (ValueBinding, ChildBinding).
 * Their own children, however, are other AliasBindings.
 * 
 * In principle, AliasBindings can be based on other AliasBindings. Don't push it. And
 * for God's sake don't make them circular.
 */
export default class AliasBinding extends Binding {

    #basis;
    #oldValue;

    constructor(key, parent) {
        super(key, parent);
    }

    get basis() {
        return this.#basis;
    }

    set basis(basis) {
        // Not only avoids extra work, but guards against circular logic ...
        if (basis !== this.basis) {
            if (this.basis) {
                // Keep the value of the old referent as the "previous" value
                this.oldValue = this.rawValue;
                // We no longer care about updates to the old basis.
                this.basis.unlink(this);
            }
            this.#basis = basis;
            if (this.basis) {
                // Tell the basis to trigger this alias when it's triggered itself.
                this.basis.link(this);
            }
            this.trigger(); // Do it manually, since the alias has indeed changed
            // Handle the parallel alias-binding hierarchy.
            for (const child of Object.values(this.children)) {
                child.basis = this.basis.child(child.discriminant);
            }
        }
    }

    get oldValue() {
        return this.#oldValue ?? this.basis?.oldValue;
    }

    set oldValue(value) {
        this.#oldValue = value;
    }

    set(value) {
        if (this.basis) {
            this.basis.set(value);
        }
        return this;
    }

    get oldValue() {
        return this.#oldValue ?? this.basis?.oldValue;
    }

    set oldValue(value) {
        this.#oldValue = value;
    }

    get rawValue() {
        return this.basis?.rawValue;
    }

    set rawValue(value) {
        throw new Error("Attempt to directly set the raw value of an alias.")
    }

    set(value) {
        if (this.basis) {
            // There might be something in the local #oldValue, if this alias has been redirected.
            // If so, it's no longer correct; remove it.
            this.#oldValue = undefined;
            // Delegate to the basis, which will set its own values directly (indirectly setting this
            // alias's values) and also trigger all the callbacks (including this alias's callbacks).
            this.basis.set(value);
        }
    }

    /**
     * Delegates to the basis binding. If there's no basis, always false.
     * 
     * @param {Binding} that 
     * @returns true if the bindings' values are equal.
     */
    equals(that) {
        return !!this.basis?.equals(that);
    }

    /**
     * The child of an AliasBinding is another AliasBinding. Its basis
     * is derived from this parent's basis. E.g., if this parent is based on
     * { name : "Fred" }, the child binding "name" is based on a binding
     * to that object's "name" property.
     */
    procreate(discriminant) {
        const child = new AliasBinding(discriminant, this);
        child.basis = this.basis?.child(discriminant);
        return child;
    }

}
