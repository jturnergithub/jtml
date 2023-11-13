import JTMLComponentFactory from "../core/JTMLComponentFactory.js";
import JTMLNode from "../core/JTMLNode.js";
import TextTagFactory from "./TextTagFactory.js";

export default class JTMLText extends JTMLNode {

    constructor(text) {
        super(text);
    }

    toDOMNode(text) {
        return document.createTextNode(text);
    }

    toArgs() {
        return [this.domNode.nodeValue];
    }

    display(string) {
        this.domNode.nodeValue = string === undefined ? "" : string.toString();
    }

    evaluate() {
        return this.domNode.nodeValue;
    }

    toString() {
        return this.evaluate();
    }
}

JTMLText.FACTORY = text => JTMLComponentFactory.INSTANCE(text) || new JTMLText(text);
