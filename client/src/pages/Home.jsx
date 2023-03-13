import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";

function Home() {
  const [data, setData] = useState(null);
  const [activeIntegration, setActiveIntegration] = useState(null);
  const [checkIntegration, setCheckIntegration] = useState(false);
  useEffect(() => {
    (async () => {
      let res = await fetch("api/getIntegrations");
      res = await res.json();
      setData(res);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      let res = await fetch("api/getCurrent");
      res = await res.json();
      setActiveIntegration(res);
      console.log("checkw");
    })();
  }, [checkIntegration]);

  return (
    <div>
      <header className="App-header">
        {activeIntegration && (
          <>
            <h1>Active Integration</h1>
            <div>
              <div>Directory: {activeIntegration.directory}</div>
              <div>Binary: {activeIntegration.binary}</div>
              <div>URL: {activeIntegration.url}</div>
              <div>
                <button
                  onClick={async () => {
                    setTimeout(() => {
                      setCheckIntegration((check) => !check);
                    }, 100);
                    await fetch("/api/stop", {
                      method: "POST",
                      headers: {"Content-Type": "application/json"},
                    });
                  }}
                >
                  Stop
                </button>
              </div>
              <div>
                <Link to="/use">View Embedded</Link>
              </div>
              <div>
                <a href={activeIntegration.url} target="_blank">
                  {" "}
                  View in new tab{" "}
                </a>
              </div>
            </div>
          </>
        )}
        <h1>Integrations</h1>
        {data &&
          data.map((integration) => (
            <div>
              <div>Directory: {integration.directory}</div>
              <div>Binary: {integration.binary}</div>
              <div>URL: {integration.url}</div>
              <button
                onClick={async () => {
                  console.log("checka");
                  setTimeout(() => {
                    console.log("checkb");
                    setCheckIntegration((check) => !check);
                  }, 100);
                  await fetch("/api/start", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(integration),
                  });
                }}
              >
                Start
              </button>
            </div>
          ))}
      </header>
    </div>
  );
}

export default Home;
