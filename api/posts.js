const express = require('express');
const postsRouter = express.Router();
const {
  getAllPosts,
  createPost,
  getUserByUsername,
  updatePost,
  getPostById,
} = require('../db');
const { requireUser } = require('./utils');

postsRouter.use((req, res, next) => {
  console.log('A request is being made to /posts');

  next();
});

postsRouter.use('/:id', (req, res, next) => {
  console.log('A request is being made to /posts');

  next();
});

postsRouter.get('/', async (req, res) => {
  const posts = await getAllPosts();
  res.send({
    posts,
  });
});

postsRouter.get('/:id', async (req, res) => {
  res.send('pereeeee');
});

postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content, tags = '' } = req.body;
  // console.log(req, 'req from post');
  const tagArr = tags.trim().split(/\s+/);
  const postData = {};

  postData.authorId = req.user.author.id;
  postData.title = title;
  postData.content = content;

  // only send the tags if there are some to send
  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
    const post = await createPost(postData);
    res.send({ post });
    // add authorId, title, content to postData object
    // const post = await createPost(postData);
    // this will create the post and the tags for us
    // if the post comes back, res.send({ post });
    // otherwise, next an appropriate error object
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
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

    if (originalPost.author.id === req.user.id) {
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

module.exports = postsRouter;

//curl http://localhost:3000/api/users/login -H "Content-Type: application/json" -X POST -d '{"username": "albert", "password": "bertie99"}'
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2NTgzMzg1Njl9.eBHKbJl8ZnFk06YUW2MioOmpI1F0VA4SM6RBXHU4vgs

// curl http://localhost:3000/api/posts -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2NTgzMzg1Njl9.eBHKbJl8ZnFk06YUW2MioOmpI1F0VA4SM6RBXHU4vgs' -H 'Content-Type: application/json' -d '{"title": "I still do not like tags", "content": "CMON! why do people use them?"}'

//PATCH
//curl http://localhost:3000/api/posts/1 -X PATCH -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2NTgzMzg1Njl9.eBHKbJl8ZnFk06YUW2MioOmpI1F0VA4SM6RBXHU4vgs' -H 'Content-Type: application/json' -d '{"title": "updating my old stuff", "tags": "#oldisnewagain"}'
