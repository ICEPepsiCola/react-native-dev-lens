import ReactJson from 'react-json-view'
import { CopyButton } from './copy-button'
import { usePreferencesStore } from '@/stores/use-preferences-store'
import { THEME } from '@/constants'

interface JsonViewerProps {
  content: string
  emptyMessage?: string
}

function isValidJson(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch (_e) {
    return false
  }
}

export function JsonViewer({ content, emptyMessage = 'No content' }: JsonViewerProps) {
  const { theme } = usePreferencesStore()

  if (!content) {
    return (
      <div className="bg-base-300 rounded-lg p-4">
        <div className="text-center py-4 text-sm opacity-50">
          {emptyMessage}
        </div>
      </div>
    )
  }

  const isJson = isValidJson(content)

  return (
    <div className="bg-base-300 rounded-lg p-4">
      <div className="flex justify-end mb-2">
        <CopyButton text={isJson ? JSON.stringify(JSON.parse(content), null, 2) : content} size="sm" />
      </div>
      {isJson ? (
        <ReactJson
          src={JSON.parse(content)}
          theme={theme === THEME.DARK ? 'monokai' : 'rjv-default'}
          collapsed={2}
          displayDataTypes={false}
          displayObjectSize={false}
          enableClipboard={false}
          name={false}
          style={{
            backgroundColor: 'transparent',
          }}
        />
      ) : (
        <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
          <code>{content}</code>
        </pre>
      )}
    </div>
  )
}
