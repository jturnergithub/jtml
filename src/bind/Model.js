import Scope from "../../jtml/bind/Scope.js";

const handler = {

    get : function(target, property) {
        return target.get(property);
    },

    set : function(target, property, value) {
        target.set(property, value);
        return true;
    }

}

const Model = new Proxy(Scope.global(), handler);
export default Model;