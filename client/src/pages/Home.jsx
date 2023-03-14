import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";

function Home(props) {
  const setCheckIntegration = props.setCheckIntegration;
  const activeIntegration = props.activeIntegration;
  const data = props.data;

  return (
    <div>
      <header className="App-header">
        {activeIntegration && (
          <>
            <h1>Active Integration</h1>
            <div>
              <div>Directory: {activeIntegration.directory}</div>
              <div>Binary: {activeIntegration.binary}</div>
              <div>Port: {activeIntegration.port}</div>
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
                <a href={"http://" + window.location.hostname + ":" + activeIntegration.port} target="_blank">
                  {" "}
                  View in new tab{" "}
                </a>
              </div>
            </div>
          </>
        )}
        <h1>Integrations</h1>
        {data &&
          Object.entries(data).map(([key, integration]) => (
            <div>
              <div>{key}</div>
              <div>Port: {integration.port}</div>
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
                    body: JSON.stringify({integrationId: key}),
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
