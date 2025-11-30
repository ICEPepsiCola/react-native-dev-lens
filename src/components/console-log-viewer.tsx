import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { JsonViewer } from '@textea/json-viewer'

interface ConsoleLogViewerProps {
  args: unknown[]
  theme: 'dark' | 'light'
}

export const ConsoleLogViewer = memo(({ args, theme }: ConsoleLogViewerProps) => {
  const { t } = useTranslation()
  if (!args || args.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      {args.map((arg, index) => {
        const isObject = typeof arg === 'object' && arg !== null

        return (
          <div key={index}>
            {isObject ? (
              <JsonObjectViewer value={arg} theme={theme} t={t} />
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
})

const JsonObjectViewer = memo(({ value, theme, t }: { value: unknown; theme: 'dark' | 'light'; t: (key: string) => string }) => {
  const [expanded, setExpanded] = useState(false)

  if (!expanded) {
    const label = Array.isArray(value)
      ? `[${t('array')}(${value.length})]`
      : `{${t('object')}}`

    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-xs font-mono text-primary hover:underline cursor-pointer text-left"
      >
        {label} ▶ {t('clickToExpand')}
      </button>
    )
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(false)}
        className="text-xs font-mono text-primary hover:underline cursor-pointer mb-1"
      >
        ▼ {t('clickToCollapse')}
      </button>
      <JsonViewer
        value={value}
        theme={theme}
        defaultInspectDepth={1}
        displayDataTypes={false}
        displaySize={false}
        enableClipboard={false}
        rootName={false}
        style={{
          backgroundColor: 'transparent',
          fontSize: '12px',
        }}
      />
    </div>
  )
})
