import express from "express"
import cors from "cors"
const app = express();
import {spawn} from "child_process"
// const {spawn} = require("node:child_process");
// const kill = require("tree-kill");
import kill from "tree-kill"
import { JsonDB, Config } from 'node-json-db';

// The first argument is the database filename. If no extension, '.json' is assumed and automatically added.
// The second argument is used to tell the DB to save after each push
// If you put false, you'll have to call the save() method.
// The third argument is to ask JsonDB to save the database in an human readable format. (default false)
// The last argument is the separator. By default it's slash (/)
var db = new JsonDB(new Config("../settings", true, true, '/'));
await db.push("/test1","super test");

app.use(cors());
app.use(express.json());

app.get("/message", (req, res) => {
  res.json({message: "Hello from server!"});
});

let bat = null;
app.get("/start", (req, res) => {
  bat = spawn(
    "cmd.exe",
    ["/k", "C:\\Users\\aaron\\stable-diffusion-webui\\webui-user.bat"],
    {cwd: "C:\\Users\\aaron\\stable-diffusion-webui", detached: true, shell: true}
  );

  bat.stdout.on("data", (data) => {
    console.log(data.toString());
  });
  res.json({message: "Hello from server!"});
});
app.get("/stop", (req, res) => {
  if (bat !== null) {
    kill(bat.pid);
    bat = null;
    res.json({message: "stopped"});
    return;
  }
  res.json({message: "not stopped"});
});

app.post("/settings", (req, res) => {
  console.log(req.body);
  res.json({message: "Hello from server!"});
});

app.listen(8000, () => {
  console.log(`Server is running on port 8000.`);
});


// Bind controllers to routes
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../client/build/index.html")
  );
});