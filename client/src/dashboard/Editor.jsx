import { useEffect, useRef, useState } from "react";
import { host } from "../config";
import toml from "toml";

import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-toml";
import "ace-builds/src-noconflict/theme-monokai";
import { useCallback } from "react";

export default function Editor(props) {
  let [configText, setConfigText] = useState("");
  let [tomlParseResult, setTomlParseResult] = useState(null);
  let textAreaRef = useRef(null);

  useEffect(() => {
    (async () => {
      // get config from localStorage
      let configText_ = await fetch(host + "api/raw_config", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      configText_ = await configText_.text();
      if (configText_) {
        textAreaRef.current.editor.setValue(configText_);
        setConfigText(configText_);
      }
    })();
  }, []);

  useEffect(() => {
    try {
      toml.parse(configText);
      setTomlParseResult("Config is valid");
    }
    catch (e) {
      setTomlParseResult(e.message);
    }
  }, [configText]);

  let [presets, setPresets] = useState(null);
  useEffect(() => {
    const interval = setInterval(async () => {
      let res = await fetch(host + "api/presets", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      res = await res.json();
      setPresets(res);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  let saveConfig = useCallback(async () => {
    let res = await fetch(host + "api/raw_config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({rawConfig: configText}),
    });
    setTomlParseResult(await res.text());
  });

  return (
    <div {...props}>
      <div className="card flex flex-col w-full h-full gap-1">
        <AceEditor
            ref={textAreaRef}
            style={{resize: "none"}}
            className="flex-initial w-full h-full"
            mode="toml"
            theme="monokai"
            placeholder="config toml"
            width="100%"
            height="100%"
            value={configText}
            onChange={(e) => setConfigText(e)}
          ></AceEditor>
          <div className="flex-initial w-full flex justify-between p-5">
            <div>{tomlParseResult}</div>
            <button className="btn btn-primary" onClick={saveConfig}>save</button>
          </div>
      </div>
    </div>
  );
}
