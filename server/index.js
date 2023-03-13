const express = require("express");
const cors = require("cors");
const app = express();
const {spawn} = require("node:child_process");
const kill = require("tree-kill");

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

app.listen(8000, () => {
  console.log(`Server is running on port 8000.`);
});
