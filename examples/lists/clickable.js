import {ul} from "../../src/jtml.js";

const clickableList = ul(
    "Ketchup",
    "Mustard",
    "Cheese",
    "Lettuce",
    "Pickles",
    "Onions"
).classes("clickable", true).distribute(li => li.click(tag => alert(tag.text())));
// clickableList.children.click(tag => alert(tag.text()));

export default clickableList;
