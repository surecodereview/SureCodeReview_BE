const { exec, spawn, execSync } = require('child_process');

const getBranches = (repoPath) => {
    return new Promise((resolve, reject) => {
        exec(`git -C "${repoPath}" branch`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${stderr}`);
            }
            const branches = stdout.split('\n').map(branch => branch.replace('* ', '').trim()).filter(Boolean);
            resolve(branches);
        });
    });
};

const getCommits = (repoPath, branch) => {
    return new Promise((resolve, reject) => {
        exec(`git -C "${repoPath}" log ${branch} --pretty=format:"%h - %an, %s"`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${stderr}`);
            }
            const commits = stdout.split('\n').filter(Boolean);
            resolve(commits);
        });
    });
};

const getCommitTimestamp = (repoPath, commitId) => {
    const command = `git -C "${repoPath}" show -s --format=%ct ${commitId}`;
    return parseInt(execSync(command).toString().trim());
};

const getChanges = (repoPath, commitIds) => {
    return new Promise(async (resolve, reject) => {
        try {
            const changes = [];

            for (const id of commitIds) {
                const command = `git`;
                const args = ['-C', repoPath, 'diff', `${id}^`, id];
                const gitProcess = spawn(command, args);

                let stdout = '';
                let stderr = '';

                gitProcess.stdout.on('data', (data) => {
                    stdout += data.toString();
                });

                gitProcess.stderr.on('data', (data) => {
                    stderr += data.toString();
                });

                await new Promise((resolveProcess, rejectProcess) => {
                    gitProcess.on('close', (code) => {
                        if (code !== 0) {
                            console.error(`Error for commit ${id}: ${stderr}`);
                            rejectProcess(`Error for commit ${id}: ${stderr}`);
                        } else {
                            const timestamp = getCommitTimestamp(repoPath, id);
                            changes.push({ id, changes: stdout, timestamp });
                            resolveProcess();
                        }
                    });
                });
            }

            changes.sort((a, b) => b.timestamp - a.timestamp);
            resolve(changes);
        } catch (error) {
            console.error(`Error: ${error}`);
            reject(`Error: ${error}`);
        }
    });
};

const normalizePath = (path) => {
    return path.replace(/\\/g, '/');
};

module.exports = {
    getBranches,
    getCommits,
    getChanges,
    normalizePath
};
