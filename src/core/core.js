export {binder, format, scope} from "../bind/bind.js";
import JTMLText from "./JTMLText.js";

export function repeat(what, factory) {
    const components = [];
    if (typeof what === "number") {
        // Repeat a specific number of times
        // The factory function takes the index
        for (let i = 0; i < what; i++) {
            components.push(factory(i));
        }
        return components;
    }
    else if (Array.isArray(what)) {
        // Repeat for each item in an array
        // The factory function takes the item and its index
        for (let i = 0; i < what.length; i++) {
            components.push(factory(what[i], i));
        }
    }
    else if (typeof what === "object") {
        // Repeat for each key-value property in the object
        // The factory function takes the key, the value, and the index
        let i = 0;
        for (const [key, value] of Object.entries(what)) {
            components.push(factory(key, value, i));
            i++;
        }
    }
    else {
        throw new Error("Unknown repeater type '" + typeof what + "'");
    }
    return components;
}

// export function scope(...contents) {
//     return new Aggregate(JTMLText.FACTORY).binder(new Binder()).contents(...contents);
// }

export function text(string) {
    return new JTMLText(string);
}

export function viewer(node) {
    return function(tag) {
        tag.viewers.push(node);
        return node;
    }
}
