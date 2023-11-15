let nextID = 0;
/**
 * This doesn't detect proxies in general, only JTML's value proxies.
 * 
 * @param {*} value 
 * @returns 
 */
export function isProxy(value) {
    return typeof value === "object" && value !== null && value.__target;
}

export function proxify(binding, value) {
    if (typeof value !== "object") {
        // Thanks to JavaScript, this eliminates objects, arrays, and proxies. Thanks, JavaScript?
        return value;
    }
    else if (isProxy(value)) {
        // // Who proxies the proxies? Not us, that's who.
        // // return value;
        // return proxify(binding, deproxify(value));
        return reproxify(binding, value);
    }
    else if (Array.isArray(value)) {
        // Array proxies are special because they have to deal with in-place mutations to the array (push, pop, etc.)
        // as well as sounding off when an array item is replaced.
        return arrayProxy(binding, value);
    }
    else {
        // Object proxies just have to notify this binding's monitors when one of the object's properties is
        // changed.
        return objectProxy(binding, value);
    }

}

function reproxify(binding, proxy) {
    if (binding === proxy.__binding) {
        return proxy;
    }
    else {
        return proxify(binding, deproxify(proxy));
        // I hate hate hate the idea of proxies within proxies, but it may be that its time has come.
        // return wrapperProxy(binding, proxy);
    }
}

export function deproxify(value) {
    if (isProxy(value)) {
        return value.__target;
    }
    else {
        return value;
    }
}

function wrapperProxy(binding, proxy) {
    return new Proxy(proxy, {
        get : (target, property) => target[property],
        set : (target, property, value => {
            binding.child(property).set(deproxify(value));
            target[property] = value;
            return true;
        })       
    })
}

function objectProxy(binding, object) {
    if (isProxy(object)) {
        // This is paranoia, but it's the good kind.
        throw new Error("Nested proxy detected");
    }
    if (object === null) {
        return object;
    }
    const id = nextID++;
    return new Proxy(object, {
        get : (target, property) => property === "__id" ? id : getPropertyProxy(binding, target, property),
        set : (target, property, value) => {
            // TODO: Do we need deproxify here?
            // Changes the value managed by the appropriate child binding and triggers callbacks on that binding.
            binding.child(property).set(deproxify(value));
            return true;
        }
    });
}

function arrayProxy(binding, array) {
    if (isProxy(array)) {
        // This is paranoia, but it's the good kind.
        throw new Error("Nested proxy detected.");
    }
    return new Proxy(array, {
        get : (target, property) => {
            if (typeof property === "symbol") { // This happens with toString()
                return target[property];
            }
            else {
                const index = Number(property);
                if (Number.isNaN(index) && property !== "length") {
                    return target[property];
                }
                else {
                    return getPropertyProxy(binding, target, property);
                }    
            }
        },
        set : (target, property, value) => {
            value = deproxify(value);
            const index = Number(property);
            if (!Number.isNaN(index)) {
                binding.child(index).set(value);
            }
            else {
                // Executes when changing the *structure* of the array, as in
                //     binder.get("array-key").length = 3;
                // In this case, we don't notify the child bindings--that's its own thing--but anyone
                // who depends on the array itself needs to know that it's changed.
                // In actual fact this is apparently only called for .length;
                // push(), pop(), and so forth all involve length-changing
                // Nasty special case here:
                if (property === "length") { // Always true?
                    value = value ?? 0; // Length can't be set to undefined or null; set to zero instead.
                    binding.trigger(); // Changing length modifies the array.
                }
                // binding.set(value);
                binding.child(property).set(value); // Notify anyone who's specifically interested in array.length
            }
            return true;
        }
    });
}

function getPropertyProxy(binding, target, property) {
    if (property === "__target") {
        return target;
    }
    else if (property === "__binding") {
        return binding;
    }
    else if (typeof property === "symbol") {
        return target[property];
    }
    else {
        return proxify(binding.child(property), target[property]);
    }
}