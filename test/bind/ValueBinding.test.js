import test from "ava";
import ValueBinding from "../../src/bind/ValueBinding.js";
import Character from "./_Character.js";

test("Get initial undefined", t => {
    const binding = new ValueBinding("test");
    t.is(binding.value, undefined);
});

test("Get initial primitive", t => {
    const value = 42;
    const binding = new ValueBinding("test", value);
    t.is(binding.value, value);
});

test("Set primitive", t => {
    const value = 42;
    const binding = new ValueBinding("test");
    binding.value = value;
    t.is(binding.value, value);
});

test("Initialize with object", t => {
    const value = new Character("Smedley");
    const binding = new ValueBinding("test", value);
    t.assert(binding.value.__target);
    t.not(value, binding.value);
    t.is(value.name, binding.value.name);
});

test("Monitor a primitive", t => {
    let counter = 0;
    let status  = "ok"
    const binding = new ValueBinding("test", status).monitor(value => {
        counter++;
        status = value;
    });
    t.is(counter, 1);
    t.is(status, "ok");
    binding.set("not ok");
    t.is(counter, 2);
    t.is(status, "not ok");
});

test("Monitor an object", t => {
    let counter   = 0;
    const smedley = new Character("Smedley");
    const bertha  = new Character("Bertha");
    const binding = new ValueBinding("character", smedley).monitor(() => counter++);
    t.is(counter, 1);
    t.is(smedley.name, binding.value.name)
    binding.value.name = "Smeddles";
    t.is(counter, 1);
    binding.set(bertha);
    t.is(counter, 2);
    t.is(bertha.name, binding.value.name);
});

test("Monitor an array", t => {
    let counter = 0;
    const array = ["a", "b", "c"];
    const binding = new ValueBinding("array", array).monitor(() => counter++);
    t.is(counter, 1);
    binding.value.push("d");
    t.is(counter, 2);
    binding.value[0] = "A";
    t.is(counter, 2);
    binding.value = ["one", "two", "three"];
    t.is(counter, 3);
});

test("Set to same value", t => {
    let counter = 0;
    const binding = new ValueBinding("test", 42).monitor(() => counter++);
    t.is(counter, 1);
    binding.value = 42;
    t.is(counter, 1);
})
