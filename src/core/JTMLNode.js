import JTMLComponent from "./JTMLComponent.js";

/**
Class representing any single node in the hierarchy--a parallel, in other words,
to the built-in DOM Node. Every JTMLNode contains a DOM node; concrete subclasses are responsible
for taking in the constructor arguments and making a DOM node out of them.
**/
export default class JTMLNode extends JTMLComponent {

    constructor(...args) {
        super(...args);
        this.domNode = this.toDOMNode(...args);
    }

    key(name, value) {
        this.keys[name] = value;
        return this;
    }

    toDOMNode(...args) {
        // Subclasses MUST implement this
        throw new Error("Subclass does not implement JTMLNode.toDOMNode()");
    }

    display(value) {
        // Default: no-op. Subclasses may implement this in order to change their
        // visual representation to whatever 'value' represents. For example: a
        // text field should display value as a string; a checkbox should check
        // or uncheck itself based on value's boolean-ness; etc.
    }

    toString() {
        return this.domNode.nodeName;
    }
}
