import {a, div, h1, h2, img, li, ol, p, pre, span} from "../jtml.js";
import * as hello from "./imports/hello-world.js";

export default div(
    h1("Welcome to JTML"),
    p(`JTML is meant to provide a radically simplified way of developing dynamic websites.
    I'm well aware that there are already a great many frameworks out there, which is why I 
    stipulate that JTML is totally unnecessary. If you're using one of the others, and you like 
    it, more power to you!`),
    p(`On the other hand, I may not be the only developer who's tried out several different
    frameworks and found them . . . less than perfectly satisfying.`),
    div(
        h2("The Big Idea"),
        p(`JTML is built on these observations:`),
        ol(
            "Every modern website uses Javascript, directly or indirectly.",
            "Javascript has a complete DOM model corresponding to HTML.",
            "Ergo, Javascript can do everything HTML can do, and a great deal more.",
            li(span("So why are we using HTML again?").classes("white-on-black"))
        ),
        "For a more complete discussion, check out the ",
        a("#", "FAQ").click(self => self.set("docs-selected-tab", "FAQ")),
        "."
    ),
    div(
        h2("How Does That Work, Then?"),
        p(`The main design goal of JTML is to be easy, clean, and intuitive. For starters, at least, there's virtually nothing to
        learn: if you know HTML, you know JTML.`),
        p(`Don't believe me? Here's a simple HTML page with a header, some text in a <div>, and an image:`),
        div(
            img("./images/hello-world.png"),
        ).classes("black-border"),
        p(`Compare the code, shorn of the boilerplate:`),
        div(
            h2("HTML"),
            pre(hello.html)
        ).classes("example inline-block"),
        div(
            h2("JTML"),
            pre(hello.jtml)
        ).classes("example inline-block")
    ),
    div(
        h2("So?"),
        p(`So JTML puts the full power of Javascript right at your fingertips. There's no context switching,
        no expanded syntax, no transpilation or precompilation or interpretation. Want to put your elements in
        a for-each loop? Go wild. Conditionally include elements, or make them appear and disappear, or move them?
        It's a breeze. Create custom components? Extend the Tag class, or compose a bunch of tags into something
        that behaves like a new tag.`),
        p(`Also, JTML is agnostic about other Javascript tools. I haven't tried using it with, say, jQuery, but
        there's no reason you can't. With proper discipline, it'll even coexist with some of the other frameworks.`)
    )
);
