import {button, div, h2, ol, textField} from "../../src/jtml.js";

export default function create(header, ...items) {
    return div(
        h2(header),
        ol().mutable("listItems", items),
        textField().bind("newItem"),
        // swap() is a convenience function that changes a bound value and returns
        // the old value. In this case, it replaces the bound value for the newItem
        // text field with an empty list, and returns the former value.
        //
        // By the way, wouldn't it be nice if we disabled this button when the text field
        // is empty? See "The Whole Megillah" example for a way to do that.
        button("Add to list").click(tag => tag.push("listItems", tag.swap("newItem", ""))),
        // This is fine in a non-selectable list.
        button("Clear list").click(tag => tag.get("listItems").length = 0)
    );
}
