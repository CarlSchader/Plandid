const express = require('express');
const db = require('../database')
const router = express.Router();

// userID scheduleName
router.post("/getCategories", async function(req, res) {
    return res.json((await db.readCategoriesRecord(req.body.userID, req.body.scheduleName)).categories);
});

module.exports = router;