const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/singup', function (req, res) {
    res.render('singup'); // singup.ejs 파일을 렌더링
});

router.get('/login', function (req, res) {
  res.render('login'); // login.ejs 파일을 렌더링
});

module.exports = router;



