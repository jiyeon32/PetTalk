const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    region: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 그룹 생성자
    createdAt: { type: Date, default: Date.now },
    members: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            role: { type: String, enum: ['admin', 'member'], default: 'member' } // 역할 필드
        },
    ],
    schedules: [ // 모임 일정 관리
        {
            title: { type: String, required: true },
            date: { type: Date, required: true },
            description: { type: String },
        }
    ],
});
// 그룹 모델 생성
const Group = mongoose.model('Group', groupSchema);

module.exports = Group; // Group 모델을 내보냄