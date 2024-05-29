const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const userRouter = require('./routers/user.js')
const app = express();
const port = 3005;

const http = require('http');
const server = http.createServer(app);
const ejs = require("ejs")


// EJS 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 세션 설정
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));



app.get('/', (req,res) => {
    res.render('index');
})

app.use('/', userRouter); // '/' 경로에 대해 userRouter를 사용


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});