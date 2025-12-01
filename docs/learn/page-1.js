import {div, h2, p,} from "../../jtml.js";
import {sideBySide} from "../common/components.js"
import toDoList from "./to-do-1.js";

export default div(
    h2("Static HTML equivalent"),
    p(`
        First, let's get the components laid out as static JTML.
        We'll start with a text field, a button, and an unordered list:
    `),
    sideBySide(toDoList, 2, -2)
)
