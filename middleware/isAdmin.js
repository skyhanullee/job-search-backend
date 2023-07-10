// decided against using admin for final project, will update later for future features

const isAdmin = async (req, res, next) => {
  // try {
  //   // if not admin user
  //   if (!req.user.roles.includes('admin')) {
  //     res.status(403).send({ message: 'User is not a admin user.' });
  //   }
  //   // if admin user
  //   else {
  //     next();
  //   }
  // } catch (e) {
  //   next(e);
  // }
};

module.exports = isAdmin;
