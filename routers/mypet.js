const express = require('express');
const path = require('path');
const multer = require('multer');
const petController = require('../controllers/petController');
const router = express.Router();
const User = require('../models/User');
const Pet = require('../models/Pet');

router.get('/mypet', async (req, res) => {
  const { userId, nickname } = req.session;
  if (!userId) return res.status(401).send('로그인이 필요합니다.');

  try {
    // 사용자 정보 확인
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('사용자를 찾을 수 없습니다.');

    // 사용자의 반려동물 정보 가져오기
    const pets = await Pet.find({ owner: userId }); // `owner` 필드를 기준으로 사용자 반려동물 가져오기

    // 템플릿 렌더링 시 `pets` 데이터를 전달
    res.render('pet/mypet', { user, userId, nickname, pets });
  } catch (error) {
    console.error(error);
    res.status(500).send('서버 오류 발생');
  }
});

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // 파일 이름: 타임스탬프 + 확장자
  },
});
const upload = multer({ storage });

// 라우터 설정
router.get('/mypet', petController.getPetsByUser); // 사용자 반려동물 조회
router.post('/mypet', upload.single('photo'), petController.createPet); // 반려동물 등록
router.put('/mypet/:id', upload.single('photo'), petController.updatePet); // 반려동물 수정
router.delete('/mypet/:id', petController.deletePet); // 반려동물 삭제

module.exports = router;
