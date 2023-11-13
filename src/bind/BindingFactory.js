import Binding from "./Binding.js";
import IndexBinding from "./IndexBinding.js";
import PropertyBinding from "./PropertyBinding.js";
import * as BindUtil from "./BindUtil.js";

export const childBinding = function(discriminant) {
    discriminant = BindUtil.parse(discriminant);
    if (typeof discriminant === "number") {
        return new IndexBinding(discriminant);
    }
    else {
        return new PropertyBinding(discriminant);
    }
}

export const binding = function(key, factory = childBinding) {
    const binding   = new Binding(key);
    binding.factory = factory;
    return binding;
}
