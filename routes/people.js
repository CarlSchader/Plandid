const express = require('express');
const { mongodbConfig } = require('../config');
const database = require('../database');

const router = express.Router();

const categoryMap = {
    primary: 0,
    secondary: 1,
    success: 2,
    warning: 3,
    danger: 4,
    info: 5,
    dark: 6
};

function availabilityAlgorithm(availList, newAvail) {
    if (availList.length !== 0) {
        let changedAvail = [newAvail[0], newAvail[1]];

        // Two binary searches, one for both i and j.
        let upper = (2*availList.length) - 1;
        let lower = 0;
        let i = null;
        let index1 = null;
        let index2 = null;
        while (lower <= upper) {
            i = Math.floor((upper + lower)/2);
            index1 = Math.floor(i/2);
            index2 = Math.ceil((i/2)%1);
            if (newAvail[0] < availList[index1][index2]) upper = i - 1;
            else if (newAvail[0] > availList[index1][index2]) lower = i + 1;
            else break;
        }
        if (index2 === 1) {
            if (newAvail[0] <= availList[index1][index2]) {
                changedAvail[0] = availList[index1][0];
                i = index1 - 1;
            }
            else i = index1;
        }
        else {
            if (newAvail[0] > availList[index1][index2]) changedAvail[0] = availList[index1][0];
            i = index1 - 1;
        }

        upper = (2*availList.length) - 1;
        lower = 0;
        let j = null;
        index1 = null;
        index2 = null;
        while (lower <= upper) {
            j = Math.floor((upper + lower)/2);
            index1 = Math.floor(j/2);
            index2 = Math.ceil((j/2)%1);
            if (newAvail[1] < availList[index1][index2]) upper = j - 1;
            else if (newAvail[1] > availList[index1][index2]) lower = j + 1;
            else break;
        }
        if (index2 === 0) {
            if (newAvail[1] >= availList[index1][index2]) {
                changedAvail[1] = availList[index1][1];
                j = index1 + 1;
            }
            else j = index1;
        }
        else {
            if (newAvail[1] < availList[index1][index2]) changedAvail[1] = availList[index1][1];
            j = index1 + 1;
        }

        availList.splice(i + 1, j - i - 1, changedAvail);

        return availList;
    }
    else return [newAvail];
}

function exceptionAlgorithm(availList, newAvail) {
    if (availList.length !== 0) {
        let changedAvail = [newAvail[0], newAvail[1]];

        // Two binary searches, one for both i and j.
        let upper = (2*availList.length) - 1;
        let lower = 0;
        let i = null;
        let index1 = null;
        let index2 = null;
        while (lower <= upper) {
            i = Math.floor((upper + lower)/2);
            index1 = Math.floor(i/2);
            index2 = Math.ceil((i/2)%1);
            if (new Date(newAvail[0]) < new Date(availList[index1][index2])) upper = i - 1;
            else if (new Date(newAvail[0]) > new Date(availList[index1][index2])) lower = i + 1;
            else break;
        }
        if (index2 === 1) {
            if (new Date(newAvail[0]) <= new Date(availList[index1][index2])) {
                changedAvail[0] = availList[index1][0];
                i = index1 - 1;
            }
            else i = index1;
        }
        else {
            if (new Date(newAvail[0]) > new Date(availList[index1][index2])) changedAvail[0] = availList[index1][0];
            i = index1 - 1;
        }

        upper = (2*availList.length) - 1;
        lower = 0;
        let j = null;
        index1 = null;
        index2 = null;
        while (lower <= upper) {
            j = Math.floor((upper + lower)/2);
            index1 = Math.floor(j/2);
            index2 = Math.ceil((j/2)%1);
            if (new Date(newAvail[1]) < new Date(availList[index1][index2])) upper = j - 1;
            else if (new Date(newAvail[1]) > new Date(availList[index1][index2])) lower = j + 1;
            else break;
        }
        if (index2 === 0) {
            if (new Date(newAvail[1]) >= new Date(availList[index1][index2])) {
                (changedAvail[1]) = availList[index1][1];
                j = index1 + 1;
            }
            else j = index1;
        }
        else {
            if (new Date(newAvail[1]) < new Date(availList[index1][index2])) changedAvail[1] = availList[index1][1];
            j = index1 + 1;
        }

        // Merge descriptions on person exception adding.
        let newString = "";
        if (i + 1 >= j) newString = newAvail[2];
        else {
            let k = i + 1;
            let appendedNewAvailString = false;
            while (k < j) {
                if (!appendedNewAvailString && new Date(newAvail[0]) <= new Date(availList[k][0])) {
                    appendedNewAvailString = true;
                    newString = `\n${newString}\n\n${newAvail[2]}\n`;
                }
                else {
                    newString = `\n${newString}\n\n${availList[k][2]}\n`;
                    k++;
                }
            }
        }
        changedAvail[2] = newString.trim();
        changedAvail.push(newAvail[3]);

        availList.splice(i + 1, j - i - 1, changedAvail);
        return availList;
    }
    else return [newAvail];
}

router.post('/addPerson', async function(req, res) {
    let newName = req.body.person.name;
    let responseMessage = '';
    let error = false;
    
    if (newName.length < 1) {
        error = true;
        responseMessage = "No name given.";
    }
    else if (newName.replace(/\s/g, '').length < 1) {
        error = true;
        responseMessage = "Name must contain characters.";
    }
    for (let i = 0; i < req.body.currentSchedule.people.length; i++) {
        if (req.body.currentSchedule.people[i].name === newName) {
            error = true;
            responseMessage = "Name already being used.";
            break;
        }
    }
    // Check if categories are correct.
    for (let i = 0; i < req.body.person.categories.length; i++) {
        if (req.body.person.categories[i] !== null && !(req.body.person.categories[i] in categoryMap)) {
            error = true;
            responseMessage = 'Category error.\n';
            break;
        }
    }

    if (error) res.json(responseMessage);
    else {
        await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number}, {$push: {"people": req.body.person}});
        res.json(null);
    }
})

router.post('/changePerson', async function(req, res) { // TODO: Send error message responses if updatedPerson is invalid. Name, Categories, Weekly Availability, Exceptions.
    let error = false;
    let responseMessage = '';
    let newName = req.body.updatedPerson.name.trim();
    let finalPerson = JSON.parse(JSON.stringify(req.body.updatedPerson));

    // Check name length.
    if (newName.length < 1) {responseMessage += 'Name cannot be empty.\n'; error = true;}

    // Check if name already exists.
    for (let i = 0; i < req.body.currentSchedule.people.length; i++) {
        if (i !== req.body.personNumber &&  req.body.currentSchedule.people[i].name === newName) {
            error = true;
            responseMessage += 'Name already exists.\n';
            break;
        }
    }

    // Check if categories are correct.
    for (let i = 0; i < req.body.person.categories.length; i++) {
        if (req.body.updatedPerson.categories[i] !== null && !(req.body.updatedPerson.categories[i] in categoryMap)) {
            error = true;
            responseMessage = 'Category error.\n';
            break;
        }
    }

    // Validates new availability.
    if (req.body.dayInt !== -1) {
        let newAvail = finalPerson.weekly[req.body.dayInt].pop();
        if (newAvail[0] >= newAvail[1]) {
            error = true;
            responseMessage = 'Start time must be before end time.\n';
        }
        else if (newAvail[0] < 0 || newAvail[0] >= 86400 || newAvail[1] < 0 || newAvail[1] >= 86400) {
            error = true;
            responseMessage = 'Invalid times.\n';
        }
        else if (isNaN(newAvail[0]) || isNaN(newAvail[1])) {
            error = true;
            responseMessage = 'One of the times is not a number.\n';
        }

        // Organizes the availabilities.
        else {
            finalPerson.weekly[req.body.dayInt] = availabilityAlgorithm(finalPerson.weekly[req.body.dayInt], newAvail);
        }
    }

    // Validates new exception.
    if (req.body.newException) {
        let exception = finalPerson.exceptions.pop();
        if (isNaN(new Date(exception[0]).getTime()) || isNaN(new Date(exception[1]).getTime())) {
            error = true;
            responseMessage = 'Invalid dates\n';
        }
        else if (!(new Date(exception[0]) < new Date(exception[1]))) {
            error = true;
            responseMessage = 'Start time must be before end time.\n';
        }

        // Organizes the exceptions.
        else {
            finalPerson.exceptions = exceptionAlgorithm(finalPerson.exceptions, exception);
        }
    }


    ///////// This will either send an error message or update the person.


    if (error) res.json(responseMessage);
    else {
        if (req.body.removePerson) await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number}, { $pull: { 'people': { name: req.body.person.name } }});
        else {
            finalPerson.name = newName;
            await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.currentSchedule.email, password: req.body.currentSchedule.password, number: req.body.currentSchedule.number, people: req.body.person}, {$set: {"people.$": finalPerson}});
        }
        res.json(null);
    }
});

module.exports = router;