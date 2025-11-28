import { JsonViewer } from './json-viewer'
import { useTranslation } from 'react-i18next'

interface RequestViewerProps {
  content: string | null | undefined
}

export function RequestViewer({ content }: RequestViewerProps) {
  const { t } = useTranslation()

  return <JsonViewer content={content || ''} emptyMessage={t('noRequestBody')} />
}
