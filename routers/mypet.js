const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/mypet', function (req, res) {
    res.render('pet/mypet'); // singup.ejs 파일을 렌더링
});


module.exports = router;
