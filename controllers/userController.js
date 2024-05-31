const User = require("../models/User");
const bcrypt = require("bcrypt");
const Post = require("../models/Post");
const Pet = require("../models/Pet");
const Comment = require("../models/Comment");


// 회원가입 처리 로직
exports.registerUser = async (req, res) => {
  try {
    const { username, password, confirmPassword, nickname } = req.body;

    // 비밀번호 확인
    if (password !== confirmPassword) {
      return res
        .status(400)
        .render("user/register", { error: "비밀번호가 일치하지 않습니다." });
    }

    // 사용자 중복 체크
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .render("user/register", { error: "이미 존재하는 아이디입니다." });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새로운 사용자 저장
    const newUser = new User({
      username,
      password: hashedPassword,
      nickname,
    });
    await newUser.save();

    res.redirect("/login"); // 회원가입 후 로그인 페이지로 리디렉션
  } catch (error) {
    res.status(500).send("서버 오류");
  }
};

// 로그인 처리 로직
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(400)
        .render("user/login", { error: "아이디 또는 비밀번호가 틀렸습니다." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .render("user/login", { error: "아이디 또는 비밀번호가 틀렸습니다." });
    }

    // 세션에 사용자 정보 저장
    req.session.userId = user._id;
    req.session.nickname = user.nickname; // 닉네임도 세션에 저장
    res.redirect("/"); // 로그인 후 프로필 페이지로 리디렉션
  } catch (error) {
    res.status(500).send("서버 오류");
  }
};

// 사용자 탈퇴
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.session;

    if (!userId) {
      return res.status(401).send("로그인이 필요합니다.");
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("사용자를 찾을 수 없습니다.");
    }

    // 사용자 삭제 (사용자 관련 게시글, 반려동물 삭제)
    await user.remove(); // User 모델에 pre('remove') 미들웨어가 설정되어 있어서 게시글과 반려동물이 함께 삭제됨

    req.session.destroy(); // 세션 종료
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.status(500).send("사용자 삭제 중 오류 발생");
  }
};


// 닉네임 및 비밀번호 수정
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.session;
    const { nickname, password } = req.body;

    let updateData = { nickname };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    await User.findByIdAndUpdate(userId, updateData);
    req.session.nickname = nickname; // 세션의 닉네임도 업데이트
    res.redirect('/mypage/profile');
  } catch (error) {
    console.error(error);
    res.status(500).send('개인정보 수정 중 오류 발생');
  }
};
