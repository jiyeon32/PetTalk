const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/posts', function (req, res) {
    res.render('post/posts'); // posts.ejs 파일을 렌더링
});

router.get('/new', function (req, res) {
    res.render('post/new'); // new.ejs 파일을 렌더링
});

module.exports = router;