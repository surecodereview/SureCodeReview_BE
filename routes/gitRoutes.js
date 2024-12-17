const express = require('express');
const router = express.Router();
const { getBranches, getCommits, getChanges, normalizePath } = require('../services/gitService');

router.get('/branches', async (req, res) => {
    const { path } = req.query;
    if (!path) {
        return res.status(400).send("Repository path is required");
    }

    try {
        const normalizedPath = normalizePath(path);
        const branches = await getBranches(normalizedPath);
        res.json({ branches });
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/commits/:branch', async (req, res) => {
    const { branch } = req.params;
    const { path } = req.query;
    if (!path) {
        return res.status(400).send("Repository path is required");
    }

    try {
        const normalizedPath = normalizePath(path);
        const commits = await getCommits(normalizedPath, branch);
        res.json({ commits });
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/changes', async (req, res) => {
    const { commitIds, path } = req.query;

    if (!commitIds || !path) {
        return res.status(400).send("Commit IDs and repository path are required");
    }

    try {
        const normalizedPath = normalizePath(path);
        const commitIdsArray = commitIds.split(',');
        const changes = await getChanges(normalizedPath, commitIdsArray);
        res.json({ changes });
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
