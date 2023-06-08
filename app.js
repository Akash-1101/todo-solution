const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(4003, () => {
      console.log("The Server is running at http://localhost:4003");
    });
  } catch (e) {
    console.log(e.message);
  }
};
initializeServer();
app.get("/todos/", async (request, response) => {
  const GetQuery = `Select * FROM todo`;
  const dbresponse = await db.all(GetQuery);
  response.send(dbresponse);
});
