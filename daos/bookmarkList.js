const mongoose = require('mongoose');
const BookmarkList = require('../models/bookmarkList');
const Job = require('../models/job');

module.exports = {};

// should create a bookmarkList for the given user
module.exports.createBookmarkList = async (userId, email) => {
  const created = await BookmarkList.create({ userId: userId, email: email });
  return created;
};

module.exports.getBookmarkListByUserId = async (userId) => {
  try {
    const bookmarkList = await BookmarkList.find({ userId: userId });
    return bookmarkList;
  }
  catch (e) {
    throw e;
  }
};

// should get all bookmarkLists
module.exports.getAllBookmarkLists = () => {
  const bookmarkLists = BookmarkList.find().lean();
  return bookmarkLists;
};

// should add job to bookmarkList
// module.exports.updateBookmarkListByUserId = async (userId, jobObj) => {
module.exports.updateBookmarkListByUserId = async (userId, jobId) => {
  const convertedJob = await Job.findOne({ jobId: jobId });
  let bookmarkList = await BookmarkList.findOne({ userId: userId });
  if (!bookmarkList) {
    return null;
  }

  bookmarkList.jobs.push(convertedJob);
  await bookmarkList.save();
  return bookmarkList;
};

// should delete job from bookmarkList
module.exports.removeJobFromBookmarkList = async (userId, jobObj) => {
  let bookmarkList = await BookmarkList.findOne({ userId: userId });
  if (!bookmarkList) {
    return null;
  }
  const index = bookmarkList.jobs.indexOf(jobObj._id);
  // console.log(`jobObj._id: ${jobObj._id}, index: ${index}`);
  if (index === -1) {
    return { message: 'Job not in index. Cannot remove.' };
  }
  bookmarkList.jobs.splice(index, 1);
  await bookmarkList.save();

  return bookmarkList;
};

class BadDataError extends Error { };
module.exports.BadDataError = BadDataError;
