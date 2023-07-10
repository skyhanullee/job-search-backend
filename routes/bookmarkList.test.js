const request = require("supertest");

const server = require("../server");
const testUtils = require('../test-utils');

const User = require('../models/user');
const Job = require('../models/job');
const BookmarkList = require('../models/bookmarkList');
const mongoose = require('mongoose');

describe("/bookmarklist", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);

  afterEach(testUtils.clearDB);

  const user0 = {
    email: 'user0@mail.com',
    password: '123password'
  };
  const user1 = {
    email: 'user1@mail.com',
    password: '456password'
  };
  const adminUser = {
    email: 'admin@mail.com',
    password: '789password'
  };

  const job0 = {
    "jobId": 123,
    "title": "[TEST] Job 0",
    "description": "Job description",
    "location": "Location 0",
    "company": "Company 0",
    "salary": 100,
    "isAdzuna": false,
  };

  const job1 = {
    "jobId": 456,
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

  // let jobs;

  // beforeEach(async () => {
  //   jobs = (await Job.insertMany([job0, job1])).map(i => i.toJSON());
  // });

  // beforeEach(async () => {
  //   const collections = await mongoose.connection.db.collections();
  //   for (const collection of collections) {
  //     await collection.deleteMany({});
  //   }
  // });

  // BEFORE LOGIN
  describe('Before login', () => {
    describe('POST /', () => {
      it('should send 401 without a token', async () => {
        const res = await request(server)
          .post("/bookmarklist")
          .send(user0);
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 with a bad token', async () => {
        const res = await request(server)
          .post("/jobs")
          .set('Authorization', 'Bearer BAD')
          .send(user0);
        expect(res.statusCode).toEqual(401);
      });
    });
    describe('GET /:id', () => {
      it('should send 401 without a token', async () => {
        const res = await request(server)
          .get("/bookmarklist/123")
          .send(user0);
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 with a bad token', async () => {
        const res = await request(server)
          .get("/bookmarklist/456")
          .set('Authorization', 'Bearer BAD')
          .send(user0);
        expect(res.statusCode).toEqual(401);
      });
    });
    describe('PUT /:id', () => {
      it('should send 401 without a token', async () => {
        const res = await request(server)
          .put("/bookmarklist/update/123")
          .send(user0);
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 with a bad token', async () => {
        const res = await request(server)
          .put("/bookmarklist/update/456")
          .set('Authorization', 'Bearer BAD')
          .send(user0);
        expect(res.statusCode).toEqual(401);
      });
    })
  });

  // AFTER LOGIN
  describe('After login', () => {
    // afterEach(testUtils.clearDB);

    let token0;
    let token1;
    let adminToken;

    let user0Res;
    let user1Res;
    let adminRes;

    const testBookmarkLists = [];

    beforeEach(async () => {
      user0Res = await request(server).post("/login/signup").send(user0);
      const res0 = await request(server).post("/login").send(user0);
      token0 = res0.body.token;

      user1Res = await request(server).post("/login/signup").send(user1);
      const res1 = await request(server).post("/login").send(user1);
      token1 = res1.body.token;

      adminRes = await request(server).post("/login/signup").send(adminUser);
      await User.updateOne({ email: adminUser.email }, { $push: { roles: 'admin' } });
      const resAdmin = await request(server).post("/login").send(adminUser);
      adminToken = resAdmin.body.token;

      // bookmarkList0Res = await request(server)
      //   .post('/bookmarklist')
      //   .set('Authorization', 'Bearer ' + token0)
      //   .send(user0);
    });

    describe('POST /', () => {
      it('should send 200 to user and create bookmark list', async () => {
        const res = await request(server)
          .post('/bookmarklist')
          .set('Authorization', 'Bearer ' + token0)
          .send(user0);
        testBookmarkLists.push(res.body);
        // const res = bookmarkList0Res;
        expect(res.statusCode).toEqual(200);
        const storedBookmarkList = await BookmarkList.findOne().lean();
        expect(storedBookmarkList).toMatchObject({
          userId: (await User.findOne({ email: user0.email }).lean())._id,
          jobs: []
        });
      });
      it('should send 409 if bookmark list already exists', async () => {
        let res = await request(server)
          .post('/bookmarklist')
          .set('Authorization', 'Bearer ' + token0)
          .send(user0);
        // let res = bookmarkList0Res;
        testBookmarkLists.push(res.body);

        expect(res.statusCode).toEqual(200);
        res = await request(server)
          .post('/bookmarklist')
          .set('Authorization', 'Bearer ' + token0)
          .send();
        expect(res.statusCode).toEqual(409);
      });
    });
    describe('PUT /:id', () => {
      beforeEach(async () => {
        const res0 = await request(server)
          .post('/jobs')
          .set('Authorization', 'Bearer ' + token0)
          .send(job2);
        // await request(server)
        //   .post('/jobs')
        //   .set('Authorization', 'Bearer ' + token0)
        //   .send(job1);

        await request(server)
          .post('/bookmarklist')
          .set('Authorization', 'Bearer ' + token0)
          .send(user0);
        // bookmarkList0Id = res0.body._id;
      });
      it('should send 200 to normal user and update their bookmark list', async () => {
        // const res0 = await request(server)
        //   .post('/jobs')
        //   .set('Authorization', 'Bearer ' + token0)
        //   .send(job2);

        // const testRes = await request(server)
        //   .post('/bookmarklist')
        //   .set('Authorization', 'Bearer ' + token0)
        //   .send(user0);

        const user0Id = user0Res.body._id;
        const res = await request(server)
          .put('/bookmarklist/update/' + user0Id)
          .set('Authorization', 'Bearer ' + token0)
          .send(job0);
        // const testJobId = await Job.findOne({ jobId: job0.jobId });
        // const jobObjectId = new mongoose.Types.ObjectId(testJobId._id);
        // testBookmarkLists.push({ ...testRes.body, jobs: [jobObjectId] });
        // testBookmarkLists.push({ ...testRes.body, jobs: job0 });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
          "acknowledged": true,
          "modifiedCount": 1,
          "upsertedId": null,
          "upsertedCount": 0,
          "matchedCount": 1
        });
      });
      it(`should send 404 if user tries to update someone else's bookmark list`, async () => {
        await request(server)
          .post('/bookmarklist')
          .set('Authorization', 'Bearer ' + token0)
          .send(user0);

        const user0Id = user0Res.body._id;
        const res = await request(server)
          .put('/bookmarklist/update/' + user0Id)
          .set('Authorization', 'Bearer ' + token1)
          .send(job0);
        expect(res.statusCode).toEqual(404);
      })

    });
    describe('GET /:id', () => {
      // let bookmarkList0Id, bookmarkList1Id;
      beforeEach(async () => {
        await request(server)
          .post('/jobs')
          .set('Authorization', 'Bearer ' + token0)
          .send(job0);
        await request(server)
          .post('/jobs')
          .set('Authorization', 'Bearer ' + token0)
          .send(job1);
        // await request(server)
        //   .post('/bookmarklist')
        //   .set('Authorization', 'Bearer ' + token0)
        //   .send(user0);
        // bookmarkList0Id = res0.body._id;
        // await request(server)
        //   .post('/bookmarklist')
        //   .set('Authorization', 'Bearer ' + adminToken)
        //   .send(adminUser);
        // // bookmarkList1Id = resAdmin.body._id;
      });
      it('should send 404 for normal users', async () => {
        const testRes = await request(server)
          .post('/bookmarklist')
          .set('Authorization', 'Bearer ' + token0)
          .send(user0);
        testBookmarkLists.push(testRes.body);

        const user0Id = user0Res.body._id;
        const res = await request(server)
          .get('/bookmarklist/' + user0Id)
          .set('Authorization', 'Bearer ' + token0)
          .send();
        expect(res.statusCode).toEqual(404);
      });
      it('should send 200 for admins', async () => {
        const testRes = await request(server)
          .post('/bookmarklist')
          .set('Authorization', 'Bearer ' + token0)
          .send(user0);
        testBookmarkLists.push(testRes.body);

        const adminId = adminRes.body._id;
        const res = await request(server)
          .get('/bookmarklist/' + adminId)
          .set('Authorization', 'Bearer ' + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
      });
    });
    describe('GET /', () => {
      // beforeEach(async () => {
      //   await request(server)
      //     .post('/bookmarklist')
      //     .set('Authorization', 'Bearer ' + token0)
      //     .send(user0);

      //   // await request(server)
      //   //   .post('/bookmarklist')
      //   //   .set('Authorization', 'Bearer ' + adminToken)
      //   //   .send(adminUser);
      //   // // bookmarkList1Id = resAdmin.body._id;
      // });

      it('should send 200 to normal user with their bookmark list', async () => {
        // console.log(`this is in test GET /:id ${bookmarkList0Id}`)
        const testRes = await request(server)
          .post('/bookmarklist')
          .set('Authorization', 'Bearer ' + token0)
          .send(user0);
        testBookmarkLists.push(testRes.body);

        const user0Id = user0Res.body._id;
        const res = await request(server)
          .get('/bookmarklist/')
          .set('Authorization', 'Bearer ' + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        // console.log(res.body);
        expect(res.body[0]).toMatchObject({
          _id: (await BookmarkList.findOne({ userId: user0Id }))._id.toString(),
          userId: (await User.findOne({ email: user0.email }))._id.toString(),
          jobs: [],
          __v: 0
        });
      });
      it('should send 200 for admin with all the bookmark lists', async () => {
        // const adminId = adminRes.body._id;
        const testRes = await request(server)
          .post('/bookmarklist')
          .set('Authorization', 'Bearer ' + token0)
          .send(user0);
        testBookmarkLists.push(testRes.body);

        const res = await request(server)
          .get('/bookmarklist/')
          .set('Authorization', 'Bearer ' + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        // console.log(JSON.stringify(res.body));
        // console.log(JSON.stringify(testBookmarkLists));
        // console.log(res.body.length);
        // expect(res.body).toMatchObject(testBookmarkLists);
      });
      it("should send 400 if bookmark list does not exist", async () => {
        // const user0Id = user0Res.body._id;
        const res = await request(server)
          .get('/bookmarklist/')
          .set('Authorization', 'Bearer ' + token1)
          .send();
        expect(res.statusCode).toEqual(400);
      });
    });
    describe('DELETE /:id', () => {
      it('should send 200 to normal users and delete job from bookmark list', async () => {
        const user0Id = user0Res.body._id;
        const testRes = await request(server)
          .post('/bookmarklist')
          .set('Authorization', 'Bearer ' + token0)
          .send(user0);

        await request(server)
          .put('/bookmarklist/update/' + user0Id)
          .set('Authorization', 'Bearer ' + token0)
          .send(job0);

        const res = await request(server)
          .delete('/bookmarklist/delete/' + user0Id)
          .set('Authorization', 'Bearer ' + token0)
          .send(job0);
        expect(res.statusCode).toEqual(200);
      });
    });
  });

});
