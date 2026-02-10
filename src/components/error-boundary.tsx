"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  description?: string;
  retryLabel?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-destructive/30 bg-destructive/5 p-8 text-center">
          <span className="text-4xl">{"\u26A0\uFE0F"}</span>
          <h3 className="text-lg font-semibold">
            {this.props.title ?? "Something went wrong"}
          </h3>
          <p className="max-w-md text-sm text-muted-foreground">
            {this.props.description ?? "An unexpected error occurred. Please try again."}
          </p>
          <Button variant="outline" onClick={this.handleRetry}>
            {this.props.retryLabel ?? "Try again"}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
