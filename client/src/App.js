import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";

import Properties from "./pages/Properties";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyProperties from "./pages/MyProperties";
import CreateProperty from "./pages/CreateProperty";
import MyBookings from "./pages/MyBookings";
import PrivateRoute from "./components/PrivateRoute";
import PropertyDetail from "./pages/PropertyDetail";


function App() {
  return (
    <>
      
        <div style={{ fontFamily: "Arial, sans-serif", background: "#fafafa", minHeight: "100vh" }}>
  <Navbar />
  <div style={{ padding: "30px 40px" }}>
  

        <Routes>
          <Route path="/" element={<Properties />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />

          <Route
            path="/my-properties"
            element={
              <PrivateRoute>
                <MyProperties />
              </PrivateRoute>
            }
          />

          <Route
            path="/create"
            element={
              <PrivateRoute>
                <CreateProperty />
              </PrivateRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <PrivateRoute>
                <MyBookings />
              </PrivateRoute>
            }
          />
        </Routes>
        </div>
</div>
    </>
  );
}

export default App;
