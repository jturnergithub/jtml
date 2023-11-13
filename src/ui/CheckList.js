import {ul} from "../markup.js";
import ValueTag from "../markup/ValueTag.js";

export default class CheckList extends ValueTag {

    constructor(attrs, mutable) {
        super("ul", attrs);
        this.classes("jtml-ui jtml-check-list");
        this.children.factory = label => new CheckListItem(label, mutable);
    }
}