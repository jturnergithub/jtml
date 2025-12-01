import {a, body, div, em, h1, h2, h3, h4, hr, img, li, ol, p, pre, span, ul} from "../../jtml.js";
import {code, codeBlock, note} from "../common/format.js";
import {sideBySide} from "../common/components.js";

export default div(
    h1("Getting started with JTML"),
    p(`
        This page introduces basic JTML concepts and walks you through your first static JTML application. To
        begin with, you'll need at least moderate knowledge of both HTML and Javascript. Knowledge of CSS will
        help you make your experiments look nice, but it's not a must-have.
    `),
    h2("Get the code"),
    p(`JTML has no dependencies, so there's nothing to install. Download the code from Github and put it anywhere convenient.`),
    h2("Set up a webpage"),
    p(
        ol(
            `Create a simple .html file. It doesn't need much in it--in fact, all it really needs is <html></html>.`,
            `Instead of giving it a <body>, give it a <script type="module"> tag. The type attribute is important!`,
            li(`
                In your script, first import the JTML `, code("body()"), ` function: `,
                code('import {body} from "./path/to/your/install/jtml.js"')
            ),
            li(`Call `, code("body()"), ` in your script.`)
        ),
        `This will give you a blank page, which isn't very exciting but at least shows that nothing has crashed. If you want to
        see something there, give the `, code("body()"), ` call a string argument--"Hello, world!" is traditional.`
    ),
    h2("Pretend you're writing HTML"),
    p(`
        Most common HTML tags have identically-named JTML peer functions--there's an `, code("a()"), ` function that's equivalent to the <a>
        tag, an `, code("img()"), ` function for the <img> tag, and so forth. You can get access to them by putting the names in the import statement
        at the top of your script:
    `),
    code('import {body, h1, div, hr, img} from "path/to/your/install/jtml.js"'),
    p(`One clear and natural idiom is to nest these function calls, exactly as you would nest HTML tags. For example: `),
    sideBySide(() =>
        div(
            h1("Top-level heading"),
            "Lorem, also ipsum.",
            hr(),
            div(
                "The rain in Spain stays mainly in the plain. ",
                span(" Span span span span span "),
                em("Lovely span, wonderful span!")
            )
        )
    , 1),
    p(`
        You can freely mix strings and JTML in the arguments. Some functions provide a signature that takes in their typical
        usage patterns. The `, code("a()"), ` function, for example, takes its first argument to be the value of the href attribute; 
        the `, code("img()"), ` function takes its first argument to be the value of the src attribute; the `, code("slider()"), ` 
        function expects two numeric arguments, a min and a max.
    `),
    p(`
        For the most part, the JTML peer functions are designed to 
        be called with a common and natural set of arguments. Container-type tag functions take any number of arguments,
        which can be strings or other JTML functions.
    `),
    h2("HTML emulation"),
    p("JTML supports HTML attributes and CSS as well, of course."),
    ul(
        li(
            code("tag.attrs(object)"), ` interprets the object's key/value pairs as HTML attribute names and values. For example, `, 
            code('img("foo.gif").attrs({width : 240, height : 240})'), ` is the JTML equivalent of <img src="foo.gif" width="240" height="240">. 
            You can set an individual attribute by calling `, code("tag.attr(name, value)"), `.
        `),
        li(
            code("tag.styles(object)"), `interprets the object's key/value pairs as CSS property names and values. You can add an individual
            CSS style by calling `, code("tag.style(name, value)"), `.
        `),
        li(
            code('tag.classes("class0 class1 ... classN")'), ` or `, code('tag.classes(["class0", "class1", ...])'), ` adds the named 
            classes to the tag.
        `),
        li(code("tag.id(string)"),` is shorthand for `, code('tag.attr("id", string)'))
    ),
    p(`
        JTML methods are usually chainable, so you can write code like `,
        code('img("foo.gif").id("theFoo).attr("width", "240").classes("logo big modern")'), "."
    ),
    h2("Alternatives"),
    p(`
        Of course, you're free to call the JTML functions any way you'd like. You can make their return values into variables,
        then compose them all together using the `, code(" _()"), ` (underscore) method:
    `),
    sideBySide(() => {
        const prevImg = img("images/prev.gif").width(15).height(15);
        const prevLnk = a("#");
        prevLnk._(prevImg, "Prev");
        const nextImg = img("images/next.gif").width(15).height(15);
        const nextLnk = a("#");
        nextLnk._("Next", nextImg);

        return div(
            prevLnk, " You are here ", nextLnk
        );}
    , 1),
    p(`You can compose JTML objects into custom components:`),
    sideBySide(
        () => {

            function cityBox(city, state, text) {
                return div(
                    h4(city),
                    span(em(state)),
                    div(text)
                ).classes("box")
            }
            
            const boxes = div(
                cityBox(
                    "Boston", "Massachusetts", 
                    `The state capital, founded in 1630. Home of many educational and cultural
                    institutions. Harvard and MIT are located in neighboring Cambridge.
                `),
                cityBox(
                    "Amherst", "Massachusetts",
                    `A college town 90 miles west of Boston. Amherst College, the University of
                    Massachusetts, and Hampshire College are all located here. Emily Dickinson
                    and Robert Frost both lived in Amherst. The "h" is silent.
                `),
                cityBox(
                    "Nasha", "New Hampshire",
                    `A city just north of the Massachusetts border. Nashua is known for its many strip malls, an
                    outstanding collection of parking lots, and vinyl siding.
                `)
            );
            
            return boxes;
        }
    , 2, -3),
    p("Or you can use any arbitrary Javascript that pleases you."),
    sideBySide(
        () => {

            const author = {
                name : "JT",
                age : 29, // This is technically a lie.
                cats : [ "Polly", "Dusty" ],
                car : {
                    make : "Nissan",
                    model : "Versa",
                    year : 2010
                },
                retired : true
            };

            const about = ul();
            for (const [key, value] of Object.entries(author)) {
                const item = li(key, " : ");
                if (Array.isArray(value)) {
                    item._("array, length " + value.length)
                }
                else {
                    item._(typeof value);
                }
                about._(item)
            }

            return about;

    }, 2, -4),
    note(`Go ahead, make a recursive version. You know you want to.`).classes("centered-text"),
);