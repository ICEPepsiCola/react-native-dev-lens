import { useState, useMemo, memo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useVirtualizer } from '@tanstack/react-virtual'
import { CopyButton } from '@/components/copy-button'
import { ConsoleLogViewer } from '@/components/console-log-viewer'
import { usePreferencesStore } from '@/stores/use-preferences-store'
import { THEME } from '@/constants'
import type { ConsoleLog, LogLevelFilter } from '@/types'

interface ConsolePageProps {
  consoleLogs: ConsoleLog[];
}

const ConsoleLogRow = memo(({ log, theme }: { log: ConsoleLog; theme: 'dark' | 'light' }) => {
  const copyText = useMemo(() => {
    return log.args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg),
    ).join(' ')
  }, [log.args])

  return (
    <div className="p-4 border-b border-base-300">
      <div className="flex items-start gap-2">
        <span
          className={`badge badge-sm shrink-0 ${
            log.level === 'error'
              ? 'badge-error'
              : log.level === 'warn'
                ? 'badge-warning'
                : 'badge-info'
          }`}
        >
          {log.level.toUpperCase()}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <CopyButton text={copyText} />
          </div>
          <ConsoleLogViewer args={log.args} theme={theme} />
        </div>
      </div>
    </div>
  )
})

export function ConsolePage({ consoleLogs }: ConsolePageProps) {
  const { t } = useTranslation()
  const { theme } = usePreferencesStore()
  const [logLevelFilter, setLogLevelFilter] = useState<LogLevelFilter>('all')
  const [logMessageFilter, setLogMessageFilter] = useState<string>('')
  const parentRef = useRef<HTMLDivElement>(null)

  const jsonTheme = theme === THEME.DARK ? 'dark' : 'light'

  const filteredLogs = useMemo(() => {
    return consoleLogs
      .map((log, index) => ({ log, index }))
      .filter(({ log }) => {
        const levelMatch = logLevelFilter === 'all' || log.level === logLevelFilter
        const argsText = log.args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg),
        ).join(' ')
        const messageMatch = argsText.toLowerCase().includes(logMessageFilter.toLowerCase())
        return levelMatch && messageMatch
      })
  }, [consoleLogs, logLevelFilter, logMessageFilter])

  const virtualizer = useVirtualizer({
    count: filteredLogs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150,
    overscan: 10,
    measureElement: element => element.getBoundingClientRect().height,
  })

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center gap-4 p-4 bg-base-100 rounded-lg border border-base-300 shrink-0">
        <input
          type="text"
          placeholder={t('filterByMessage')}
          className="input input-sm grow bg-base-200 border-base-300 outline-none focus:outline-none focus:border-primary"
          value={logMessageFilter}
          onChange={e => setLogMessageFilter(e.target.value)}
        />
        <div className="join">
          {(['all', 'info', 'warn', 'error'] as const).map(level => (
            <button
              key={level}
              className={`btn btn-sm join-item outline-none ${logLevelFilter === level ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setLogLevelFilter(level)}
            >
              {level === 'all' ? t('all') : level.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={parentRef}
        className="flex-1 overflow-auto bg-base-100 rounded-lg border border-base-300"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-base-content opacity-50">
              {consoleLogs.length === 0 ? t('waitingForLogs') : t('noLogsMatch')}
            </p>
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map(virtualItem => {
              const { log } = filteredLogs[virtualItem.index]
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <ConsoleLogRow log={log} theme={jsonTheme} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
