const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true }, // 제목
  category: { type: String, required: true }, // 카테고리
  content: { type: String, required: true }, // 내용
  image: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 작성자 (참조)
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] // 댓글 (참조)
}, { timestamps: true }); // timestamps 옵션을 추가하여 생성 및 수정 시간 자동 관리

// 게시글이 삭제될 때 관련 댓글도 함께 삭제하는 middleware
postSchema.pre('remove', async function(next) {
  await this.model('Comment').deleteMany({ _id: { $in: this.comments } });
  next();
});

module.exports = mongoose.model('Post', postSchema);
