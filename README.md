# 330-final-project

## Job Search App
A description of the scenario your project is operating in.
   <br>
   - Extension of my final project from last course
   - Job search app using external api (Adzuna) and google maps api

2. A description of what problem your project seeks to solve.
   <br>
   - Search and store job posts for users

3. A description of what the technical components of your project will be, including: the routes, the data models, any external data sources you'll use, etc.
   <br>
   - Mongo Atlas, React, Express

4. Clear and direct call-outs of how you will meet the various project requirements.
   <br>
   - I will use an external API
   - Authentication and Authorization
   - 2 sets of CRUD routes
      - Job Posts:
         - GET - get job post
         - GET :id - get job post based on jobId
         - POST - create job post
         - PUT :id - update job post
      - Bookmark Lists:
         - GET - get job posts from user's saved list
         - GET :id - get job posts from user's saved list [for admins]
         - POST - create saved list for user
         - PUT - update job posts in saved list
   - Text search, aggregations, and lookups
      - search for job posts and bookmark lists using mongoose

## Last Update before Submission:
   What has been done:
   - The backend is functional and working.
   - The tests reach >80% coverage according to jest.
   - Postman tests yield favorable results when routes were individually tested.

   What still needs to be done:
   - Frontend and backend still needs improvement.
        - Some functions that work in the backend do not function perfectly in the frontend.
   - A couple tests still do not pass but that is most likely errors coming from the tests.
        - Needs more thourough testing.
        - I need more practice in writing jest tests.
   - I will continue working on this to have a complete full stack application.
