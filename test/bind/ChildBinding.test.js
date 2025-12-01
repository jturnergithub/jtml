import test from "ava";
import ValueBinding from "../../src/bind/ValueBinding.js";
import Character from "./_Character.js";

test("Change an object primitive property", t => {
    let smedley = new Character("Smedley");
    const binding = new ValueBinding("character", smedley);
    binding.value.gold = 101;
    t.is(smedley.gold, 101);
})

test("Equivalence of setting child value and property of parent value", t => {
    let counter = 0;
    let smedley = new Character("Smedley");
    const binding = new ValueBinding("character", smedley);
    t.is(counter, 0);
    t.is(binding.value.gold, smedley.gold);
    binding.child("gold").monitor(() => counter++);
    t.is(counter, 1);
    binding.child("gold").value = 101;
    t.is(counter, 2);
    t.is(smedley.gold, 101);
    t.is(binding.value.gold, 101);
    binding.value.gold = 102;
    t.is(counter, 3);
    t.is(smedley.gold, 102);
});

test("Bind to array element: primitive", t => {
    let counter = 0;
    const array = ["a", "b", "c"];
    const binding = new ValueBinding("array", array);
    binding.child(0).monitor(() => counter++);
    t.is(counter, 1);
    t.assert(Array.isArray(binding.value));
    binding.value[0] = "A";
    t.is(counter, 2);
    t.is(array[0], "A");
});

test("Bind to array element: object", t => {
    let counter   = 0;
    const smedley = new Character("Smedley");
    const bertha  = new Character("Bertha");
    const ralph   = new Character("Ralph");
    const array   = [smedley, bertha];
    const binding = new ValueBinding("array", array);
    t.is(counter, 0);
    binding.child(0).monitor(() => counter++);
    t.is(counter, 1);
    binding.value[0] = ralph;
    t.is(counter, 2);
    t.is(binding.value[0].__target, ralph);
    t.is(binding.child(0).rawValue, ralph);
});

test("Descendant", t => {
    let counter   = 0;
    const smedley = new Character("Smedley");
    const binding = new ValueBinding("smedley", smedley);
    const descendant = binding.descendant(["gems", "diamond"]).monitor(() => counter++);
    t.is(counter, 1);
    descendant.value = 7;
    t.is(smedley.gems.diamond, 7);
});

test("Monitor array length", t => {
    let counter         = 0;
    const array         = ["a", "b", "c"];
    const arrayBinding  = new ValueBinding("array", array);
    const lengthBinding = arrayBinding.child("length").monitor(
        () => counter++
    );
    t.is(counter, 1);
    t.is(lengthBinding.value, 3)
    arrayBinding.value.push("d");
    t.is(counter, 2);
    t.is(lengthBinding.value, 4)
    arrayBinding.value[0] = "A";
    t.is(counter, 2);
    // NB different array, but same length. By current understanding, this nonetheless triggers .length binding.
    arrayBinding.value = ["one", "two", "three", "four"];
    t.is(counter, 3);
});

test("Separate length and item bindings; new item changes length", t => {
    let counter         = 0;
    const arrayBinding  = new ValueBinding("array");
    const itemBinding   = arrayBinding.child(0);
    const lengthBinding = arrayBinding.child("length").monitor(
        () => counter++
    );
    t.is(counter, 1);
    t.is(lengthBinding.value, undefined);
    arrayBinding.set([]);
    t.is(counter, 2);
    t.is(lengthBinding.value, 0);
    itemBinding.value = "foo";
    t.is(counter, 3);
    t.is(lengthBinding.value, 1);
});