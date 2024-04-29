import { useEffect, useState } from 'react'

let host = "http://localhost:8000/";

if (process.env.NODE_ENV != "development") {
  host = "/";
};

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
    <>
      <div>
        {integrations === null ? (
          <div>Loading...</div>
        ) : (
          <div>
            {Object.keys(integrations).map((key) => (
              <div key={key}>
                <h1>{key}</h1>
                {info && info[key] && info[key]?.pm2_env?.status ? (
                  <h2>Status: {info[key].pm2_env.status}</h2>
                ) : null}
                <button
                  onClick={async () => {
                    await fetch(host + "api/start", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({integrationId: key}),
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
                      body: JSON.stringify({integrationId: key}),
                    });
                  }}
                >
                  Stop
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default Dashboard;
