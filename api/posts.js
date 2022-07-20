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

postsRouter.get('/', async (req, res, next) => {
  try {
    const allPosts = await getAllPosts();

    const posts = allPosts.filter((post) => {
      return post.active || (req.user && post.author.id === req.user.id);
    });

    res.send({
      posts,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.get('/:id', async (req, res) => {
  post = req.params.id;
  res.send(post);
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

postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);

    if (post && post.author.id === req.user.id) {
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

//LOGIN
//curl http://localhost:3000/api/users/login -H "Content-Type: application/json" -X POST -d '{"username": "albert", "password": "bertie99"}'

//TOKEN
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2NTgzNDM5NzJ9.k7-QhTPWmXOl-o5-ardjNTkVbbncy52OA-75jZkR8Ws

//POST
// curl http://localhost:3000/api/posts -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2NTgzMzg1Njl9.eBHKbJl8ZnFk06YUW2MioOmpI1F0VA4SM6RBXHU4vgs' -H 'Content-Type: application/json' -d '{"title": "I still do not like tags", "content": "CMON! why do people use them?"}'

//PATCH
//curl http://localhost:3000/api/posts/1 -X PATCH -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2NTgzNDE2OTJ9.cMEY6-4kUqbmBpG7K3dbkMJ2Mj2R5wNjCdYO1b0iGjk' -H 'Content-Type: application/json' -d '{"title": "updating my old stuff", "tags": "#oldisnewagain"}'

// DELETE
//curl http://localhost:3000/api/posts/235 -X DELETE -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2NTgzNDM5NzJ9.k7-QhTPWmXOl-o5-ardjNTkVbbncy52OA-75jZkR8Ws'

//CHECKIN INACTIVE POSTS
// curl http://localhost:3000/api/posts -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2NTgzNDM5NzJ9.k7-QhTPWmXOl-o5-ardjNTkVbbncy52OA-75jZkR8Ws'

// TAGS
//curl http://localhost:3000/api/tags/%23happy/posts -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2NTgzNDM5NzJ9.k7-QhTPWmXOl-o5-ardjNTkVbbncy52OA-75jZkR8Ws'
