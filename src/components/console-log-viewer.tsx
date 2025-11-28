import ReactJson from 'react-json-view'
import { usePreferencesStore } from '@/stores/use-preferences-store'
import { THEME } from '@/constants'

interface ConsoleLogViewerProps {
  args: unknown[]
}

export function ConsoleLogViewer({ args }: ConsoleLogViewerProps) {
  const { theme } = usePreferencesStore()

  if (!args || args.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      {args.map((arg, index) => {
        // Check if arg is an object (not string, number, boolean, null)
        const isObject = typeof arg === 'object' && arg !== null

        return (
          <div key={index}>
            {isObject ? (
              <ReactJson
                src={arg}
                theme={theme === THEME.DARK ? 'monokai' : 'rjv-default'}
                collapsed={2}
                displayDataTypes={false}
                displayObjectSize={false}
                enableClipboard={false}
                name={false}
                style={{
                  backgroundColor: 'transparent',
                  fontSize: '12px',
                }}
              />
            ) : (
              <pre className="font-mono text-sm whitespace-pre-wrap break-all m-0">
                {String(arg)}
              </pre>
            )}
          </div>
        )
      })}
    </div>
  )
}
