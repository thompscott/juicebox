const express = require('express');
const postsRouter = express.Router();
const { getAllPosts, createPost, getUserByUsername } = require('../db');
const { requireUser } = require('./utils');



postsRouter.use((req, res, next) => {
  console.log('A request is being made to /posts');

  next();
});

postsRouter.get('/', async (req, res) => {
  const posts = await getAllPosts();

  res.send({
    posts
  });
});

postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;

  const tagArr = tags.trim().split(/\s+/)
  const postData = {};

 

  // only send the tags if there are some to send
  
  postData.authorId = 1;
  postData.title = title;
  postData.content = content;
  if (tagArr.length) {
    postData.tags = tagArr;
  }
  


  try {
    const post = await createPost(postData)
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

module.exports = postsRouter;