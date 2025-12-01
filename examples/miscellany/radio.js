import {div, radio} from "../../jtml.js";

export default [
    radio("Yes", "Maybe", "No")
        .required(true)
        .bind("decision")
        .classes("inline-block top-aligned"),
    div(
        div("Glad to hear it!").visible("decision", "Yes"),
        div("Make up your mind!").visible("decision", "Maybe"),
        div("That's a pity.").visible("decision", "No")
    ).classes("inline-block")
]