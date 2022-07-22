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

// patch
usersRouter.patch('/:userId', requireUser, async (req, res, next) => {
  try {
    const user = await getUserById(req.params.userId);

    if (user && user[0].id == req.user[0].id) {
      const updatedUser = await updateUser(user[0].id, { active: true });

      res.send({ user: updatedUser });
    } else {
      next(
        user
          ? {
              name: 'UnauthorizedUserError',
              message: 'You cannot Activate a user which is not yours',
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
