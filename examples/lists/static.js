import {div, h2, li, strong, text, ul} from "../../src/jtml.js";

/*
Here we are creating a Tag, populating it, and putting it into a variable.
This is OK for a static element that will never change; it's just a way of
isolating code that would otherwise clutter up the main script. It is limiting,
though, because this code can't easily be reused. (Inserting the same Tag
instance at multiple points in the Tag hierarchy is liable to result in, as
they say, undefined behavior.)
*/
const html = div(
    h2("Static"),
    ul(
        "Alpha",
        "Beta",
        li("Gamma").classes("yellow"),
        "Delta",
        "Epsilon"
    )
);

export default html;
