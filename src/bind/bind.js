export * from "./Binding.js";
export * from "./ChildBinding.js";
export * from "./IndexBinding.js";
export * from "./PropertyBinding.js";

import * as BindUtil from "./BindUtil.js";

export const format = BindUtil.format;
export const Trigger = BindUtil.Trigger;

import Scope from "./Scope.js";
export const binder = Scope.current;

export function scope(alias, key, discriminant) {
    return new Scope().alias(alias, format(key, discriminant));
}

