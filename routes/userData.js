const express = require('express');
const router = express.Router();

router.post("/getTier", async function(req, res) {
    res.json(req.body.tier);
})

module.exports = router;