import React, { Component } from "react";
import { useTranslation } from "react-i18next";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
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
            minHeight: "100vh",
            backgroundColor: "#f5f5f5",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              color: "#dc3545",
              marginBottom: "16px",
            }}
          >
            ⚠️ خطأ غير متوقع
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              color: "#666",
              marginBottom: "24px",
              maxWidth: "600px",
            }}
          >
            نأسف، حدث خطأ ما. يرجى المحاولة مرة أخرى أو الاتصال بالدعم إذا
            استمرت المشكلة.
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: "12px 24px",
              fontSize: "1rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
          >
            إعادة المحاولة
          </button>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details
              style={{
                marginTop: "32px",
                padding: "16px",
                backgroundColor: "#fff",
                borderRadius: "8px",
                maxWidth: "800px",
                textAlign: "left",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  color: "#dc3545",
                }}
              >
                تفاصيل الخطأ (للتطوير فقط)
              </summary>
              <pre
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  overflow: "auto",
                  fontSize: "0.9rem",
                  color: "#333",
                }}
              >
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
