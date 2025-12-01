import {div, img} from "../jtml.js";

export default div(
    div(
        img("images/logo.gif").id("small-logo"),
        img("images/banner-text.gif").id("banner-text")
    ).id("banner")
).id("header");