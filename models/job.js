const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  isBookmarked: { type: Boolean },
  jobId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  company: { type: String },
  salary: { type: Number, required: true },
  createdAt: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  url: { type: String },
  isAdzuna: { type: Boolean, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
});

module.exports = mongoose.model("jobs", jobSchema, "testJobs");
