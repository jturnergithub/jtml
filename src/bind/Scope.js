import Binder from "./Binder.js";

const stack = [ new Binder() ]; 
const scopes = {}

export default class Scope {

    constructor(name) {
        this.name    = name;
        this.isolate = false;
        this.aliases = []; // Alias definitions to apply when there's a materialized binder.
        this.pending = []; // Operations to execute when there's a materialized binder.
        if (name) {
            scopes[name] = this;
        }
    }
    
    alias(newName, oldName) {
        this.aliases.push({
            newName : newName,
            oldName : oldName
        });
        return this;
    }

    isolated(isolated) {
        if (isolated === undefined) {
            return this.isolate;
        }
        else {
            this.isolate = isolated;
            return this;    
        }
    }

    redirect(key) {
        this.binder.binding(this.alias, this.binder.progenitor.binding(key));
    }

    get single() {
        this.enter();
        return jtml => {
            this.exit();
            return jtml;
        }
    }

    get multiple() {
        this.enter();
        return (...jtmls) => {
            this.exit();
            return jtmls;
        }
    }

    materialize(progenitor) {
        if (!this.binder) {
            progenitor = progenitor || Scope.current();
            this.binder = this.isolate ? new Binder() : new Binder(progenitor);
            for (let alias of this.aliases) {
                this.binder.alias(alias.newName, alias.oldName);
            }    
        }
        return this;
    }

    enter(progenitor) {
        this.materialize(progenitor);
        stack.push(this.binder);
        return this.binder;
    }

    exit() {
        if (stack.length > 1) {
            return stack.pop();
        }
        else {
            throw new Error("Can't exit global binder");
        }
    }

    /*** Facade over Binder methods ***/

    set(key, value) {
        this.pending.push(binder => binder.set(key, value));
        return this;
    }

    monitor(key, ...callbacks) {
        this.pending.push(binder => binder.monitor(key, ...callbacks));
        return this;
    }

    define(key, ...dependencies) {
        this.pending.push(binder => binder.define(key, ...dependencies));
        return this;
    }
}

Scope.global = function() {
    return stack[0];
}

Scope.current = function() {
    return stack[stack.length - 1];
}

Scope.binding = Scope.current;

Scope.get = function(name) {
    return scopes[name] || new Scope(name);
}

