import {button, checkbox, div, img, li, span, text, textField, ul} from  "../../jtml.js";

const HIDE = "Hide completed";
const SHOW = "Show all";

const todos = [
    { completed : false, text : "Learn HTML" },
    { completed : false, text : "Learn Javascript" },
    { completed : false, text : "Learn JTML" }
];

function setRemainingCt(jtml) {
    jtml.set("remainingCt", jtml.get("todos").filter(todo => !todo.completed).length);
}

function newItem(todo, index, key) {
    const completedKey = `todos[${index}].completed`;
    const textKey      = `todos[${index}].text`;
    const todoItm = li(
        checkbox().bind(completedKey),
        span(text().bind(textKey)).classes("strikethrough", completedKey), 
        button(img("../common/assets/x.gif"))
            .classes("image-button")
            .click(jtml => jtml.get("todos").splice(index, 1))
    )
        .hidden(["hide-completed", completedKey], (hide, completed) => hide && completed);
    todoItm.monitor(completedKey, () => setRemainingCt(todoItm));
    todoItm.monitor("todos.length", () => setRemainingCt(todoItm))
    return todoItm;
}

export default div(
    div(
        textField().bind("new-todo").attr("placeholder", "new todo"),
        button(img("../common/assets/plus.gif"), "Add Todo").classes("image-button")
            .enabled("new-todo", todo => todo?.length)
            .click(jtml => jtml.push("todos", { text : jtml.replace("new-todo", "") }))
    ),
    ul(newItem).bind("todos", todos),
    div(
        text().bind("remainingCt"), 
        " of ",
        text().bind("todos.length"),
        " item",
        span("s").visible("remainingCt", count => count !== 1),
        " remaining"
    ),
    button()
        .bind("hide-completed", false)
        .toDisplay(hidden => hidden ? SHOW : HIDE)
        .click(jtml => jtml.toggle("hide-completed"))
);

/*
Here's Vue's version.

<script setup>
import { ref, computed } from 'vue'

let id = 0

const newTodo = ref('')
const hideCompleted = ref(false)
const todos = ref([
  { id: id++, text: 'Learn HTML', done: true },
  { id: id++, text: 'Learn JavaScript', done: true },
  { id: id++, text: 'Learn Vue', done: false }
])

const filteredTodos = computed(() => {
  return hideCompleted.value
    ? todos.value.filter((t) => !t.done)
    : todos.value
})

function addTodo() {
  todos.value.push({ id: id++, text: newTodo.value, done: false })
  newTodo.value = ''
}

function removeTodo(todo) {
  todos.value = todos.value.filter((t) => t !== todo)
}
</script>

<template>
  <form @submit.prevent="addTodo">
    <input v-model="newTodo" required placeholder="new todo">
    <button>Add Todo</button>
  </form>
  <ul>
    <li v-for="todo in filteredTodos" :key="todo.id">
      <input type="checkbox" v-model="todo.done">
      <span :class="{ done: todo.done }">{{ todo.text }}</span>
      <button @click="removeTodo(todo)">X</button>
    </li>
  </ul>
  <button @click="hideCompleted = !hideCompleted">
    {{ hideCompleted ? 'Show all' : 'Hide completed' }}
  </button>
</template>

 */
