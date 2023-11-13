import Aggregate from "../core/Aggregate.js";
import Binder from "../bind/Binder.js";
import JTMLComponent from "../core/JTMLComponent.js";
import JTMLNode from "../core/JTMLNode.js";
import JTMLText from "../core/JTMLText.js";

/**
tag.disabled() returns true if the tag is disabled.
tag.disabled(bool) enables or disables the tag.
tag.disabled("foo") binds the state of the tag to the key "foo": disabled
when "foo" is truthy, enabled when it isn't. Changing the value of "foo" through the
binder changes the state of the tag.
tag.disabled("foo", value => something) also binds the state of the tag to the key
"foo", but it's no longer the truthiness of the bound value that matters. Instead,
an evaluator callback is called when the bound value changes; the tag state is
set to the callback's return.


The Tag.hidden() method works similarly to Tag.disabled().

tag.classes() returns the list of classes associated with the tag.
tag.classes("foo bar", bool) ensures that the classes "foo" and "bar" are present
or absent, depending on the value of the bool flag. If the boolean is omitted, it
defaults to true.
tag.classes(foo bar", "baz") binds the presence or absence of the classes to the
key "baz".
tag.classes("foo bar", "baz", value => something)

**/

let id = 0;

export default class Tag extends JTMLNode {

    #id = id++;
    #classBindings = {};

    constructor(name, attrs = {}, ...etc) {
        super(name, attrs, ...etc);
        this.children         = new Aggregate(JTMLText.FACTORY);
        this.children.parent  = this;
        this.viewers          = [];
        this.my.multiple      = false;
        this.classes(["jtml-tag", "jtml-" + name], true);
    }

    get factory() {
        return this.children.factory;
    }

    set factory(factory) {
        this.children.factory = factory;
    }

    multiple(multiple) {
        if (multiple === undefined) {
            return this.my.multiple;
        }
        else {
            this.my.multiple = multiple;
            return this;
        }
    }

    alias(alias) {
        if (alias === undefined) {
            return this.my.alias;
        }
        else {
            this.multiple(true);
            this.my.alias = alias;    
            return this;
        }
    }

    _(...children) {
        this.children._(...children);
        return this;
    }

    containing(...children) {
        return this._(children);
    }

    append(...children) {
        return this._(...children);
    }

    child(index) {
        return this.children.members[index];
    }

    appendTo(domNode) {
        this.children.appendTo(this.domNode);
        super.appendTo(domNode);
        return this;
    }

    clear() {
        this.domNode.replaceChildren();
        this.children.clear();
    }

    /**
    Replaces all existing children of this JTML node with a new set of children,
    and modifies the DOM accordingly.

    TODO: figure out if this is the most efficient way to do this.
    **/
    replace(...children) {
        // Scrub the DOM
        this.domNode.replaceChildren();
        // Restructure the JTML *and* DOM
        this.children.replace(...children);
        return this;
    }

    /**
    Unless otherwise specified, a Tag and its children share the same binder.
    This allows (for example) a button to set a bound value that's actually
    stored in its parent div's binder, which in turn lets some other child of
    the div monitor and respond to the change.

    A multiple tag is replicated multiple times with the same
    internal structure. Multiple tags have one binder per instance, which
    inherits from the prototype binder. That lets (for example) each item in a
    list have the same name for its text binding.
    **/
    setBinder(binder) {
        if (!this.multiple()) {
            super.setBinder(binder);
        }
        else {
            super.setBinder(new Binder(binder, this.alias()));
        }
        this.children.setBinder(this.binder());
    }

    // bind(key, initial, index) {
    //     return super.bind(key, initial, index);
    // }

    /**
     * Called when this tag gets its own binder. If it's a multiple tag, then the
     * binder inherits from a prototype binder (and has multiple siblings that do the same).
     * 
     * @param {*} key 
     * @param {*} initial 
     */
    init(key, initial) {
        // If the binder has an alias, then it's a LOCAL equivalent of key.
        // E.g., in a list, each item may have its own binder, with a prototype binder
        // shared by all of them. An alias says that "for this particular list item,
        // the key 'player' is equivalent to 'game.players[7]'", or whatever.
        const alias = this.alias();
        if (alias) {
            this.binder().alias(key, alias);
        }
        super.init(key, initial);
    }

    viewer(viewer) {
        this.viewers.push(viewer);
        return this;
    }

    display(value) {
        for (let viewer of this.viewers) {
            if (typeof viewer === "function") {
                viewer(value, this);
            }
            else {
                viewer.display(value, this);
            }
        }
        return !!this.viewers.length;
    }

    evaluate() {
        return this.children.members[0].evaluate();
    }

    /**
     * Monitors the key for changes. When it's set to some value, adds that
     * value as a class. If key had a previous value, the corresponding
     * class is removed.
     * 
     * @param {string} key 
     */
    bindClass(key) {
        this.monitor(key, value => {
            this.removeClasses(this.#classBindings[key]);
            this.#classBindings[key] = value;
            this.addClasses(value);
        });
        return this;
    }

    bindContents(key, initial = []) {
        this.children.bind(key, initial);
    }

    /**
     * Called on a container tag--normally something like a ul or a select, but also for a div that
     * contains other, formatted divs.
     * 
     * Binding a tag's items means that its contents can be changed--by adding
    children, removing children, moving children, or replacing the children wholesale.
    It doesn't mean anything with regard to selectability: the tag may allow
    a selection from an immutable list, or it may allow the list to change but
    not be selectable.

     * @param {*} key 
     * @param {*} options 
     * @returns 
     */
    bindItems(key, options = {}) {
        if (options.factory) {
            if (!options.alias) {
                this.children.factory = options.factory;
            }
            else {
                this.children.alias(options.alias, options.factory);
            }
        }
        this.children.bindItems(key, options.initial);
        return this;
    }


    distribute(callback) {
        this.children.distribute(callback);
        return this;
    }

    /**
    Convenience function that sets or gets the id attribute.
    **/
    id(id) {
        return this.attr("id", id);
    }

    attrs(attrs) {
        if (attrs === undefined) {
            attrs = {};
            if (this.element.hasAttributes())
            {
                for (let attr of this.element.attributes) {
                    attrs[attr.key] = attr.value;
                }
            }
            return attrs;
        }
        else {
            for (let [key, value] of Object.entries(attrs)) {
                this.attr(key, value);
            }
        }
        return this;
    }

    attr(key, value) {
        if (value === undefined) {
            return this.domNode.getAttribute(key);
        }
        else {
            this.domNode.setAttribute(key, value);
            return this;
        }
    }

    /**
    * The classes argument can be either an array of strings or a space-separated
    * list of strings.
    **/
    classes(classes = "", key = true, value) {
        if (classes === undefined) {
            return this.domNode.classList;
        }
        else {
            return this.setClasses(classes, key, value);
        }
    }

    hasClasses(classes) {
        if (typeof classes === "string") {
            classes = classes.split(/\s+/);
        }
        let classList = this.domNode.classList;
        for (let cls of classes) {
            if (!classList.contains(cls)) {
                return false;
            }
        }
        return true;
    }

    setClasses(classes, key, value) {
        let classList = this.domNode.classList;
        if (typeof classes === "string") {
            classes = classes.split(/\s+/);
        }
        if (key === true) {
            this.addClasses(classes, classList);
        }
        else if (!key) {
            this.removeClasses(classes, classList);
        }
        else if (typeof key === "string") {
            let action = present => this.setClasses(classes, present);
            this.binder().when(key, value, action);
        }
        else {
            throw new Error("Unsupported type for 'key' passed to Tag.setClasses()");
        }
        return this;
    }

    addClasses(classes) {
        if (classes) {
            if (typeof classes === "string") {
                classes = classes.split(/\s+/);
            }
            let classList = this.domNode.classList;
            for (let cls of classes) {
                if (cls !== "" && !classList.contains(cls)) {
                    classList.add(cls);
                }
            }    
        }
        return this;
    }

    removeClasses(classes) {
        if (classes) {
            if (typeof classes === "string") {
                classes = classes.split(/\s+/);
            }
            let classList = this.domNode.classList;
            for (let cls of classes) {
                if (classList.contains(cls)) {
                    classList.remove(cls);
                }
            }    
        }
        return this;
    }

    enabled(key, value) {
        if (key === undefined) {
            return !this.disabled();
        }
        else {
            return this.disabled(key, value, false);
        }
    }

    /**
    test should be a function that takes as its **first** argument the value of
    the binding.
    **/
    disabled(key, value, disable = true) {
        if (key === undefined) {
            return this.domNode.disabled;
        }
        else {
            // In English, this means "make the DOM node disabled if the 'disable' flag matches the
            // result of the 'should I do this?' test"
            // In other words, the 'disable' argument is a way of reversing the sense of the test
            const action = testResult => this.domNode.disabled = testResult === disable ? true : false;
            this.binder().when(key, value, action);
            return this;
        }
    }

    styles(...styles) {
        for (let style of styles) {
            for (const [key, value] of Object.entries(style)) {
                this.style(key, value);
            }
        }
        return this;
    }

    style(key, value) {
        if (value === undefined) {
            return window.getComputedStyle(this.domNode)[key];
        }
        else {
            this.domNode.style[key] = value;
            return this;
        }
    }

    styled(key, value, when) {
        // Remember what the value is before we do anything.
        let current = this.style(key);
        if (when === undefined) {
            return current === value;
        }
        else {
            let self = this;
            // The action is to set style[key] = value ... for instance, set backgroundColor = orange.
            // If the "when" predicate evaluates to true, then the passed-in value is set. If not,
            // the pre-existing value is restored.
            let action = present => self.style(key, present ? value : current); // set or unset the style
            this.resolve(value, changed => action(predicate(changed)));
        }
    }

    visible(key, value) {
        if (key === undefined) {
            return !this.hidden();
        }
        else {
            return this.hidden(key, value, false);
        }
    }

    hidden(key, value, condition = true) {
        if (key === undefined) {
            return this.style("display") === "none";
        }
        else {
            const action = hidden => 
                this.style("display", hidden === condition ? "none" : null)
            this.binder().when(key, value, action);
            return this;
        }
    }

    resolve(what, when, action) {
        if (typeof what === "boolean") {
            // If what is true or false, just do the action.
            action(what);
            return this;
        }
        else if (typeof what === "string") {
            // what is actually the name of a binding.
            // Create a callback for when bound value changes, and pass in a predicate
            // return this.bindPredicate(flag, hidden => self.hidden(hidden), when);
            // let predicate = this.toPredicate(when);
            // Keep track of the bound key "what". When its value changes, (1) check
            // the predicate to see whether the new value matches the predicate, and
            // (2) pass that result (true/matched or false/not matched) to the action callback.
            // this.monitor(what, value => action(predicate(value)));
            this.binder().when(what, when, action);
        }
        return this;
    }

    // /**'
    // Returns a predicate function which takes a value and returns true "when" ... something.

    // If "when" is undefined the predicute returns true when it's passed a truthy value and
    // false when it's passed a falsy value.

    // If "when" is a value, the predicuate returns true if it's passed a value that's equal to "when".

    // If "when" is a function, it *is* the predicate, and is returned unchanged.
    // **/
    // toPredicate(when){
    //     if (when === undefined) {
    //         // If no specific predicate is given, assume the action's argument
    //         // is true if and only if the bound value is truthy. The "predicate"
    //         // function simply returns its input as a boolean.
    //         // predicate = value => !!value;
    //         return value => !!value;
    //     }
    //     else if (typeof when !== "function") {
    //         // Caller has supplied a specific value. The action's argument is true
    //         // when the bound value is equal to the given value.
    //         // predicate = value => value == when
    //         return value => value == when;
    //     }
    //     else {
    //         // Caller has passed in a function which takes a value and returns
    //         // true or false, which is then passed to the action function.
    //         // predicate = when;
    //         return when;
    //     }
    //     // We now have a predicate function, which takes in the value bound to
    //     // key and returns a boolean. When the bound value changes, that boolean
    //     // is passed to the action callback.
    // }

    click(callback, propagate) {
        if (callback) {
            const self = this;
            this.domNode.addEventListener("click", event => {
                // Some DOM objects are smart enough to ignore clicks when disabled, like buttons
                // Others, like divs, are not intrinsically clickish and have to be managed
                if (!self.disabled()) {
                    if (!propagate) {
                        event.stopPropagation();
                    }
                    callback(self, event);    
                }
            });
        }
        return this;
    }

    change(callback) {
        let self = this;
        this.domNode.addEventListener("change", event => callback(self, event));
        return this;
    }

    toDOMNode(name, attrs = {}) {
        let element = document.createElement(name);
        for (let [key, value] of Object.entries(attrs)) {
            element.setAttribute(key, value);
        }
        return element;
    }

    toArgs() {
        return [this.delement.tagName, this.attrs()];
    }

    apply(callback, ...searches) {
        for (let search in searches) {
            for (let tag of this.find(search)) {
                callback(tag);
            }
        }
        return this;
    }

    /**
    Finds the nearest ancestor of the given tag type. TODO: make much more flexible.
    **/
    ancestor(...types) {
        if (!this.parent) {
            return undefined;
        }
        else if (types.map(type => type.toUpperCase()).indexOf(this.parent.domNode.nodeName) !== -1) {
            return this.parent;
        }
        else {
            return this.parent.ancestor(...types);
        }
    }

    find(search) {
        let tags = [];
        if (this.matches(search)) {
            tags.push(this);
        }
        tags.push(this.family.find(search));
        return tags;
    }

    index() {
        return this.parent.indexOf(this);
    }

    indexOf(child) {
        return this.children.indexOf(child);
    }

    /**
    **/

    matches(search) {
        // TODO: array == AND ?
        if (typeof search === "function") {
            return search(this);
        }
        else if (search.startsWith(".")) {
            return this.classes().includes(search.substring(1)); // TODO: upper case
        }
        else {
            return this.domNode.nodeName.toUpperCase() == search.toUpperCase();
        }
    }

    /**
    Issues one or more command to this object's children (its issue, as they say
    in wills; -20 points for Griffindor, excessive wordplay) and returns this
    object. Each callback is applied to the this.children AGGREGATE, not to each
    individual child. So this method is appropriate when the caller wants to
    configure the container for the children, without breaking method chaining.

    So it's an alternative to
        tag.children.doStuff();
    by instead calling
        tag.issue(children => children.doStuff());
    because doStuff() might return anything, but issue() always returns this. To
    be explicit, you can't do
        tag.children.doStuff().attr(key, value);
    because doStuff() won't generally return tag. But you can do
        tag.issue(children => children.doStuff()).attr(key, value);
    instead.
    **/
    issue(...callbacks) {
        for (let callback of callbacks) {
            callback(this.children);
        }
        return this;
    }

    factory(factory) {
        this.children.factory = factory;
        return this;
    }
}

Tag.builder = function(what) {

    const properties = {
        attrs : {},
        contents : [],
        args : [],
        textTag : false
    };

    const builder = {

        type : function(type, ...args) {
            properties.type = type;
            properties.args = args;
            return this;
        },

        name : function(name) {
            properties.name = name;
            return this;
        },

        attr : function(key, value) {
            if (value !== undefined) {
                properties.attrs[key] = value;
            }
            return this;
        },

        attrs : function(attrs) {
            // attrs should be an object. If it isn't, then the caller has simply skipped the attrs
            // and provided the contents. In that case, the so-called "attrs" argument is really the
            // first of the contents.
            if (typeof attrs === "string" || typeof attrs === "number" || typeof attrs === "function" || attrs instanceof JTMLComponent) {
                properties.contents.unshift(attrs);
                attrs = {};
            }
            if (attrs) {
                properties.attrs = attrs;
            }
            return this;
        },

        contents : function(...contents) {
            if (contents.length) {
                if (contents.length == 1 && typeof contents[0] === "object" && contents[0].options) {
                    this.factory(contents.factory);
                    contents = contents.options;
                }
                properties.contents.push(...contents);
            }
            return this;
        },

        factory : function(factory) {
            properties.factory = factory;
            return this;
        },

        textTag : function(textTag) {
            properties.textTag = textTag;
            return this;
        },

        construct : function(construct) {
            properties.construct = construct;
            return this;
        },

        build : function() {
            let tag;
            if (properties.type) {
                if (properties.attrs && Object.keys(properties.attrs).length) {
                    // The convention is that Tag subclass constructors should be called thus:
                    // new FooTag(attrs, fooTagArg1, fooTagArg2 ...)
                    properties.args.unshift(properties.attrs);
                }
                tag = new properties.type(...properties.args);
            }
            else if (properties.construct) {
                tag = properties.construct(properties.attrs);
            }
            else {
                tag = new Tag(properties.name, properties.attrs);
            }
            if (properties.contents.length) {
                tag._(...properties.contents);
                // A text tag typically has only one child, which is itself a text node.
                // That means that the tag can be bound to a text property, by registering
                // the child to receive property-change notifications.
                if (properties.textTag && properties.contents.length === 1) {
                    tag.viewer(tag.children.members[0]);
                }
            }
            if (properties.factory) {
                tag.children.factory = factory;
            }
            return tag;
        }

    };

    if (typeof what === "string") {
        builder.name(what);
    }
    else if (what !== undefined) {
        builder.type(what);
    }

    return builder;
}
