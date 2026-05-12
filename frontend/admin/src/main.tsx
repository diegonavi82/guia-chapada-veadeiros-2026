import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import "./styles.css";

const router = createBrowserRouter([
  { path: "/", element: <Dashboard /> },
  { path: "/posts", element: <Dashboard /> },
  { path: "/posts/:postId", element: <Dashboard /> },
  { path: "/login", element: <Login /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
