require('dotenv').config();

const getRemoteBranches = (owner, repo) => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const branches = data.map(branch => branch.name);
                resolve(branches);
            })
            .catch(error => {
                reject(`Error: ${error.message}`);
            });
    });
};

const getRemoteCommits = async (owner, repo, branch) => {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}`;
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });

    if (!response.ok) {
        throw new Error(`GitHub API responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date
    }));
};

const getRemoteChanges = async (owner, repo, commitIds) => {
    const diffs = [];

    for (const id of commitIds) {
        const commitResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${id}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (!commitResponse.ok) {
            throw new Error(`Error fetching commit data for ${id}: ${commitResponse.statusText}`);
        }

        const commitData = await commitResponse.json();

        const diffResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${id}`, {
            headers: {
                'Accept': 'application/vnd.github.v3.diff',
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (!diffResponse.ok) {
            throw new Error(`Error fetching diff for commit ${id}: ${diffResponse.statusText}`);
        }

        const diff = await diffResponse.text();

        diffs.push({
            id,
            changes: diff,
            timestamp: new Date(commitData.commit.author.date).getTime() // 타임스탬프 변환
        });
    }

    diffs.sort((a, b) => a.timestamp - b.timestamp);

    return { changes: diffs };
};


module.exports = {
    getRemoteBranches,
    getRemoteCommits,
    getRemoteChanges
};
