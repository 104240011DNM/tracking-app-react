import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'leaflet/dist/leaflet.css';


import SigninForm from "./features/component/SigninForm.jsx";
import SignupForm from "./features/component/SignupForm.jsx";
import Logout from "./features/component/Logout.jsx";

import SensorMonitor from "./features/sensors/SensorMonitor";
import PlanViewer from "./features/runplan/PlanViewer";
import MapTracker from "./features/tracking/MapTracker";
import PlanGenerator from "./features/runplan/PlanGenerator";
import TodayInfo from "./features/component/TodayInfo";
import useAuthListener from "./hooks/useAuthListener";

const App = () => {
  if (window.document.namespaces) {
    try {
      delete window.document.namespaces;
    } catch (e) {
      console.warn("VML namespaces couldn't be removed");
    }
  }
  const { user, loading } = useAuthListener();

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <h1>🏃 Run Plan & Tracking App</h1>

        {user ? (
          <>
            <p>Welcome, {user.email}!</p>
            <Logout />

            <Routes>
              <Route path="/" element={<MapTracker />} />
              <Route path="/plan" element={<PlanGenerator />} />
              <Route path="/myplan" element={<PlanViewer userId={user.uid} />} />
              <Route path="/monitor" element={<SensorMonitor userId={user.uid} />} />
            </Routes>

            <nav style={{ marginBottom: '10px' }}>
            <a href="/" style={{ marginRight: '10px' }}>🏃 Track</a>
            <a href="/plan" style={{ marginRight: '10px' }}>📋 Plan</a>
            <a href="/myplan" style={{ marginRight: '10px' }}>📅 My Plan</a>
            <a href="/monitor">📡 Monitor</a>
            </nav>
          </>
        ) : (
          <>
            <Routes>
              <Route path="/" element={<SigninForm />} />
              <Route path="/signup" element={<SignupForm />} />
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;
