export * from "./AliasBinding.js";
export * from "./ChildBinding.js";
export * from "./ValueBinding.js";
export * from "./Binder.js";

import Binder from "./Binder.js";
import * as BindUtil from "./BindUtil.js";
import Scope from "./Scope.js";

export const format = BindUtil.format;
export const Trigger = BindUtil.Trigger;

export const binder = () => Binder.current();
export const scope = () => new Scope();