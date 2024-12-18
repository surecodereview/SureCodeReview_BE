const express = require('express');
const router = express.Router();
const { getRemoteBranches, getRemoteCommits, getRemoteChanges } = require('../services/gitRemoteService');

router.get('/branches', async (req, res) => {
    try {
        const { owner, repo } = req.query;
        if (!owner || !repo) {
            return res.status(400).json({ error: 'Owner and repo are required' });
        }
        const response = await getRemoteBranches(owner, repo);
        if (response && Array.isArray(response)) {
            const branches = response;
            res.json(branches);
        } else {
            res.status(500).json({ error: 'Invalid response from getRemoteBranches' });
        }
    } catch (error) {
        console.error('Error fetching branches:', error);
        res.status(500).json({ error: 'Failed to fetch branches' });
    }
});

router.get('/commits', async (req, res) => {
    try {
        const { owner, repo, branch } = req.query;
        if (!owner || !repo || !branch) {
            return res.status(400).json({ error: 'Owner, repo, and branch are required' });
        }
        const commits = await getRemoteCommits(owner, repo, branch);
        res.json(commits);
    } catch (error) {
        console.error('Error fetching commits:', error);
        res.status(500).json({ error: 'Failed to fetch commits' });
    }
});

router.get('/changes', async (req, res) => {
    try {
        const { owner, repo, commitIds } = req.query;

        if (!owner || !repo || !commitIds) {
            return res.status(400).json({ error: 'Owner, repo, and commitIds are required' });
        }

        const parsedCommitIds = commitIds.split(',');
        const diffs = await getRemoteChanges(owner, repo, parsedCommitIds);
        res.json(diffs);
    } catch (error) {
        console.error('Error fetching diffs:', error);
        res.status(500).json({ error: 'Failed to fetch diffs' });
    }
});

module.exports = router;
