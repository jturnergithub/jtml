import {chooser, div, h3, text, ul} from "../../jtml.js";

export default [
    div(
        h3("Single selection"),
        chooser(
            ul(
                "Hamburger",
                "Hot dog",
                "Kielbasa",
                "Chicken puck",
                "Veggie burger"
            )
        ).bind("snack")
    ).classes("inline-block"),
    div(
        h3("Multiple Selections"),
        div(
            chooser(
                ul(
                    "Ketchup",
                    "Mustard",
                    "Cheese",
                    "Lettuce",
                    "Pickles",
                    "Onions"
                ),
                "multiple"
            ).bind("condiments").classes("inline-block"),
            div(
                div(text().bind("condiments.length")).id("condiment-ct"),
                "condiments"    
            ).classes("inline-block top-aligned centered-text")
        )
        
    ).classes("inline-block top-aligned")
    
]

