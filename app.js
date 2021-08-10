import express from "express";
import { realpathSync } from "fs";
import morgan from "morgan";
import path from "path";
import redis from "redis";
import { redirect } from "statuses";

const client = redis.createClient();
client.on("connect", () => {
  console.log("redis is running");
});

const app = express();
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

///list list list list
app.post("/", (req, res) => {
  const data = req.body;
  const { task } = data;

  client.lpush("tasks", task, function (err, reply) {
    res.redirect("/");
  });
});

app.post("/tasks/delete", (req, res) => {
  const tasksToDel = req.body.tasks;
  client.lrange("tasks", 0, -1, function (erro, reply) {
    for (let i = 0; i < tasksToDel.length; i++) {
      const exist = reply.indexOf(tasksToDel[i]);
      if (exist > -1) {
        client.lrem("tasks", 1, tasksToDel[i], function (err, reply) {
          if (err) {
            console.log(err);
          }
          console.log(reply);
        });
      }
    }
  });
  res.redirect("/");
});

app.get("/", (req, res) => {
  const title = "title";

  client.lrange("tasks", 0, -1, function (err, reply) {
    client.hmget(
      "userInfo",
      "name",
      "age",
      "tel",
      "adress",
      function (err, user) {
        res.render("index", { title: "title", tasks: reply, user });
      }
    );
  });
});
///list list list list

app.post("/call/add", (req, res) => {
  const data = req.body;

  const name = data.name;
  const tel = data.tel;
  const adress = data.adress;
  const age = data.age;

  client.hmset(
    "userInfo",
    ["name", name, "tel", tel, "adress", adress, "age", age],
    function (err, reply) {
      if (err) {
        console.log(e);
      }

      console.log(reply);
      res.redirect("/");
    }
  );
});

app.listen(4000, () => console.log("server is rinning"));

export default app;
