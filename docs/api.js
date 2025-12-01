import {a, collapsible, div, h1, h2, img, li, ol, p, pre, span, ul} from "../jtml.js";
import {code} from "./common/format.js";

function navMenu(title, content) {
    return collapsible(title, content, "../images/wedge.gif").rotation(90).imageSize(12, 12)
}

export default div(
    h1("The JTML API"),
    div(
        div(
            a("#", "Overview"),
            navMenu(
                "Markup", 
                ul(
                    "Generic builders",
                    "Tag functions"
                ).classes("no-bullet")
            ),
            navMenu(
                "UI", 
                ul(
                    "collapsible",
                    "checklist",
                    "chooser",
                    "formEntry"
                ).classes("no-bullet")
            )
        ).id("api-nav"),
        div(
            p(`
                The user-facing portion of JTML comprises three packages. They're all included in `, code("jtml.js"), `, 
                but it's worth keeping the difference in mind.
            `),
            ul(
                li(code("markup"), ` contains API functions that are direct peers to HTML tags, or at least closely tied
                to individual HTML tags. This is where you find your `, code("a()"), `, your `, code("checkbox()"), `,
                your `, code("div()"), `, etc. etc. etc.`),
                li(code("ui"), ` contains API functions that create new, compound components, like collapsible sections 
                and tabs and stuff like that.`),
                li(code("util"), ` contains some useful and occasionally-necessary functions.`)
            ),
            p(`
                If you poke your nose deeper into the code, you'll see two more folders: `, code("bind"), ` and `, code("core"), `.
                Don't mess with these unless you really know what you're doing, or you're me.
            `)
        ).id("api-text")
    ).id("api-page")
);
