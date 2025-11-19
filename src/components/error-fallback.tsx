interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center h-screen bg-base-100">
      <div className="card w-96 bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-error">Something went wrong</h2>
          <p className="text-sm opacity-70">{error.message}</p>
          <div className="card-actions justify-end mt-4">
            <button className="btn btn-primary btn-sm" onClick={resetErrorBoundary}>
              Try Again
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>
              Reload App
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
