import AliasBinding from "./AliasBinding.js";
import * as BindingFactory from "./BindingFactory.js";
import * as BindUtil from "./BindUtil.js";

export default class BindingManager {

    constructor(bindings = {}) {
        // Bindings contains only root bindings. That is, they're either scalar values ("foo", 42, false)
        // or they're the ancester of a set of children. Child bindings are never memoized.
        this.bindings = bindings;
    }

    has(key) {
        return !!this.bindings[key];
    }

    /**
     * True if there's already a binding with the given key, whether as a root or as a child.
     * This is straightforward for ordinary bindings. For alias bindings, it's necessary to
     * ask whether the alias target exists, rather than the alias that refers to it.
     * 
     * @param {string} key 
     */
    exists(key) {
        if (this.has(key)) {
            return true;
        }
        else {
            const [first, ...rest] = BindUtil.split(key);
            if (!this.has(first)) {
                return false;
            }
            else {
                return this.bindings[first].seek(rest);
            }
        }
    }

    /**
     * If key points to an existing binding, returns it. If not, splits the key into chunks. Then creates a
     * child binder for each chunk that doesn't already have a binder. For instance,
     * "foo.bar[3][4].baz.qux[5]" becomes ["foo", "bar", "3", "4", "baz", "qux", "5"]. If we'd already created
     * the binding "foo.bar[3]", this method would also create the bindings "foo.bar[3][4]", "foo.bar[3][4].baz",
     * "foo.bar[3][4].baz.qux", and "foo.bar[3][4].baz.qux[5]".
     */
    binding(key, factory = BindingFactory.childBinding) {
        if (!key) {
            return undefined;
        }
        else {
            const [first, ...rest] = BindUtil.split(key);
            // Can't do this; by the nature of prototypal inheritance, it hides the prototype binding if it exists.
            // this.bindings[first] = this.bindings[first] || BindingFactory.binding(first, factory);
            if (!this.bindings[first]) {
                this.bindings[first] = BindingFactory.binding(first, factory);
            }
            return this
                .bindings[first]
                .descend(rest)
                .generate(rest, factory);    
        }
    }

    /**
     * Creates the last binding in the key, whether it has one element or many, using the factory provided.
     * Intermediate elements are created if necessary.
     * @param {string} key 
     * @param {function} factory 
     * @returns 
     */
    addLastBinding(key, factory) {
        const path    = BindUtil.split(key);
        const lastKey = BindUtil.parse(path.pop()); // If key is a multi-parter, only the *final* element is created.
        const binding = factory(lastKey);
        if (!path.length) {
            // Single-element key. Remember it among our root bindings, otherwise there's no
            // way to retrieve it ever again.
            this.bindings[lastKey] = binding;
        }
        else {
            // Multi-element key. Find or create the next-to-last binding
            // and add the last binding as a child, rather than as a root.
            this.binding(BindUtil.join(...path)).child(lastKey, binding);
        }
        return binding;
    }

    aliasBinding(aliasKey, targetKey = aliasKey + "-target") {
        const target  = this.binding(targetKey);
        const factory = lastKey => new AliasBinding(lastKey, target);
        return this.addLastBinding(aliasKey, factory);
    }

    defineBinding(key) {
        const oldBinding = this.bindings[key];
        const newBinding = this.addLastBinding(key, BindingFactory.binding);
        if (oldBinding) {
            newBinding.value = oldBinding.value;
            newBinding.monitor(...oldBinding.callbacks);
        }
        return newBinding;
    }

    /**
     * Combines a key string (indicating an EXTANT binding) and an array of trailing 
     * key elements (indicating one or more TO-BE-CREATED bindings)
     * 
     * @param {string} key 
     * @param {array} path 
     * @returns 
     */
    toBinding(key, path = BindUtil.split(key)) {
        // Find the last extant binding in the path, shortening the path as we go
        const parent = this.toParent(path);
        if (path.length) {
            // We now have an existing parent binding, and a path array of all those key elements
            // below it that *don't* exist.
            // Create! that! path!
            return this.instantiate(parent, path);
        }
        else {
            // All the bindings in the key physically exist, but we maybe don't have a record of them.
            // The "parent" is actually a single child binding of the original (first) binding.
            // (That is, it's a missing binding with zero missing children.)
            // Add the "parent" to the bindings so we don't have to search for it again
            this.bindings[key] = this.bindings[key] || parent;
            return parent;
        }
    }

    /**
     * Finds the last element on the path that already exists, shortening the path along the way.
     * The root item is created, if necessary.
     * 
     * @param {array} path 
     */
    toParent(path) {
        if (!path.length) {
            throw new Error("Attempt to find an existing element failed because the path is empty")
        }
        else {
            // If there's no root item, create one
            const firstKey = path.shift();
            if (!this.has(firstKey)) {
                // The root is always a vanilla Binding, because by definition it refers to an
                // independent thing--not an array element, nor a property of an object, but a
                // scalar or a top-level array or a top-level object. new it up.
                this.bindings[firstKey] = BindingFactory.binding(firstKey);
            }
            return this.bindings[firstKey].descend(path);
        }
    }
   
    instantiate(parent, path) {
        // The first element of the trailing path is always absent and must be created.
        // Shift it off the path array
        const binding = parent.child(path.shift());
        // Return the final, bottom-most nouveau binding
        if (path.length) {
            // Still got work to do, recurse
            return this.instantiate(binding, path);
        }
        else {
            // Having shifted off the first path element, it turns out that we're done.
            return binding;
        }
    }

}