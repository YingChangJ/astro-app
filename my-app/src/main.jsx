import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import ErrorPage from "./routes/error-page.jsx";
import Bazi from "./routes/bazi.jsx";
import Chart from "./routes/chart.jsx";
import Vedic from "./routes/vedic.jsx";
// import Root from "./routes/root.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
// Root;
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} errorElement={<ErrorPage />}>
      <Route index element={<Chart />} />
      <Route path="bazi" element={<Bazi />} />
      <Route path="vedic" element={<Vedic />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
