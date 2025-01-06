const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const userRouter = require('./routers/user.js');
const mypageRouter = require('./routers/mypage.js');
const mypetRouter = require('./routers/mypet.js');
const mygroupRouter = require('./routers/mygroup.js');
const noticeRouter = require('./routers/notice.js');

const Post = require('./models/Post');
const Comment = require('./models/Comment');

const port = 3005;

const http = require('http');
const server = http.createServer(app);
const ejs = require("ejs");

// 몽고DB 연결
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://kangjy003482:0302@node.yinbt.mongodb.net/')
  .then(() => console.log('MongoDB가 연결되었습니다.'))
  .catch((err) => {
    console.error('MongoDB 연결 실패:', err);
    process.exit(1);  // 연결 실패 시 서버 종료
  });

// EJS 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 미들웨어 설정
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // 업로드 파일 제공

// 세션 설정
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,  // HTTPS 환경에서만 true로 설정
        httpOnly: true, // 클라이언트에서 쿠키에 접근하지 못하도록 설정
        maxAge: 24 * 60 * 60 * 1000  // 1일 동안 세션 유지
    }
}));

// 메인 페이지에서 카테고리별 인기 게시글 전달
app.get('/', async (req, res) => {
  try {
    // 각 카테고리별 상위 5개 게시글 가져오기
    const categories = ['자유게시판', '정보게시판', '리뷰게시판', '질문게시판'];
    const popularPosts = {};

    for (const category of categories) {
      popularPosts[category] = await Post.find({ category })
        .populate('author')
        .populate('comments')
        .sort({ 'comments.length': -1 }) // 댓글 수 기준으로 정렬
        .limit(5);
    }

    res.render('index', {
      userId: req.session.userId,
      nickname: req.session.nickname,
      popularPosts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('메인 페이지 데이터를 불러오는 중 오류가 발생했습니다.');
  }
});

// 세션 데이터를 res.locals에 전달
app.use((req, res, next) => {
  res.locals.userId = req.session.userId || null;
  res.locals.nickname = req.session.nickname || null;
  next();
});

// 라우터 설정
app.use('/', userRouter);
app.use('/', mypageRouter);
app.use('/', mypetRouter);
app.use('/', mygroupRouter);
app.use('/', noticeRouter);
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// 서버 시작
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
