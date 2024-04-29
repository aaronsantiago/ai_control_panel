import {useEffect, useState} from "react";
import Integration from "./Integration";
import {host} from "../config";

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
          <div className="flex gap-5 h-full">
            {Object.keys(integrations).map((key) => (
              <div
                style={{width: "48rem"}}
                className="card bg-base-100 flex-initial"
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
