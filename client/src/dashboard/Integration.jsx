import {useEffect, useRef, useState} from "react";
import {host} from "../config";

export default function Integration({integrationId, info, ...props}) {
  let [logs, setLogs] = useState(null);
  let modalRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      let res = await fetch(host + "api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({integrationId: integrationId}),
      });
      res = await res.text();
      setLogs(res);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div {...props}>
      <div className="flex flex-col items-center justify-center w-full h-full">
        <h1>{integrationId}</h1>
        {info && info[integrationId] && info[integrationId]?.pm2_env?.status ? (
          <h2>Status: {info[integrationId].pm2_env.status}</h2>
        ) : null}
        <button
          onClick={async () => {
            await fetch(host + "api/start", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({integrationId: integrationId}),
            });
          }}
        >
          Start
        </button>
        <button
          onClick={async () => {
            await fetch(host + "api/stop", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({integrationId: integrationId}),
            });
          }}
        >
          Stop
        </button>
        <div className="flex-1 overflow-auto w-full">
          <pre>
            <code>{logs}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
