import { useEffect, useRef, useState } from "react";
import { host } from "../config";
import toml from "toml";

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
        textAreaRef.current.value = configText_;
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

  return (
    <div {...props}>
      <div className="prose flex flex-col items-center justify-center w-full h-full gap-1 p-5">
        <textarea
            ref={textAreaRef}
            style={{resize: "none"}}
            className="flex-initial textarea textarea-bordered w-full h-full"
            placeholder="config toml"
            onChange={(e) => setConfigText(e.target.value)}
          ></textarea>
          <div className="flex-initial w-full">{tomlParseResult}</div>
      </div>
    </div>
  );
}
