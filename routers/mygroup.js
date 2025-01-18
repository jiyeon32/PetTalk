const express = require('express');
const router = express.Router();
const Group = require('../models/Group');

// 그룹 목록 렌더링
router.get('/group', async (req, res) => {
  try {
    const groups = await Group.find(); // MongoDB에서 그룹 데이터 가져오기
    res.render('groups/group', { groups }); // EJS에 그룹 데이터 전달
  } catch (error) {
    console.error('그룹 목록 조회 오류:', error.message);
    res.status(500).send('서버 오류로 그룹 데이터를 가져올 수 없습니다.');
  }
});

// 그룹 생성 처리
router.post('/group', async (req, res) => {
  const { name, region, description } = req.body;

  if (!name || !region || !description) {
    return res.status(400).send('모든 필드를 입력해주세요.');
  }

  try {
    const group = new Group({ name, region, description });
    await group.save(); // MongoDB에 그룹 데이터 저장
    res.redirect('/group'); // 그룹 생성 후 목록 페이지로 리다이렉트
  } catch (error) {
    console.error('그룹 생성 오류:', error.message);
    res.status(500).send('서버 오류로 그룹을 생성할 수 없습니다.');
  }
});

// 그룹 상세 페이지
router.get('/group/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members.userId', 'nickname');
    if (!group) {
      return res.status(404).send('그룹을 찾을 수 없습니다.');
    }
    res.render('groups/groupDetail', { group });
  } catch (error) {
    console.error('그룹 상세 조회 오류:', error.message);
    res.status(500).send('서버 오류로 그룹 데이터를 가져올 수 없습니다.');
  }
});

// 그룹 가입 신청
router.post('/group/:id/join', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).send('그룹을 찾을 수 없습니다.');
    }

    const userId = req.session.userId; // 세션에서 사용자 ID 가져오기
    if (!userId) {
      return res.status(401).send('로그인이 필요합니다.');
    }

    if (group.members.some(member => member.userId.toString() === userId)) {
      return res.status(400).send('이미 그룹에 가입된 사용자입니다.');
    }

    group.members.push({ userId });
    await group.save();

    res.redirect(`/group/${group._id}`); // 가입 후 상세 페이지로 리다이렉트
  } catch (error) {
    console.error('그룹 가입 오류:', error.message);
    res.status(500).send('서버 오류로 그룹 가입을 처리할 수 없습니다.');
  }
});

module.exports = router;