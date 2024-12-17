const express = require('express');
const router = express.Router();
const { reviewCode } = require('../services/reviewService');

router.post('/review', async (req, res) => {
    const changes = req.body.changes;
    if (!Array.isArray(changes) || changes.length === 0) {
        return res.status(400).send("Invalid input: expected non-empty array of changes");
    }

    try {
        const reviewResults = await Promise.all(changes.map(async (change) => {
            const review = await reviewCode(change.changes);
            return { id: change.id, review };
        }));

        res.json({ reviews: reviewResults });
    } catch (error) {
        console.error('Error in /api/review:', error);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;
