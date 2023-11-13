import {binder} from "../bind/bind.js";
import {Trigger} from "../bind/Binding.js";
import * as BindUtil from "../bind/BindUtil.js";

let serialNbr = 0;

export default class JTMLComponent {

    #serialNbr;

    constructor() {
        this.#serialNbr = serialNbr++;
        this.keys = {};
        this.my = {
            binder : binder()
        };
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
            // else if (domNode.startsWith(".")) {
            //     let elements = document.getElementsByClassName(domNode.substring(1));
            //     for (let element of elements) {
            //         // recurse
            //         this.addToDOM(element);
            //     }
            // }
            else {
                let elements = document.getElementsByTagName(domNode);
                domNode = elements[0];
                // for (let element of elements) {
                //     // recurse
                //     this.addToDOM(element);
                // }
            }
        }
        if (!this.hasBinder()) {
            this.setBinder(new Binder());
        }
        this.appendTo(domNode);
        return this;
    }

    appendTo(domNode) {
        if (!domNode) {
            throw new Exception("Cannot append to a nonexistent DOM node");
        }
        domNode.appendChild(this.domNode);
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
        return this.my.binder || this.my.proxy;
    }

    setBinder(binder) {
        if (!this.hasBinder()) {
            this.my.binder = binder;
            this.my.lock.release();
        }
        return this;
    }

    hasBinder() {
        return !!this.my.binder;
    }

    /********** Binder operations **********/

    bind(key, initial, callback) {
        if (callback === undefined && typeof initial === "function") {
            callback = initial;
            initial = undefined;
        }
        this.key = key;
        // Better way ...
        this.keys.binding = key;
        this.init(key, initial);
        // Associate the key with a callback (which may be called
        // immediately) which shows the value, updating every time
        // the bound value changes.
        const self = this;
        this.monitor(key,
            value => self.display(value)
        );
        if (callback) {
            this.monitor(key, callback);
        }
        return this;
    }

    // unbind() {
    //     this.binder().ignore(this.key, this.callbacks.display);
    //     this.key = undefined;
    // }

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

    monitor(key, ...callbacks) {
        this.binder().monitor(key, ...callbacks);
        return this;
    }

    /********** Binder convenience methods **********/

    get(key, raw) {
        return this.binder().get(key, raw);
    }

    set(key, value, trigger = Trigger.AUTO) {
        this.binder().set(key, value, trigger);
        return this;
    }

    swap(key, value) {
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

    define(key, ...dependencies) {
        this.binder().define(key, ...dependencies);
        return this;
    }

    trigger(key) {
        this.binder().binding(key).trigger();
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
     * Creates a movable alias where aliasKey points to targetKey; then does a binding to
     * aliasKey.childKey, so that whenever the childKey bound value changes this JTMLComponent
     * calls display() with the new value.
     * 
     * @param string aliasKey 
     * @param string targetKey 
     * @param string childKey 
     */
    bindFloating(aliasKey, descendantKey) {
        if (descendantKey) {
            // We need to know when some descendant of the alias target changes--specifically,
            // we need to redisplay the descendant value when the alias is redirected to a new target.
            const aliasBinding = this.binder().binding(aliasKey);
            const self         = this;
            // Create a floating callback that's triggered when the descendant property changes        
            aliasBinding.float(descendantKey, value => { 
                self.display(value);
            });    
            return this;
        }
    }

    /**
     * Like a regular bind() call, only this version points not to a regular binding but to an alias binding.
     * Alias bindings have a couple of related uses:
     * - In some particular scope, alias can be used to refer to one item in a bound array. For example, if there's
     * a key "game.players" that's an array, a selector option tag or similar might alias "game.players[0]" with the
     * key "player".
     * - An alias can also be redirected to a different target. For example, "game.currentPlayer" may start out
     * as an alias for "game.players[0]", then get redirected to "game.players[1]", then "game.players[2]", etc.
     * @param {string} aliasKey 
     * @param {string} targetKey 
     * @param {string} childKey 
     * @returns 
     */
    bindAlias(aliasKey, targetKey, childKey) {
        this.alias(aliasKey, targetKey);
        if (childKey) {
            // Display the value of a descendant of the alias -> target
            this.bind(BindUtil.format(aliasKey, childKey));
        }
        else {
            // Display the value of the alias -> target itself
            this.bind(aliasKey);
        }
        return this;
    }
    
    alias(aliasKey, targetKey) {
        this.keys.alias = aliasKey;
        this.binder().alias(aliasKey, targetKey);
        return this;
    }

    /**
     * If this JTML is bound to an alias, moves the alias to point to a different foundation.
     * 
     * @param {string} targetKey 
     * @returns 
     */
    redirect(targetKey) {
        if (!this.keys.alias) {
            throw new Error(`Can't redirect ${this} to ${targetKey} because it doesn't have an alias key`);
        }
        if (targetKey) {
            this.binder().redirect(this.keys.alias, targetKey);
        }
        return this;
    }

    float(key, suffix, callback) {
        this.binder().float(key, suffix, callback);
        return this;
    }

    /**
    Tells the binder to perform a callback function without triggering any
    monitors. The binder is returned so that the caller can then easily
    trigger specific bindings, if desired.
    **/
    silently(callback) {
        let binder = this.binder();
        binder.suspend();
        callback(binder);
        binder.resume();
        return binder;
    }    

    display(value) {
        throw new Error("Subclass does not implement JTMLComponent.display()");
    }
}