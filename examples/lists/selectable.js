import JTMLConstants from "../../src/JTMLConstants.js";
import {ul, li} from "../../src/jtml.js";

export default function create(multi = JTMLConstants.SelectionMode.SINGLE, ...items) {
    const selectableList = ul(...items)
        // "Ketchup",
        // "Mustard",
        // "Cheese",
        // "Lettuce",
        // "Pickles",
        // "Onions"
    .classes("clickable").selectable(multi);

}
