const express = require('express');
const database = require('../database')
const { mongodbConfig } = require('../config');

const router = express.Router();

function plannable(schedule) {
    let bool = false;
    for (let i = 0; i < schedule.weekly.length; i++) {
        bool = bool || schedule.weekly[i].length > 0;
    }
    return bool && schedule.people.length > 0 && schedule.tasks.length > 0;
}

router.post('/planSchedule', async function(req, res) {
    let schedule = await database.read(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number});
    if (schedule === null) {
        res.json("Invalid user data.\n");
        return;
    }
    if (!plannable(schedule)) {
        res.json('Schedule not ready for planning. People, Tasks, or Week are empty.\n');
        return;
    }
});

router.post('/renameSchedule', async function(req, res) {
    let newName = req.body.name.trim();
    if (newName.length < 1) {
        res.json("No name given.\n");
        return;
    }

    let query = await database.readMany(mongodbConfig.schedulesCollectionName, {name: newName});
    for (let i = 0; i < query.length; i++) {
        if (query[i].number !== req.body.currentSchedule.number) {
            res.json("Name already being used.\n");
            return;
        }
    }

    await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number}, {$set: {"name": newName}});
    res.json(null);
});

router.post('/changeTimezone', async function(req, res) {
    let schedule = await database.read(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number});
    if (schedule === null) {
        res.json("Invalid user data.\n");
        return;
    }
    await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number}, {$set: {"timezone": req.body.timezone}});
    res.json(null);
});

module.exports = router;