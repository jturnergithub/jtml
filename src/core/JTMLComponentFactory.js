import JTMLComponent from "./JTMLComponent.js";

/**
The base class has no state.

TODO : replace this class hierarchy with arrow functions? Have a chain of
functions, perhaps.
**/
export default class JTMLComponentFactory {

    constructor(callback) {
        this.callback = callback;
    }

    // Default implementation: if the object is a JTMLComponent, just return it.
    create(object) {
        if (object instanceof JTMLComponent) {
            return object;
        }
        else if (this.callback) {
            return this.callback(object);
        }
        // else if (typeof object === "function") {
        //     return object();
        // }
        else {
            return false;
        }
    }
}

JTMLComponentFactory.INSTANCE = object => {
    if (object instanceof JTMLComponent) {
        return object;
    }
    else {
        return false;
    }
}; // new JTMLComponentFactory();
