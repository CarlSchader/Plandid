const express = require('express');
const router = express.Router();

router.post('/signUp', function(req, res) {
    console.log(req.body);
    res.send({'hi': 'hi'});
});

router.post('/login', function(req, res) {
    console.log(req.body);
    res.send({'hi': 'hi'});
});

module.exports = router;