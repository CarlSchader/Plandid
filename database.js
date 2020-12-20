const { MongoClient } = require('mongodb');
const { mongodbConfig } = require('./config');
const { rangeMerge, overlapSearch } = require('./algorithm');
const { makeID, sortRangedObjectArray, weekMillis } = require('./utilities');

const names = mongodbConfig.collectionNames;

const client = new MongoClient(mongodbConfig.uri, {useNewUrlParser: true, useUnifiedTopology: true});

// Connects to client. (Runs in index.js)
async function connect() {
	try {
		await client.connect();
		return true;
	}
	catch(error) {
		console.error(error);
		return false;
	}
}


// Database schemas
function emailValidationSchema(key, email, password) {
	return {createdAt: new Date(), key: key, email: email, password: password};
}

function userDataSchema(userID, email, password, tier) {
    return {userID: userID, email: email, password: password, tier: tier, lastUsedSchedule: ""};
}

function scheduleSchema(userID, scheduleName) {
    return {userID: userID, scheduleName: scheduleName};
}

function peopleSchema(userID, scheduleName) {
    return {userID: userID, scheduleName: scheduleName, people: {}};
}

// function tasksSchema(userID, scheduleName) {
//     return {userID: userID, scheduleName: scheduleName, tasks: {}};
// }

function categoriesSchema(userID, scheduleName) {
    return {userID: userID, scheduleName: scheduleName, categories: {}}
}

// function weekSchema(userID, scheduleName) {
//     return {userID: userID, scheduleName: scheduleName, week: []};
// }

// function exceptionsSchema(userID, scheduleName) {
//     return {userID: userID, scheduleName, exceptions: []};
// }

function eventsSchema(userID, scheduleName) {
    return {userID: userID, scheduleName: scheduleName, events: []}
}

function plansSchema(userID, scheduleName) {
    return {userID: userID, scheduleName: scheduleName, plans: []};
}

function onlineSchema(sessionID, userID, email) {
    return {createdAt: new Date(), sessionID: sessionID, userID: userID, email: email};
}


// Database subfield schemas
function people_personSchema(categories) {
	return {categories: categories, availabilities: []}
}

function people_availabilitySchema(startTime, endTime, timezone, rrule) {
	return {start: startTime, end: endTime, timezone: timezone, rrule: rrule};
}

// function people_exceptionSchema(startTime, endTime, available, description) {
// 	return {start: startTime, end: endTime, available: available, description: description};
// }

// function tasks_taskSchema(category) {
// 	return category;
// }

// function week_jobSchema(startTime, endTime, taskName, category) {
// 	return {start: startTime, end: endTime, taskName: taskName, category: category};
// }

// function exceptions_exceptionSchema(startTime, endTime, description, jobs) {
// 	return {start: startTime, end: endTime, description: description, jobs: jobs};
// }

// function exceptions_jobSchema(startTime, endTime, taskName, category) {
// 	return {start: startTime, end: endTime, taskName: taskName, category: category};
// }

function events_eventSchema(start, end, name, category, timezone, rrule) {
    return {start: start, end: end, name: name, category: category, timezone: timezone, rrule: rrule}
}

function plans_planSchema(startTime, endTime, personName, eventName, category) {
	return {start: startTime, end: endTime, personName: personName, eventName: eventName, category: category};
}


// Base level database functions
async function create(collection, data) {
	return await (await client.db(mongodbConfig.databaseName).collection(collection).insertOne(data));
}

async function createMany(collection, dataArray) {
	return await client.db(mongodbConfig.databaseName).collection(collection).insertMany(dataArray);
}

async function read(collection, data) {
	return await client.db(mongodbConfig.databaseName).collection(collection).findOne(data);
}

async function readMany(collection, data, limit=0) {
	const cursor = await client.db(mongodbConfig.databaseName).collection(collection).find(data)
	if (limit > 0) cursor.limit(limit);
	return await cursor.toArray();
}

async function update(collection, filter, updateQuery) {
	return await client.db(mongodbConfig.databaseName).collection(collection).updateOne(filter, updateQuery);
}

async function remove(collection, objectToDelete) {
	return await client.db(mongodbConfig.databaseName).collection(collection).deleteOne(objectToDelete);
}

async function removeMany(collection, objectToDelete) {
	return await client.db(mongodbConfig.databaseName).collection(collection).deleteMany(objectToDelete);
}

async function sortArray(collection, arrayPath, sortFieldPath, ascending=true) {
	let ascendingDigit = 1;
	if (!ascending) {
		ascendingDigit = -1;
	}
	let arrayName = arrayPath.split('.').pop();
	let sortQuery = {$sort: {}};
	sortQuery["$sort"][sortFieldPath] = ascendingDigit; 
	let groupQuery = {$group: {_id: "$_id"}};
	groupQuery["$group"][arrayName] = {$push: `$${arrayPath}`};
	let projectQuery = {$project: {}};
	projectQuery["$project"][arrayPath] = `$${arrayName}`;

	return await client.db(mongodbConfig.databaseName).collection(collection).aggregate(
		{$unwind: `$${arrayPath}`},
		sortQuery,
		groupQuery,
		projectQuery
	).pretty();
}

async function recordExists(collection, searchObject) {
    let record = await read(collection, searchObject);
    if (record === null) {
        return false;
    }
    else {
        return true;
    }
}

async function generateUniqueKey(collection, keyName) {
    let query = {};
    query[keyName] = makeID(mongodbConfig.idLength);
    while (await recordExists(collection, query)) {
        query[keyName] = makeID(mongodbConfig.idLength);
    }
    return query[keyName];
}


// Data creation functions
async function createEmailValidationRecord(email, password) {
    let key = await generateUniqueKey(names.emailValidation, "key");
    await create(names.emailValidation, emailValidationSchema(key, email, password));
    return key;
}

async function createUserDataRecord(email, password, tier) {
    let userID = await generateUniqueKey(names.userData, "userID");
    await create(names.userData, userDataSchema(userID, email, password, tier));
    return userID;
}

async function createScheduleRecord(userID, scheduleName) {
	return await create(names.schedule, scheduleSchema(userID, scheduleName));
}

async function createPeopleRecord(userID, scheduleName) {
	return await create(names.people, peopleSchema(userID, scheduleName));
}

// async function createTasksRecord(userID, scheduleName) {
// 	return await create(names.tasks, tasksSchema(userID, scheduleName));
// }

// async function createWeekRecord(userID, scheduleName) {
// 	return await create(names.week, weekSchema(userID, scheduleName));
// }

// async function createExceptionsRecord(userID, scheduleName) {
// 	return await create(names.exceptions, exceptionsSchema(userID, scheduleName));
// }

async function createPlansRecord(userID, scheduleName) {
	return await create(names.plans, plansSchema(userID, scheduleName));
}

async function createEventsRecord(userID, scheduleName) {
    return await create(names.events, eventsSchema(userID, scheduleName));
}

async function createCategoriesRecord(userID, scheduleName) {
    return await create(names.categories, categoriesSchema(userID, scheduleName));
}

async function createAccount(email, password, tier) {
	let userID = await createUserDataRecord(email, password, tier);
	let scheduleName = "New Schedule";
	await createScheduleRecord(userID, scheduleName);
	await createPeopleRecord(userID, scheduleName);
	// await createTasksRecord(userID, scheduleName);
	// await createWeekRecord(userID, scheduleName);
    // await createExceptionsRecord(userID, scheduleName);
    await createEventsRecord(userID, scheduleName);
    await createCategoriesRecord(userID, scheduleName);
	await createPlansRecord(userID, scheduleName);
	return userID;
}

async function createOnlineRecord(userID) {
	let userData = await readUserDataRecordFromID(userID);
	if (userData !== null) {
        let sessionID = await getSessionID(userData.email);
        if (sessionID === null) {
            sessionID = await generateUniqueKey(names.online, "sessionID");
            await create(names.online, onlineSchema(sessionID, userID, userData.email));
            return sessionID;
        }
        else {
            return sessionID;
        }
	}
	else {
		return null;
	}
}

// Remove data functions
async function removeEmailValidationRecord(key) {
	await remove(names.emailValidation, {key: key});
}

async function removeUserDataRecord(userID) {
	await remove(names.userData, {userID: userID});
}

async function removeScheduleRecord(userID, scheduleName) {
	await remove(names.schedule, {userID: userID, scheduleName: scheduleName});
}

async function removePeopleRecord(userID, scheduleName) {
	await remove(names.people, {userID: userID, scheduleName: scheduleName});
}

// async function removeTasksRecord(userID, scheduleName) {
// 	await remove(names.tasks, {userID: userID, scheduleName: scheduleName});
// }

// async function removeWeekRecord(userID, scheduleName) {
// 	await remove(names.week, {userID: userID, scheduleName: scheduleName});
// }

// async function removeExceptionsRecord(userID, scheduleName) {
// 	await remove(names.exceptions, {userID: userID, scheduleName: scheduleName});
// })

async function removePlansRecord(userID, scheduleName) {
	await remove(names.plans, {userID: userID, scheduleName: scheduleName});
}

async function removeOnlineRecord(sessionID) {
	await remove(names.online, {sessionID: sessionID});
}

async function clearDatabase() {
    for (const key in names) {
        await removeMany(names[key], {});
    }
}


// Read data functions
async function readEmailValidationRecord(key) {
	return await read(names.emailValidation, {key: key});
}

async function readEmailValidationRecordFromEmail(email) {
	return await read(names.emailValidation, {email: email});
}

async function readUserDataRecordFromID(userID) {
	return await read(names.userData, {userID: userID});
}

async function readUserDataRecord(email, password) {
	return await read(names.userData, {email: email, password: password});
}

async function readScheduleRecord(userID, scheduleName) {
	return await read(names.schedule, {userID: userID, scheduleName: scheduleName});
}

async function readPeopleRecord(userID, scheduleName) {
	return await read(names.people, {userID: userID, scheduleName: scheduleName});
}

// async function readTasksRecord(userID, scheduleName) {
// 	return await read(names.tasks, {userID: userID, scheduleName: scheduleName});
// }

// async function readWeekRecord(userID, scheduleName) {
// 	return await read(names.week, {userID: userID, scheduleName: scheduleName});
// }

// async function readExceptionsRecord(userID, scheduleName) {
// 	return await read(names.exceptions, {userID: userID, scheduleName: scheduleName});
// }

async function readEventsRecord(userID, scheduleName) {
    return await read(names.events, {userID: userID, scheduleName: scheduleName});
}

async function readCategoriesRecord(userID, scheduleName) {
    return await read(names.categories, {userID: userID, scheduleName: scheduleName});
}

async function readPlansRecord(userID, scheduleName) {
	return await read(names.plans, {userID: userID, scheduleName: scheduleName});
}

async function readOnlineRecord(sessionID) {
	return await read(names.online, {sessionID: sessionID});
}

async function getSessionID(email) {
    let onlineData = await read(names.online, {email: email});
    if (onlineData === null) {
        return null;
    }
    else {
        return onlineData.sessionID;
    }
}

async function readRandomScheduleRecord(userID) {
    return await read(names.schedule, {userID: userID});
}

// Update data functions
async function isLoggedIn(sessionID) {
    let onlineData = await read(names.online, {sessionID: sessionID});
    if (onlineData !== null) {
        return true;
    }
    else {
        return false;
    }
}

async function isLoggedInEmail(email) {
    let onlineData = await read(names.online, {email: email});
    if (onlineData !== null) {
        return true;
    }
    else {
        return false;
    }
}

async function userIDfromSessionID(sessionID) {
    return (await read(names.online, {sessionID: sessionID})).userID;
}

async function changeUserDataEmail(userID, newEmail) {
	await update(names.userData, {userID: userID}, {$set: {email: newEmail}});
}

async function changeUserDataPassword(userID, newPassword) {
	await update(names.userData, {userID: userID}, {$set: {password: newPassword}});
}

async function changeUserDataTier(userID, tier) {
	await update(names.userData, {userID: userID}, {$set: {tier: tier}});
}

async function changeUserDataLastUsedSchedule(userID, lastUsedSchedule) {
    await update(names.userData, {userID: userID}, {$set: {lastUsedSchedule: lastUsedSchedule}});
}

async function changeUserDataStripeCustomerId(userID, stripeCustomerId) {
    await update(names.userData, {userID: userID}, {$set: {stripeCustomerId: stripeCustomerId}});
}

async function changeScheduleName(userID, oldScheduleName, newScheduleName) {
	await update(names.schedule, {userID: userID, scheduleName: oldScheduleName}, {$set: {scheduleName: newScheduleName}});
	await update(names.people, {userID: userID, scheduleName: oldScheduleName}, {$set: {scheduleName: newScheduleName}});
	// await update(names.tasks, {userID: userID, scheduleName: oldScheduleName}, {$set: {scheduleName: newScheduleName}});
	// await update(names.week, {userID: userID, scheduleName: oldScheduleName}, {$set: {scheduleName: newScheduleName}});
    // await update(names.exceptions, {userID: userID, scheduleName: oldScheduleName}, {$set: {scheduleName: newScheduleName}});
    await update(names.events, {userID: userID, scheduleName: oldScheduleName}, {$set: {scheduleName: newScheduleName}});
    await update(names.categories, {userID: userID, scheduleName: oldScheduleName}, {$set: {scheduleName: newScheduleName}});
	await update(names.plans, {userID: userID, scheduleName: oldScheduleName}, {$set: {scheduleName: newScheduleName}});
}

async function addPerson(userID, scheduleName, name, categories={}) {
	let query = {$set: {}};
    query["$set"][`people.${name}`] = people_personSchema(categories);
	await update(names.people, {userID: userID, scheduleName: scheduleName}, query);
}

async function removePerson(userID, scheduleName, name) {
	let query = {$unset: {}};
	query["$unset"][`people.${name}`] = "";
	await update(names.people, {userID: userID, scheduleName: scheduleName}, query);
}

async function changePersonName(userID, scheduleName, oldName, newName) {
	let person = (await readPeopleRecord(userID, scheduleName)).people[oldName];
	await removePerson(userID, scheduleName, oldName);
	await addPerson(userID, scheduleName, newName, categories=person.categories, week=person.week, exceptions=person.exceptions);
}

async function changePersonCategories(userID, scheduleName, name, newCategories) {
	let query = {$set: {}};
	query["$set"][`people.${name}.categories`] = newCategories;
	await update(names.people, {userID: userID, scheduleName: scheduleName}, query);
}

async function changePersonWeek(userID, scheduleName, name, newWeek) {
	let query = {$set: {}};
	query["$set"][`people.${name}.week`] = newWeek;
	await update(names.people, {userID: userID, scheduleName: scheduleName}, query);
}

async function changePersonExceptions(userID, scheduleName, name, newExceptions) {
	let query = {$set: {}};
	query["$set"][`people.${name}.exceptions`] = newExceptions;
	await update(names.people, {userID: userID, scheduleName: scheduleName}, query);
}

async function addPersonAvailability(userID, scheduleName, name, utcStart, utcEnd, timezone, rrule) {
    const newAvailability = people_availabilitySchema(utcStart, utcEnd, timezone, rrule);
    let query = {$push: {}};
    query["$push"][`people.${name}.availabilities`] = {$each: [newAvailability], $sort: {start: 1}};
    await update(names.people, {userID: userID, scheduleName: scheduleName}, query);
}

// async function addPersonException(userID, scheduleName, name, utcStart, utcEnd, available, description) {
//     let exceptions = (await readPeopleRecord(userID, scheduleName)).people[name].exceptions;
// 	let newExceptions = rangeMerge(people_exceptionSchema(utcStart, utcEnd, available, description), exceptions, "start", "end");
// 	await changePersonExceptions(userID, scheduleName, name, newExceptions);
// }

async function changePersonAvailability(userID, scheduleName, name, index, utcStart, utcEnd, timezone, rrule) {
    const newAvailability = people_availabilitySchema(utcStart, utcEnd, timezone, rrule);
    let query = {$set: {}};
    query["$set"][`people.${name}.availabilities.${index}`] = newAvailability;
    await update(names.people, {userID: userID, scheduleName: scheduleName}, query);
    query = {$push: {}};
    query["$push"][`people.${name}.availabilities`] = {$each: [], $sort: {start: 1}};
    await update(names.people, {userID: userID, scheduleName: scheduleName}, query);
}

async function removePersonAvailability(userID, scheduleName, name, index) {
	let availabilities = (await readPeopleRecord(userID, scheduleName)).people[name].availabilities;
	availabilities.splice(index, 1);
	let query = {$set: {}};
	query["$set"][`people.${name}.availabilities`] = availabilities;
	await update(names.people, {userID: userID, scheduleName: scheduleName}, query);
}

async function removePersonException(userID, scheduleName, name, index) {
	let exceptions = (await readPeopleRecord(userID, scheduleName)).people[name].exceptions;
	exceptions.splice(index, 1);
	let query = {$set: {}};
	query["$set"][`people.${name}.exceptions`] = exceptions;
	await update(names.people, {userID: userID, scheduleName: scheduleName}, query);
}

async function addTask(userID, scheduleName, name, category) {
	let query = {$set: {}};
	query["$set"][`tasks.${name}`] = tasks_taskSchema(category);
	await update(names.tasks, {userID: userID, scheduleName: scheduleName}, query);
}

async function removeTask(userID, scheduleName, name) {
	let query = {$unset: {}};
	query["$unset"][`tasks.${name}`] = "";
	await update(names.tasks, {userID: userID, scheduleName: scheduleName}, query);
}

async function changeTaskName(userID, scheduleName, oldName, newName) {
	let category = (await readTasksRecord(userID, scheduleName)).tasks[oldName];
	await removeTask(userID, scheduleName, oldName);
	await addTask(userID, scheduleName, newName, category);
}

async function changeTaskCategory(userID, scheduleName, name, category) {
	let query = {$set: {}};
	query["$set"][`tasks.${name}`] = category;
	await update(names.tasks, {userID: userID, scheduleName: scheduleName}, query);
}

async function addWeekJob(userID, scheduleName, utcStart, utcEnd, taskName, category) {
    let normalizedStart = weekMillis(utcStart);
    let normalizedEnd = weekMillis(utcEnd);
    let newJob = week_jobSchema(normalizedStart, normalizedEnd, taskName, category);
    let jobs = (await readWeekRecord(userID, scheduleName)).week;
    jobs.push(newJob);
    jobs = sortRangedObjectArray(jobs);
	await update(names.week, {userID: userID, scheduleName: scheduleName}, {$set: {week: jobs}});
}

async function removeWeekJob(userID, scheduleName, index) {
	let jobs = (await readWeekRecord(userID, scheduleName)).week;
	jobs.splice(index, 1);
	await update(names.week, {userID: userID, scheduleName: scheduleName}, {$set: {week: jobs}});
}

async function addException(userID, scheduleName, utcStart, utcEnd, description, jobs) {
    let exceptions = (await readExceptionsRecord(userID, scheduleName)).exceptions;
    let newException = exceptions_exceptionSchema(utcStart, utcEnd, description, jobs);
    if (!overlapSearch(newException, exceptions, "start", "end")) {
        exceptions.push(newException);
        exceptions = sortRangedObjectArray(exceptions);
        await update(names.exceptions, {userID: userID, scheduleName: scheduleName}, {$set: {exceptions: exceptions}});
    }
}

async function removeException(userID, scheduleName, index) {
	let exceptions = (await readExceptionsRecord(userID, scheduleName)).exceptions;
	exceptions.splice(index, 1);
	await update(names.exceptions, {userID: userID, scheduleName: scheduleName}, {$set: {exceptions: exceptions}});
}

async function exceptionChangeDescription(userID, scheduleName, index, newDescription) {
	let query = {$set: {}};
	query["$set"][`exceptions.${index}.description`] = newDescription;
	await update(names.exceptions, {userID: userID, scheduleName: scheduleName}, query);
}

async function exceptionShiftDate(userID, scheduleName, index, newUtcStart) {
    let exceptions = (await readExceptionsRecord(userID, scheduleName)).exceptions;
    const difference = newUtcStart - exceptions[index].start;
    let jobs = exceptions[index].jobs.map(function(job) {return exceptions_jobSchema(
        job.start + difference, 
        job.end + difference,
        job.taskName,
        job.category
    )});
    exceptions[index].start = newUtcStart;
    exceptions[index].end = exceptions[index].end + difference;
    exceptions[index].jobs = jobs;
    exceptions = sortRangedObjectArray(exceptions);
	await update(names.exceptions, {userID: userID, scheduleName: scheduleName}, {$set: {exceptions: exceptions}});
}

async function exceptionChangeStart(userID, scheduleName, index, newUtcStart) {
    let exceptions = (await readExceptionsRecord(userID, scheduleName)).exceptions;
    if (newUtcStart >= exceptions[index].end) {
        await removeException(userID, scheduleName, index);
    }
    else {
        let jobs = exceptions[index].jobs;
        let newJobs = [];
        for (let i = 0; i < jobs.length; i++) {
            if (jobs[i].end > newUtcStart) {
                if (jobs[i].start < newUtcStart) {
                    newJobs.push(exceptions_jobSchema(newUtcStart, jobs[i].end, jobs[i].taskName, jobs[i].category));
                }
                else {
                    newJobs.push(jobs[i]);
                }
            }
        }
        exceptions[index].start = newUtcStart;
        exceptions[index].jobs = newJobs;
        exceptions = sortRangedObjectArray(exceptions);
        await update(names.exceptions, {userID: userID, scheduleName: scheduleName}, {$set: {exceptions: exceptions}});
    }
}

async function exceptionChangeEnd(userID, scheduleName, index, newUtcEnd) {
    let exceptions = (await readExceptionsRecord(userID, scheduleName)).exceptions;
    if (newUtcEnd <= exceptions[index].start) {
        await removeException(userID, scheduleName, index);
    }
    else {
        let jobs = exceptions[index].jobs;
        let newJobs = [];
        for (let i = 0; i < jobs.length; i++) {
            if (jobs[i].start < newUtcEnd) {
                if (jobs[i].end > newUtcEnd) {
                    newJobs.push(exceptions_jobSchema(jobs[i].start, newUtcEnd, jobs[i].taskName, jobs[i].category));
                }
                else {
                    newJobs.push(jobs[i]);
                }
            }
        }
        exceptions[index].start = newUtcStart;
        exceptions[index].jobs = newJobs;
        await update(names.exceptions, {userID: userID, scheduleName: scheduleName}, {$set: {exceptions: exceptions}});
    }
}

async function exceptionAddJob(userID, scheduleName, index, utcStart, utcEnd, taskName, category) {
    if (utcStart < utcEnd) {
        let exception = (await readExceptionsRecord(userID, scheduleName)).exceptions[index];
        let newStart = utcStart;
        let newEnd = utcEnd;
        if (newStart < exception.start) {
            newStart = exception.start;
        }
        if (newEnd > exception.end) {
            newEnd = exception.end;
        }
        let newJob = exceptions_jobSchema(newStart, newEnd, taskName, category);
        let jobs = (await readExceptionsRecord(userID, scheduleName)).exceptions[index].jobs;
        jobs.push(newJob);

        jobs = sortRangedObjectArray(jobs);
        let query = {$set: {}};
        query["$set"][`exceptions.${index}.jobs`] = jobs;
        await update(names.exceptions, {userID: userID, scheduleName: scheduleName}, query);
    }
}

async function exceptionRemoveJob(userID, scheduleName, index, jobIndex) {
	let exception = (await readExceptionsRecord(userID, scheduleName)).exceptions[index];
	exception.jobs.splice(jobIndex, 1);
	query = {$set: {}};
	query["$set"][`exceptions.${index}`] = exception;
	await update(names.exceptions, {userID: userID, scheduleName: scheduleName}, query);

}

async function addPlan(userID, scheduleName, utcStart, utcEnd, personName, taskName, category) {
    let newPlan = plans_planSchema(utcStart, utcEnd, personName, taskName, category);
    let plans = (await readPlansRecord(userID, scheduleName)).plans;
    plans.push(newPlan);
    plans = sortRangedObjectArray(plans);
	await update(names.plans, {userID: userID, scheduleName: scheduleName}, {$set: {plans: plans}});
}

async function removePlan(userID, scheduleName, index) {
	let plans = (await readPlansRecord(userID, scheduleName)).plans;
	plans.splice(index, 1);
	await update(names.plans, {userID: userID, scheduleName: scheduleName}, {$set: {plans: plans}});
}

async function updatePlans(userID, scheduleName, plans) {
	await update(names.plans, {userID: userID, scheduleName: scheduleName}, {$set: {plans: plans}});
}

async function accountExists(email) {
	let userData = await read(names.userData, {email: email});
	if (userData !== null) {
		return true;
	}
	else {
		return false;
	}
}

async function addCategory(userID, scheduleName, category) {
    query = {$set: {}};
	query["$set"][`categories.${category}`] = "";
    await update(names.categories, {userID: userID, scheduleName: scheduleName}, query);
}

// Stripe
async function readStripeCustomerID(userID) {
    const currentRecord = await read(names.stripe, {userID: userID});
    if (currentRecord) {
        return currentRecord.customerId;
    }
    else {
        return null;
    }
}

async function readUserIDfromCustomerId(customerId) {
    const currentRecord = await read(names.stripe, {customerId: customerId});
    if (currentRecord) {
        return currentRecord.userID;
    }
    else {
        return null;
    }
}

async function createStripeCustomerRecord(userID, customerId) {
    const currentId = await readStripeCustomerID(userID);
    if (!currentId) {
        await create(names.stripe, {userID: userID, customerId: customerId});
    }
}

module.exports = {
    connect: connect,

    // Base Level Functions
    create: create,
    read: read,
    
    plans_planSchema: plans_planSchema,

	createEmailValidationRecord: createEmailValidationRecord,
	createUserDataRecord: createUserDataRecord,
	createScheduleRecord: createScheduleRecord,
	createPeopleRecord: createPeopleRecord,
	// createTasksRecord: createTasksRecord,
	// createWeekRecord: createWeekRecord,
    // createExceptionsRecord: createExceptionsRecord,
    createEventsRecord: createEventsRecord,
    createCategoriesRecord: createCategoriesRecord,
	createPlansRecord: createPlansRecord,
	createAccount: createAccount,
	createOnlineRecord: createOnlineRecord,
	
	removeUserDataRecord: removeUserDataRecord,
	removeEmailValidationRecord: removeEmailValidationRecord,
	removeScheduleRecord: removeScheduleRecord,
	removePeopleRecord: removePeopleRecord,
    // removeTasksRecord: removeTasksRecord,
	// removeWeekRecord: removeWeekRecord,
    // removeExceptionsRecord: removeExceptionsRecord,
    // removeEventsRecord: removeEventsRecord,
    // removeCategoriesRecord: removeCategoriesRecord,
	removePlansRecord:  removePlansRecord,
    removeOnlineRecord: removeOnlineRecord,
    clearDatabase: clearDatabase,
	
	readUserDataRecord: readUserDataRecord,
	readUserDataRecordFromID: readUserDataRecordFromID,
	readEmailValidationRecord: readEmailValidationRecord,
	readEmailValidationRecordFromEmail: readEmailValidationRecordFromEmail,
	readScheduleRecord: readScheduleRecord,
	readPeopleRecord: readPeopleRecord,
	// readTasksRecord: readTasksRecord,
	// readWeekRecord: readWeekRecord,
    // readExceptionsRecord: readExceptionsRecord,
    readEventsRecord: readEventsRecord,
    readCategoriesRecord: readCategoriesRecord,
	readPlansRecord:  readPlansRecord,
    readOnlineRecord: readOnlineRecord,
    getSessionID: getSessionID,
    readRandomScheduleRecord: readRandomScheduleRecord,

    isLoggedIn: isLoggedIn,
    isLoggedInEmail: isLoggedInEmail,
    userIDfromSessionID: userIDfromSessionID,
	changeUserDataEmail: changeUserDataEmail,
	changeUserDataPassword: changeUserDataPassword,
    changeUserDataTier: changeUserDataTier,
    changeUserDataLastUsedSchedule: changeUserDataLastUsedSchedule,
    changeUserDataStripeCustomerId: changeUserDataStripeCustomerId,
	changeScheduleName: changeScheduleName,
	addPerson: addPerson,
	removePerson: removePerson,
	changePersonName: changePersonName,
	changePersonCategories: changePersonCategories,
	changePersonWeek: changePersonWeek,
	changePersonExceptions: changePersonExceptions,
    addPersonAvailability: addPersonAvailability,
    changePersonAvailability: changePersonAvailability,
	// addPersonException: addPersonException,
	removePersonAvailability: removePersonAvailability,
	removePersonException: removePersonException,
	addTask: addTask,
	removeTask: removeTask,
	changeTaskName: changeTaskName,
	changeTaskCategory: changeTaskCategory,
	addWeekJob: addWeekJob,
	removeWeekJob: removeWeekJob,
	addException: addException,
	removeException: removeException,
    exceptionChangeDescription: exceptionChangeDescription,
    exceptionShiftDate: exceptionShiftDate, 
	exceptionChangeStart: exceptionChangeStart,
	exceptionChangeEnd: exceptionChangeEnd,
	exceptionAddJob: exceptionAddJob,
	exceptionRemoveJob: exceptionRemoveJob,
	addPlan: addPlan,
	removePlan: removePlan,
	updatePlans: updatePlans,
    accountExists: accountExists,
    addCategory: addCategory,
    
    // Stripe
    readStripeCustomerID: readStripeCustomerID,
    readUserIDfromCustomerId: readUserIDfromCustomerId,
    createStripeCustomerRecord: createStripeCustomerRecord
};