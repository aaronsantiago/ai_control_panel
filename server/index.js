import express from "express";
import cors from "cors";
const app = express();
import {spawn} from "child_process";
import path from "path";
// const {spawn} = require("node:child_process");
// const kill = require("tree-kill");
import kill from "tree-kill";
import {JsonDB, Config} from "node-json-db";
const __dirname = path.resolve();

import pm2 from "pm2";

// The first argument is the database filename. If no extension, '.json' is assumed and automatically added.
// The second argument is used to tell the DB to save after each push
// If you put false, you'll have to call the save() method.
// The third argument is to ask JsonDB to save the database in an human readable format. (default false)
// The last argument is the separator. By default it's slash (/)
var db = new JsonDB(new Config("../settings", true, true, "/"));

try {
  await db.getData("/integrations");
} catch {
  db.push("/integrations", []);
}

app.use(cors());
app.use(express.json());

let bat = null;
let current = null;

let pm2Instance = null;

pm2.connect(function (err) {
  if (err) {
    console.error(err);
    process.exit(2);
  }

  pm2Instance = pm2;
  console.log("Connected to PM2");
});

app.post("/api/start", async (req, res) => {
  if (bat !== null) {
    kill(bat.pid);
    bat = null;
  }
  let requestId = req.body.integrationId;
  let integration = (await db.getData(`/integrations/`))[requestId];

  console.log("dirname", __dirname);
  pm2.start(
    {
      script: path.join(integration.directory, integration.binary),
      cwd: integration.directory,
      name: req.body.integrationId,
      interpreter: path.join(integration.directory, integration.interpreter),
      output: path.join(__dirname, "logs", req.body.integrationId + ".log"),
      error: path.join(__dirname, "logs", req.body.integrationId + ".log"),
    },
    function (err, apps) {
      if (err) {
        console.error(err);
        return pm2.disconnect();
      }
      // pm2.list((err, list) => {
      //   console.log(err, list)

      //   pm2.restart('api', (err, proc) => {
      //     // Disconnects from PM2
      //     pm2.disconnect()
      //   })
      // })
      console.log("Started integration ", req.body.integrationId);
    }
  );

  // bat = spawn(
  //   "cmd.exe",
  //   ["/k", path.join(integration.directory, integration.binary)],
  //   {cwd: integration.directory, detached: true, shell: true}
  // );
  // current = integration;
});

app.post("/api/stop", (req, res) => {
  if (bat != null) {
    kill(bat.pid);
    bat = null;
  }
  current = null;
});

app.get("/api/getCurrent", (req, res) => {
  res.json(current);
});

app.get("/api/getIntegrations", async (req, res) => {
  res.json(await db.getData("/integrations"));
});

app.get("/api/info", async (req, res) => {
  pm2.list((err, list) => {
    console.log(err, list);
    res.json(list);
  });
  // res.json(await db.getData("/integrations"));
});

app.listen(8000, () => {
  console.log(`Server is running on port 8000.`);
});

app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});
