import express from "express";
import cors from "cors";
const app = express();
import {spawn} from "child_process";
import path from "path";
import fs from "fs";
// const {spawn} = require("node:child_process");
// const kill = require("tree-kill");
const __dirname = path.resolve();
import readLastLines from "read-last-lines";

import toml from "toml";

import {JsonDB, Config} from "node-json-db";
import kill from "tree-kill";

import pm2 from "pm2";

let config = toml.parse(fs.readFileSync(path.join(__dirname, "../settings.toml")).toString());

// // The first argument is the database filename. If no extension, '.json' is assumed and automatically added.
// // The second argument is used to tell the DB to save after each push
// // If you put false, you'll have to call the save() method.
// // The third argument is to ask JsonDB to save the database in an human readable format. (default false)
// // The last argument is the separator. By default it's slash (/)
// var db = new JsonDB(new Config("../settings", true, true, "/"));

console.log(config);

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

async function startIntegration(integrationId) {
  let integration = (await db.getData(`/integrations/`))[integrationId];
  pm2.start(
    {
      name: integrationId,
      output: path.join(__dirname, "logs", integrationId + ".log"),
      error: path.join(__dirname, "logs", integrationId + ".log"),
      ...integration
    },
    function (err, apps) {
      if (err) {
        console.error(err);
        // return pm2.disconnect();
      }
      // pm2.list((err, list) => {
      //   console.log(err, list)

      //   pm2.restart('api', (err, proc) => {
      //     // Disconnects from PM2
      //     pm2.disconnect()
      //   })
      // })
      console.log("Started integration ", integrationId);
    }
  );
}

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
  startIntegration(req.body.integrationId);
});

app.get("/api/presets", async (req, res) => {
  res.json(await db.getData("/presets"));
});

app.post("/api/preset", async (req, res) => {
  let presets = await db.getData("/presets");
  let preset = presets[req.body.presetId];
  let integrations = await db.getData("/integrations");

  let info = await (async () => {
    return new Promise((resolve, reject) => {
      pm2.list((err, list) => {
        let mappedRes = {};
        for (let el of list) {
          mappedRes[el.name] = el;
        }
        resolve(mappedRes);
      });
    });
  })();
  console.log(info);

  for (let integration in integrations) {
    if (preset.includes(integration)) {
      if (!info[integration] || info[integration].pm2_env.status != "online") {
        await startIntegration(integration);
      }
    }
    else {
      if (info[integration] && info[integration].pm2_env.status == "online") {
        pm2.stop(integration, (err, proc) => {
          console.log("Stopped integration ", integration);
        });
      }
    }
  }
  res.send("OK");
});


app.post("/api/stop", (req, res) => {
  pm2.stop(req.body.integrationId, (err, proc) => {
    console.log("Stopped integration ", req.body.integrationId);
  });
});

app.get("/api/getCurrent", (req, res) => {
  res.json(current);
});

app.get("/api/getIntegrations", async (req, res) => {
  res.json(await db.getData("/integrations"));
});

app.get("/api/info", async (req, res) => {
  pm2.list((err, list) => {
    // console.log(err, list);
    res.json(list);
  });
  // res.json(await db.getData("/integrations"));
});

app.post("/api/logs", async (req, res) => {
  let log;
  try {
    log = await readLastLines.read(
      path.join(__dirname, "logs", req.body.integrationId + ".log"),
      req.query.length || 1000
    );
  } catch (e) {
    log = "";
  }
  res.send(log);
});

app.listen(8000, () => {
  console.log(`Server is running on port 8000.`);
});

app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});
