function requireUser(req, res, next) {
  console.log(req.user);
  if (!req.user) {
    next({
      name: 'MissingUserError',
      message: 'You must be logged in to perform this action',
    });
  }
  next();
}

function requireActiveUser(req, res, next) {
  if (!req.user[0].active) {
    next({
      name: 'InactiveUserError',
      message: 'You must be active to perform this action',
    });
  }
  next();
}

module.exports = {
  requireUser,
  requireActiveUser,
};
