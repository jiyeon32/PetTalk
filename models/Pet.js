const mongoose = require('mongoose');

const weightSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: {
    type: String,
    enum: {
      values: ['Male', 'Female'],
      message: '{VALUE}는 유효하지 않은 성별입니다.'
    },
    required: true
  },
  weight: [weightSchema],
  diseases: { type: [String], default: [] },
  age: { type: Number, required: true },
  photo: { type: String }, // 사진 파일 경로
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Pet', petSchema);
