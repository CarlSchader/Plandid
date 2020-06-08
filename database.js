const {MongoClient} = require('mongodb');
const {mongodbConfig} = require('./config');

const client = new MongoClient(mongodbConfig.uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = {
	connect: async function() {
		try {
			await client.connect();
			return true;
		}
		catch(error) {
			console.error(error);
			return false;
		}
	},

	create: async function(collection, data) {
		return await client.db(mongodbConfig.databaseName).collection(collection).insertOne(data);
	},

	createMany: async function(collection, dataArray) {
		return await client.db(mongodbConfig.databaseName).collection(collection).insertMany(dataArray);
	},

	read: async function(collection, data) {
		return await client.db(mongodbConfig.databaseName).collection(collection).findOne(data);
	},

	readMany: async function(collection, data, limit=0) {
		const cursor = await client.db(mongodbConfig.databaseName).collection(collection).find(data)
		if (limit > 0) cursor.limit(limit);
		return await cursor.toArray();
	},

	update: async function(collection, objectToUpdate, updatedObject) {
		return await client.db(mongodbConfig.databaseName).collection(collection).updateOne(objectToUpdate, {$set: updatedObject});
	}
};