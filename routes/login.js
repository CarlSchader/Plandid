const express = require('express');
const nodemailer = require('nodemailer');
const { mongodbConfig, emailConfig, appName, url, indexHTMLPath } = require('../config');
const database = require('../database');

const router = express.Router();

function scheduleSchema(email, password, number, name) {
    return {
        email: email,
        password: password, 
        number: number,
        name: name,
        people: [],
        tasks: [],
        weekly: [[], [], [], [], [], [], []],
        exceptions: {}
    };
}

function sendEmail(to, subject, html, from = emailConfig.address, password = emailConfig.password, service = emailConfig.service) {
    let transporter = nodemailer.createTransport({
        service: service,
        auth: {
          user: from,
          pass: password
        }
      });
      
      let mailOptions = {
        from: from,
        to: to,
        subject: subject,
        html: html
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        }
      });
}

function emailString(key) {
    return `
    <!doctype html>
    <html lang="en">
      <head>
        <title>Trek</title>
      </head>
      <body>
          <meta charset="utf-8"/>
          <p>
          Click this button to confirm account creation.
        </p>
        <form action="${url}/login/confirmAccountkey" method="get">
            <input type="hidden" name="key" value="${key}" />
            <input type="submit" value="Confirm">
        </form>
      </body>
    </html>
    `;
}

router.post('/signUp', async function(req, res) {
    let result = await database.read(mongodbConfig.userDataCollectionName, {email: req.body.email})
    if (result === null) { // Email not in database.
        // If the validation email has been sent for this email already delete the other values in the db.
        if (await database.read(mongodbConfig.emailValidationCollectionName, {email: req.body.email}) !== null) {
            await database.deleteMany(mongodbConfig.emailValidationCollectionName, {email: req.body.email})
        }

        let key = [...Array(10)].map(i=>[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"][Math.random()*[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"].length|0]).join``; // Random string generator
        // Check to make sure key is unique
        while (await database.read(mongodbConfig.emailValidationCollectionName, {key: key}) !== null) {
            key = [...Array(10)].map(i=>[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"][Math.random()*[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"].length|0]).join``; 
        }
        let validationObject = {
            createdAt: new Date(),
            key: key,
            email: req.body.email,
            password: req.body.password
        };
        await database.create(mongodbConfig.emailValidationCollectionName, validationObject);
        sendEmail(req.body.email, `Welcome to ${appName}`, emailString(key));
        res.json(0);
    }
    else { // 1: Email is already in database.
        res.json(1);
    }
});

router.post('/login', function(req, res) {
    database.read(mongodbConfig.userDataCollectionName, req.body)
    .then(function(result) {
        if (result !== null) { // 0: Account exists and password is correct.
            req.session.user = result;
            req.session.save();
            res.json(0);
        }
        else { // 1: Account either doesn't exist or password is incorrect.
            res.json(1)
        }
    })
    .catch(function(error) { // 2: Error reading from database.
        res.json(2);
    });
});

router.get('/confirmAccount*', async function(req, res) {
    let userData = await database.read(mongodbConfig.emailValidationCollectionName, {key: req.query.key});
    if (userData !== null) {
        await database.delete(mongodbConfig.emailValidationCollectionName, userData);
        await database.create(mongodbConfig.userDataCollectionName, {email: userData.email, password: userData.password});
        await database.create(mongodbConfig.schedulesCollectionName, scheduleSchema(userData.email, userData.password, 0, "Schedule 1"));
        req.session.user = userData;
        req.session.save();
        console.log(`Created new user: ${userData.email}, ${userData.password}`);
    }
    res.redirect('/Calendar');
});

module.exports = router;