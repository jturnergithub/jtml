import OptionTag from "./OptionTag.js" ;
import ChooserTag from "./ChooserTag.js";

/**
Implements ChooserTag. The selectables are the OptionTag objects that make up
the children.
**/
export default class SelectTag extends ChooserTag {

    constructor(attrs, factory = OptionTag.FACTORY) {
        super("select", attrs, factory);
        this.event = "change";
    }

    size(n) {
        return this.attr("size", n);
    }

    /**
    Required by base class
    **/
    selectables() {
        return this.children.members;
    }
}
