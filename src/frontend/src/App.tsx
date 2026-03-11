import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import BrowsePage from "./pages/BrowsePage";
import HomePage from "./pages/HomePage";
import PremiumPage from "./pages/PremiumPage";
import VideoPage from "./pages/VideoPage";

function Layout() {
  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <Outlet />
      <footer className="border-t border-border mt-16 py-6 text-center text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} KSRP FM. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-crimson hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <Outlet />
      <Toaster />
    </AuthProvider>
  ),
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: Layout,
});

const homeRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: HomePage,
});

const browseRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/browse/$genre",
  component: BrowsePage,
});

const videoRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/video/$id",
  component: VideoPage,
});

const premiumRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/premium",
  component: PremiumPage,
});

const adminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  authRoute,
  layoutRoute.addChildren([
    homeRoute,
    browseRoute,
    videoRoute,
    premiumRoute,
    adminRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
