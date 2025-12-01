import Binder from "./Binder.js";

const scopes = {}

export default class Scope {

    constructor(name) {
        this.name    = name;
        this.pending = []; // Operations to execute when there's a materialized binder.
        if (name) {
            scopes[name] = this;
        }
    }
    
    alias(aliasKey, basisKey) {
        this.pending.push(binder => binder.alias(aliasKey, basisKey));
        return this;
    }

    define(key, dependencies, evaluator) {
        this.pending.push(binder => binder.define(key, dependencies, evaluator));
    }

    set(key, value) {
        this.pending.push(binder => binder.define(key, value));
    }

    /**
     * Creates a new binder that inherits bindings (prototypally, of course) from
     * the current binder. The new binder will beused for all JTML bindings until
     * it's either popped from the stack or superseded by an even newer model.
     */
    get child() {
        this.enter(Binder.current());
        return (...jtmls) => {
            return this.exit(jtmls);
        }
    }

    /**
     * Creates a new binder with no inherited bindings. The new binder will beused for 
     * all JTML bindings until it's either popped from the stack or superseded by an 
     * even newer model.
     * 
     */
    get independent() {
        this.enter();
        return (...jtmls) => {
            return this.exit(jtmls);
        }
    }

    /**
     * Enters a new scope by creating a Binder, configuring according to the pending
     * list, and pushing it onto the binder stack (making it current). If the parent
     * exists, the new binder takes the parent's bindings as the prototype for its 
     * own bindings. If not, the new binder is independent.
     * 
     * @param {Binder} parent 
     */
    enter(parent) {
        const binder = new Binder(parent);
        for(const callback of this.pending) {
            callback(binder);
        }
        Binder.push(binder);
        return this;
    }

    /**
     * Exits a scope.
     * 
     * @returns The previous binder
     */
    exit(jtmls) {
        Binder.pop();
        if (jtmls?.length === 1) {
            return jtmls[0];
        }
        else {
            return jtmls;
        }
    }

}

Scope.get = function(name) {
    return scopes[name] || new Scope(name);
}

