import React, { Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider } from "@deriv-com/quill-ui";
import { observer } from "mobx-react-lite";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";
import Header from "./components/Header/Header";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { authStore } from "./stores/AuthStore";
import { authService } from "./services/auth.service";

const Homepage = React.lazy(() => import("./pages/homepage"));
const DerivTrading = React.lazy(() => import("./pages/trading"));
const NotFoundPage = React.lazy(() => import("./pages/404"));

const AuthHandler: React.FC = observer(() => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token1");

    if (token) {
      authStore.handleAuthCallback(token).then((success) => {
        // Clear the token from URL
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);

        if (success) {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      });
    }
  }, [location, navigate]);

  return null;
});

const AppContent: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthHandler />
      <Header />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/dashboard" element={<DerivTrading />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

const App: React.FC = observer(() => {
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    // Initialize auth store
    authStore.initialize().then(() => {
      setIsInitialized(true);
    });

    return () => {
      // Cleanup auth service when app unmounts
      authService.cleanup();
    };
  }, []);

  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider theme="light" persistent>
        <BrowserRouter basename="/">
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
});

export default App;
