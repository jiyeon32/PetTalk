const Group = require('../models/Group');

// 모든 그룹 조회
exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find(); // MongoDB에서 그룹 데이터 가져오기
        res.render('groups/group', { 
            groups, 
            userId: req.session.userId || null, // 세션에서 userId 가져오기
            nickname: req.session.nickname || null // 세션에서 nickname 가져오기
        });
    } catch (error) {
        console.error('그룹 조회 오류:', error.message);
        res.status(500).send('서버 오류로 그룹 데이터를 가져올 수 없습니다.');
    }
};


exports.createGroup = async (req, res) => {
    const { name, region, description } = req.body;
    const userId = req.user._id; // 현재 로그인한 사용자의 ID를 가져옵니다.

    // 입력값 검증
    if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: '그룹 이름은 최소 2글자 이상이어야 합니다.' });
    }
    if (!region || region.trim().length < 2) {
        return res.status(400).json({ message: '지역은 최소 2글자 이상이어야 합니다.' });
    }
    if (!description || description.trim().length < 5) {
        return res.status(400).json({ message: '그룹 설명은 최소 5글자 이상이어야 합니다.' });
    }

    try {
        // 그룹 생성 시 관리자(userId) 지정
        const group = new Group({
            name: name.trim(),
            region: region.trim(),
            description: description.trim(),
            createdBy: userId, // 그룹 생성자를 기록
            members: [{ userId, role: 'admin' }], // 생성자를 관리자로 추가
        });

        // 그룹 저장
        await group.save();

        // 성공 응답
        res.status(201).json({ success: true, data: group });
    } catch (error) {
        console.error('그룹 생성 오류:', error.message);
        res.status(500).json({ message: '그룹 생성 중 오류가 발생했습니다.', error: error.message });
    }
};



// 그룹 삭제
exports.deleteGroup = async (req, res) => {
    try {
        const group = await Group.findByIdAndDelete(req.params.id);
        if (!group) {
            return res.status(404).json({ message: '그룹을 찾을 수 없습니다.' });
        }
        res.status(200).json({ success: true, data: group, message: '그룹이 삭제되었습니다.' });
    } catch (error) {
        console.error('그룹 삭제 오류:', error.message);
        res.status(500).json({ message: '서버 오류로 그룹을 삭제할 수 없습니다.' });
    }
};

// 그룹에 멤버 추가
exports.addMemberToGroup = async (req, res) => {
    const { userId } = req.body;

    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: '그룹을 찾을 수 없습니다.' });
        }

        if (group.members.some(member => member.userId.toString() === userId)) {
            return res.status(400).json({ message: '이미 그룹에 추가된 멤버입니다.' });
        }

        group.members.push({ userId });
        await group.save();
        res.status(200).json({ success: true, data: group });
    } catch (error) {
        console.error('멤버 추가 오류:', error.message);
        res.status(500).json({ message: '서버 오류로 멤버를 추가할 수 없습니다.' });
    }
};

// 그룹 탈퇴 처리
exports.leaveGroup = async (req, res) => {
    const groupId = req.params.id;
    const userId = req.user._id;
  
    try {
      const group = await Group.findById(groupId);
  
      if (!group) {
        return res.status(404).json({ message: '그룹을 찾을 수 없습니다.' });
      }
  
      // 해당 사용자 삭제
      group.members = group.members.filter(member => String(member.userId) !== String(userId));
  
      await group.save();
  
      res.redirect(`/group/${group._id}`); // 탈퇴 후 그룹 상세 페이지로 리다이렉트
    } catch (error) {
      console.error('그룹 탈퇴 오류:', error.message);
      res.status(500).json({ message: '그룹 탈퇴 중 오류가 발생했습니다.' });
    }
  };

// 그룹 생성 시 관리자가 기본 지정
exports.createGroup = async (req, res) => {
    const { name, region, description } = req.body;
    const userId = req.user._id; // 현재 로그인한 사용자의 ID를 가져옵니다.
  
    // 입력값 검증
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: '그룹 이름은 최소 2글자 이상이어야 합니다.' });
    }
    if (!region || region.trim().length < 2) {
      return res.status(400).json({ message: '지역은 최소 2글자 이상이어야 합니다.' });
    }
    if (!description || description.trim().length < 5) {
      return res.status(400).json({ message: '그룹 설명은 최소 5글자 이상이어야 합니다.' });
    }
  
    try {
      // 그룹 생성 시 관리자(userId) 지정
      const group = new Group({
        name: name.trim(),
        region: region.trim(),
        description: description.trim(),
        createdBy: userId, // 그룹 생성자를 기록
        members: [{ userId, role: 'admin' }], // 생성자를 관리자로 추가
      });
  
      // 그룹 저장
      await group.save();
  
      // 성공 응답
      res.status(201).json({ success: true, data: group });
    } catch (error) {
      console.error('그룹 생성 오류:', error.message);
      res.status(500).json({ message: '그룹 생성 중 오류가 발생했습니다.', error: error.message });
    }
  };

  // 그룹 정보 수정
exports.editGroup = async (req, res) => {
    const groupId = req.params.id;
    const { name, region, description } = req.body;
  
    try {
      const group = await Group.findById(groupId);
  
      if (!group) {
        return res.status(404).json({ message: '그룹을 찾을 수 없습니다.' });
      }
  
      // 관리자가 아니면 수정 불가
      if (String(group.createdBy) !== String(req.user._id)) {
        return res.status(403).json({ message: '관리자만 그룹 정보를 수정할 수 있습니다.' });
      }
  
      group.name = name;
      group.region = region;
      group.description = description;
  
      await group.save();
  
      res.redirect(`/group/${group._id}`); // 수정 후 그룹 상세 페이지로 리다이렉트
    } catch (error) {
      console.error('그룹 정보 수정 오류:', error.message);
      res.status(500).json({ message: '그룹 정보 수정 중 오류가 발생했습니다.' });
    }
  };