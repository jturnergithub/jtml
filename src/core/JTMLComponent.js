import Binder from "../bind/Binder.js";
import {Trigger} from "../bind/Binding.js";

let serialNbr = 0;

/**
 * The base class for JTML tags, text nodes, and groups thereof.
 * 
 * A JTMLComponent has two jobs.
 * 1. Act as a peer to some DOM element, or possibly a collection of elements.
 * 2. Modify itself in response to changes in one or more Bindings.
 * 
 * A Binding is an object that houses a value and a collection of callback functions.
 * When the value is changed, the callback functions are triggered. A JTMLComponent
 * responds to such a change by calling its display() method, as well as any other.
 * This behavior is automatic! Creators of JTMLComponents can supply other behaviors
 * as well.
 * 
 * @see Binding 
 */
export default class JTMLComponent {

    #serialNbr;
    #binder;
    #toDisplay = value => value;

    constructor() {
        this.#serialNbr = serialNbr++;
        this.keys       = {};
        this.#binder    = Binder.current();
    }

    get serialNbr() {
        return this.#serialNbr;
    }

    // /**
    //  * Synonym for this.value(). TODO: used by various subclasses, should be rethought.
    //  * 
    //  * @deprecated
    //  * 
    //  * @returns 
    //  */
    // evaluate() {
    //     return this.value();
    // }

    /**
     * Gets or sets the toDisplay function for this component; toDisplay is used to
     * modify a bound value before passing it off to the display() method.
     * 
     * @param {function} toDisplay 
     * @returns 
     */
    toDisplay(toDisplay) {
        if (!toDisplay) {
            return this.#toDisplay;
        }
        else {
            this.#toDisplay = toDisplay;
            // If the bound value has already been set, it hasn't gone through the toDisplay()
            // function yet. Do so.
            if (this.keys.binding) {
                const value = this.get(this.keys.binding);
                if (value !== undefined) {
                    this.display(toDisplay(value));
                }
            }
            return this;
        }
    }

    /**
    It would be nice to support adding to multiple DOM nodes. That way we could
    attach an identical set of children to all .foo nodes, or all buttons, or
    whatever. However, to do that, we'd have to delay creating the Node
    instances until attachment time, which would be deuced inconvenient.
    **/
    addToDOM(domNode = "body") {
        if (typeof domNode === "string") {
            if (domNode.startsWith("#")) {
                // replace domNode with the indicated Node object
                domNode = document.getElementById(domNode.substring(1));
            }
            else {
                let elements = document.getElementsByTagName(domNode);
                domNode = elements[0];
            }
        }
        if (!this.hasBinder()) {
            this.setBinder(binder);
        }
        this.appendTo(domNode);
        return this;
    }

    appendTo(domNode) {
        if (!domNode) {
            throw new Error("Cannot append to a nonexistent DOM node");
        }
        domNode.appendChild(this.domNode);
    }

    /**
     * Delays executing a callback function, if need be, until the document has been loaded. Used for
     * some functionality--focusing, for example--that won't work right before the element is
     * added to the DOM tree.
     * 
     * @param {function} callback 
     */
    pend(callback) {
        if (document.body.contains(this.domNode)) {
            callback();
        }
        else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    get boundValue() {
        if (this.keys.binding) {
            return this.get(this.keys.binding);
        }
    }

    get root() {
        if (this.parent) {
            return this.parent.root;
        }
        else {
            return this;
        }
    }

    /********** Binder management **********/

    binder(binder){
        if (binder === undefined) {
            return this.getBinder();
        }
        else {
            this.setBinder(binder);
            return this;
        }
    }

    getBinder() {
        return this.#binder;
    }

    setBinder(binder) {
        if (!this.hasBinder()) {
            this.#binder = binder;
        }
        return this;
    }

    hasBinder() {
        return !!this.#binder;
    }

    /**
     * Gives this component a new binder that inherits from its current binder.
     * Useful for child components.
     */
    newBinder() {
        this.binder(new Binder(this.binder()));
    }

    /********** Binder operations **********/

    /**
     * The most important single method in JTML. Establishes that the component is dependent
     * on some value; when the model changes, the component must change with it.
     * 
     * Subclasses must implement the display() method, which specifies what to do when
     * the bound value changes.
     * // If given a callback in addition to the above behavior, register it.
     * 
     * @param {string} key An identifier for a Binding
     * @param {*} initial The initial value
     * @param {function} callback Optional function to be called immediately
     * @returns 
     */
    bind(key, initial) {
        // Remember the key to retrieve the binding
        this.keys.binding = key;
        // Create the binding and give it an initial value
        this.init(key, initial);
        // Associate the key with a callback (which may be called
        // immediately) which handles the new bound value, updating every time
        // the bound value changes.
        this.monitor(key, value => this.update(value));
        return this;
    }

    /**
     * Called when the bound value changes, so that this JTMLComponent can change its
     * state to match. The expected behavior is to display the new value in some fashion.
     * 
     * @param {*} value Value type dependent on subclass
     */
    update(value) {
        this.display(this.#toDisplay(value));
    }

    // unbind() {
    //     this.binder().ignore(this.key, this.callbacks.display);
    //     this.key = undefined;
    // }

    /********** Binder convenience methods **********/

    /**
     * Convenience method: calls binder.get(key, raw). If raw is true, then
     * the value is a non-proxy.
     * 
     * @param {String} key 
     * @param {boolean} raw 
     * @returns 
     */
    get(key = this.keys.binding, raw) {
        return this.binder().get(key, raw);
    }

    /**
     * Convenience method: calls binder.set(key, value, trigger)
     * 
     * @param {string} key 
     * @param {*} value 
     * @param {*} trigger 
     * @returns 
     */
    set(key, value, trigger = Trigger.AUTO) {
        this.binder().set(key, value, trigger);
        return this;
    }

    /**
     * Convenience method that replaces the value of key0 with the value of key1.
     * Equivalent to this.set(key0, this.get(key1)).
     * 
     * @param {string} key0 The key to be overwritten
     * @param {string} key1 The source of the value
     */
    overwrite(key0, key1) {
        this.set(key0, this.get(key1));
        return this;
    }

    replace(key, value) {
        let oldValue = this.get(key);
        this.set(key, value);
        return oldValue;
    }

    increment(key, amount = 1) {
        this.binder().increment(key, amount);
        return this;
    }

    decrement(key, amount = 1) {
        this.binder().decrement(key, amount);
        return this;
    }

    toggle(key) {
        this.binder().toggle(key);
        return this;
    }

    push(key, value) {
        this.get(key).push(value);
        return this;
    }

    pop(key) {
        return this.get(key).pop();
    }

    define(key, ...dependencies) {
        this.binder().define(key, ...dependencies);
        return this;
    }

    trigger(key) {
        this.binder().binding(key).trigger();
        return this;
    }

    when(key, value, action) {
        this.binder().when(key, value, action);
        return this;
    }

    /**
     * Compares two bound values to see if they're equal. A simple "===" comparison is
     * unsafe in the case of bound object/array values, because they're surrounded by proxies.
     * 
     * @param {*} key0 
     * @param {*} key1 
     */
    equal(key0, key1) {
        return this.binder().equal(key0, key1);
    }

    
    /**
     * Called when the component receives a binder, to initialize the bound value.
     * 
     * @param {*} key 
     * @param {*} initial 
     * @returns 
     */
    init(key, initial) {
        this.binder().init(key, initial);
        return this;
    }

    /**
     * Convenience method: calls binder.monitor().
     * Track a key that this thing might not be bound to, and call one or functions when its value changes.
     * If no callback functions are given, the component refreshes its display, as if its own bound
     * value had changed.
     * 
     * @param {string} key 
     * @param  {...function} callbacks 
     * @returns 
     */
    monitor(key, ...callbacks) {
        if (!callbacks.length) {
            callbacks = [() => this.refresh()];
        }
        // const self = this;
        // for (let i = 0; i < callbacks.length; i++) {
        //     const callback = callbacks[i];
        //     callbacks[i] = function(...args) {
        //         callback.call(self, ...args);
        //     }
        // }
        this.binder().monitor(key, ...callbacks);
        return this;
    }

    // /**
    //  * Creates a movable alias where aliasKey points to targetKey; then does a binding to
    //  * aliasKey.childKey, so that whenever the childKey bound value changes this JTMLComponent
    //  * calls display() with the new value.
    //  * 
    //  * @param string aliasKey 
    //  * @param string targetKey 
    //  * @param string childKey 
    //  */
    // bindFloating(aliasKey, descendantKey) {
    //     if (descendantKey) {
    //         // We need to know when some descendant of the alias target changes--specifically,
    //         // we need to redisplay the descendant value when the alias is redirected to a new target.
    //         const aliasBinding = this.binder().binding(aliasKey);
    //         const self         = this;
    //         // Create a floating callback that's triggered when the descendant property changes        
    //         aliasBinding.float(descendantKey, value => { 
    //             self.display(value);
    //         });    
    //         return this;
    //     }
    // }

    // /**
    //  * Like a regular bind() call, only this version points not to a regular binding but to an alias binding.
    //  * Alias bindings have a couple of related uses:
    //  * - In some particular scope, alias can be used to refer to one item in a bound array. For example, if there's
    //  * a key "game.players" that's an array, a selector option tag or similar might alias "game.players[0]" with the
    //  * key "player".
    //  * - An alias can also be redirected to a different target. For example, "game.currentPlayer" may start out
    //  * as an alias for "game.players[0]", then get redirected to "game.players[1]", then "game.players[2]", etc.
    //  * @param {string} aliasKey 
    //  * @param {string} targetKey 
    //  * @param {string} childKey 
    //  * @returns 
    //  */
    // bindAlias(aliasKey, targetKey, childKey) {
    //     this.alias(aliasKey, targetKey);
    //     if (childKey) {
    //         // Display the value of a descendant of the alias -> target
    //         this.bind(BindUtil.format(aliasKey, childKey));
    //     }
    //     else {
    //         // Display the value of the alias -> target itself
    //         this.bind(aliasKey);
    //     }
    //     return this;
    // }
    
    alias(aliasKey, basisKey) {
        this.keys.alias = aliasKey;
        this.binder().alias(aliasKey, basisKey);
        return this;
    }

    synonym(synonym, key) {
        this.binder().synonym(synonym, key);
        return this;
    }

    /**
     * If this JTML is bound to an alias, moves the alias to point to a different foundation.
     * 
     * @param {string} targetKey 
     * @returns 
     */
    redirect(basisKey) {
        if (!this.keys.alias) {
            throw new Error(`Can't redirect ${this} to ${basisKey} because it doesn't have an alias key`);
        }
        this.binder().alias(this.keys.alias, basisKey);
        return this;
    }

    // float(key, suffix, callback) {
    //     this.binder().float(key, suffix, callback);
    //     return this;
    // }

    // /**
    // Tells the binder to perform a callback function without triggering any
    // monitors. The binder is returned so that the caller can then easily
    // trigger specific bindings, if desired.
    // **/
    // silently(callback) {
    //     let binder = this.binder();
    //     binder.suspend();
    //     callback(binder);
    //     binder.resume();
    //     return binder;
    // }    

    display() {
        throw new Error("Subclass does not implement JTMLComponent.display()");
    }

    /**
     * Forces a component to redisplay itself. Useful for computed values, or
     * when values can be changed outside of the JTML system.
     */
    refresh() {
        this.display(this.get(this.keys.binding));
        return this;
    }
}