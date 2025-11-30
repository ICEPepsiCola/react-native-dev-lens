import { useTranslation } from 'react-i18next'

interface DevStatusBarProps {
  networkCount: number
  consoleCount: number
}

export function DevStatusBar({ networkCount, consoleCount }: DevStatusBarProps) {
  const { t } = useTranslation()

  if (!import.meta.env.DEV) {
    return null
  }

  return (
    <div className="bg-base-200 border-t border-base-300 px-4 py-2 text-xs font-mono flex items-center gap-4">
      <span className="opacity-70">{t('devMode')}</span>
      <span className="flex items-center gap-1">
        <span className="opacity-70">{t('network')}:</span>
        <span className="badge badge-sm badge-primary">{networkCount}</span>
      </span>
      <span className="flex items-center gap-1">
        <span className="opacity-70">{t('console')}:</span>
        <span className="badge badge-sm badge-secondary">{consoleCount}</span>
      </span>
    </div>
  )
}
