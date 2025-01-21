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
  const userId = req.session.userId; // 현재 로그인된 사용자 ID

  if (!name || !region || !description) {
    return res.status(400).send('모든 필드를 입력해주세요.');
  }

  try {
    const group = new Group({
      name,
      region,
      description,
      createdBy: userId, // 그룹 생성자를 저장
      members: [{ userId, role: 'admin' }], // 생성자를 관리자로 지정
    });

    await group.save();
    res.redirect('/group'); // 생성 후 목록 페이지로 리다이렉트
  } catch (error) {
    console.error('그룹 생성 오류:', error.message);
    res.status(500).send('서버 오류로 그룹을 생성할 수 없습니다.');
  }
});


// 그룹 상세 페이지 (관리자 여부 추가)
router.get('/group/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members.userId', 'nickname');
    if (!group) {
      return res.status(404).send('그룹을 찾을 수 없습니다.');
    }

    const userId = req.session.userId; // 현재 로그인된 사용자 ID 가져오기
    const isAdmin = group.members.some(
      member => String(member.userId._id) === String(userId) && member.role === 'admin' // 관리자인지 확인
    );

    // groupDetail.ejs에 isAdmin 추가
    res.render('groups/groupDetail', { group, userId, isAdmin });
  } catch (error) {
    console.error('그룹 상세 조회 오류:', error.message);
    res.status(500).send('서버 오류로 그룹 데이터를 가져올 수 없습니다.');
  }
});


// 그룹 가입 신청
router.post('/group/:id/join', async (req, res) => {
  const userId = req.session.userId; // 현재 로그인된 사용자 ID

  try {
    if (!userId) {
      return res.status(401).send('로그인이 필요합니다.');
    }

    // 그룹 확인
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).send('그룹을 찾을 수 없습니다.');
    }

    // 중복 가입 체크
    const isAlreadyMember = group.members.some(member => String(member.userId) === String(userId));
    if (isAlreadyMember) {
      return res.status(400).send('이미 그룹에 가입된 사용자입니다.');
    }

    // 멤버 추가: members 배열만 업데이트
    await Group.updateOne(
      { _id: req.params.id },
      { $push: { members: { userId, role: 'member' } } }
    );

    res.redirect(`/group/${group._id}`); // 가입 후 상세 페이지로 리다이렉트
  } catch (error) {
    console.error('그룹 가입 오류:', error.message);
    res.status(500).send('서버 오류로 그룹 가입을 처리할 수 없습니다.');
  }
});



// 그룹 탈퇴 처리
router.post('/group/:id/leave', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).send('그룹을 찾을 수 없습니다.');
    }

    const userId = req.session.userId; // 세션에서 사용자 ID 가져오기
    if (!userId) {
      return res.status(401).send('로그인이 필요합니다.');
    }

    // 사용자 삭제 처리
    const memberIndex = group.members.findIndex(member => member.userId.toString() === userId);
    if (memberIndex === -1) {
      return res.status(400).send('그룹에 가입되지 않은 사용자입니다.');
    }

    group.members.splice(memberIndex, 1); // 해당 멤버 삭제
    await group.save();

    res.redirect(`/group/${group._id}`); // 탈퇴 후 그룹 상세 페이지로 리다이렉트
  } catch (error) {
    console.error('그룹 탈퇴 오류:', error.message);
    res.status(500).send('서버 오류로 그룹 탈퇴를 처리할 수 없습니다.');
  }
});

// 그룹 상세 페이지
router.get('/group/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members.userId', 'nickname');
    if (!group) {
      return res.status(404).send('그룹을 찾을 수 없습니다.');
    }

    const userId = req.session.userId;

    // 관리자 여부 확인 (예시: group.admin이 관리자의 userId)
    const isAdmin = group.admin.toString() === userId; // 관리자의 userId와 현재 로그인된 userId 비교

    res.render('groups/groupDetail', { group, userId, isAdmin }); // isAdmin 추가
  } catch (error) {
    console.error('그룹 상세 조회 오류:', error.message);
    res.status(500).send('서버 오류로 그룹 데이터를 가져올 수 없습니다.');
  }
});

// 그룹 수정 처리
router.post('/group/:id/edit', async (req, res) => {
  const { name, region, description } = req.body;
  const userId = req.session.userId;

  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).send('그룹을 찾을 수 없습니다.');
    }

    // 관리자 확인
    const isAdmin = group.members.some(
      member => String(member.userId) === String(userId) && member.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).send('관리자만 그룹 정보를 수정할 수 있습니다.');
    }

    group.name = name;
    group.region = region;
    group.description = description;
    await group.save();

    res.redirect(`/group/${group._id}`);
  } catch (error) {
    console.error('그룹 수정 오류:', error.message);
    res.status(500).send('서버 오류로 그룹 정보를 수정할 수 없습니다.');
  }
});

// 그룹 삭제 처리
router.post('/group/:id/delete', async (req, res) => {
  const userId = req.session.userId;

  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).send('그룹을 찾을 수 없습니다.');
    }

    // 관리자 확인
    const isAdmin = group.members.some(
      member => String(member.userId) === String(userId) && member.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).send('관리자만 그룹을 삭제할 수 있습니다.');
    }

    await group.remove();
    res.redirect('/group');
  } catch (error) {
    console.error('그룹 삭제 오류:', error.message);
    res.status(500).send('서버 오류로 그룹을 삭제할 수 없습니다.');
  }
});

// 일정 등록
router.post('/group/:id/schedules', async (req, res) => {
  const { title, date, description } = req.body;
  const userId = req.session.userId;

  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).send('그룹을 찾을 수 없습니다.');
    }

    // 관리자 확인
    const isAdmin = group.members.some(
      member => String(member.userId) === String(userId) && member.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).send('관리자만 일정을 추가할 수 있습니다.');
    }

    group.schedules.push({ title, date, description });
    await group.save();

    res.redirect(`/group/${group._id}`);
  } catch (error) {
    console.error('일정 추가 오류:', error.message);
    res.status(500).send('서버 오류로 일정을 추가할 수 없습니다.');
  }
});

// 일정 삭제
router.post('/group/:id/schedules/:scheduleId/delete', async (req, res) => {
  const userId = req.session.userId;

  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).send('그룹을 찾을 수 없습니다.');
    }

    // 관리자 확인
    const isAdmin = group.members.some(
      member => String(member.userId) === String(userId) && member.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).send('관리자만 일정을 삭제할 수 있습니다.');
    }

    group.schedules = group.schedules.filter(
      schedule => String(schedule._id) !== req.params.scheduleId
    );
    await group.save();

    res.redirect(`/group/${group._id}`);
  } catch (error) {
    console.error('일정 삭제 오류:', error.message);
    res.status(500).send('서버 오류로 일정을 삭제할 수 없습니다.');
  }
});




module.exports = router;