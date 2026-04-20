import "./index.css";
import React from "react";
import { render } from "react-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { App } from "./App";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

render(
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>,
  document.getElementById("root")
);