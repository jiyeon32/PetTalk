const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/mypage', function (req, res) {
    res.render('mypage'); // singup.ejs 파일을 렌더링
});



module.exports = router;

