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
//initializing the server
initializeServer();
//API 1
app.get("/todos/", async (request, response) => {
  const hasPriorityAndStatusProperties = (requestQuery) => {
    return (
      requestQuery.priority !== undefined && requestQuery.status !== undefined
    );
  };

  const hasPriorityProperty = (requestQuery) => {
    return requestQuery.priority !== undefined;
  };

  const hasStatusProperty = (requestQuery) => {
    return requestQuery.status !== undefined;
  };

  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
    SELECT
        *
    FROM
        todo 
    WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
    SELECT
        *
    FROM
        todo 
    WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
    SELECT
        *
    FROM
        todo 
    WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
    SELECT
        *
    FROM
        todo 
    WHERE
        todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});
//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const GetTodoQuery = `SELECT * FROM todo WHERE id='${todoId}'`;
  const dbresponse = await db.get(GetTodoQuery);
  response.send(dbresponse);
});
//API 3
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const PostQuery = `INSERT INTO todo(id,todo,priority,status) VALUES(${id},'${todo}','${priority}','${status}')`;
  await db.run(PostQuery);
  response.send("Todo Successfully Added");
});
//API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { search_q = " ", todo, priority, status } = request.body;
  const todoProperty = (requestQuery) => {
    return requestQuery.todo !== undefined;
  };

  const hasPriorityProperty = (requestQuery) => {
    return requestQuery.priority !== undefined;
  };

  const hasStatusProperty = (requestQuery) => {
    return requestQuery.status !== undefined;
  };
  let sendMsg = "";
  switch (true) {
    case todoProperty(request.body): //if this is true then below query is taken in the code
      updateTodosQuery = `
        UPDATE
            todo
        SET
            todo='${todo}'
        WHERE
            id=${todoId};`;
      sendMsg = "Todo Updated";
      break;
    case hasPriorityProperty(request.body):
      updateTodosQuery = `
        UPDATE
            todo
        SET
            priority= '${priority}'
        WHERE
            id=${todoId};`;
      sendMsg = "Priority Updated";
      break;
    case hasStatusProperty(request.body):
      updateTodosQuery = `
        UPDATE
            todo
        SET
           status = '${status}'
        WHERE
            id=${todoId};
           `;
      sendMsg = "Status Updated";
      break;
  }
  await db.run(updateTodosQuery);
  response.send(sendMsg);
});
//AP 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const DeleteQuery = `DELETE FROM todo WHERE id=${todoId}`;
  await db.run(DeleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
