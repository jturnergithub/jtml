import JTMLText from "../core/JTMLText.js"
import Tag from "./Tag.js";

/**
 * A ContainerTag is a tag that contains other tags. The other tags can be
 * homogeneous (a typical <ul>, for instance) or heterogeneous (a <div> used
 * to put a border around some other elements).
 */

export default class ContainerTag extends Tag {

    constructor(name, factory = JTMLText.textFactory) {
        super(name);
        this.children.factory = factory || this.children.factory;
        this.always((jtml, index) => {
            if (jtml.classes) {
                jtml.classes(index % 2 ? "jtml-odd" : "jtml-even");
            }
        });
    }

    bind(key, initial) {
        this.children.bind(key, initial);
        return this;
    }

    bindContents(key, initial) {
        this.bind(key, initial);
        this.children.always((jtml, index) => jtml.bind(`${key}[${index}]`));
        return this;
    }

    evaluate() {
        return super.evaluate() ?? this.children.members.map(child => child.evaluate()).join(" ");
    }

    /**
     * Allows a div or suchlike to be globally disabled/enabled, by recursively calling this method 
     * on the children.
     * 
     * @param {boolean} disabled 
     */
    setDisabled(disabled) {
        for (const child of this.children.members) {
            // Filter out text children and other anomalies
            if (child.setDisabled) {
                child.setDisabled(disabled);
            }
        }
    }
}

ContainerTag.textTag = function(type, text) {
    if (text instanceof ContainerTag) {
        return text;
    }
    else if (typeof type === "function") {
        return new type()._(text);
    }
    else {
        return new ContainerTag(type)._(text);
    }
}

ContainerTag.textTagFactory = function(type) {
    return contents => {
        if (contents instanceof ContainerTag) {
            return contents;
        }
        else { 
            return ContainerTag.textTag(type, contents);

        }
    }
}

ContainerTag.FACTORY = content => {
    if (content instanceof JTMLComponent) {
        return content;
    }
    else if (content === undefined) {
        return new JTMLText();
    }
    else {
        return new JTMLText(content.toString());
    }
}