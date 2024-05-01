import {useEffect, useState} from "react";
import Integration from "./Integration";
import {host} from "../config";
import Presets from "./Presets";
import Editor from "./Editor";

function Dashboard() {
  const [integrations, setIntegrations] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      let res = await fetch(host + "api/getIntegrations");
      res = await res.json();
      setIntegrations(res);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      let res = await fetch(host + "api/info");
      res = await res.json();
      let mappedRes = {};
      for (let el of res) {
        mappedRes[el.name] = el;
      }
      setInfo(mappedRes);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full overflow-x-auto overflow-y-hidden">
      <div className="h-full p-5">
        {integrations === null ? (
          <div>Loading...</div>
        ) : (
          <div className="flex flex-initial flex-nowrap gap-5 h-full w-full">
            <div
              style={{width: "48rem"}}
              className="bg-base-100 flex-none flex flex-col"
            >
              <Editor style={{height: "250%"}} className="w-full" />
              <Presets className="h-full" />
            </div>
            {Object.keys(integrations).map((key) => (
              <div
                style={{width: "36rem"}}
                className="card bg-base-100 flex-none"
                key={key}
              >
                <Integration
                  className="h-full"
                  integrationId={key}
                  info={info}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
