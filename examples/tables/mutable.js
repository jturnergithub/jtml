import crew from "../common/data/crew.js"
import {button, chooser, div, formEntry, h3, img, select, span, table, td, text, textField, tr} from "../../jtml.js";

const ranks = [
    "Enlisted", 
    "Ensign", 
    "Lieutenant", 
    "Lieutenant Commander", 
    "Commander",
    "Captain",
    "Commodore"
];

function shift(jtml, offset) {
    const crew       = jtml.get("crew"); // Returns an array proxy
    const i          = jtml.get("jtml-crewmember-index"); // Returns a number
    const j          = i + offset;
    const crewmember = crew[i]; // An object proxy
    crew[i]          = crew[j]; // Modifies the array through the proxy, alerting monitors
    crew[j]          = crewmember; // Ditto
}

function remove(jtml) {
    const crew = jtml.get("crew"); // Returns an array proxy
    const i    = jtml.get("jtml-crewmember-index");
    crew.splice(i, 1);
    const j    = Math.min(i, crew.length - 1);
    jtml.set("crewmember", crew[j]); // Changes the selection
}

function pair(key, tag = textField()) {
    return span(
        span(text().bind(`crewmember.${key}`)).hidden("editing"),
        tag.bind(`editing.${key}`).visible("editing")
    );
}

export default div(
    div(
        h3("Crew"),
        chooser(
            table()
                .factory((crewmember, index, key) => tr(
                    td(text().bind(`${key}.lastName`).monitor("crewmember.lastName")),
                    td(text().bind(`${key}.firstName`).monitor("crewmember.firstName"))
                )
                    .value(crewmember)) // LAME
                    .classes("inline-block")
                    .bind("crew", crew),
        )
            .id("crewmember-chs")
            .bind("crewmember")
            .bindValues()
            .classes("inline-block")
    ).classes("inline-block top-aligned"),
    div(
        button(img("../common/assets/up-arrow.gif"))
            .enabled("jtml-crewmember-index") // Enablied if jtml-crewmember-index is truthy, i.e. not zero or undefined.
            .click(jtml => shift(jtml, -1)),
        button(img("../common/assets/down-arrow.gif"))
            .enabled("jtml-crewmember-index", index => index < crew.length - 1)
            .click(jtml => shift(jtml,  +1))
    ).id("arrow-buttons").classes("inline-block"),
    div(
        h3("Details"),
        formEntry("Last name", pair("lastName")),
        formEntry("First name", pair("firstName")),
        formEntry("Rank", pair("rank", select(...ranks))),
        formEntry("Position", pair("position")),
        div(
            button("Edit")
                .hidden("editing")
                .click(self => self.set("editing", Object.assign({}, self.get("crewmember")))),
            button("Delete")
                .hidden("editing")
                .click(self => remove(self)),
            button("OK")
                .visible("editing")
                .click(self => {
                    Object.assign(self.get("crewmember"), self.get("editing"));
                    self.set("editing", false)
                }),
            button("Cancel").visible("editing").click(self => self.set("editing", false))
        ).id("detail-btns")
    ).classes("inline-block top-aligned")
).classes("fixed-height").set("editing", false);