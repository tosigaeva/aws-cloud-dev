import React from "react";
import { createRoot } from "react-dom/client";
import App from "~/components/App/App";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { theme } from "~/theme";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const authErrorEventName = "auth-error";

type AuthErrorEventDetail = {
  message: string;
};

function AuthErrorSnackbar() {
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    const onAuthError = (event: Event) => {
      setMessage((event as CustomEvent<AuthErrorEventDetail>).detail.message);
    };

    window.addEventListener(authErrorEventName, onAuthError);

    return () => {
      window.removeEventListener(authErrorEventName, onAuthError);
    };
  }, []);

  return (
    <Snackbar
      open={Boolean(message)}
      autoHideDuration={6000}
      onClose={() => setMessage("")}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert severity="error" onClose={() => setMessage("")}>
        {message}
      </Alert>
    </Snackbar>
  );
}

const showAuthError = (message: string) => {
  window.dispatchEvent(
    new CustomEvent<AuthErrorEventDetail>(authErrorEventName, {
      detail: { message },
    })
  );
};

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 401) {
        showAuthError("Authorization header is missing or invalid. Please set authorization_token in localStorage.");
      }

      if (status === 403) {
        showAuthError("Access denied. Please check your authorization_token value.");
      }
    }

    return Promise.reject(error);
  }
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false, staleTime: Infinity },
  },
});

if (import.meta.env.DEV) {
  const { worker } = await import("./mocks/browser");
  worker.start({ onUnhandledRequest: "bypass" });
}

const container = document.getElementById("app");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthErrorSnackbar />
          <App />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
