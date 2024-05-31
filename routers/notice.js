const express = require('express');
const multer = require('multer');
const path = require('path');
const postController = require('../controllers/postController');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const fs = require('fs');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads')); // public/uploads 경로 설정
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, uniqueSuffix); // 한글 파일명을 UTF-8로 처리
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  },
});

// 게시글 목록 페이지 렌더링
router.get('/posts', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).send('로그인이 필요합니다.');
    }

    await postController.getPosts(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).send('게시글 목록을 불러오는 중 오류 발생');
  }
});

// 글쓰기 페이지 렌더링
router.get('/new', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).send('로그인이 필요합니다.');
  }
  res.render('post/new', {
    userId: req.session.userId,
    nickname: req.session.nickname,
  }); // new.ejs 파일 렌더링
});

// 게시글 작성 요청 처리
router.post('/posts/new', upload.single('image'), async (req, res) => {
  try {
    const { title, content, category } = req.body;

    const postData = {
      title,
      content,
      category,
      author: req.session.userId,
    };

    if (req.file) {
      postData.image = `/uploads/${req.file.filename}`; // public/uploads 기준 경로
    }

    const newPost = new Post(postData);
    await newPost.save();

    res.redirect('/posts');
  } catch (error) {
    console.error(error);
    res.status(500).send('게시글 작성 중 오류 발생');
  }
});

// 게시글 수정 페이지 렌더링
router.get('/posts/:postId/edit', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post || post.author.toString() !== req.session?.userId) {
      return res.status(403).send('수정 권한이 없습니다.');
    }

    res.render('post/edit', { post, userId: req.session.userId, nickname: req.session.nickname });
  } catch (error) {
    console.error(error);
    res.status(500).send('게시글 수정 페이지 로드 중 오류 발생');
  }
});

//게시글 수정
router.put('/posts/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, content, category } = req.body;

    // 업데이트 데이터 생성
    const updatedData = { title, content, category };

    if (req.file) {
      // 새 파일 업로드 처리
      updatedData.image = `/uploads/${req.file.filename}`;

      // 기존 파일 삭제
      const post = await Post.findById(req.params.id);
      if (post?.image) {
        const oldImagePath = path.join(__dirname, '..', 'public', post.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // DB 업데이트
    const post = await Post.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!post) {
      return res.status(404).send('게시글을 찾을 수 없습니다.');
    }

    res.redirect(`/posts/${req.params.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('게시글 수정 중 오류 발생');
  }
});

// 게시글 삭제 요청 처리
router.delete('/posts/:id', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).send('로그인이 필요합니다.');
    }

    await postController.deletePost(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).send('게시글 삭제 중 오류 발생');
  }
});

// 게시글 상세보기 페이지 렌더링
router.get('/posts/:id', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).send('로그인이 필요합니다.');
    }

    await postController.getPostById(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).send('게시글 조회 중 오류 발생');
  }
});

// 댓글 작성 요청 처리
router.post('/posts/:id/comments', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).send('로그인이 필요합니다.');
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send('게시글을 찾을 수 없습니다.');
    }

    const comment = new Comment({
      content: req.body.content,
      author: req.session.userId,
      post: req.params.id,
    });

    await comment.save();
    post.comments.push(comment);
    await post.save();

    res.redirect(`/posts/${req.params.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('댓글 작성 중 오류 발생');
  }
});

// 댓글 수정 요청 처리
router.put('/comments/:commentId', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).send('로그인이 필요합니다.');
    }

    await postController.updateComment(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).send('댓글 수정 중 오류 발생');
  }
});

// 댓글 삭제 요청 처리
router.delete('/comments/:commentId', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).send('로그인이 필요합니다.');
    }

    await postController.deleteComment(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).send('댓글 삭제 중 오류 발생');
  }
});

module.exports = router;
