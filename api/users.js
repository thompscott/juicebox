require('dotenv').config();
const express = require('express');
const usersRouter = express.Router();
const {
  getAllUsers,
  getUserByUsername,
  createUser,
  getUserById,
  updateUser,
} = require('../db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const { requireUser } = require('./utils');

usersRouter.use((req, res, next) => {
  console.log('A request is being made to /users');

  next();
});

usersRouter.get('/', async (req, res) => {
  const users = await getAllUsers();
  const activeUsers = users.filter((user) => user.active === true);
  res.send({
    activeUsers,
  });
});

usersRouter.use('/:userId', (req, res, next) => {
  console.log('A request is being made to /users/id');
  next();
});

usersRouter.get('/:userId', async (req, res, next) => {
  try {
    const user = await getUserById(req.params.userId);
    res.send(user);
  } catch (error) {
    console.log(error);
  }
});

//USER LOGIN
usersRouter.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: 'MissingCredentialsError',
      message: 'Please supply both a username and password',
    });
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password == password) {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET
      );
      res.send({ message: "you're logged in!", token: token });
    } else {
      next({
        name: 'IncorrectCredentialsError',
        message: 'Username or password is incorrect',
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// USER REGISTER
usersRouter.post('/register', async (req, res, next) => {
  const { username, password, name, location } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        name: 'UserExistsError',
        message: 'A user by that username already exists',
      });
    }

    const user = await createUser({
      username,
      password,
      name,
      location,
    });

    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      JWT_SECRET,
      {
        expiresIn: '1w',
      }
    );

    res.send({
      message: 'thank you for signing up',
      token,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

//Delete User
usersRouter.delete('/:userId', requireUser, async (req, res, next) => {
  try {
    const user = await getUserById(req.params.userId);

    if (user && user[0].id == req.user[0].id) {
      const updatedUser = await updateUser(user[0].id, { active: false });

      res.send({ user: updatedUser });
    } else {
      // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
      next(
        user
          ? {
              name: 'UnauthorizedUserError',
              message: 'You cannot delete a user which is not yours',
            }
          : {
              name: 'UserNotFoundError',
              message: 'That user does not exist',
            }
      );
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = usersRouter;

//curl http://localhost:3000/api/users/login -H "Content-Type: application/json" -X POST -d '{"username": "albert", "password": "bertie99"}'

//"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2NTg1MDI3Nzl9.pADmTTOTxxlTLr3amjru80HclL6MdVwU6fR4pB0EqgM

//delete
//curl http://localhost:3000/api/users/6 -X DELETE -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2NTg1MDI3Nzl9.pADmTTOTxxlTLr3amjru80HclL6MdVwU6fR4pB0EqgM'

//patch
// curl http://localhost:3000/api/posts/1 -X PATCH -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2NTg1MDI3Nzl9.pADmTTOTxxlTLr3amjru80HclL6MdVwU6fR4pB0EqgM' -H 'Content-Type: application/json' -d '{"title": "updating my old stuff", "tags": "#oldisnewagain"}'

//Delete post
//curl http://localhost:3000/api/posts/1 -X DELETE -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2NTg1MDI3Nzl9.pADmTTOTxxlTLr3amjru80HclL6MdVwU6fR4pB0EqgM'

//POST
// curl http://localhost:3000/api/posts -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2NTg1MDI3Nzl9.pADmTTOTxxlTLr3amjru80HclL6MdVwU6fR4pB0EqgM' -H 'Content-Type: application/json' -d '{"title": "test post", "content": "how is this?", "tags": " #once #twice    #happy"}'
