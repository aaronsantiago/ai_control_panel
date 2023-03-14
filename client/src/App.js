import logo from './logo.svg';
import reportWebVitals from './reportWebVitals';
import './App.css';
import { Routes, Route, Outlet, Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import Home from "./pages/Home";
import ActiveIntegration from './pages/ActiveIntegration';

function App() {
  const [checkIntegration, setCheckIntegration] = useState(false);
  const [activeIntegration, setActiveIntegration] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      let res = await fetch("api/getIntegrations");
      res = await res.json();
      setData(res);
    })();
  }, []);

  function doCheckIntegration() {
    (async () => {
      let res = await fetch("api/getCurrent");
      res = await res.json();
      setActiveIntegration(res);
    })();
  }
  useEffect(doCheckIntegration, [checkIntegration]);
  useEffect(doCheckIntegration, []);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout data={data} setCheckIntegration={setCheckIntegration} />}>
          <Route index element={<Home data={data} activeIntegration={activeIntegration} setCheckIntegration={setCheckIntegration} />} />
          <Route path='use' element={<ActiveIntegration activeIntegration={activeIntegration} />} />
        </Route>
      </Routes>
    </div>
  );
}

function Layout({data, setCheckIntegration}) {
  return (
    <div>
      {/* A "layout route" is a good place to put markup you want to
          share across all the pages on your site, like navigation. */}
      <nav style={{height:"5vh"}}>
        <Link to="/">Back to Home</Link>
        <Link to="use">iframe active integration</Link>
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
        {data &&
          Object.entries(data).map(([key, integration]) => (
            <div>
              <div>{key}</div>
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
      </nav>

      <hr />

      {/* An <Outlet> renders whatever child route is currently active,
          so you can think about this <Outlet> as a placeholder for
          the child routes we defined above. */}
      <div style={{height: "90vh"}}>
        <Outlet/>
        </div>
    </div>
  );
}

export default App;
