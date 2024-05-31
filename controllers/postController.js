const Post = require('../models/Post');
const Comment = require('../models/Comment');

// 게시글 목록 불러오기
exports.getPosts = async (req, res) => {
  try {
    const { category = 'all', page = 1, limit = 10 } = req.query; // 기본값 설정
    const categoryMap = {
      all: '전체',
      tmiboard: '자유게시판',
      infoboard: '정보게시판',
      sharboard: '리뷰게시판',
      quesboard: '질문게시판',
    };

    let filter = {};
    if (category !== 'all') {
      filter.category = categoryMap[category];
    }

    const totalPosts = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .populate('author')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.render('post/posts', {
      posts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalPosts / limit),
      category, // category 추가
      userId: req.session.userId,
      nickname: req.session.nickname,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('게시글 목록을 불러오는 중 오류 발생');
  }
};

// 게시글 저장 로직
exports.createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    const newPost = new Post({
      title,
      category,
      content,
      author: req.session.userId,
    });

    await newPost.save();
    res.redirect('/posts');
  } catch (error) {
    console.error(error);
    res.status(500).send('게시글 저장 중 오류 발생');
  }
};

// 게시글 상세 조회
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author')
      .populate('comments');

    if (!post) {
      return res.status(404).send('게시글을 찾을 수 없습니다.');
    }

    res.render('post/postDetail', {
      post,
      userId: req.session.userId, // 추가
      nickname: req.session.nickname, // 추가
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('게시글 조회 중 오류 발생');
  }
};

// 게시글 삭제
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      author: req.session.userId,
    });

    if (!post) {
      return res.status(404).send('게시글을 찾을 수 없습니다.');
    }

    res.redirect('/posts');
  } catch (error) {
    console.error(error);
    res.status(500).send('게시글 삭제 중 오류 발생');
  }
};

// 게시글 수정
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;

    await Post.findByIdAndUpdate(id, { title, content, category });
    res.redirect(`/posts/${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('게시글 수정 중 오류 발생');
  }
};

// 댓글 수정
exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findOneAndUpdate(
      { _id: req.params.commentId, author: req.session.userId },
      { content: req.body.content },
      { new: true }
    );

    if (!comment) {
      return res.status(404).send('댓글을 찾을 수 없습니다.');
    }

    res.redirect(`/posts/${comment.post}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('댓글 수정 중 오류 발생');
  }
};

// 댓글 삭제
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({
      _id: req.params.commentId,
      author: req.session.userId,
    });

    if (!comment) {
      return res.status(404).send('댓글을 찾을 수 없습니다.');
    }

    res.redirect(`/posts/${comment.post}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('댓글 삭제 중 오류 발생');
  }
};

