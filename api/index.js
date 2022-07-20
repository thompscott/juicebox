const jwt = require('jsonwebtoken');
const { getPostById } = require('../db');
require('dotenv').config();
const { JWT_SECRET } = process.env;
const express = require('express');
const apiRouter = express.Router();

//const webToken =
// 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2NTgyODcxMTR9.rmiF1LDWhZmN4JTTgiHk8HPc8rRTVKAbrXb0W-_SurY';

//const command = ` curl http://localhost:3000/api -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2NTgyODcxMTR9.rmiF1LDWhZmN4JTTgiHk8HPc8rRTVKAbrXb0W-_SurY'`;

//JWT middleware
apiRouter.use(async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');

  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const { id } = jwt.verify(token, JWT_SECRET);

      if (id) {
        req.user = await getPostById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

apiRouter.use((req, res, next) => {
  if (req.user) {
    console.log('User is set:', req.user);
  }

  next();
});

//ROUTERS

const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);

const postsRouter = require('./posts');
apiRouter.use('/posts', postsRouter);
apiRouter.use('/posts/:id', postsRouter);

const tagsRouter = require('./tags');
apiRouter.use('/tags', tagsRouter);
apiRouter.use('/tags/:tagName/posts', tagsRouter);

apiRouter.use((error, req, res, next) => {
  res.send({
    name: error.name,
    message: error.message,
  });
});

module.exports = apiRouter;
