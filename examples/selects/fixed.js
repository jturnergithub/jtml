import {div, hr, select, text} from "../../jtml.js";

export default [
    // A fixed scrolling list
    select("Fee", "Fie", "Fo", "Fum").id("scrolling").size(3),
    div(
        // A fixed drop-down list
        select("Foo", "Bar", "Baz", "Qux").bind("jtml-drop-down"),
        hr(),
        "You selected '", text().bind("jtml-drop-down"), "'"
    ).classes("inline-block"),
    select("Bread", "Milk", "Cola", "Bologna", "Cat food").size(5).mode(select.Mode.MULTIPLE)
];