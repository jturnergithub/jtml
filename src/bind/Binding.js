import AbstractBinding from "./AbstractBinding.js";
export {Trigger} from "./BindUtil.js";
import * as ProxyFactory from "./ProxyFactory.js";

export default class Binding extends AbstractBinding {

    #rawValue;

    constructor(key, value) {
        super(key);
        this.discriminant = key;
        this.set(value);
    }

    get rawValue() {
        return this.#rawValue;
    }

    /**
     * If the bound value is a scalar, returns it. If the bound value is
     * an array or object, returns its proxy.
     */
    get value() {
        return ProxyFactory.proxify(this, this.#rawValue);
    }

    set value(value) {
        this.oldValue = this.rawValue; // Very likely to be the wrong thing here.
        this.#rawValue = ProxyFactory.deproxify(value);
    }

}
