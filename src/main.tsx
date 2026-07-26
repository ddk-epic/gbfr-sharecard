import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { rootRoute } from "./app/root-route";
import { indexRoute } from "./app/App";
import "./styles/theme.css";
import "./styles/art.css";
import "./styles/global.css";

// Single route at the Pages base path; the screen rides in the search params.
const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute]),
  basepath: import.meta.env.BASE_URL,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
