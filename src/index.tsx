import "./index.css";
import React from "react";
import { render } from "react-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { App } from "./App";
import { KitPage } from "./components/KitPage";
import { matchKitId, usePathname } from "./router";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function Root() {
  const kitId = matchKitId(usePathname());
  if (!kitId) return <App />;
  return (
    <div className="w-full max-w-[390px] sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto min-h-screen bg-brand-dark shadow-2xl overflow-hidden relative print:max-w-none print:min-h-0 print:bg-white print:shadow-none print:overflow-visible">
      <KitPage kitId={kitId} />
    </div>
  );
}

render(
  <ConvexProvider client={convex}>
    <Root />
  </ConvexProvider>,
  document.getElementById("root")
);