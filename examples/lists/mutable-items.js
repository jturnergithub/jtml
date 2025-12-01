import {button, chooser, div, img, span, text, textField, ul} from "../../jtml.js";

const names = ["Alice", "Bob", "Charles", "Diana", "Eve"];
export default [
    div(
        chooser(
            ul().bind("names", names)
        ).classes("inline-block  top-aligned").bind("name", names[0]),
        div( // Right side
            div(
                div( // Badge
                    div("Hi! My name is").id("hi").classes("red"),
                    div(
                        span(text().bind("name"))
                            .hidden("editing")
                            .click(jtml => {
                                jtml.set("editing", true);
                                jtml.set("new-name", jtml.get("name"))
                            }),
                        span(
                            textField().bind("new-name"),
                            button(img("../common/assets/check.gif")).click(jtml => {
                                const index = jtml.get("jtml-selected-name").findIndex(flag => flag);
                                jtml.set(`names[${index}]`, jtml.get("new-name"));
                                jtml.set("name", jtml.get("new-name"));
                                jtml.set("editing", false);
                            }),
                            button(img("../common/assets/x.gif")).click(jtml => jtml.set("editing", false))
                        ).id("editor").visible("editing")
                    ).id("name")),
                div("").id("filler").classes("red"),
            ).id("badge"),
            div("Click to edit").classes("small-text centered-text")
        ).classes("inline-block")
    )
]