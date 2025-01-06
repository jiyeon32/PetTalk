const Group = require('../models/Group');

// 모든 그룹 조회
exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find(); // MongoDB에서 그룹 데이터 가져오기
        res.render('/group', { 
            groups, 
            userId: req.session.userId || null, // 세션에서 userId 가져오기
            nickname: req.session.nickname || null // 세션에서 nickname 가져오기
        });
    } catch (error) {
        console.error('그룹 조회 오류:', error.message);
        res.status(500).send('서버 오류로 그룹 데이터를 가져올 수 없습니다.');
    }
};


// 그룹 생성
exports.createGroup = async (req, res) => {
    const { name, region, description } = req.body;

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
        const group = new Group({ name: name.trim(), region: region.trim(), description: description.trim() });
        await group.save();
        res.status(201).json({ success: true, data: group });
    } catch (error) {
        console.error('그룹 생성 오류:', error.message);
        res.redirect('/group');
    }
};

// 특정 그룹 조회
exports.getGroupById = async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: '유효하지 않은 그룹 ID입니다.' });
        }

        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: '그룹을 찾을 수 없습니다.' });
        }
        res.status(200).json({ success: true, data: group });
    } catch (error) {
        console.error('그룹 조회 오류:', error.message);
        res.status(500).json({ message: '서버 오류로 그룹을 불러올 수 없습니다.' });
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
