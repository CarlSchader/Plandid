module.exports = {
    port: 8000,
    url: 'http://localhost:8000',
    clientBuildPath: require('path').join(__dirname, 'client', 'build'),
    indexHTMLPath: require('path').join(__dirname, 'client', 'build', 'index.html'),
    mongodbConfig: {
		username: 'mongoTrek',
		password: 'RedGreenBlue@1',
		uri: 'mongodb+srv://mongoTrek:RedGreenBlue@1@trek-9zavu.mongodb.net/test?retryWrites=true&w=majority',
		databaseName: 'Trek'
	}
};