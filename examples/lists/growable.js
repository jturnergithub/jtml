import {button, div, ol, textField} from "../../jtml.js";

export default div(
    ol()
        .bind("list-items", ["item 1", "item 2", "item 3"]),
    textField().bind("new-item"),
    // By the way, wouldn't it be nice if we disabled this button when the text field
    // is empty? See "The Whole Megillah" example for a way to do that.
    div(
        button("Add to list").click(jtml => jtml.push("list-items", jtml.replace("new-item", ""))),
        // This is fine in a non-selectable list.
        button("Clear list").click(jtml => jtml.set("list-items", []))  
    )
);
