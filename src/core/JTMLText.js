import JTMLComponentFactory from "../core/JTMLComponentFactory.js";
import JTMLNode from "../core/JTMLNode.js";

export default class JTMLText extends JTMLNode {

    constructor(text) {
        super(text);
    }

    toDOMNode(text) {
        return document.createTextNode(text ?? "");
    }

    toArgs() {
        return [this.domNode.nodeValue];
    }

    display(string) {
        this.domNode.nodeValue = string === undefined ? "" : string.toString();
    }

    inspect() {
        return this.domNode.nodeValue;
    }

    evaluate() {
        return this.inspect();
    }

    find(test) {
        const found = [];
        if (test(this)) {
            found.push(this);
        }
        return found;
    }

    toString() {
        return this.evaluate();
    }
}

JTMLText.FACTORY = text => JTMLComponentFactory.INSTANCE(text) || new JTMLText(text);

// better way?

JTMLText.textFactory = content => {
    if (content instanceof JTMLNode) {
        return content;
    }
    else if (content === undefined) {
        return new JTMLText();
    }
    else {
        return new JTMLText(content.toString());
    }
}