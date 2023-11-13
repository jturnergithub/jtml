import AbstractBinding from "./AbstractBinding.js";
import * as BindUtil from "./BindUtil.js";

/**
 * There are three separable things to be done with a movable alias.
 * 
 * 1. Establish that the alias exists.
 * 2. Point it to a particular target.
 * 3. Bind to (or through) it.
 * 
 * #2 necessarily entails #1, so they can be done in tandem.
 */
export default class AliasBinding extends AbstractBinding {

    #target;
    #oldValue;

    constructor(key, target) {
        super(key);
        this.target = target;
        // When the target value changes out from under us, we need to xxx out the
        // old value that we have stored. NB: this will always be the very first callback invoked.
        // this.callbacks.push((newValue, oldValue) =>  this.oldValue = undefined);
    }

    get target() {
        return this.#target;
    }

    set target(target) {
        if (this.#target) {
            // We no longer care about updates to the old target.
            this.target.forget(...this.callbacks);
            // However, in changing targets, we've changed the "old" value of the alias.
            // this.oldValue = this.rawValue;
            this.oldValue = this.value;
        }
        this.#target = target;
        if (this.#target) {
            // We do care about updates to the new target. N.B. monitor() invokes the callbacks, as per standard behavior.
            this.target.monitor(...this.callbacks);
        }
        else {
            // If the alias is set to point off into the blue, with no target, we need to invoke its own callbacks
            // to let them know that its value is now undefined.
            super.trigger();
        }
        // Handle the parallel alias-binding hierarchy.
        if (this.children) {
            for (const child of Object.values(this.children)) {
                child.target = this.target.child(child.discriminant);
            }    
        }
    }

    different(value) {
        return !!this.target?.different(value);
    }

    monitor(...callbacks) {
        // Remember these callbacks so they can be moved if the AliasBinding is retargeted.
        this.callbacks.push(...callbacks);
        // We also need the current target to call these callbacks when its value changes in-place,
        // without this AliasBinding being redirected.
        if (this.target) {
            this.target.monitor(...callbacks);
        }
    }

    /**
     * When the binder sets the value of a binding, that binding's callbacks are triggered. An AliasBinding
     * doesn't have its own value; it points to a target, where the value is stored. Triggering only the
     * AliasBinding's callbacks would leave anyone who's monitoring the target in the dark. In fact, all the
     * callback here have been stuck into the target! So we just delegate.
     * 
     * @param  {...function} callbacks 
     */
    trigger(...callbacks) {
        this.target?.trigger(...callbacks);
    }

    get oldValue() {
        return this.#oldValue ?? this.target?.oldValue;
    }

    set oldValue(value) {
        this.#oldValue = value;
    }

    get rawValue() {
        return this.target?.rawValue;
    }

    get value() {
        return this.target?.value;
    }

    set value(value) {
        if (this.target) {
            this.target.value = value;
        }
    }

    equals(that) {
        return !!this.target?.equals(that);
    }

    /**
     * Regrettably, we need to have a parallel hierarchy of AliasBindings that shadows the hierarchy
     * of real bindings. It boils down to redirects:
     * 
     * binder.alias("current-player", "game.players[0]"); // Establishes an alias
     * text().bind("current-player.name"); // Creates some text, which updates whenever the name changes
     * binder.redirect("current-player", "game.players[1]"); // Moves the alias to the next player
     * 
     * Without an alias hierarcy, step 2 above puts a callback into the target of the binding--that is, into 
     * the "game.players[0].name" binding. That callback just sits there even after step 3, which says that
     * the current player is now someone else. It'll never be called unless player[0]'s name changes!
     * 
     * To handle this correctly, step 2 must put a callback into the child AliasBinding "current-player.name".
     * When the "current-player" alias gets redirected, the child aliases also get redirected.
     * 
     * @param {string} discriminant 
     * @returns 
     */
    spawn(discriminant) {
        this.children = this.children || BindUtil.container(discriminant); // TODO: make consistent with AbstractBinding
        return super.spawn(discriminant, () => 
            new AliasBinding(
                discriminant, 
                this.target.child(discriminant)
            )
        );
    }

    /**
     * If there's a target, delegate to it. If not, try the children.
     * 
     * @param {*} path 
     * @returns 
     */
    seek(path) {
        if (this.target) {
            return this.target.seek(path);
        }
        else {
            // If there's a child that is itself an AliasBinding, and the super.seek() method
            // goes recursive, we should end up back in *this* method ...
            return super.seek(path);
        }
    }

}
