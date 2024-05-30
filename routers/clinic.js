const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/clinic', function (req, res) {
    res.render('clinic'); // clinic.ejs 파일을 렌더링
});



module.exports = router;