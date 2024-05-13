import {useEffect, useState} from "react";
import {host} from "../config";

export default function Presets(props) {
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
      <div className="flex flex-col items-center justify-center w-full h-full gap-1 p-5">
        <div className="prose">
          <h1 className="text-secondary">presets</h1>
          <div className="flex flex-initial w-full justify-between flex-col">
            {
              presets ? Object.keys(presets).map((presetId, index) => {
                return <div key={presetId} className="flex">
                  <div tabIndex={index} className="collapse bg-base-200">
                    <div className="collapse-title text-xl font-medium">
                      {presetId}
                    </div>
                    <div className="collapse-content">
                      {presets[presetId].map((integration) => <p key={integration} className="bg-base-100">{integration}</p>)}
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={async () => {
                    await fetch(host + "api/preset", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({presetId: presetId}),
                    });
                  }}>Start</button>
                </div>
              }) : null
            }
          </div>
        </div>
      </div>
    </div>
  );
}
