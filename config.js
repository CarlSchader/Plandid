module.exports = {
    appName: 'Plandid',
    port: 80,
    url: 'http://carlschader.com',
    clientBuildPath: require('path').join(__dirname, 'client', 'build'),
    indexHTMLPath: require('path').join(__dirname, 'client', 'build', 'index.html'),
    sessionSecret: [...Array(10)].map(i=>[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"][Math.random()*[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"].length|0]).join``,
    
    mongodbConfig: {
		username: 'SchedulerUser',
		password: 'RedGreenBlue@1',
		uri: 'mongodb+srv://SchedulerUser:RedGreenBlue@1@schedulercluster-7jjoi.mongodb.net/Scheduler?retryWrites=true&w=majority',
        databaseName: 'Scheduler',
        idLength: 24,
        collectionNames: {
            userData: 'UserData',
            emailValidation: 'EmailValidation',
            schedule: 'Schedule',
            exceptions: 'Exceptions',
            people: 'People',
            plans: 'Plans',
            tasks: 'Tasks',
            week: 'Week',
            online: 'Online'   
        }
    },

    emailConfig: {
        service: 'gmail',
        address: 'carlwschader@gmail.com',
        password: 'dncrqgxuljgkhgms'
    }
};
