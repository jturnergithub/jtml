import Checkbox from "./Checkbox.js";
import ChooserTag from "./ChooserTag.js";
import DiscreteValueTag from "./DiscreteValueTag.js";
import Image from "./Image.js";
import ListItemTag from "./ListItemTag.js";
import ListTag from "./ListTag.js";
import OptionTag from "./OptionTag.js";
import RadioButton from "./RadioButton.js";
import SelectTag from "./SelectTag.js";
import Tag from "./Tag.js";
import TextField from "./TextField.js";

/**
 * The "standard" Tag.Builder invocation.
 * 
 * @param {object} attrs 
 * @param  {...JTMLComponent} contents 
 */
function tag(what, attrs, ...contents) {
    const builder = Tag.builder();
    if (typeof what === "string") {
        builder.name(what);
    }
    else if (typeof what === "function") {
        builder.type(what);
    }
    return builder
        .attrs(attrs)
        .contents(contents)
        .build();
}

export function a(href, attrs, ...contents) {
    return Tag.builder()
        .name("a")
        .attrs(attrs)
        .attr("href", href)
        .contents(...contents)
        .build();
}

export function area(attrs) {
    return tag("area", attrs);
}

export function br(attrs) {
    return new Tag("br", attrs);
}

export function button(attrs, ...contents) {
    return Tag.builder()
        .name("button")
        .attrs(attrs)
        .contents(...contents)
        .build()
        .viewer((text, self) => self.domNode.textContent = String(text));
}

export function checkbox(attrs) {
    return new Checkbox(attrs);
}

export function discrete(type, min = 0, max, step = 1) {
    const attrs = {
        min : min,
        type : type
    };
    if (max !== undefined) {
        attrs.max = max;
    }
    return Tag.builder() 
        .type(DiscreteValueTag)
        .attrs(attrs)
        .build();

}

export function div(attrs, ...contents) {
    return Tag.builder()
        .name("div")
        .attrs(attrs)
        .contents(...contents)
        .build();
}

export function em(text) {
    return new Tag("em")._(text);
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

export function h(n, attrs, ...contents) {
    return Tag.builder()
    .name("h" + n)
    .attrs(attrs)
    .contents(...contents)
    .build();
}

export function h1(attrs, ...contents) {
    return h(1, attrs, ...contents);
}

export function h2(attrs, ...contents) {
    return h(2, attrs, ...contents);
}

export function h3(attrs, ...contents) {
    return h(3, attrs, ...contents);
}

export function hr(attrs) {
    return new Tag("hr", attrs);
}

export function img(src, attrs) {
    return Tag.builder()
        .type(Image)
        .attrs(attrs)
        .attr("src", src)
        .build();
}

export function li(attrs, ...contents) {
    return Tag.builder()
        .type(ListItemTag)
        .attrs(attrs)
        .contents(...contents)
        .build();
}

export function map(name, ...contents) {
    return tag("map", { "name" : name }, ...contents);
}

export function ol(attrs, ...contents) {
    return Tag.builder()
        .type(ListTag, ListTag.ORDERED)
        .attrs(attrs)
        .contents(...contents)
        .build();
}

export function option(text, value = text) {
    return Tag.builder()
        .type(OptionTag, text, value)
        .build();
}

export function radioButton(attrs) {
    return new RadioButton(attrs);
}

export function select(attrs, ...contents) {
    return Tag.builder()
        .type(SelectTag)
        .attrs(attrs)
        .contents(contents)
        .build();
}

export function slider(min = 0, max) {
    return discrete("range", min, max);
}

export function span(attrs, ...contents) {
    return Tag.builder()
        .name("span")
        .attrs(attrs)
        .contents(...contents)
        .textTag(true)
        .build();
}

export function spinner(min = 0, max) {
    return discrete("number", min, max);
}

export function strong(text) {
    return new Tag("strong")._(text);
}

export function table(attrs, ...contents) {
    return Tag.builder()
        .name("table")
        .attrs(attrs)
        .contents(contents)
        .build();
}

export function td(attrs, ...contents) {
    return tag("td", attrs, contents);
}

export function textField(attrs, ...contents) {
    return Tag.builder()
        .type(TextField)
        .attrs(attrs)
        .contents(...contents)
        .build();
}

export function tr(attrs, ...contents) {
    return tag("tr", attrs, contents);
}

export function ul(attrs, ...contents) {
    return Tag.builder()
        .type(ListTag, ListTag.UNORDERED)
        .attrs(attrs)
        .contents(...contents)
        .build();
}

export const SelectionMode = ChooserTag.Mode;
