const express = require('express');
const { mongodbConfig } = require('../config');
const database = require('../database');

const router = express.Router();

router.post('/addTask', async function(req, res) {
    if (isNaN(req.body.newElement[0]) || req.body.newElement[0] < 0 || req.body.newElement[0] >= 86400 || isNaN(req.body.newElement[1]) || req.body.newElement[1] < 0 || req.body.newElement[1] >= 86400) {
        res.json("Invalid times.\n");
        return;
    }
    if (req.body.newElement.length < 3 || req.body.newElement[2] === null) {
        res.json("Invalid request.\n");
        return;
    }
    let schedule = await database.read(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number});
    if (schedule === null) {
        res.json("Invalid user data.\n");
        return;
    }
    let week = JSON.parse(JSON.stringify(schedule.weekly[req.body.dayNum]));

    let upper = week.length - 1;
    let lower = 0;
    let i = 0;
    while (lower < upper) {
        i = Math.floor((upper + lower) / 2);
        if (req.body.newElement[0] < week[i][0]) upper = i - 1;
        else if (req.body.newElement[0] > week[i][0]) lower = i + 1;
        else break;
    }
    if (week.length === 0) week.push(req.body.newElement);
    else if (req.body.newElement[0] < week[i][0]) week.splice(i, 0, req.body.newElement);
    else week.splice(i + 1, 0, req.body.newElement);

    await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number, weekly: schedule.weekly[req.body.dayNum]}, {$set: {"weekly.$": week}});
    res.json(null);
});

router.post('/removeTask', async function(req, res) {
    let schedule = await database.read(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number});
    if (schedule === null) {
        res.json("Invalid user data.\n");
        return;
    }
    let week = JSON.parse(JSON.stringify(schedule.weekly[req.body.dayNum]));
    week.splice(req.body.elementNum, 1);
    await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number, weekly: schedule.weekly[req.body.dayNum]}, {$set: {"weekly.$": week}});
    res.json(null);
});

module.exports = router;