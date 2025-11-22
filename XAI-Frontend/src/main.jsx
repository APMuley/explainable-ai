import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

import MainLayout from "./App.jsx";   // Layout
import Home from "./pages/Home.jsx";  // Your Home page
import Classification from "./components/classification/Classification.jsx"; // Actual workflow
import Performance from "./pages/Performance.jsx"

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      <Route index element={<Home />} />  
      <Route path="classification" element={<Classification />} />
      <Route path="performance" element={<Performance />} />
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
