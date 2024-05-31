const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/notice', function (req, res) {
    res.render('notice'); // notice.ejs 파일을 렌더링
});

router.get('/post', function (req, res) {
    res.render('post'); // post.ejs 파일을 렌더링
});

module.exports = router;