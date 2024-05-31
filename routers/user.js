const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('user/register'); // 'views/user/register.ejs' 파일을 렌더링
});

router.get('/login', function (req, res) {
  res.render('user/login'); // login.ejs 파일을 렌더링
});

module.exports = router;



