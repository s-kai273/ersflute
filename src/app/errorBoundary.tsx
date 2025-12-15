import { Component, useEffect } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { ErrorDialog, showErrorDialog } from "@/features/errorDialog";

let globalErrorListenerUsage = 0;

const handleWindowError = (event: ErrorEvent) => {
  showErrorDialog(event.error ?? event.message, {
    context: event.filename
      ? `${event.filename}${event.lineno ? `:${event.lineno}` : ""}${
          event.colno ? `:${event.colno}` : ""
        }`
      : undefined,
  });
};

const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  showErrorDialog(event.reason, {
    context: "Unhandled promise rejection",
  });
};

function GlobalErrorListener() {
  useEffect(() => {
    globalErrorListenerUsage += 1;
    if (globalErrorListenerUsage === 1) {
      window.addEventListener("error", handleWindowError);
      window.addEventListener("unhandledrejection", handleUnhandledRejection);
    }

    return () => {
      globalErrorListenerUsage -= 1;
      if (globalErrorListenerUsage === 0) {
        window.removeEventListener("error", handleWindowError);
        window.removeEventListener(
          "unhandledrejection",
          handleUnhandledRejection,
        );
      }
    };
  }, []);

  return null;
}

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    const trimmedStack = info.componentStack
      ? info.componentStack.trim()
      : undefined;
    showErrorDialog(error, {
      context: trimmedStack
        ? `React component stack:\n${trimmedStack}`
        : undefined,
    });
  }

  override render() {
    return (
      <>
        <GlobalErrorListener />
        <ErrorDialog />
        {this.state.hasError ? null : this.props.children}
      </>
    );
  }
}
