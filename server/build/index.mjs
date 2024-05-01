import express from "express";
import cors from "cors";
const app = express();

import path from "path";
import fs from "fs";
const __dirname = path.resolve();
import readLastLines from "read-last-lines";
import toml from "toml";
import pm2 from "pm2";

let config = {};
let rawConfig = "";

function loadConfig() {
  rawConfig = fs.readFileSync(path.join(__dirname, "settings.toml")).toString();
  console.log(rawConfig)
  try {
    config = toml.parse(rawConfig);
  }
  catch (e) {
    return e.message;
  }
  return "ok";
}
loadConfig();


app.use(cors());
app.use(express.json());

async function startIntegration(integrationId) {
  let integration = config.integrations[integrationId];
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
      }
      console.log("Started integration ", integrationId);
    }
  );
}

pm2.connect(function (err) {
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
  fs.writeFileSync(path.join(__dirname, "settings.toml"), rawConfig);
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
  res.json(config.integrations);
});

app.get("/api/info", async (req, res) => {
  pm2.list((err, list) => {
    res.json(list);
  });
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

app.use(express.static(path.join(__dirname, "_/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "_/dist/index.html"));
});
