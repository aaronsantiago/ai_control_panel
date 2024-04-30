import {useEffect, useState} from "react";

function Client({host}) {
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
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="h-full p-5">
        {integrations === null ? (
          <div>Loading...</div>
        ) : (
          <div className="flex gap-5 h-full flex-col">
            <div>{host}</div>
            {Object.keys(integrations).map((key) => (
              <div className="flex justify-between" key={key}>
                <div
                  style={{width: "48rem"}}
                  className="card bg-base-100 flex-initial"
                  key={key}
                >
                  {key}
                </div>
                <div>{info &&
                            info[key] &&
                            info[key]?.pm2_env?.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Client;
