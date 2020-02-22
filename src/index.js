const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

// WITHOUT middleware:  new request -> run route handler
// WITH middleware:     new request -> do something -> run route handler

app.listen(port, () => {
    console.log(`Listening on port ${port} mothafucka`);
});

const Task = require("./models/task");
const User = require("./models/user");


// andrew -> poijdfjmorewoijwer -> andrew .... ENCRYPTION algorithm is reversible
// mypass -> mpoijsaerjweroijwem .... HASHING algorithm is non-reversible
