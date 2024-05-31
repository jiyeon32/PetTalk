const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

// 회원가입 페이지 렌더링
router.get('/register', (req, res) => {
  res.render('user/register'); 
});

// 로그인 페이지 렌더링
router.get('/login', function (req, res) {
  res.render('user/login'); 
});



// 회원가입 요청 처리
router.post('/register', userController.registerUser);

// 로그인 요청 처리
router.post('/login', userController.loginUser);

// 로그아웃 처리
router.get('/logout', (req, res) => {
  req.session.destroy(); // 세션 종료
  res.redirect('/');
});


module.exports = router;

