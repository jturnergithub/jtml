import {img} from "../../jtml.js";
import ChooserTag from "../markup/ChooserTag.js";
import CheckListItem from "./CheckListItem.js";

export default class CheckList extends ChooserTag {

    constructor(factory = label => new CheckListItem(label)) {
        super("div", ChooserTag.Mode.MULTIPLE);
        this.classes("jtml-ui jtml-check-list");
        this.children.factory = CheckListItem.metafactory(factory);
    }
}