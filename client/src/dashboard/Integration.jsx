import {useEffect, useRef, useState} from "react";
import {host} from "../config";

export default function Integration({integrationId, info, ...props}) {
  let [logs, setLogs] = useState(null);
  let scrollRef = useRef(null);
  let initialScroll = useRef(false);

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

  useEffect(() => {
    console.log(initialScroll.current, scrollRef.current?.scrollTop, scrollRef.current?.scrollHeight);
    if(scrollRef.current && !initialScroll.current && logs) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      initialScroll.current = true;
    }
  }, [logs]);

  return (
    <div {...props}>
      <div className="prose flex flex-col items-center justify-center w-full h-full gap-1 p-5">
        <h1 className="text-primary">{integrationId}</h1>
        <div className="flex flex-initial w-full justify-between">
          <div className="join">
            <button
              className="btn btn-primary join-item"
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
              className="btn btn-secondary join-item"
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
          </div>
          
          {info &&
          info[integrationId] &&
          info[integrationId]?.pm2_env?.status ? (
              <h2 className="m-0">{info[integrationId].pm2_env.status}</h2>
          ) : null}
        </div>
        <pre ref={scrollRef} className="flex-1 overflow-auto w-full">
          {/* <pre className="overflow-visible"> */}
            <code>{logs}</code>
          {/* </pre> */}
        </pre>
      </div>
    </div>
  );
}
