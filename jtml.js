export * from "./src/core/core.js";
export * from "./src/markup/markup.js";
export * from "./src/ui/ui.js";

export const JTML =  {

    Binder : {

        get global() {
            return bind.global;
        },

        get current() {
            return bind.current()
        },
    },

    scope : () => bind.scope(),

    /* Binder facade */

    get(key) {
        return JTML.Binder.current.get(key);
    },

    set(key, value) {
        return JTML.Binder.set(key, value);
    },

    Operator : {
        ANY : function(...values) {
            return JTML.Operator.EXACTLY(0, ...values);
        },
        ALL : function(...values) {
            return JTML.Operator.EXACTLY(values.length, ...values);
        },
        EXACTLY : function(n, ...values) {
            return values.filter(value => !!value).length === n;
        }
    },

    SelectMode : {
        SINGLE : "single",
        MULTIPLE : "multiple"
    },

    Layout : {
        HORIZONTAL : "horizontal",
        VERTICAL : "ertical"
    },

    Direction : {
        LEFT_TO_RIGHT : "left-to-right",
        RIGHT_TO_LEFT : "right-to-left"
    }
}