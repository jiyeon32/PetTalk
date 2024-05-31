const Pet = require('../models/Pet');
const fs = require('fs');
const path = require('path');

// 반려동물 등록
exports.createPet = async (req, res) => {
  try {
    const { name, gender, weight, diseases, age } = req.body;

    if (!req.session || !req.session.userId) {
      return res.status(401).send('로그인이 필요합니다.');
    }

    const petData = {
      name,
      gender,
      weight: [{ value: weight, date: new Date() }],
      diseases: diseases ? diseases.split(',') : [],
      age,
      owner: req.session.userId,
    };

    if (req.file) {
      petData.photo = `/uploads/${req.file.filename}`;
    }

    const newPet = new Pet(petData);
    await newPet.save();

    res.redirect('/mypet');
  } catch (error) {
    console.error('반려동물 등록 중 오류:', error);
    res.status(500).send('반려동물 등록 중 오류 발생');
  }
};

// 반려동물 목록 조회
exports.getPetsByUser = async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.session.userId });
    const petData = pets.length > 0 ? pets[0] : null;

    res.render('pet/mypet', { 
      pets,
      petData,
      userId: req.session.userId,
      nickname: req.session.nickname
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('반려동물 정보를 불러오는 중 오류가 발생했습니다.');
  }
};

// 반려동물 수정
exports.updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gender, weight, diseases, age } = req.body;

    const updateData = {
      name,
      gender,
      diseases: diseases ? diseases.split(',') : [],
      age, // age 필드 추가
    };

    if (weight) {
      updateData.$push = { weight: { value: weight, date: new Date() } };
    }

    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }

    const pet = await Pet.findOneAndUpdate(
      { _id: id, owner: req.session.userId },
      updateData,
      { new: true }
    );

    if (!pet) {
      return res.status(404).send('반려동물을 찾을 수 없습니다.');
    }

    res.redirect('/mypet');
  } catch (error) {
    console.error('반려동물 수정 중 오류:', error);
    res.status(500).send('반려동물 수정 중 오류 발생');
  }
};

// 반려동물 삭제
exports.deletePet = async (req, res) => {
  try {
    const { id } = req.params;

    const pet = await Pet.findOneAndDelete({ _id: id, owner: req.session.userId });

    if (pet && pet.photo) {
      const photoPath = path.join(__dirname, '..', 'public', pet.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    if (!pet) {
      return res.status(404).send('반려동물을 찾을 수 없습니다.');
    }

    res.redirect('/mypet');
  } catch (error) {
    console.error('반려동물 삭제 중 오류:', error);
    res.status(500).send('반려동물 삭제 중 오류 발생');
  }
};
