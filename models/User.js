const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 4, maxlength: 16 },
  password: { type: String, required: true, minlength: 8 },
  nickname: { type: String, required: true, maxlength: 16 },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // 사용자가 작성한 게시글 참조
  pets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }]  // 사용자가 소유한 반려동물 참조
}, { timestamps: true });

// 사용자 탈퇴 시 관련 게시글 및 반려동물 데이터 삭제 처리
userSchema.pre('remove', async function(next) {
  await this.model('Post').deleteMany({ author: this._id });
  await this.model('Pet').deleteMany({ owner: this._id });
  next();
});

module.exports = mongoose.model('User', userSchema);
