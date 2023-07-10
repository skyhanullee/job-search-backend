const jwt = require('jsonwebtoken');
const userDAO = require('../daos/user');
require('dotenv').config();

// It should verify the JWT provided in req.headers.authorization
// and put the decoded value on the req object.
const isAuthorized = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token || !token.includes('Bearer')) {
      return res.status(401).send({ message: 'No valid token.' });
    }
    else {
      const userToken = token.replace('Bearer ', '');
      const authorizedUser = jwt.verify(userToken, process.env.JWT_SECRET_KEY);
      if (!authorizedUser) {
        return res.status(401).send({ message: 'Token from user does not exist.' });
      }

      const isUserExists = userDAO.getUser(authorizedUser?._id);
      if (!isUserExists) {
        return res.status(401).send({ message: 'User does not exist.' });
      }
      else {
        req.user = {
          _id: authorizedUser._id,
          email: authorizedUser.email,
          roles: authorizedUser.roles
        };
        next();
      }
    }
  }
  catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      res.status(401).send('Unauthorized');
    }
    // console.log(e);
    next(e);
  }
};

module.exports = isAuthorized;
