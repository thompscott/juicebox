const express = require('express');
const postsRouter = express.Router();
const {
  getAllPosts,
  createPost,
  getUserByUsername,
  updatePost,
  getPostById,
  getUserById,
} = require('../db');
const { requireUser, requireActiveUser } = require('./utils');

postsRouter.use((req, res, next) => {
  console.log('A request is being made to /posts');

  next();
});

postsRouter.use('/:id', (req, res, next) => {
  console.log('A request is being made to /posts/id');

  next();
});

postsRouter.get('/', async (req, res, next) => {
  try {
    const allPosts = await getAllPosts();

    const posts = allPosts.filter((post) => {
      return (
        (post.active && post.author.active) ||
        (req.user && post.author.id === req.user[0].id)
      );
    });

    res.send({
      posts,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.get('/:id', async (req, res, next) => {
  try {
    const post = await getPostById(req.params.id);

    if (
      (post.active && post.author.active) ||
      (req.user && post.author.id === req.user[0].id)
    ) {
      res.send({ post });
    } else {
      next({
        name: 'PostAccessError',
        message: 'You do not have access to this post',
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.post('/', requireActiveUser, async (req, res, next) => {
  const { title, content, tags = '' } = req.body;
  const tagArr = tags.trim().split(/\s+/);
  const postData = {};

  postData.authorId = req.user[0].id;
  postData.title = title;
  postData.content = content;

  // only send the tags if there are some to send
  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
    const post = await createPost(postData);
    res.send({ post });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.patch('/:postId', requireActiveUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user[0].id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost });
    } else {
      next({
        name: 'UnauthorizedUserError',
        message: 'You cannot update a post that is not yours',
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.delete('/:postId', requireActiveUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);

    if (post && post.author.id === req.user[0].id) {
      const updatedPost = await updatePost(post.id, { active: false });

      res.send({ post: updatedPost });
    } else {
      // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
      next(
        post
          ? {
              name: 'UnauthorizedUserError',
              message: 'You cannot delete a post which is not yours',
            }
          : {
              name: 'PostNotFoundError',
              message: 'That post does not exist',
            }
      );
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = postsRouter;
