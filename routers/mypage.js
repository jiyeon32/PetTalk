const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const userController = require('../controllers/userController');

router.put('/mypage', userController.updateUser);


// 사용자 프로필 페이지 렌더링
router.get('/profile', async (req, res) => {
  const { userId, nickname } = req.session;
  if (!userId) return res.status(401).send('로그인이 필요합니다.');

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('사용자를 찾을 수 없습니다.');

    res.render('mypage/profile', { user, userId, nickname });
  } catch (error) {
    console.error(error);
    res.status(500).send('서버 오류 발생');
  }
});

// 프로필 수정 요청 처리
router.post('/mypage/profile', userController.updateUser);

// 사용자 프로필 수정
const User = require('../models/User'); // User 모델을 불러옵니다.

router.get('/profile', async (req, res) => {
  const { userId, nickname } = req.session;
  if (!userId) return res.status(401).send('로그인이 필요합니다.');

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('사용자를 찾을 수 없습니다.');

    res.render('mypage/profile', { user, userId, nickname });
  } catch (error) {
    console.error(error);
    res.status(500).send('서버 오류 발생');
  }
});


module.exports = router;