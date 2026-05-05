import type { FallbackProps } from "react-error-boundary";

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" style={{ padding: "20px", textAlign: "center" }}>
      <h2>Something went wrong</h2>

      <p>{String(error)}</p>

      <button onClick={resetErrorBoundary}>Try Again</button>
    </div>
  );
}
