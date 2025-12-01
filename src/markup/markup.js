import JTMLComponent from "../core/JTMLComponent.js";
import JTMLText from "../core/JTMLText.js";
import Button from "./Button.js";
import Checkbox from "./Checkbox.js";
import ChooserTag from "./ChooserTag.js";
import ContainerTag from "./ContainerTag.js";
import DiscreteValueTag from "./DiscreteValueTag.js";
import Image from "./Image.js";
import ListItem from "./ListItem.js";
import ListTag from "./ListTag.js";
import Option from "./Option.js";
import RadioButton from "./RadioButton.js";
import Select from "./Select.js";
import Table from "./Table.js";
import TableRow from "./TableRow.js";
import Tag from "./Tag.js";
import TextArea from "./TextArea.js";
import TextField from "./TextField.js";

export function toArgs(factory, contents = []) {
    if (factory !== undefined && typeof factory !== "function") {
        contents.unshift(factory);
        factory = undefined;
    }
    return [factory, contents];
}

export function tag(name) {
    return new Tag(name);
}

export function containerTag(name, factory, ...contents) {
    [factory, contents] = toArgs(factory, contents);
    return new ContainerTag(name, factory)._(...contents);
}

export function a(href, ...contents) {
    return containerTag("a", ...contents).attr("href", href);
}

export function area() {
    return tag("area");
}

export function body(...contents) {
    for (let jtml of contents) {
        if (typeof jtml === "string") {
            jtml = new JTMLText(jtml);
        }
        jtml.addToDOM();
    }
    return new JTMLComponent();
}

export function br() {
    return tag("br");
}

export function button(...contents) {
    return new Button()._(...contents);
}

export function canvas(width, height) {
    return tag("canvas")
        .attr("width", width)
        .attr("height", height);
}

export function checkbox() {
    return new Checkbox();
}

export function code(...contents) {
    return containerTag("code", ...contents);
}

export function discrete(type, min = 0, max, step = 1) {
    const tag = new DiscreteValueTag(type)
        .attr("type", type)
        .attr("min", min);
    if (max !== undefined) {
        tag.attr("max", max);
    }
    return tag;

}

export function div(factory, ...contents) {
    return containerTag("div", factory, ...contents);
}

export function em(text) {
    return containerTag("em", text);
}

export function factory(factory, ...contents) {
    return function(tag) {
        // Tell the tag to use this factory from now on.
        tag.factory(factory);
        // Might as well do this here, although it would be done later if we
        // just returned the contents.
        return contents.map(factory);
    }
}

export function h(n, ...contents) {
    return containerTag("h" + n, ...contents);
}

export function h1(...contents) {
    return h(1, ...contents);
}

export function h2(...contents) {
    return h(2, ...contents);
}

export function h3(...contents) {
    return h(3, ...contents);
}

export function h4(...contents) {
    return h(4, ...contents)
}

export function h5(...contents) {
    return h(5, ...contents)
}

export function h6(...contents) {
    return h(6, ...contents)
}

export function hr() {
    return tag("hr");
}

export function img(src, width, height) {
    const image = new Image(src);
    if (width) {
        image.width(width);
    }
    if (height) {
        image.height(height);
    }
    return image;
}

export function label(...contents) {
    return containerTag("label", ...contents);
}

export function li(...contents) {
    return new ListItem()._(...contents);
}

export function map(name, ...contents) {
    return containerTag("map", ...contents).attr("name", name);
}

export function ol(factory, ...contents) {
    [factory, contents] = toArgs(factory, contents);
    return new ListTag(ListTag.ORDERED, factory)._(...contents);
}

export function option(text, value = text) {
    return new Option(text, value);
}

export function p(...contents) {
    return containerTag("p", ...contents);
}

export function pre(...contents) {
    return containerTag("pre", ...contents);
}

export function radioButton() {
    return new RadioButton();
}

export function select(toDisplay, ...contents) {
    if (typeof toDisplay !== "function") {
        contents.unshift(toDisplay);
        toDisplay = undefined;
    }
    return new Select(toDisplay)._(...contents);
}

select.Mode = ChooserTag.Mode;

export function slider(min = 0, max) {
    return discrete("range", min, max);
}

export function span(...contents) {
    return containerTag("span", ...contents);
}

export function spinner(min = 0, max) {
    return discrete("number", min, max);
}

export function strong(text) {
    return containerTag("strong", text);
}

export function table(factory, ...contents) {
    if (typeof factory !== "function") {
        contents.unshift(factory);
        factory = undefined;
    }
    return new Table(factory)._(...contents);
}

export function td(factory, ...contents) {
    return containerTag("td", factory, ...contents);
}

export function textArea(rows, cols) {
    return new TextArea(rows, cols);
}

export function textField(...contents) {
    return new TextField()._(...contents);
}

export function th(factory, ...contents) {
    return containerTag("th", factory, ...contents);
}

export function tr(factory, ...contents) {
    // return containerTag("tr", factory, ...contents);
    [factory, contents] = toArgs(factory, contents);
    return new TableRow(factory)._(...contents);
}

export function ul(factory, ...contents) {
    [factory, contents] = toArgs(factory, contents);
    return new ListTag(ListTag.UNORDERED, factory)._(...contents);
}
