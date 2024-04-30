import {useState, useEffect, useCallback, useRef} from "react";
import toml from "toml";
import Client from "./Client";

function App() {
  let [config, setConfig] = useState({});
  let [configText, setConfigText] = useState("");
  let textAreaRef = useRef(null);

  useEffect(() => {
    // get config from localStorage
    let configText_ = localStorage.getItem("odin_meta-config");
    if (configText_) {
      textAreaRef.current.value = configText_;
      setConfigText(configText_);
    }
  }, []);


  useEffect(() => {
    try {
      setConfig(toml.parse(configText));
    } catch (e) {
      console.log(e);
    }
    localStorage.setItem("odin_meta-config", configText);
  }, [configText]);

  let runPreset = useCallback((preset) => {
    if (config && config.clients) {
      config.clients.forEach((client) => {
        fetch("http://" + client + "/api/preset", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({presetId: preset}),
        });
      });
    }
  });
  return (
    <div className="flex w-screen h-screen">
      <div className="flex h-full flex-col">
        <textarea
          ref={textAreaRef}
          style={{resize: "none"}}
          className="flex-initial textarea textarea-bordered w-48 h-1/2"
          placeholder="config toml"
          onChange={(e) => setConfigText(e.target.value)}
        ></textarea>
        <div className="flex-initial h-1/2 overflow-y-auto">
          <div>Run presets on all clients</div>
          {config && config.presets
            ? config.presets.map((preset, index) => {
                return (
                  <button
                    key={index}
                    className="btn btn-primary"
                    onClick={() => {
                      runPreset(preset);
                    }}
                  >
                    {preset}
                  </button>
                );
              })
            : null}
        </div>
      </div>
      {config && config.clients
        ? config.clients.map((client, index) => {
            console.log("rendering", config);
            return <Client key={index} host={"http://" + client + "/"} />;
          })
        : null}
    </div>
  );
}

export default App;
