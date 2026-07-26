// Apart from main.tsx: a route naming its parent from the entry point would
// make the imports circular.

import { createRootRoute, Outlet } from "@tanstack/react-router";

export const rootRoute = createRootRoute({ component: Outlet });
