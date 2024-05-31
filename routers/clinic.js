const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/clinic', (req, res) => {
    res.render('clinic', {
        userId: req.session.userId,  // 세션 또는 로그인 정보에서 userId를 가져와 전달
        nickname: req.session.nickname  // 마찬가지로 nickname도 전달
    });
});



module.exports = router;