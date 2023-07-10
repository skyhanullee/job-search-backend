const mongoose = require('mongoose');
const Job = require('../models/job');

const db = mongoose.connection;

module.exports = {};

// should create a job (only admin users or adzuna api calls can create jobs)
module.exports.createJob = async (jobObj) => {
  // const created = await Job.create(jobObj);
  const created = await db.collection('testJobs').insertOne(jobObj);
  if (!created) {
    return null;
  }
  return created;
};

// should get job for jobId (jobId)
module.exports.getJobByJobId = async (jobId) => {
  const job = await Job.findOne({ jobId: jobId }).lean();
  if (!job) {
    return null;
  }
  return job;
};

// should get job for _id (id)
module.exports.getJobById = async (id) => {
  const job = await Job.findOne({ _id: new mongoose.Types.ObjectId(id) }).lean();
  if (!job) {
    return null;
  }
  return job;
};

// should get all jobs for userId
module.exports.getAllJobs = async () => {
  const jobs = await Job.find().lean();
  if (!jobs) {
    return null;
  }
  return jobs;
};

module.exports.updateJobById = async (jobId, jobObj) => {
  const updatedJob = await Job.updateOne({ jobId: jobId }, jobObj);
  return updatedJob;
};

module.exports.deleteJobById = async (jobId) => {
  const deletedJob = await Job.deleteOne({ jobId: jobId });
  // console.log(deletedJob);
  return deletedJob;
}

class BadDataError extends Error { };
module.exports.BadDataError = BadDataError;
