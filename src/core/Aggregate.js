import Binder from "../bind/Binder.js"; // TODO: fix bind.js so we don't explicitly import the whole class.
import {format, scope} from "../bind/bind.js";
import JTMLComponent from "./JTMLComponent.js";
import JTMLComponentFactory from "./JTMLComponentFactory.js";
import JTMLText from "./JTMLText.js";

/**
 * An Aggregate is a JTMLComponent that contains other JTMLComponents. The Aggregate can be
 * treated eather as its own binding scope or as a container for a number of related
 * children. One use is as a pseudo-node: a virtual node, which is not itself
 * present in the DOM tree but whose children form a control.
 *
 * The simplest Aggregates are populated explicitly, by the caller simply setting
 * the contents to other JTMLComponents. The only way to modify such an aggregate
 * is to construct and add new JTML, or remove existing JTML. A dynamic Aggregate,
 * which creates new members on the fly, often requires a factory function. The
 * factory takes in some kind of input and constructs a JTML object from it--
 * by turning text into a ListItem <li>, for example, or by turning a full-fledged
 * object into a <div> with text and/or controls inside it.
 * 
 * Aggregates can be bound to arrays. Changes to the array structure, or replacing
 * the bound array with a different array, cause the Aggregate to create or destroy
 * members as necessary.
 * 
 * Separate from this, the members of the Aggregate can themselves be bound. If the
 * members are created explicitly, this is trivial. If members are to be created
 * programatically, via the factory function, call the bindItems(key) method; this
 * ensures that the individual members are bound to "key[0]", "key[42]", and so
 * forth. This, in turn, allows changes in the bound array's individual elements to 
 * show up in the HTML.
 * 
**/
export default class Aggregate extends JTMLComponent {

    #factory;
    #always = [];

    /**
     * A factory must be supplied if this aggregate is dynamic.
     * 
     * The default factory is a no-op. It's suitable for the common case where the binding members
     * are explicitly-created JTML components. E.g., for something like
     * div (
     *  div("inner div"),
     *  button("click me"),
     *  img("image.png")
     * )
     * 
     * @param {*} factory 
     */
    constructor(factory = JTMLComponentFactory.INSTANCE) {
        super();
        this.members = [];
        this.factory = factory;
    }

    get factory() {
        return this.#factory;
    }

    set factory(factory) {
        this.#factory = factory || this.#factory;
        return true;
    }

    /**
     * Sets or replaces this aggregate's factory function. The new function ensures
     * that every item that's manufactured has its own binder, which inherits from the
     * aggregate's binder. It also ensures that the new binder has a binding with the
     * key "alias", which refers to a binding in this aggregate's binder. 
     * 
     * For example: suppose that we have an object like 
     * game = {
     *  players : [ 
     *      { name : "Bob", color : "red" },
     *      { name : "Carol", color : "green" },
     *      { name : "Ted", color : "blue" },
     *      { name : "Alice", color : "yellow" }
     *  ]
     * }
     * 
     * It's easy enough to have the aggregate create bindings such that, say,
     * "game.players[3]" ---> {name : "Alice", color : "yellow" }
     * 
     * Using an alias lets us say that, WITHIN AGGREGATE MEMBER #3, the binding "player"
     * would also refer to Alice. In aggregate member #1, the binding "player" would
     * refer to Bob.
     * 
     * @param {*} alias 
     * @param function factory : a factory function
     */
    alias(alias, factory = this.factory) {
        // Okay, see, it's like this. The factory is used to create new JTML components from
        // an array of other stuff, like strings or objects. Only the alias indicates that 
        // we want each child to have its own binder, 
        // which inherits from the aggregate's binder. So we're wrapping the factory function
        // in another function, which encases the original factory in its own binder scope.
        this.factory = (item, index) => {
            // Manufacture the JTML object with its own inheritor binder, and establish an alias in
            // that scope.
            const member = scope(alias, this.keys.binding, index).single(factory(item, index));
            if (member) {
                member.bind(alias, item);
            }
            return member;
        }
    }

    /********** Adding to, removing from, and iterating the members array **********/

    get length() {
        return this.members.length;
    }

    /**
    Allows the Aggregate to be used in for ... of loops.
    **/
    [Symbol.iterator]() {
        return this.members[Symbol.iterator]();
    }

    _(member0, ...rest) {
        return this.contents(member0, ...rest);
    }

    /**
    If called with no arguments, returns the members of this Aggregate. If
    called with arguments, adds those to this Aggregate. The signature allows
    us to distinguish between the two cases.
=    **/
    contents(member0, ...rest) {
        if (member0 === undefined) {
            return this.members;
        }
        else {
            return this.addAll(member0, ...rest);
        }
    }

    /**
    Appends the arguments, in order, to this Aggregate.
    **/
    addAll(...members) {
        for (const member of members) {
            this.add(member);
        }
        return this;
    }

    add(member) {
        // Encountered a function instead of an object? Invoke it with the
        // containing tag and use the output as the member.
        if (typeof member === "function") {
            // Go recursive! That way we can have functions that return functions,
            // functions that return arrays, and similar zany hijinks.
            this.add(member(this.parent));
        }
        // else if (Array.isArray(member)) {
        //     this.addAll(...member);
        // }
        else {
            // It may be that this Aggregate was created in a different scope--i.e., it doesn't use
            // the global Binder. Left unchecked, this means that any members that are dynamically
            // created won't have the same Binder as the rest, and tears will ensue. The dumb way to
            // fix this is to push, then pop, whatever binder we've got.
            Binder.push(this.binder());
            // Convert member, if necessary, to a usable JTMLNode instance.
            member = this.factory(member, this.length, `${this.keys.binding}[${this.length}]`);
            if (typeof member === "string") {
                member = new JTMLText(member);
            }
            Binder.pop();
            if (Array.isArray(member)) {
                this.push(...member);
            }
            else {
                this.push(member);
            }
        }
        return this;
    }

    /**
     * Sticks one or more members onto the end of the members array, modifying the DOM.
     * Skips any members that are undefined. Does the always-do-this callbacks for each
     * new member.
     * 
     * @param  {...any} members 
     */
    push(...members) {
        for (const member of members) {
            if (member !== undefined) {
                member.parent = this.parent;
                for (let callback of this.#always) {
                    callback(member, this.members.length);
                }
                // Stick it in the array.
                this.members.push(member);
                // Manifest the DOM node
                if (this.domNode) {
                    member.appendTo(this.domNode);
                }
            }
        }
    }

    /**
    TODO: Is this faster than replacing each individual member in place? Do we
    maybe have to do that for binding purposes? (Very likely.)
    **/
    replace(...members) {
        this.clear();
        this.addAll(...members);
        return this;
    }

    toJTMLComponent(object) {
        return this.factory.create(object);
    }

    clear() {
        this.members.length = 0;
        return this;
    }

    /********** Fun with binders **********/

    /**
     * Aggregates should only be bound to arrays.
     * 
     * Binding an aggregate means that when the array is replaced by a 
     * different array, the aggregate's children are regenerated or refreshed as
     * necessary. This works just like any other binding: when someone sets the bound value
     * to a different array, this aggregate's display() method is automatically called.
     * The latter is responsible for all the hard work of synchronizing the array with what's
     * on scren.
     * 
     * When an aggregate is bound in this fashion, its children *display* values dynamically.
     * That is, if list item[3] changes from "foo" to "bar", the associated ul or ol tag
     * knows to display "bar" for its third item. 
    **/
    // bind(key, initial = [], callback) {
    //     super.bind(key, initial);
    //     this.always((jtml, index) => jtml.bindValue(`${key}[${index}]`))
    //     return this;
    // }

    // bindItems(key, initial = []) {
    //     this.keys.binding = key; // Probably should be this.keys.itemBinding
    //     this.set(key, initial);
    //     // When the array itself is swapped out, we may have to create or destroy members
    //     this.monitor(key, items => this.fit(items));
    //     // Make sure that all existing and new aggregate members get bound to items.
    //     this.always((jtml, index) => jtml.bindValue(`${key}[${index}]`));
    // }

    /**
     * 1. Truncates this aggregate so that it's no longer than the items.
     * 2. Slices off any items from length onwards.
     * 3. Adds those items.
     * 
     * @param {array} items 
     */
    display(items = []) {
        if (!Array.isArray(items)) {
            // This is to deal with Javascript's pathological arrays, which not only have a .length
            // property, but also respond to the ... (spread) operator. The result is that if items
            // is "JTML", the default logic would add four children: "J", "T", "M", and "L".
            items = [items];
        }
        // Remove any members that don't have corresponding items.
        this.truncate(items.length);
        // Slice off the new items, if there are any. If length is too long, this produces an empty array.
        const newItems = items.slice(this.length);
        // Add each of the new items.
        this.addAll(...newItems);
    }

    extend(items = []) {
        // const n = items.length - this.length;
        for (let item of items) {
            // Creates a key of the form "foo.bar.baz[3]" or whatever and sets its value to item
            const key = format(this.keys.binding, this.length);
            // this.binder().set(key, item);                
            // Indirectly calls the factory function, which turns item
            // into JTML and gives it its own local binder. If the manufactured
            // JTML contains bindings, they should trigger!
            this.add(item);
            // Make sure that the (newest) member displays correctly if the underlying value changes.
            this.members[this.length - 1].bind(key);

        }
        return n;
    }

    /**
     * Modifies the DOM tree by removing nodes indexed higher than length.
     * 
     * @param {number} length 
     * @returns The number of removed members
     */
    truncate(length = 0) {;
        if (length < this.members.length) {
            if (this.domNode){
                for (let i = length; i < this.members.length; i++) {
                    this.domNode.removeChild(this.members[i].domNode);
                }
            }
            // TODO: this still leaves bound callbacks that refer to the deleted
            // items, which is absurd. Should use a WeakMap or something?
            this.members.length = length;
        }
        return this;
    }    

    /**
    By default, the children of an Aggregate share the same binder as the Aggregate.
    This isn't necessarily true for Aggregates that represent the repeating
    children of a parent, such as the options in a list or the rows in a table.
    **/
    setBinder(binder) {
        super.setBinder(binder);
        for (let member of this.members) {
            member.setBinder(binder);
        }
    }

    /********** Interaction with other objects **********/

    /**
    An Aggregate is not (typically, presumably) itself a peer to a DOM node,
    so there's no "append yourself" logic. Just append all the children and
    move on (recursively, natch).
    **/
    appendTo(domNode) {
        // Aggregates inside other Aggregates generally don't have their
        // own domNodes. They'll be part of the same DOM object as this
        // Aggregate.
        this.domNode = this.domNode || domNode;
        // Let's remember the nearest ancestor DOM node, just in case.
        for (let member of this.members) {
            member.appendTo(domNode);
        }
    }

    /********** Utility methods **********/

    click(callback) {
        for (const member of this.members) {
            member.click(callback);
        }
        return this;
    }

    enabled(key, value) {
        return this.disabled(key, value, false)
    }

    disabled(key, value, disabled = true) {
        this.always(member => {
            if (member.disabled) { // Make sure the member can be disabled
                member.disabled(key, value, disabled);
            }
        });
    }

    /**
    * Specifies that each of the provided functions should always be called
    * when a member is added to the aggregate, INCLUDING EXISTING MEMBERS.
    * 
    * A callback's signature is (jtml, index), where jtml is the aggregate
    * member and index is its position in the aggregate.
    */
    always(...callbacks) {
        const self = this;
        for (let callback of callbacks) {
            this.#always.push(callback);
            for (let i = 0; i < this.members.length; i++) {
                callback(this.members[i], i);
            }
        }
        return this;
    }

    find(test, deep) {
        const found = [];
        for (const member of this.members) {
            if (test(member)) {
                found.push(member);
            }
            if (deep) {
                found.push(...member.find(test, deep));
            }
        }
        return found;
    }

    indexOf(member) {
        return this.members.indexOf(member);
    }

    moveUp(member) {
        return this.move(member, -1)
    }

    moveDown(member) {
        return this.move(member, +1);
    }

    /**
    This is a brute-force way to move DOM nodes around. It's semi-deprecated.
    In most use cases, it's more appropriate to bind to an array and manipulate
    the bound value. However, that's not always practical.
    **/
    move(member, amount) {
        let oldIndex = this.indexOf(member);
        let newIndex = oldIndex + amount;
        if (newIndex >= 0 && newIndex < this.members.length) {
            let domNode = this.parent.domNode;
            let prev = domNode.children[newIndex + (newIndex < oldIndex ? 0 : 1)];
            domNode.insertBefore(member.domNode, prev || null);
            // Keep the JTML tree in synch with the DOM tree.
            // TODO: this isn't really right for amounts that aren't +1 or -1.
            // Should shift *everyting* between oldIndex and newIndex.
            this.members[oldIndex] = this.members[newIndex];
            this.members[newIndex] = member;
        }
        return this;
    }

    first(test) {
        for (let member of this.members) {
            if (test(member)) {
                return member;
            }
            else if (member.children) {
                let found = member.children.first(test);
                if (found) {
                    return found;
                }
            }
        }
        // if nothing found, returns undefined
    }
}
