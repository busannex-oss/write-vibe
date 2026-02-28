import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log to ErrorLog entity
    try {
      base44.entities.ErrorLog.create({
        error_type: "render",
        message: error?.message || String(error),
        stack: errorInfo?.componentStack || error?.stack || "",
        page: window.location.pathname + window.location.search,
        component: this.props.componentName || "unknown",
        severity: "critical",
        context: JSON.stringify({ url: window.location.href })
      });
    } catch (_) {}
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-white/50 text-sm mb-2">{this.state.error?.message}</p>
            {this.props.componentName && (
              <p className="text-white/30 text-xs mb-6">in {this.props.componentName}</p>
            )}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                className="bg-amber-500 hover:bg-amber-600 text-white border-0"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.href = "/"}
                className="text-white/50 hover:text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}