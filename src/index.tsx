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
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";

const authErrorEventName = "auth-error";
const requestStateEventName = "request-state";

type RequestStateEventDetail = {
  pendingRequests: number;
};

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

function GlobalRequestLoader() {
  const [pendingRequests, setPendingRequests] = React.useState(0);

  React.useEffect(() => {
    const onRequestStateChange = (event: Event) => {
      setPendingRequests(
        (event as CustomEvent<RequestStateEventDetail>).detail.pendingRequests
      );
    };

    window.addEventListener(requestStateEventName, onRequestStateChange);

    return () => {
      window.removeEventListener(requestStateEventName, onRequestStateChange);
    };
  }, []);

  if (pendingRequests === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        left: 0,
        position: "fixed",
        right: 0,
        top: 0,
        zIndex: (muiTheme) => muiTheme.zIndex.tooltip + 1,
      }}
    >
      <LinearProgress />
    </Box>
  );
}

const showAuthError = (message: string) => {
  window.dispatchEvent(
    new CustomEvent<AuthErrorEventDetail>(authErrorEventName, {
      detail: { message },
    })
  );
};

let pendingRequests = 0;

const emitRequestState = () => {
  window.dispatchEvent(
    new CustomEvent<RequestStateEventDetail>(requestStateEventName, {
      detail: { pendingRequests },
    })
  );
};

const increasePendingRequests = () => {
  pendingRequests += 1;
  emitRequestState();
};

const decreasePendingRequests = () => {
  pendingRequests = Math.max(0, pendingRequests - 1);
  emitRequestState();
};

axios.interceptors.request.use(
  (config) => {
    increasePendingRequests();
    return config;
  },
  (error) => {
    decreasePendingRequests();
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    decreasePendingRequests();
    return response;
  },
  (error) => {
    decreasePendingRequests();

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
          <GlobalRequestLoader />
          <AuthErrorSnackbar />
          <App />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
