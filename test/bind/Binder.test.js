import test from "ava";
import Binder from "../../src/bind/Binder.js";
import Character from "./_Character.js";

test("Set and get a primitive", t => {
    const binder = new Binder();
    t.is(binder.get("one"), undefined);
    binder.set("one", 1);
    t.is(binder.get("one"), 1);
});

test("Create a binding with no value", t => {
    const binder  = new Binder();
    const binding = binder.binding("Nothing")
    t.assert(binding);
    t.assert(!binding.value);
});

test("Get multiple values", t => {
    const binder = new Binder();
    binder.set("zero", 0);
    binder.set("one", 1);
    binder.set("two", 2);
    const array = binder.getAll("zero", "one", "two");
    t.is(array[0], 0);
    t.is(array[1], 1);
    t.is(array[2], 2);
});

test("Define a synthetic binding", t => {
    let counter  = 0;
    const binder = new Binder();
    binder.set("zero", 0);
    binder.set("one", 1);
    binder.set("two", 2);
    binder
        .define("sum", ["zero", "one", "two"], (a, b, c) => a + b + c)
        .monitor(() => counter++);
    t.is(binder.get("sum"), 3);
    t.is(counter, 1);
    binder.binding("zero").set(100);
    t.is(binder.get("sum"), 103);
    t.is(counter, 2);
});

test("One key, one binding", t => {
    const binder   = new Binder();
    const binding0 = binder.binding("foo");
    const binding1 = binder.binding("foo");
    t.is(binding0, binding1);
});

test("Simple synonym", t => {
    let counter = 0;
    const smedley = new Character("Smedley");
    const binder  = new Binder();
    binder.set("smedley", smedley);
    binder.monitor("smedley.gems.diamond", () => counter++);
    t.is(counter, 1);
    binder.synonym("gem", "smedley.gems.diamond");
    t.is(counter, 1);
    binder.increment("gem");
    t.is(counter, 2);
    t.is(smedley.gems.diamond, 1);
    t.is(binder.get("gem"), smedley.gems.diamond);
    binder.synonym("gem", "smedley.gems.opal");
    binder.set("gem", 2);
    t.is(counter, 2);
    t.is(smedley.gems.diamond, 1);
    t.is(smedley.gems.opal, 2);
    binder.synonym("gem");
    t.assert(!binder.get("gem"));
});