const mongoose = require('mongoose');
const BookmarkList = require('../models/bookmarkList');
const Job = require('../models/job');

module.exports = {};

// should create a bookmarkList for the given user
module.exports.createBookmarkList = async (userId, email) => {
  const created = await BookmarkList.create({ userId: userId, email: email });
  // if (!created) {
  //   return null;
  // }
  return created;
};

module.exports.getBookmarkListByUserId = async (userId) => {
  try {
    const bookmarkList = await BookmarkList.find({ userId: userId });
    // if (!bookmarkList) {
    //   return null;
    // }
    return bookmarkList;
  }
  catch (e) {
    // if (e.message.includes('validation failed')) {
    //   throw new BadDataError(e.message);
    // }
    throw e;
  }
};

// should get all bookmarkLists
module.exports.getAllBookmarkLists = () => {
  const bookmarkLists = BookmarkList.find().lean();
  // if (!bookmarkLists) {
  //   return null;
  // }
  return bookmarkLists;
};

// should add job to bookmarkList
// module.exports.updateBookmarkListByUserId = async (userId, jobObj) => {
module.exports.updateBookmarkListByUserId = async (userId, jobId) => {
  // console.log(jobId);
  // const jobIdObj = new mongoose.Types.ObjectId(jobId);
  // console.log(jobIdObj);
  const convertedJob = await Job.findOne({ jobId: jobId });
  // console.log('BOOKMARKDAO ' + convertedJob);
  let bookmarkList = await BookmarkList.findOne({ userId: userId });
  if (!bookmarkList) {
    return null;
  }


  bookmarkList.jobs.push(convertedJob);
  // bookmarkList.updateOne(
  //   { userId: userId },
  //   { $addToSet: { jobs: jobIdObj } },
  // );
  await bookmarkList.save();
  // console.log(bookmarkList);
  return bookmarkList;
};

// should delete job from bookmarkList
module.exports.removeJobFromBookmarkList = async (userId, jobObj) => {
  let bookmarkList = await BookmarkList.findOne({ userId: userId });
  if (!bookmarkList) {
    // console.log('no bookmark list');
    return null;
  }
  const index = bookmarkList.jobs.indexOf(jobObj._id);
  console.log(`jobObj._id: ${jobObj._id}, index: ${index}`);
  if (index === -1) {
    // console.log('not in index');
    return { message: 'Job not in index. Cannot remove.' };
  }
  bookmarkList.jobs.splice(index, 1);
  await bookmarkList.save();

  // console.log('DAOS BOOKMARK: ')
  // console.log(bookmarkList);
  return bookmarkList;
};

class BadDataError extends Error { };
module.exports.BadDataError = BadDataError;
