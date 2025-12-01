import {button, div, h1, img, text} from "../../jtml.js";
import page1 from "./page-1.js";
import page2 from "./page-2.js";
import page3 from "./page-3.js";
import page4 from "./page-4.js";
import page5 from "./page-5.js";
import page6 from "./page-6.js";
import page7 from "./page-7.js";
import page8 from "./page-8.js";
import page9 from "./page-9.js";
import page10 from "./page-10.js";
import page11 from "./page-11.js";

const pages = [
    page1.visible("pageNbr", 1),
    page2.visible("pageNbr", 2),
    page3.visible("pageNbr", 3),
    page4.visible("pageNbr", 4),
    page5.visible("pageNbr", 5),
    page6.visible("pageNbr", 6),
    page7.visible("pageNbr", 7),
    page8.visible("pageNbr", 8),
    page9.visible("pageNbr", 9),
    page10.visible("pageNbr", 10),
    page11.visible("pageNbr", 11)
];

function nextPage(n, delta) {
    n += delta;
    if (n < 1) {
        return pages.length - n;
    }
    else if (n > pages.length) {
        return n % pages.length;
    }
    else {
        return n;
    }
}

export default div(
    h1("Learn JTML: To-Do list"),
    div(
        button(img("images/prev.gif")).click(jtml => jtml.set("pageNbr", nextPage(jtml.get("pageNbr"), -1))),
        "Page ", text().bind("pageNbr"), " of ", pages.length,
        button(img("images/next.gif")).click(jtml => jtml.set("pageNbr", nextPage(jtml.get("pageNbr"), +1))),
    ).id("pager").set("pageNbr", 1),
    div(...pages).classes("inline-block")
);