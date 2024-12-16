const express = require('express');
const { exec } = require('child_process'); // Git 명령어 실행을 위한 모듈
const app = express();
const port = 8080;
const { spawn } = require('child_process');

// 특정 레포지토리 경로
const repoPath = 'C:\\Users\\user\\Desktop\\SureCodeReview\\SureCodeReview_FE'; // 여기에 레포지토리 경로를 입력하세요.

// 모든 브랜치 목록을 가져오는 함수
const getBranches = () => {
    return new Promise((resolve, reject) => {
        exec(`git -C ${repoPath} branch`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${stderr}`);
            }
            const branches = stdout.split('\n').map(branch => branch.replace('* ', '').trim()).filter(Boolean);
            resolve(branches);
        });
    });
};

// 특정 브랜치의 커밋 리스트를 가져오는 함수
const getCommits = (branch) => {
    return new Promise((resolve, reject) => {
        exec(`git -C ${repoPath} log ${branch} --pretty=format:"%h - %an, %s"`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${stderr}`);
            }
            const commits = stdout.split('\n').filter(Boolean);
            resolve(commits);
        });
    });
};


// 특정 커밋의 변경 사항을 가져오는 함수
const getChanges = (commitIds) => {
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

                gitProcess.on('close', (code) => {
                    if (code !== 0) {
                        reject(`Error: ${stderr}`);
                    } else {
                        changes.push({ id, changes: stdout });
                        if (changes.length === commitIds.length) {
                            resolve(changes);
                        }
                    }
                });
            }
        } catch (error) {
            console.error(`Error: ${error}`);
            reject(`Error: ${error}`);
        }
    });
};




// 해당하는 레포지토리의 로컬 브랜치 목록 반환 API
app.get('/api/branches', async (req, res) => {
    try {
        const branches = await getBranches();
        res.json({ branches });
    } catch (error) {
        res.status(500).send(error);
    }
});

// 특정 브랜치의 커밋 리스트 반환 API
app.get('/api/commits/:branch', async (req, res) => {
    const { branch } = req.params;
    try {
        const commits = await getCommits(branch);
        res.json({ commits });
    } catch (error) {
        res.status(500).send(error);
    }
});

// 선택한 커밋의 변경 사항 반환 API
app.get('/api/changes', async (req, res) => {
    const commitIds = ['bde9b3e', '0cb510e', '18ad2b2'];
    // const { commitIds } = req.body;
    try {
        const changes = await getChanges(commitIds);
        res.json({ changes });
    } catch (error) {
        res.status(500).send(error);
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
