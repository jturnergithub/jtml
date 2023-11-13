import {ARRAY_LENGTH_BINDING, format, scope} from "../bind/bind.js";
import JTMLComponent from "./JTMLComponent.js";
import JTMLComponentFactory from "./JTMLComponentFactory.js";

/**
An Aggregate is a JTMLComponent that contains other JTMLComponents. The Aggregate can be
treated eather as its own binding scope or as a container for a number of related
children. One use is as a pseudo-node: a virtual node, which is not itself
present in the DOM tree but whose children form a control.
**/
export default class Aggregate extends JTMLComponent {

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
        this.members       = [];
        this.factory       = factory;
        this.distributions = [];
    }

    get factory() {
        return this.my.factory;
    }

    set factory(factory) {
        this.my.factory = factory;
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
        for (let member of members) {
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
        else if (Array.isArray(member)) {
            this.addAll(...member);
        }
        else {
            // Convert member, if necessary, to a usable JTMLNode instance.
            member = this.factory(member, this.length);
            if (member) {
                member.parent = this.parent;
                for (let callback of this.distributions) {
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
        return this;
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

    /**
     * Shows the items that are in the items array, and only those items. Extraneous child
     * JTMLComponents are truncated, or new ones created, as necessary. If they're not already
     * JTML objects, the new items are
     * converted the aggregate's factory function.
     * 
     * This is expected to be called from a binding, which means that it's
     * going to be called if the bound value *changes*. That is, if you
     * replace one array with another, the Aggregate has to display the new
     * array and not the old one.
     * 
     * @param {*} items 
     */
    display(items = []) {
        // 1. Get rid of any members that don't have corresponding items.
        this.truncate(items.length);
        // 2. Make any existing members display the associated item value, if there is one.
        // NOTE: this.length can be shorter than items.length, but it can't be longer.
        for (let i = 0; i < this.length; i++) {
            this.members[i].display(items.shift());
        }
        // 3. If we've run out of extant members, but we still have items, create a new member for each item.
        this.addAll(...items);

        // If items.length is 0, there won't be any children, so first and last
        // are irrelevant
        // if (items.length) {
        //     // If the previous array was empty, then there won't be an extant jtml-first.
        //     // Make one.
        //     this.members[0].set("jtml-first", true);
        //     // If the new list adds items, the previous jtml-last is no longerlast
        //     if (n < 0) {
        //         this.members[oldLength - 1].set("jtml-last", false);
        //     }
        //     this.members[items.length - 1].set("jtml-last", true);
        // }

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
     * Binding an aggregate to an array means that when the array is replaced by a 
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
    bind(key, initial = []) {
        super.bind(key, initial);
    }

    bindItems(key, initial = []) {
        const self = this;
        this.keys.binding = key;
        this.binder().set(key, initial);
        // When the array itself is swapped out, we may have to create or destroy members
        this.monitor(key, items => self.fit(items));
        // When the array is lengthened or shortened in-place, we *also* may have to create or destroy members.
        // ASSUMPTION: this.get(key) returns the modified array
        this.monitor(format(key, "length"), () => self.fit(self.get(key)));
    }

    /**
     * 1. Truncates this aggregate so that it's no longer than the items.
     * 2. Slices off any items from length onwards.
     * 3. Adds those items.
     * 
     * @param {array} items 
     */
    fit(items = []) {
        // Remove any members that don't have corresponding items.
        this.truncate(items.length);
        // Slice off the new items, if there are any. If length is too long, this produces an empty array.
        const newItems = items.slice(this.length);
        // Add each of the new items.
        this.extend(newItems);
    }

    extend(items = []) {
        const n = items.length - this.length;
        for (let item of items) {
            // Creates a key of the form "foo.bar.baz[3]" or whatever and sets its value to item
            this.binder().set(format(this.keys.binding, this.length), item);                
            // Indirectly calls the factory function, which turns item
            // into JTML and gives it its own local binder. If the manufactured
            // JTML contains bindings, they should trigger!
            this.add(item);
        }
        return n;
    }

        /**
     * Returns the number of members removed.
     * 
     * @param {*} length 
     * @returns The number of removed members
     */
    truncate(length = 0) {;
        if (length >= this.members.length) {
            return 0;
        }
        else {
            let n = this.members.length - length;
            if (this.domNode){
                for (let i = length; i < this.members.length; i++) {
                    this.domNode.removeChild(this.members[i].domNode);
                }
            }
            // TODO: this still leaves bound callbacks that refer to the deleted
            // items, which is absurd. Should use a WeakMap or something?
            this.members.length = length;
            return n;
        }
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

    // /**
    // Returns a list of all DOM nodes in this Aggregate's direct children. If some
    // of those children are themselves Aggregates, this method will be called
    // recursively. The result is a *shallow* list of DOM nodes that are directly
    // underneath us in the DOM tree.
    // **/
    // domNodes() {
    //     let nodes = [];
    //     for (let member of this.members) {
    //         nodes.push(member.domNodes());
    //     }
    //     return nodes;
    // }

    // display(members = []) {
    //     this.replace(...members);
    // }

    /********** Utility methods **********/

    click(callback) {
        for (let member of this.members) {
            member.click(callback);
        }
        return this;
    }

    enabled(key, value) {
        return this.disabled(key, value, false)
    }

    disabled(key, value, disabled = true) {
        this.distribute(member => {
            if (member.disabled) { // Make sure the member can be disabled
                member.disabled(key, value, disabled);
            }
        });
    }

    /**
    Applies callbacks to everything directly contained by the aggregate.
    Each callback is called for each present AND FUTURE member.
    **/
    distribute(...callbacks) {
        for (let callback of callbacks) {
            this.distributions.push(callback);
            for (let i = 0; i < this.members.length; i++) {
                callback(this.members[i], i);
            }
        }
    }

    find(search) {
        let members = [];
        if (this.matches(search)) { // Or if (search.matches(this)) ?????
            members.push(this);
        }
        for (let member of this.members) {
            if (member.find) {
                member.push(member.find(search));
            }
        }
        return members;
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
