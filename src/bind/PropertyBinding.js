import ChildBinding from "./ChildBinding.js";

/**
There are a couple of different ways that calling code can change a bound Object
property or array item.

One way is to get the bound thing, then assign a new value to an property. For
example: binder.get("foo")[3] = aNewValue. Or binder.get("foo").bar = aNewValue.

Another way is to directly get the binding for the property and set it. For
example: binder.set("foo[3]", aNewValue). Or binder.set("foo.bar", aNewValue)

Both of these are supported and are equivalent: TODO

**/
export default class PropertyBinding extends ChildBinding {

    constructor(property) {
        super(property);
    }

    get property() { 
        return this.discriminant;
    }

    format(property) {
        return "." + property;
    }

    container() {
        return {};
    }

       /**
     * We want to support two different ways of setting a property value. For example, if
     * the intention is to set "foo.bar" to 42, the user should be able to do
     * 1. binder.set("foo", { bar : 42 }); // Replace the whole object bound to "foo"
     * 2. binder.get("foo")["bar"] = 42; // Change the property value in the existing object
     * 
     * If binder.get("foo") returns a vanilla object, there's no way to alert the monitors
     * that one of its properties has changed. A proxy, on the other hand, can pass off a property
     * set to this binder, which triggers any change listeners.
     *
     * @param {*} object 
     * @returns 
     */
    proxy(object) {
        const self = this;
        return new Proxy(object, {
            set : function(target, property, value) {
                target[property] = value; 
                self.trigger();
                return true;
            }
        });
    }
}
