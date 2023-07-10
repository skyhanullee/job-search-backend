require('dotenv').config();
const server = require("./server");
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { dbName: `jobSearch` }).then(() => {
  server.listen(port, () => {
    console.log(`Server is listening on http://127.0.0.1:${port}`);
  });
}).catch((e) => {
  console.error(`Failed to start server:`, e);
});
