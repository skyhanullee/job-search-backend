const request = require("supertest");

const server = require("../server");
const testUtils = require('../test-utils');

const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Job = require('../models/job');

describe("/jobs", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);

  afterEach(testUtils.clearDB);

  const job0 = {
    "jobId": "123",
    "title": "[TEST] Job 0",
    "description": "Job description",
    "location": "Location 0",
    "company": "Company 0",
    "salary": 100,
    "isAdzuna": false,
  };
  const job1 = {
    "jobId": "456",
    "title": "[TEST] Job 1",
    "description": "Job description",
    "location": "Location 1",
    "company": "Company 1",
    "salary": 200,
    "isAdzuna": false,
  };

  const job2 = {
    "jobId": "789",
    "title": "[TEST] Job 2",
    "description": "Job description",
    "location": "Location 2",
    "company": "Company 2",
    "salary": 300,
    "isAdzuna": false,
  };

  describe('Before login', () => {
    describe('POST /', () => {
      it('should send 401 without a token', async () => {
        const res = await request(server).post("/jobs").send(job0);
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 with a bad token', async () => {
        const res = await request(server)
          .post("/jobs")
          .set('Authorization', 'Bearer BAD')
          .send(job0);
        expect(res.statusCode).toEqual(401);
      });
    });
    describe('GET /:id', () => {
      it('should send 401 without a token', async () => {
        const res = await request(server).get("/jobs/123").send(job0);
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 with a bad token', async () => {
        const res = await request(server)
          .get("/jobs/456")
          .set('Authorization', 'Bearer BAD')
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
  });

  // describe.each([job0, job1])("POST / job %#", (job) => {
  //   it('should send 200 and store job', async () => {
  //     const res = await request(server)
  //       .post("/jobs")
  //       .send(job);
  //     expect(res.statusCode).toEqual(200);
  //     expect(res.body).toMatchObject(job)
  //     const savedJob = await Job.findOne({ _id: res.body._id }).lean();
  //     expect(savedJob).toMatchObject(job);
  //   });
  // });
  describe('after login', () => {
    const user0 = {
      email: 'user0@mail.com',
      password: '123password'
    };
    const user1 = {
      email: 'user1@mail.com',
      password: '456password'
    }
    let token0;
    let adminToken;
    // beforeEach(async () => {
    const login = async () => {
      // testUtils.clearDB;
      await request(server).post("/login/signup").send(user0);
      const res0 = await request(server).post("/login").send(user0);
      token0 = res0.body.token;
      await request(server).post("/login/signup").send(user1);
      await User.updateOne({ email: user1.email }, { $push: { roles: 'admin' } });
      const res1 = await request(server).post("/login").send(user1);
      adminToken = res1.body.token;
      // });
    };
    beforeEach(async () => {
      testUtils.clearDB
    });

    // so far, POST and DELETE only work if the job is made within the test.
    // the userid and token changes after every test
    // because the code signs up from scratch every time.
    describe.only.each([job0, job1])("POST / job %#", (job) => {
      it('should send 200 to all users and store job', async () => {
        login();
        const res = await request(server)
          .post("/jobs")
          .set('Authorization', 'Bearer ' + token0)
          .send(job);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(job)
        const savedJob = await Job.findOne({ _id: res.body._id }).lean();
        expect(savedJob).toMatchObject(job);
        // console.log('------ POST ------');
        // console.log(job);
      });
      it('should create jobId if jobId is not provided', async () => {
        const jobWithoutId = { ...job, jobId: '' };
        const res = await request(server)
          .post("/jobs")
          .set('Authorization', 'Bearer ' + token0)
          .send(jobWithoutId);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({ ...job, jobId: res.body.jobId });
      });
    });
    describe('POST /', () => {
      it('should send 400 if no job is given', async () => {
        const res = await request(server)
          .post("/jobs")
          .set('Authorization', 'Bearer ' + token0)
          .send();
        expect(res.statusCode).toEqual(400);
      })
    });
    describe('GET /', () => {
      it('should send 200 to all users', async () => {
        const res = await request(server).get("/jobs");
        expect(res.statusCode).toEqual(200);
      });
    });
    describe.each([job0, job1])("GET /:id job %#", (job) => {
      // let originalJob;
      // beforeEach(async () => {
      //   const res = await request(server)
      //     .post("/jobs/")
      //     .set('Authorization', 'Bearer ' + adminToken)
      //     .send(job);
      //   originalJob = res.body;
      // });
      it('should send 200 to normal user and return job', async () => {
        // console.log(`JOB GET /:id ${originalJob}`);
        // console.log(job);
        const testJob = await Job.findOne({ jobId: job.jobId }).lean();
        const res = await request(server)
          .get("/jobs/" + job.jobId)
          .set('Authorization', 'Bearer ' + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(JSON.stringify(res.body)).toEqual(JSON.stringify(testJob));
      });
      it('should send 200 to admin user and return job', async () => {
        const testJob = await Job.findOne({ jobId: job.jobId });
        const res = await request(server)
          .get("/jobs/" + job.jobId)
          .set('Authorization', 'Bearer ' + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(JSON.stringify(res.body)).toEqual(JSON.stringify(testJob));
      });
    });
    describe("PUT / job 2", () => {
      // testUtils.clearDB;
      let originalJob;
      beforeEach(async () => {
        const res = await request(server)
          .post("/jobs")
          .set('Authorization', 'Bearer ' + token0)
          .send(job2);
        originalJob = res.body;
      });
      it('should send 200 to normal user and update job they posted', async () => {
        // const getRes = await request(server).get("/jobs");
        // console.log(getRes);
        // await request(server)
        //   .post("/jobs")
        //   .set('Authorization', 'Bearer ' + token0)
        //   .send(job);
        console.log(originalJob);
        const res = await request(server)
          .put("/jobs/" + originalJob._id)
          .set('Authorization', 'Bearer ' + token0)
          .send(job2);
        expect(res.statusCode).toEqual(200);
        // const newJob = await Job.findById(testJob.jobId).lean();
        // newJob.jobId = newJob.jobId.toString();
        // expect(newJob).toMatchObject(testJob);
      });
      it('should send 200 to admin user and update job', async () => {
        // const testJob = await Job.findOne({ jobId: job.jobId }).lean();
        const res = await request(server)
          .put("/jobs/" + job2.jobId)
          // .put("/jobs/" + originalJob._Id)
          .set('Authorization', 'Bearer ' + adminToken)
          .send(job2);
        expect(res.statusCode).toEqual(200);
        // const newJob = await Job.findById(testJob.jobId).lean();
        // newJob.jobId = newJob.jobId.toString();
        // expect(newJob).toMatchObject(testJob);
      });
    });

    describe("DELETE / job 2", () => {
      // let originalJob;
      // beforeEach(async () => {
      //   const res = await request(server)
      //     .post("/jobs")
      //     .set('Authorization', 'Bearer ' + token0)
      //     .send(job2);
      //   originalJob = res.body;
      //   console.log(originalJob);
      // });
      it('should send 200 to normal user and delete job they posted', async () => {
        // const postRes = await request(server)
        //   .post("/jobs")
        //   .set('Authorization', 'Bearer ' + token0)
        //   .send(job);
        // originalJob = postRes.body;
        // const testJob = await Job.findOne({ jobId: job.jobId }).lean();
        const res = await request(server)
          .delete("/jobs/" + job2._id)
          .set('Authorization', 'Bearer ' + token0)
          .send(job2);
        expect(res.statusCode).toEqual(200);
        // const newJob = await Job.findById(testJob.jobId).lean();
        // newJob.jobId = newJob.jobId.toString();
        // expect(newJob).toMatchObject(testJob);
      });
      it('should send 200 to admin user and delete job', async () => {
        const res = await request(server)
          .delete("/jobs/" + originalJob._id)
          .set('Authorization', 'Bearer ' + adminToken)
          .send(job2);
        expect(res.statusCode).toEqual(200);
        // const newJob = await Job.findById(testJob.jobId).lean();
        // newJob.jobId = newJob.jobId.toString();
        // expect(newJob).toMatchObject(testJob);
      });
    });

  });

});
