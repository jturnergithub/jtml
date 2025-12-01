import {deproxify} from "../bind/Binding.js";
import Aggregate from "../core/Aggregate.js";
import JTMLNode from "../core/JTMLNode.js";
import JTMLText from "../core/JTMLText.js";

/**
 * A Tag is the peer of an DOM element--i.e., anything that's represented as <something>
 * or <something> ... contents ... </something>. The various Tag subclasses implement
 * more specific functionality. However, Tag is not an abstract class; there are a number
 * of HTML constructs--<hr> and <br>, for instance--that don't need any other behavior
 * than what Tag provides.
 * 
 * Tag does not implement JTMLComponent.display(). Subclasses should implement this
 * to mutate the .domNode property appropriately. Instances of Tag that aren't instances
 * of such a subclass should never be bound.
 * 
 * Individual subclasses should supply their own constructors, ones that are natural
 * for the type of element being represented. Supplying tag contents in the constructor
 * is not encouraged; rather, the subclass constructor should take everything that's
 * going to be required *in order to* correctly add the contents, whether immediately
 * or later.
 * 
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

export default class Tag extends JTMLNode {

    #classBindings = {};
    #selected;
    #value;

    constructor(name) {
        super(name);
        this.children         = new Aggregate(JTMLText.FACTORY);
        this.children.parent  = this;
        this.viewers          = [];
        this.classes(["jtml-tag", "jtml-" + name], true);
    }

    toDOMNode(name) {
        return document.createElement(name);

    }

    toArgs() {
        return [this.domNode.tagName, this.attrs()];
    }

    get factory() {
        return this.children.factory;
    }

    set factory(factory) {
        this.children.factory = factory;
    }

    get name() {
        return this.domNode?.nodeName.toLowerCase();
    }

    /**
     * Gets or sets the accompanying DOM node's innerHTML property. Setting this will
     * detach any JTML contents from this parent tag, and adding JTML cntents to the
     * tag will overwrite the innerHTML. This method is mainly intended to be used if
     * you have a large swathe of textual HTML, perhaps from an outside source, and
     * you won't need to mess with it after creating it.
     * 
     * @param {string} html 
     */
    html(html) {
        if (html === undefined) {
            return this.domNode.innerHTML;
        }
        else {
            this.domNode.innerHTML = html;
            return this;
        }
    }

    value(value) {
        if (value === undefined) {
            return this.#value;
        }
        else {
            this.#value = deproxify(value);
            return this;
        }
    }

    selected(selected) {
        if (selected === undefined) {
            return !!this.#selected;
        }
        else {
            this.#selected = !!selected;
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

    add(...children) {
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

    invoke(func) {
        func(this);
        return this;
    }

    key(key, value) {
        if (value === undefined) {
            return this.keys[key];
        }
        else {
            this.keys[key] = value;
            return this;
        }
    }

    // clear() {
    //     this.domNode.replaceChildren();
    //     this.children.clear();
    // }

    // /**
    // Replaces all existing children of this JTML node with a new set of children,
    // and modifies the DOM accordingly.

    // TODO: figure out if this is the most efficient way to do this.
    // **/
    // replace(...children) {
    //     // Scrub the DOM
    //     this.domNode.replaceChildren();
    //     // Restructure the JTML *and* DOM
    //     this.children.replace(...children);
    //     return this;
    // }

    // /**
    //  * Called when this tag gets its own binder. If it's a multiple tag, then the
    //  * binder inherits from a prototype binder (and has multiple siblings that do the same).
    //  * 
    //  * @param {*} key 
    //  * @param {*} initial 
    //  */
    // init(key, initial) {
    //     // If the binder has an alias, then it's a LOCAL equivalent of key.
    //     // E.g., in a list, each item may have its own binder, with a prototype binder
    //     // shared by all of them. An alias says that "for this particular list item,
    //     // the key 'player' is equivalent to 'game.players[7]'", or whatever.
    //     const alias = this.alias();
    //     if (alias) {
    //         this.binder().alias(key, alias);
    //     }
    //     super.init(key, initial);
    // }

    viewer(viewer) {
        this.viewers.push(viewer);
        return this;
    }

    display(value) {
        for (const viewer of this.viewers) {
            if (typeof viewer === "function") {
                viewer(value, this);
            }
            else {
                viewer.display(value, this);
            }
        }
        return !!this.viewers.length;
    }

    /**
     * Gets the value associated with this Tag, which isn't as simple as it sounds.
     * If someobody has set an explict value, that's the value. If this tag has a binding,
     * that's the second choice. Subclasses should override this as necessary.
     * 
     * @returns 
     */
    evaluate() {
        if (typeof this.value() === "function") {
            return this.value()();
        }
        else if (this.value() !== undefined) {
            return this.value();
        }
        else if (this.keys.binding) {
            return this.get(this.keys.binding);
        }
        else {
            return undefined;
        }
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

    // /**
    //  * Called on a container tag--normally something like a ul or a select, but also for a div that
    //  * contains other, formatted divs.
    //  * 
    //  * Binding a tag's items means that its contents can be changed--by adding
    // children, removing children, moving children, or replacing the children wholesale.
    // It doesn't mean anything with regard to selectability: the tag may allow
    // a selection from an immutable list, or it may allow the list to change but
    // not be selectable.

    //  * @param {*} key 
    //  * @param {*} options 
    //  * @returns 
    //  */
    // bindItems(key, initial = [], options = {}) {
    //     if (!Array.isArray(initial)) {
    //         // Second arg isn't an array, so presumably it's an options object; anything else
    //         // would be bogus.
    //         options = initial;
    //         initial = options.initial || [];
    //     }
    //     if (options.factory) {
    //         if (!options.alias) {
    //             this.children.factory = options.factory;
    //         }
    //         else {
    //             this.children.alias(options.alias, options.factory);
    //         }
    //     }
    //     this.children.bindItems(key, initial);
    //     return this;
    // }

    /**
     * A few pathological HTML constructs have a value that's separate from
     * what they display. (Select options and radio buttons, for example,
     * have invisible values.) This method is for them. By default it just delegates
     * to bind().
     * 
     * @param {string} key 
     * @returns 
     */
    bindValue(key) {
        return this.bind(key);
    }

    always(callback) {
        this.children.always(callback);
        return this;
    }

    /**
     * Convenience function that sets or gets the id attribute.
     */
    id(id) {
        return this.attr("id", id);
    }

    attrs(attrs) {
        if (attrs === undefined) {
            attrs = {};
            if (this.domNode.hasAttributes())
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
        else {
            let action = present => this.setClasses(classes, present);
            this.binder().signal(key, value, action);
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
            // STUPID STUPID STUPID browsers don't always redraw STUPID

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
            return this.disabled(key, value, true);
        }
    }

    /**
     * Enables or disables this Tag, depending on the value of the binding.
    **/
    disabled(key, value, reverse = false) {
        if (key === undefined) {
            return this.domNode.disabled;
        }
        else {
            this.binder().signal(key, value, disabled => {
                if (reverse) {
                    disabled = !disabled;
                }
                this.setDisabled(disabled);
                this.classes("jtml-disabled", disabled);
            });
            return this;
        }
    }

    /**
     * INTERNAL METHOD. Makes the tag disabled or not. The only reason this exists is 
     * so that subclasses can override it, so that things that aren't intrinsically
     * disable-able can do something smart.
     * 
     * @param {boolean} disabled 
     */
    setDisabled(disabled) {
        this.domNode.disabled = disabled;
    }

    /**
     * Adds or removes multiple styles, defined in an object.
     * 
     * @param {object} styles 
     * @param {string} bindingKey 
     * @param {string} bindingValue 
     * @returns 
     */
    styles(styles, bindingKey, bindingValue) {
        for (const [key, value] of Object.entries(styles)) {
            this.style(key, value, bindingKey, bindingValue);
        }
        return this;
    }

    style(key, value, bindingKey, bindingValue) {
        if (bindingKey === undefined) {
            if (value === undefined) {
                return window.getComputedStyle(this.domNode)[key];
            }
            else {
                this.domNode.style[key] = value;
                return this;
            }
        }
        else {
            this.binder().signal(bindingKey, bindingValue, present => {
                if (present) {
                    this.domNode.style[key] = value;
                }
                else {
                    this.domNode.style[key] = "";
                }
            });
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
            return this.hidden(key, value, true);
        }
    }

    /**
     * Hides an element when a binding key becomes equal to a value.
     * 
     * @param {*} key 
     * @param {*} value 
     * @param {*} condition If false, reverses the sense of the action--i.e., hides the element when the key and value are 
     * NOT equal
     * @returns 
     */
    hidden(key, value, reverse = false) {
        if (key === undefined) {
            return this.style("display") === "none";
        }
        else {
            // If this method was called as foo.hidden(key, value), then the action taken when key === value is
            // to set foo's display to none. If it was called as foo.hidden(key, value, false), then the action
            // taken when key === value is to set foo's display to null, i.e. visible.
            const action = hidden => {
                if (reverse) {
                    hidden = !hidden;
                }
                this.style("display", hidden ? "none" : null)
            }
            this.binder().signal(key, value, action);
            return this;
        }
    }

    blur(key, value) {
        if (key === undefined) {
            return this.domNode !== document.activeElement;
        }
        return this.focus(key, value, true);
    }

    focus(key, value, reverse = false) {
        if (key === undefined) {
            return this.domNode === document.activeElement;
        }
        else {
            const action = focused => this.pend(() => {
                if (reverse) {
                    focused = !focused;
                }
                if (focused) {
                    if (this.domNode !== document.activeElement) {
                        this.domNode.focus();
                    }
                }
                else {
                    this.domNode.blur();
                }
            })
            this.binder().signal(key, value, action);
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

    click(callback, propagate) {
        if (callback) {
            const self = this;
            this.domNode.addEventListener("click", event => {
                if (!propagate) {
                    event.stopPropagation();
                }
                // Some DOM objects are smart enough to ignore clicks when disabled, like buttons
                // Others, like divs, are not intrinsically clickish and have to be managed
                if (!self.disabled()) {
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

    type(callback) {
        this.domNode.addEventListener("keyup", event => callback(this, event));
        return this;
    }

    move(callback) {
        let self = this;
        this.domNode.addEventListener("mousemove", event => callback(self, event));
        return this;
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

    find(test, deep) {
        return this.children.find(test, deep)
    }

    index() {
        return this.parent?.indexOf(this);
    }

    indexOf(child) {
        return this.children.indexOf(child);
    }

    /**
    */
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

    factory(factory) {
        this.children.factory = factory;
        return this;
    }
}