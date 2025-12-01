import {div, h1, h2, ul, p, pre, span} from "../jtml.js";
import {collapsibleSection} from "./common/components.js";
import {code, qna} from "./common/format.js";

export default div(
    h1("Frequently Asked Questions"),
    p(`
        A more candid title would be "Questions that I think would be frequently asked if anyone else
        were using JTML," but let's go with tradition.
    `),
    collapsibleSection(
        h2("Background"),
        ...qna(
            "What does JTML stand for?",
            `Javascript Text Markup Language. The fact that my initials are "JT" is purely coincidence, I assure you.`
        ),
        ...qna(
            "Why does the world need yet another Javascript framework?",
            `It doesn't. Hence "totally unnecessary".`
        ),
        ...qna(
            "Why did you perpetrate it, then?",
            `For my own amusement. Also, all the frameworks I've personally tried out--
            including React, Vue, Angular, and a couple of others--are clunky.`
        )
    ),
    collapsibleSection(
        h2("Why JTML"),
        p("What's so bad about HTML + Javascript?").classes("question"),
        p(`For starters, it's unproductive to have two languages--HTML and Javascript--that do the same job.`),
        p(`
            More importantly, it introduces a subtle but ugly piece of tight coupling into web architecture. Take the
            exceedingly common case of a checkbox for "I accept these terms that I haven't read" and a "Continue" button.
            The button is grayed out unless the checkbox is checked.
        `),
        ul(
            `In the HTML, you assign an onclick function to the checkbox. So you have to know something about the
            Javascript layer--the function name, at least--in the HTML layer.`,
            `In the Javascript onclick, you look up the ID of the button and enable or disable it. So you have to
            know something about the HTML layer--the button's ID--in the Javascript layer.`
        ),
        p(`There are other ways to do this, but they all hit this problem at some point.`),
        p("Why is JTML the answer?").classes("question"),
        p(`
            Because once you've put everything into Javascript, it's trivially easy to implement `, 
            span("bindings").classes("term"),
            `. And bindings make everything work a little like a spreadsheet: change a value in one place, and the effects
            magically ripple out to anything that depends on that value. This specific example can be handled with
            two lines of code:
        `),
        pre(`
            checkbox().bind("accepted"),
            button("Continue").enabled("accepted")
        `),
        p("Don't other frameworks use binding?").classes("question"),
        p(`
            I know that some do, at least. Angular is one example. But none of them takes the step of jettisoning
            HTML, so they all have to introduce a lot of syntactic squirrelyness. Here's Angular's way of disabling
            a button with binding:
        `),
        pre(`
            <button [disabled]="isFormValid">Save</button>
        `),
        p(`
            Not only is there new syntax to learn, but the HTML still needs to know about a named Javascript function. Here's
            the JTML way:`
        ),
        pre(`
            button("Save").disabled("form-invalid");
            // Or, equivalently
            button("Save").enabled("form-valid"); 
        `),
    ),
    collapsibleSection(
        h2("Using JTML"),
        p("Why should I use JTML?").classes("question"),
        p(`
            You probably shouldn't. As I write, there's no team of developers behind JTML, no support, no community, and
            no guarantee of the future. The entire JTML world consists of me.
        `),
        p(`If I ignore your excellent advice and use JTML anyway, what's it good for?`).classes("question"),
        p(`
            Smallish projects and prototypes. Putting together a JTML webapp is--in my totally unbiased opinion--very 
            quick, pretty elegant, and with an easy learning curve.
        `),
        p(`What are JTML's dependencies?`).classes("question"),
        p(`None.`),
        p(`Can I mix HTML and JTML?`).classes("question"),
        p(`
            Sure. JTML's job is to create and manage the DOM tree, or a portion of it. If you want to futz with the DOM
            in other ways, be my guest. The one thing I'd advise is to avoid having the same DOM elements managed by both
            JTML and non-JTML code; that way lies madness.
        `),
        p(`Can I use JTML freely?`).classes("question"),
        p(`
            For non-commercial use, sure. If you do anything public-facing, I'd be grateful for a credit. If you want to
            make money using JTML--even indirectly, by using it for prototyping--please contact me first.
        `)
    ),
    collapsibleSection(
        "Not using JTML",
        p(`When shouldn't I use JTML?`).classes("question"),
        pre(p(`
            DO.
            NOT.
            USE.
            JTML.
            FOR.
            ANYTHING.
            CRITICAL.
        `).style("color", "red")),
        p("What else?").classes("question"),
        p(`
            JTML is meant for dynamic webpages. It offers fewer advantages for big blocks of static HTML. 
            It's sometimes handy for defining reusable components, and it's not much harder to type `, 
            span(`p("Emphasized text is in ", em("italics"))`).classes("code"), 
            " than it is to type ",
            span(`<p>Emphasized text is in <em>italics</em></p>`).classes("code"), 
            `, but really intricate markup may get hard to follow.
        `),
        p(`
            More to the point, if you're wring big blocks of HTML, you're probably not doing it via lovingly handcrafting a .html
            file; you're probaby doing it with a WYSIWIG editor or some such tool. These things don't exist for JTML. You can,
            however, generate your HTML separately and suck it into JTML using the `, span(".html").classes("code"), ` method of any JTML object.
        `)
    ),
    collapsibleSection(
        h2("The future"),
        ...qna(
            `Is JTML complete?`,
            p(
                `No. I've implemented the most common and important HTML concepts. That said, much of the
                remainder is pretty straightforward. Any tag that just acts as a grouping for other content, 
                for example, can be created by calling `, 
                code(`containerTag(name, ...contents)`),
                `. There are a lot of these, some of them rather obscure; no doubt the <aside> tag is vital to 
                someone somewere, but I've never seen it in the wild.`
            )
        ),
        p(`Are you planning to continue to build out JTML?`).classes("question"),
        p(`Planning to, yes. Expect updates to the code every however often I feel like it.`),
        p(`Is JTML ever likely to be a fully-supported large-scale project?`).classes("question"),
        p(`
            Not unless someone comes by and offers to do the boring parts for me. I won't say never, but
            don't hold your breath.
        `)
    )
)
