const User = require('../models/user');

module.exports = {};

// should store a user record
module.exports.createUser = async (userObj) => {
  try {
    const created = await User.create(userObj);
    return created;
  }
  catch (e) {
    if (e.message.includes('validation failed')) {
      throw new BadDataError(e.message);
    }
    throw e;
  }
};

// should get a user record using their email
module.exports.getUser = async (email) => {
  const user = await User.findOne({ email: email }).lean();
  return user;
};

// should update the user's password field
module.exports.updateUserPassword = async (userId, newHashedPassword) => {
  await User.findOneAndUpdate(
    { _id: userId },
    { password: newHashedPassword },
  ).lean();
  return true;
};

class BadDataError extends Error { };
module.exports.BadDataError = BadDataError;
