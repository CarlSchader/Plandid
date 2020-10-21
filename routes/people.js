const express = require('express');
const db = require('../database');
const { categoriesAreOkay, checkName } = require('../utilities');

const router = express.Router();

// userID, scheduleName
router.post("/getPeople", async function(req, res) {
    res.json((await db.readPeopleRecord(req.body.userID, req.body.scheduleName)).people);
});

// userID, scheduleName, name, categories
router.post("/addPerson", async function(req, res) {
    let name = req.body.name.trim();
    let categories = req.body.categories;
    if (!checkName(name, (await db.readPeopleRecord(req.body.userID, req.body.scheduleName)).people)) {
        return res.json(1);
    }
    if (!categoriesAreOkay(categories)) {
        return res.json(2);
    }
    await db.addPerson(req.body.userID, req.body.scheduleName, name, categories=categories);
    return res.json(0);
})

// userID, scheduleName, name
router.post("/removePerson", async function(req, res) {
    await db.removePerson(req.body.userID, req.body.scheduleName, req.body.name);
    return res.json(0);
});

// userID, scheduleName, oldName, newName
router.post("/changeName", async function(req, res) {
    let newName = req.body.newName.trim();
    if (!checkName(newName, (await db.readPeopleRecord(req.body.userID, req.body.scheduleName)).people)) {
        return res.json(1);
    }
    else {
        await db.changePersonName(req.body.userID, req.body.scheduleName, req.body.oldName, newName);
        return res.json(0);
    }
});

// userID, scheduleName, name, categories
router.post("/changeCategories", async function(req, res) {
    if (!categoriesAreOkay(req.body.categories)) {
        return res.json(1);
    }
    else {
        await db.changePersonCategories(req.body.userID, req.body.scheduleName, req.body.name, req.body.categories);
        return res.json(0);
    }
});

// userID, scheduleName, name, utcStart, utcEnd
router.post("/addAvailability", async function(req, res) {
    await db.addPersonAvailability(req.body.userID, req.body.scheduleName, req.body.name, req.body.utcStart, req.body.utcEnd);
    return res.json(0);
});

// userID, scheduleName, name, utcStart, utcEnd, available, description
router.post("/addException", async function(req, res) {
    if (typeof req.body.available !== "boolean") {
        return res.json(1);
    }
    await db.addPersonException(req.body.userID, req.body.scheduleName, req.body.name, req.body.utcStart, req.body.utcEnd, req.body.available, req.body.description);
    return res.json(0);
});

// userID, scheduleName, name, index
router.post("/removeAvailability", async function(req, res) {
    await db.removePersonAvailability(req.body.userID, req.body.scheduleName, req.body.name, req.body.index);
    return res.json(0);
});

// userID, scheduleName, name, index
router.post("/removeException", async function(req, res) {
    await db.removePersonException(req.body.userID, req.body.scheduleName, req.body.name, req.body.index);
    return res.json(0);
});

module.exports = router;