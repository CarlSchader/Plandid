const express = require('express');
const { mongodbConfig } = require('../config');
const database = require('../database');

const router = express.Router();

router.post('/addPerson', async function(req, res) {
    await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.email, password: req.body.password, number: req.body.number}, {$push: {people: req.body.person}});
    res.json(0);
});

router.post('/addAvailability', async function(req, res) {
    let schedule = await database.read(mongodbConfig.schedulesCollectionName, {email: req.body.email, password: req.body.password, number: req.body.number});
    let times = schedule.people[req.body.personNumber].weekly[req.body.dayInt];
    let pushString = `people.${req.body.personNumber}.weekly.${req.body.dayInt}`;
    await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.email, password: req.body.password, number: req.body.number}, {$set: {[pushString]: req.body.availability}});
    res.json(0);
});

router.post('/changePerson', async function(req, res) {
    // await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.email, password: req.body.password, number: req.body.number}, {$pull: {people: req.body.currentPerson}});
    await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.email, password: req.body.password, number: req.body.number, people: req.body.currentPerson}, {$set: {"people.$": req.body.updatedPerson}});
    res.json(0);
});

module.exports = router;