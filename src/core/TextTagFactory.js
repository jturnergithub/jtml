import JTMLComponentFactory from "../core/JTMLComponentFactory.js";

export default class TextTagFactory extends JTMLComponentFactory {

    constructor(tag, callback) {
        super(callback);
        this.tag = tag;
    }

    create(object) {
        return super.create(object) || new this.tag(object.toString());
    }

}
