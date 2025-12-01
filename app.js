import express from "express";

const app      = express();
const port     = 3001;

app.use(express.static("."));
app.use(express.json());

app.get('/', (request, response) => {
    response.send('Hello World!');
});

app.listen(port, () => {
    console.log(`JTML app listening on port ${port}`);
});
