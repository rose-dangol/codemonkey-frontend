import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AppThemeLoader } from "./services/AppThemeLoader.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GlobalLoader } from "./components/GlobalLoader.tsx";
import { ErrorFallBack } from "./components/ErrorFallback.tsx";
import { ErrorBoundary } from "react-error-boundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./contexts/AuthContext.tsx";

AppThemeLoader();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: false,
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) return false;
        return failureCount < 3;
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GlobalLoader />
          <ErrorBoundary
            FallbackComponent={ErrorFallBack}
            onReset={() => {
              queryClient.invalidateQueries();
            }}
          >
            <App />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </ErrorBoundary>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
