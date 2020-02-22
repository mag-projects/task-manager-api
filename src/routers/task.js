const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = new express.Router();

//TASKS endpoint || Post or create a new task
router.post("/tasks", auth, async (req, res) => {
    // const task = new Task(req.body);
    const task = new Task({
        // ...req.body copies all the properties from req.body to this new object
        ...req.body,
        owner: req.user._id
    });
    try {
        await task.save();
        res.status(201).send(`${task.description} task created successfully!`);
    } catch (e) {
        res.status(400).send(e);
    }
});

// GET /tasks?completed=true || tasks?completed=false
// GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt:desc
// Find all tasks
router.get("/tasks", auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === 'desc' ? -1: 1
    }

    if (req.query.completed) {
        match.completed = req.query.completed === "true";
    }

    try {
        // const tasks = await Task.find({owner: req.user._id});
        await req.user.populate({
            path: "tasks",
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Find task by ID
router.get("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        // const task = await Task.findById(_id);
        const task = await Task.findOne({_id, owner: req.user._id});
        if (!task) return res.status(404).send(`Please authenticate`);
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Update task by ID
router.patch("/tasks/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    const isValid = updates.every(update => allowedUpdates.includes(update));
    if (!isValid) res.status(400).send(`${updates} cannot be updated`);

    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if (!task) res.status(400).send();
        updates.forEach(update => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Delete task by ID
router.delete("/tasks/:id", auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        if (!task) res.status(404).send();
        res.send(`${task.description} task successfully deleted`);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;
