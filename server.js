const express = require('express');
const cors = require('cors');
const gitRoutes = require('./routes/gitRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

app.use('/api', gitRoutes);
app.use('/api', reviewRoutes);

app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
