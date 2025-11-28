import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CopyButton } from '@/components/copy-button'
import { ConsoleLogViewer } from '@/components/console-log-viewer'
import type { ConsoleLog, LogLevelFilter } from '@/types'

interface ConsolePageProps {
  consoleLogs: ConsoleLog[];
}

export function ConsolePage({ consoleLogs }: ConsolePageProps) {
  const { t } = useTranslation()
  const [logLevelFilter, setLogLevelFilter] = useState<LogLevelFilter>('all')
  const [logMessageFilter, setLogMessageFilter] = useState<string>('')

  const filteredLogs = consoleLogs
    .map((log, index) => ({ log, index }))
    .filter(({ log }) => {
      const levelMatch = logLevelFilter === 'all' || log.level === logLevelFilter
      // Search in all args
      const argsText = log.args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg),
      ).join(' ')
      const messageMatch = argsText.toLowerCase().includes(logMessageFilter.toLowerCase())
      return levelMatch && messageMatch
    })
  return (
    <div className="flex flex-col h-full gap-4">
      {/* Console Filters */}
      <div className="flex items-center gap-4 p-4 bg-base-100 rounded-lg border border-base-300">
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

      <div className="grow overflow-hidden bg-base-100 rounded-lg border border-base-300">
        <div className="h-full overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-base-content opacity-50">
                {consoleLogs.length === 0 ? t('waitingForLogs') : t('noLogsMatch')}
              </p>
            </div>
          ) : (
            <div>
              {filteredLogs.map(({ log, index }) => {
                // Generate copy text from args
                const copyText = log.args.map(arg =>
                  typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg),
                ).join(' ')

                return (
                  <div
                    key={index}
                    className="p-4 border-b border-base-300 last:border-b-0"
                  >
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
                        <ConsoleLogViewer args={log.args} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
