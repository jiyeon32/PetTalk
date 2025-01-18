const mongoose = require('mongoose');

// 그룹 스키마 정의
const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    region: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    members: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        },
    ],
});

// 그룹 모델 생성
const Group = mongoose.model('Group', groupSchema);

module.exports = Group; // Group 모델을 내보냄