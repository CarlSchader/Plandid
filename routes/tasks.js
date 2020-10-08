const express = require('express');
const { mongodbConfig } = require('../config');
const database = require('../database');

const router = express.Router();

router.post('/addTask', async function(req, res) {
    let newName = req.body.task.name.trim();
    if (newName.length < 1) {
        res.json("No name given.\n")
        return;
    }
    for (let i = 0; i < req.body.currentSchedule.tasks.length; i++) {
        if (req.body.currentSchedule.tasks[i].name === newName) {
            res.json("Name already being used.\n");
            return;
        }
    }
    await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number}, {$push: {tasks: req.body.task}});
    res.json(null);
});

router.post('/changeName', async function(req, res) {
    let newName = req.body.input.name.trim();
    
    // Check name length.
    if (newName.length < 1) {
        res.json('Name cannot be empty.\n');
        return;
    }

    // Check if name already exists.
    for (let i = 0; i < req.body.currentSchedule.tasks.length; i++) {
        if (i !== req.body.input.taskNumber &&  req.body.currentSchedule.tasks[i].name === newName) {
            res.json('Name already exists.\n');
            return;
        }
    }

    let updatedTask = JSON.parse(JSON.stringify(req.body.task));
    updatedTask.name = newName;
    await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number, tasks: req.body.task}, {$set: {"tasks.$": updatedTask}});
    res.json(null);
});

router.post('/changeCategory', async function(req, res) {
    // Check if category is correct.
    const categories = new Set(["", "primary", "secondary", "success", "warning", "danger", "info", "dark"]);
    if (!categories.has(req.body.input.category)) {
        res.json("Invalid category.\n");
        return
    }

    let updatedTask = JSON.parse(JSON.stringify(req.body.task));
    updatedTask.category = req.body.input.category;
    await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number, tasks: req.body.task}, {$set: {"tasks.$": updatedTask}});
    res.json(null);
});

router.post('/removeTask', async function(req, res) {
    await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number}, { $pull: { 'tasks': { name: req.body.task.name } }});
    res.json(null);
});

module.exports = router;