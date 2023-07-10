const { Router } = require("express");
const router = Router();
const jobDAO = require('../daos/job');
const isAuthorized = require("../middleware/isAuthorized");
// const isAdmin = require("../middleware/isAdmin");
const uuid = require('uuid');

// Create: POST /jobs 
// Restricted to users with the "admin" role
router.post("/", isAuthorized, async (req, res, next) => {
  try {
    let editedJob;
    const job = req.body;
    if (!job || Object.keys(job).length === 0) {
      return res.status(400).send({ message: 'No job given.' });
    }

    let jobId;
    if (req.body.jobId) {
      jobId = req.body.jobId;
      // console.log(jobId);
    }
    else {
      jobId = uuid.v4();
    }

    const existingJob = await jobDAO.getJobByJobId(job.jobId);
    if (existingJob) {
      return res.status(409).send({ message: 'Job already saved.' });
    }

    editedJob = { ...job, jobId: jobId, userId: req.user?._id };

    await jobDAO.createJob(editedJob);
    res.status(200).json(editedJob);

  } catch (e) {
    console.log(e);
    next(e);
  }
});

// Get all jobs: GET /jobs 
// Open to all users
router.get("/", async (req, res, next) => {
  try {
    const jobs = await jobDAO.getAllJobs();
    res.json(jobs);
  }
  catch (e) {
    next(e);
  }
});

// Get specific job: GET /jobs/:id 
// Open to all users
router.get("/:id", isAuthorized, async (req, res, next) => {
  try {
    const jobId = req.params.id;
    // const job = await jobDAO.getJobByJobId(jobId);
    const job = await jobDAO.getJobById(jobId);
    if (!job) {
      return res.status(404).send({ message: 'Cannot find job from id.' })
    }
    res.json(job);
  } catch (e) {
    next(e);
  }
});

// Update a job: PUT /jobs/:id 
// Restricted to users' own posts
// Admins can update any post
router.put("/:id", isAuthorized, async (req, res, next) => {
  try {
    // const jobId = req.body.jobId;
    const paramsId = req.params.id;
    const jobData = req.body;
    const user = req.user;
    if (!paramsId || !jobData) {
      res.status(400).send({ message: 'No job id / job data.' })
    }

    const jobObj = await jobDAO.getJobByJobId(jobData.jobId);
    if (!jobObj) {
      return res.status(407).send({ message: 'Job does not exist.' });
    }
    // if (jobObj.jobId !== paramsId) {
    //   return res.status(404).send({ message: 'Invalid job id.' })
    // }

    // const userRoles = req.user;
    if (!user.roles.includes('admin')) {
      console.log(`PUT - user._id: ${user._id} | jobObj.userId: ${jobObj.userId}`);
      if (user._id !== jobObj.userId.toString()) {
        return res.status(403).send({ message: 'User did not create this job. Cannot update.' });
      }
      else {
        console.log('not admin');
      }
    }
    const isUpdated = await jobDAO.updateJobById(paramsId, jobData);
    if (!isUpdated) {
      res.status(400).send({ message: 'Not updated. Something went wrong.' });
    }
    else {
      res.status(200).send({ message: 'Job updated.' })
    }
  } catch (e) {
    next(e);
  }
});

// Delete a job: DELETE /jobs/:id
// 
router.delete("/:id", isAuthorized, async (req, res, next) => {
  try {
    // const jobId = req.body.jobId;
    const paramsId = req.params.id;
    const jobData = req.body;
    const user = req.user;
    if (!paramsId || !jobData) {
      res.status(400).send({ message: 'No job id / job data.' })
    }

    // if (jobData.jobId !== paramsId) {
    //   return res.status(404).send({ message: 'Invalid job id.' })
    // }

    const jobObj = await jobDAO.getJobByJobId(jobData.jobId);

    if (!jobObj) {
      return res.status(400).send({ message: 'Job does not exist.' });
    }

    // console.log(`DELETE - user._id: ${user._id} | jobObj.userId: ${jobObj.userId}`);
    // const userRoles = req.user;
    if (!user.roles.includes('admin')) {
      if (user._id !== jobObj.userId) {
        return res.status(403).send({ message: 'User did not create this job. Cannot update.' });
      }
    }

    const isDeleted = await jobDAO.deleteJobById(paramsId);
    if (!isDeleted) {
      res.status(400).send({ message: 'Not updated. Something went wrong.' });
    }
    else {
      res.status(200).send({ message: 'Job deleted.' })
    }
  }
  catch (e) {
    console.log(e);
    next(e);
  }
});

module.exports = router;
