const express = require('express');
const path = require('path');
const config = require('../config');
const database = require('../database');

const router = express.Router();

router.post('/signUp', function(req, res) {
    
});

router.post('/login', function(req, res) {
    console.log(req.body);
    res.sendStatus(200);
});

module.exports = router;