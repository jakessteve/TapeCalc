import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Root-level error boundary — catches rendering errors and shows a recovery UI
 * instead of crashing the entire app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            gap: 16,
            padding: 32,
            background: "var(--bg-base, #0F172A)",
            color: "var(--fg-primary, #E2E8F0)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(239, 68, 68, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            ⚠️
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            Something went wrong
          </h2>
          <p
            style={{
              fontSize: 13,
              opacity: 0.6,
              maxWidth: 360,
              textAlign: "center",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            TapeCalc encountered an unexpected error. Your data is safe — click below to recover.
          </p>
          {this.state.error && (
            <code
              style={{
                fontSize: 11,
                opacity: 0.4,
                maxWidth: 400,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {this.state.error.message}
            </code>
          )}
          <button
            onClick={this.handleReload}
            style={{
              marginTop: 8,
              padding: "8px 24px",
              borderRadius: 8,
              border: "none",
              background: "var(--accent-primary, #A855F7)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
