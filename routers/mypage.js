const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/profile', function (req, res) {
    res.render('mypage/profile'); // profile.ejs 파일을 렌더링
});



module.exports = router;

