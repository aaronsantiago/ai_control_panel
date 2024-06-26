import express from "express";
import cors from "cors";
const app = express();

import path from "path";
import fs from "fs";
const __dirname = path.resolve();
import readLastLines from "read-last-lines";
import toml from "toml";
import pm2 from "pm2";
import { exec } from "child_process";

let config = {};
let rawConfig = "";

let logBuffers = {};

import Tail from "tail-file"

let configPath = "settings.toml";
if (process.argv.length > 2) {
  configPath = process.argv[2];
}

function loadConfig() {
  // check if the file exists
  if (!fs.existsSync(path.join(__dirname, configPath))) {
    // create the file
    fs.writeFileSync(
      path.join(__dirname, configPath),
      `[presets]
test = ["test"]

[integrations.test]
directory = "C:\\Users\\aaron"
script = "C:\\Users\\aaron\\webui-user.bat"
interpreter = "cmd.exe"
metadata = {port = "7860"}`,
    );
  }

  rawConfig = fs.readFileSync(path.join(__dirname, configPath)).toString();
  console.log(rawConfig);
  try {
    config = toml.parse(rawConfig);
  } catch (e) {
    return e.message;
  }
  return "ok";
}
loadConfig();

app.use(cors());
app.use(express.json());

async function startIntegration(integrationId) {
  let integration = config.integrations[integrationId];
  let logPath = path.join(__dirname, "logs", integrationId + ".log");
  pm2.start(
    {
      name: integrationId,
      output: logPath,
      error: logPath,
      ...integration,
    },
    function (err, apps) {
      if (err) {
        console.error(err);
      }
      console.log("Started integration ", integrationId);
    },
  );
  let logBuffer = [];
  try {
    let log = await readLastLines.read(
      logPath,
      1000,
    );
    logBuffer = log.split("\n");
  } catch (e) {}

  const tail = new Tail(logPath, {force: true}, line => {
    logBuffer.push(line);
    while (logBuffer.length > 1000) {
      logBuffer.shift();
    }
  });

  logBuffers[integrationId] = {
    buffer: logBuffer,
    tail,
  }
}

pm2.connect(true, function (err) {
  if (err) {
    console.error(err);
    process.exit(2);
  }

  console.log("Connected to PM2");
});

app.post("/api/start", async (req, res) => {
  startIntegration(req.body.integrationId);
});

app.get("/api/raw_config", async (req, res) => {
  res.send(rawConfig);
});

app.post("/api/raw_config", async (req, res) => {
  rawConfig = req.body.rawConfig;
  fs.writeFileSync(path.join(__dirname, configPath), rawConfig);
  let result = loadConfig();
  res.send(result);
});

app.get("/api/presets", async (req, res) => {
  res.json(config.presets);
});

app.post("/api/preset", async (req, res) => {
  let preset = config.presets[req.body.presetId];

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

  for (let integration in config.integrations) {
    if (preset.includes(integration)) {
      if (!info[integration] || info[integration].pm2_env.status != "online") {
        await startIntegration(integration);
      }
    } else {
      if (info[integration] && info[integration].pm2_env.status == "online") {
        stopIntegration(integration);
      }
    }
  }
  res.send("OK");
});

function stopIntegration(integration) {
  pm2.delete(integration, (err, proc) => {
    console.log("Stopped integration ", integration);
  });

  if (logBuffers[integration] != null) {
    logBuffers[integration].tail.stop();
    delete logBuffers[integration];
  }

  // run postinstall command in the working directory
  let postinstall = config.integrations[integration].postinstall;
  if (postinstall) {
    exec(
      postinstall,
      { cwd: config.integrations[integration].directory },
      (err, stdout, stderr) => {
        if (err) {
          console.error(err);
        }
      },
    );
  }
}

app.post("/api/stop", (req, res) => {
  stopIntegration(req.body.integrationId);
});

app.get("/api/getCurrent", (req, res) => {
  res.json(current);
});

app.get("/api/getIntegrations", async (req, res) => {
  res.json(config.integrations);
});

app.get("/api/info", async (req, res) => {
  pm2.list((err, list) => {
    res.json(list);
  });
});

app.post("/api/logs", async (req, res) => {
  let log;
  if (logBuffers[req.body.integrationId] != null) {
    for (let line of logBuffers[req.body.integrationId].buffer) {
      log += line + "\n";
    }
  }
  res.send(log);
});

app.listen(8000, () => {
  console.log(`Server is running on port 8000.`);
});

app.use(express.static(path.join(__dirname, "_/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "_/dist/index.html"));
});
