import logo from './logo.svg';
import reportWebVitals from './reportWebVitals';
import './App.css';
import { Routes, Route, Outlet, Link } from "react-router-dom";
import Home from "./pages/Home";
import CreateIntegration from './pages/CreateIntegration';
import ActiveIntegration from './pages/ActiveIntegration';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='create' element={<CreateIntegration />} />
          <Route path='use' element={<ActiveIntegration />} />
          {/* <Route path="about" element={<About />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="*" element={<NoMatch />} /> */}
        </Route>
      </Routes>
    </div>
  );
}

function Layout() {
  return (
    <div>
      {/* A "layout route" is a good place to put markup you want to
          share across all the pages on your site, like navigation. */}
      <nav style={{height:"5vh"}}>
        <Link to="/">Back to Home</Link>
        <Link to="use">iframe active integration</Link>
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
