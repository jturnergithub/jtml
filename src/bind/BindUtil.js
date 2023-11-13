/**
 * Regular expression to split a key, such as "foo.bar[3].baz.qux[4][5]" 
 * The regular expression matches:
 * 1. ".", optionally preceded by "]". Examples: "foo.bar", "baz[3].qux"
 * 2. "[", optionally preceded by "]". Examples: "foo[3]", "bar[3][4]"
 * 3. "]", alone, at the end of input
 * This would match some malformed path strings, like "foo.bar]". Don't do that.
 */
const SPLIT_REGEX = /\]?\.|\]?\[|\]/g;

// Why are we doing this? It's ugly. 
// a) The parent keeps its child IndexBindings in an array, so it can look them up by number.
// b) Only sometimes we get a lookup request for the length of an array, not one of its members.
// c) Which makes the parent try to find the child at array["length"], which barfs.
// d) So we have to trap get and set calls against the length property and divert them.
// e) Fortunately, one of the first things super() does is set children[index] = this.
// f) So if the index is actually the string "length", then the proxy traps it and holds it
// and returns it if anyone asks for "length" in the future.
// g) In theory.
const handler = {

    get : (target, property) => {
        if (property === "length") {
            return target.length;
        }
        else {
            return target[property];
        }
    },

    set : (target, property, value) => {
        if (property === "length") {
            target.length = value;
        }
        else {
            target[property] = value;
        }
        return true;
    }

};

export const container = function(key) {
    key = parse(key);
    if (typeof key === "number") {
        return new Proxy([], handler);
    }
    else {
        return {};
    }
}

export const parse = function(property) {
    const index = Number(property);
    if (Number.isNaN(index)) {
        return property;
    }
    else {
        return index;
    }
}

/**
 * Appends each element of the path to the key with the correct formatting.
 * * Path elements that can be converted to a number are surrounded with []
 * * Path elements that can't be converted to a number are preceded by .
 * @param {string} key 
 * @param  {...string} path 
 * @returns 
 */
export const format = function(key, ...path) {
    while (path.length) {
        const suffix = path.shift();
        const index = Number(suffix);
        if (Number.isNaN(index)) {
            key += "." + suffix;
        }
        else if (suffix !== undefined) {
            key += "[" + suffix + "]";
        }
    }
    return key;
}

export const split = function(key) {
    return key
        .split(SPLIT_REGEX) // Divide the key into chunks
        .map(chunk => chunk.trim()) // Eliminate extra whitespace from each chunk
        .filter(chunk => chunk.length); // Toss any chunks consisting of empty string
}

export const join = function(...keys) {
    let string = "";
    if (keys.length) {
        string = keys.shift();
        for (let key of keys) {
            string = format(string, key);
        }
    }
    return string;
}

export const concatenate = function(key, ...otherKeys) {
    for (let otherKey of otherKeys) {
        // This is dumb, because we're splitting up otherKey unnecessarily. Really all we need
        // to do is figure out whether the first element is a number or not.
        key = format(key, otherKey);
    }
    return key;
}

export const Trigger = {
    NEVER  : "never",
    AUTO   : "auto",
    ALWAYS : "always"
}