import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AppThemeLoader } from "./services/AppThemeLoader.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GlobalLoader } from "./components/GlobalLoader.tsx";
import { ErrorFallback } from "./components/ErrorFallBack.tsx";
import { ErrorBoundary } from "react-error-boundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

AppThemeLoader();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: true,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <GlobalLoader />
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
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
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
