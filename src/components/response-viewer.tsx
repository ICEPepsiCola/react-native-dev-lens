import { JsonViewer } from './json-viewer'
import { useTranslation } from 'react-i18next'

interface ResponseViewerProps {
  content: string | null | undefined
}

export function ResponseViewer({ content }: ResponseViewerProps) {
  const { t } = useTranslation()

  return <JsonViewer content={content || ''} emptyMessage={t('noResponseBody')} />
}
