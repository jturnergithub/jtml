import {button, div, img, li, span, strong, text, textField, ul, viewer} from "../../src/jtml.js";

export default function create() {
    return [
        // Make a message that only shows up when there are no list items
        span("The list is empty").hidden("megillah", items => items && items.length > 0),
        // Create the <ul> tag and initialize it to an empty list with no selection.
        // The selection will be bound to the key "megillah" and the contents (list items)
        // will be bound to the key "megillah-items".
        // NB: the bind() call also sets the ID.
        ul().classes("no-bullet").bind("megillah").mutable("megillah-items").factory(liText =>
            // This is the return value that will be given when a string item is added to the bound array.
            // It has a <li> tag cotaining a span (the added string) and some controls.
            li(
                viewer(span(liText).classes("monicker inline-block")),
                button(img("../common/assets/up-arrow.gif"))
                    .click(tag => tag.ancestor("li").move(-1))
                    // Disabled when in the first li
                    .disabled("jtml-first"),
                button(img("../common/assets/down-arrow.gif"))
                    .click(tag => tag.ancestor("li").move(1))
                    // Disabled when in the last li
                    .disabled("jtml-last"),
                button(img("../common/assets/x.gif")).click(tag => tag.ancestor("li").remove())
            )
        ),
        textField().bind("tchotchke"),
            button("Add", img("../common/assets/plus.gif"))
                .id("add-btn")
                // Unlike the "The list is empty" message, the "Add" button is always
                // visible--but it's grayed out if the user hasn't typed anything.
                .disabled("tchotchke", string => !string || string.length === 0)
                // The swap() call replaces the value bound to "tchotchke" and returns
                // the old value. The push() call adds that value to the array bound to
                // "megillah".
                .click(tag => tag.push("megillah-items", tag.swap("tchotchke", ""))),
        strong("Currently selected: "),
        span(
            span("Nothing").hidden("megillah"),
            text("").bind("megillah")
        )
    ]
}
