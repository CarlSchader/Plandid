const express = require('express');
const { mongodbConfig } = require('../config');
const database = require('../database');

const router = express.Router();

router.post('/addException', async function(req, res) {
    let exception = req.body.exception;
    let schedule = await database.read(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number});
    if (schedule === null) {
        res.json("Schedule doesn't exist.\n");
        return;
    }
    for (let i = 0; i < schedule.exceptions.length; i++) {
        if (exception.date === schedule.exceptions[i].date) {
            res.json("Date already has exception.\n");
            return;
        }
    }

    await database.update(mongodbConfig.schedulesCollectionName, {email: schedule.email, password: schedule.password, number: schedule.number}, {$push: {"exceptions": exception}});
    res.json(null);
});

router.post('/removeException', async function(req, res) {
    let schedule = await database.read(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number});
    if (schedule === null) {
        res.json("Schedule doesn't exist.\n");
        return;
    }
    let exceptions = schedule.exceptions;
    exceptions.splice(req.body.exceptionNumber, 1);
    await database.update(mongodbConfig.schedulesCollectionName, {email: schedule.email, password: schedule.password, number: schedule.number}, {$set: {"exceptions": exceptions}});
    res.json(null);
});

router.post('/changeDate', async function(req, res) {
    let schedule = await database.read(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number});
    if (schedule === null) {
        res.json("Schedule doesn't exist.\n");
        return;
    }
    let exceptions = schedule.exceptions;
    exceptions[req.body.exceptionNumber].date = req.body.date;
    await database.update(mongodbConfig.schedulesCollectionName, {email: schedule.email, password: schedule.password, number: schedule.number}, {$set: {"exceptions": exceptions}});
    res.json(null);
});

router.post('/changeDescription', async function(req, res) {
    let schedule = await database.read(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number});
    if (schedule === null) {
        res.json("Schedule doesn't exist.\n");
        return;
    }
    let exceptions = schedule.exceptions;
    exceptions[req.body.exceptionNumber].description = req.body.description;
    await database.update(mongodbConfig.schedulesCollectionName, {email: schedule.email, password: schedule.password, number: schedule.number}, {$set: {"exceptions": exceptions}});
    res.json(null);
});

router.post('/addJob', async function(req, res) {
    if (isNaN(req.body.job[0]) || req.body.job[0] < 0 || req.body.job[0] >= 86400 || isNaN(req.body.job[1]) || req.body.job[1] < 0 || req.body.job[1] >= 86400) {
        res.json("Invalid times.\n");
        return;
    }
    if (req.body.job.length < 3 || req.body.job[2] === null) {
        res.json("Invalid request.\n");
        return;
    }
    let schedule = await database.read(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number});
    if (schedule === null) {
        res.json("Invalid user data.\n");
        return;
    }
    let exceptions = schedule.exceptions;
    let jobs = exceptions[req.body.exceptionNumber].jobs;
    let upper = jobs.length - 1;
    let lower = 0;
    let i = 0;
    while (lower < upper) {
        i = Math.floor((upper + lower) / 2);
        if (req.body.job[0] < jobs[i][0]) upper = i - 1;
        else if (req.body.job[0] > jobs[i][0]) lower = i + 1;
        else break;
    }
    if (jobs.length === 0) jobs.push(req.body.job);
    else if (req.body.job[0] < jobs[i][0]) jobs.splice(i, 0, req.body.job);
    else jobs.splice(i + 1, 0, req.body.job);

    exceptions[req.body.exceptionNumber].jobs = jobs;
    await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number}, {$set: {"exceptions": exceptions}});
    res.json(null);
});

router.post('/removeJob', async function(req, res) {
    let schedule = await database.read(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number});
    if (schedule === null) {
        res.json("Schedule doesn't exist.\n");
        return;
    }
    let exceptions = schedule.exceptions;
    exceptions[req.body.exceptionNumber].jobs.splice(req.body.elementNumber, 1);
    await database.update(mongodbConfig.schedulesCollectionName, {email: schedule.email, password: schedule.password, number: schedule.number}, {$set: {"exceptions": exceptions}});
    res.json(null);
});

module.exports = router;