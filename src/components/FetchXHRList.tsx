import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CopyButton } from './CopyButton'
import type { NetworkRequest, DetailTab } from '../types'

interface FetchXHRListProps {
  requests: NetworkRequest[];
}

export function FetchXHRList({ requests }: FetchXHRListProps) {
  const { t } = useTranslation()
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null)
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('General')

  const toHeaderCase = (str: string): string => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('-')
  }

  const toggleRequestDetails = (id: string) => {
    if (expandedRequestId === id) {
      setExpandedRequestId(null)
    } else {
      setExpandedRequestId(id)
      setActiveDetailTab('General')
    }
  }

  const renderDetailView = (req: NetworkRequest) => {
    const detailTabs: { key: DetailTab; label: string }[] = [
      { key: 'General', label: t('general') },
      { key: 'Headers', label: t('headers') },
      { key: 'Response', label: t('response') },
    ]

    return (
      <div className="p-4 bg-base-200">
        <div role="tablist" className="tabs tabs-bordered">
          {detailTabs.map(tab => (
            <a
              key={tab.key}
              role="tab"
              className={`tab outline-none ${activeDetailTab === tab.key ? 'tab-active' : ''}`}
              onClick={() => setActiveDetailTab(tab.key)}
            >
              {tab.label}
            </a>
          ))}
        </div>
        <div className="mt-4">
          {activeDetailTab === 'General' && (
            <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm items-center">
              <span className="font-semibold opacity-70">{t('requestUrl')}:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm break-all">{req.url}</span>
                <CopyButton text={req.url} showText={false} size="xs" className="shrink-0" />
              </div>
              <span className="font-semibold opacity-70">{t('requestMethod')}:</span>
              <span className="badge badge-primary">{req.method}</span>
              <span className="font-semibold opacity-70">{t('statusCode')}:</span>
              <span className={`badge ${req.status >= 400 ? 'badge-error' : 'badge-success'}`}>{req.status}</span>
              <span className="font-semibold opacity-70">{t('type')}:</span>
              <span className="badge badge-outline">{req.type}</span>
            </div>
          )}
          {activeDetailTab === 'Headers' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold mb-3 opacity-70">{t('requestHeaders')}</h3>
                {renderHeaders(req.headers.request)}
              </div>
              <div className="divider my-4"></div>
              <div>
                <h3 className="text-sm font-bold mb-3 opacity-70">{t('responseHeaders')}</h3>
                {renderHeaders(req.headers.response)}
              </div>
            </div>
          )}
          {activeDetailTab === 'Response' && (
            <div className="bg-base-300 rounded-lg p-4">
              <div className="flex justify-end mb-2">
                <CopyButton
                  text={req.response ? JSON.stringify(JSON.parse(req.response), null, 2) : ''}
                  size="sm"
                />
              </div>
              <pre className="text-xs font-mono overflow-x-auto">
                <code>{req.response ? JSON.stringify(JSON.parse(req.response), null, 2) : ''}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderHeaders = (headers: Record<string, string>) => (
    <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm items-baseline">
      {Object.entries(headers)
        .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .map(([key, value]) => (
          <React.Fragment key={key}>
            <span className="font-semibold opacity-70 truncate">{toHeaderCase(key)}:</span>
            <span className="break-all font-mono text-xs">{value}</span>
          </React.Fragment>
        ))}
    </div>
  )

  if (requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-base-content opacity-50">{t('noRequests')}</p>
      </div>
    )
  }

  return (
    <div>
      {requests.map(req => (
        <div key={req.id} className="border-b border-base-300 last:border-b-0">
          <div
            onClick={() => toggleRequestDetails(req.id)}
            className="grid grid-cols-[100px_1fr_80px_100px] items-center p-4 hover-bg cursor-pointer transition-colors"
          >
            <span className="badge badge-primary font-mono">{req.method}</span>
            <span className="truncate text-sm">{req.url}</span>
            <span className={`badge ${req.status >= 400 ? 'badge-error' : 'badge-success'} font-bold`}>
              {req.status}
            </span>
            <span className="font-mono text-sm text-right opacity-70">{req.response_time}ms</span>
          </div>
          {expandedRequestId === req.id && renderDetailView(req)}
        </div>
      ))}
    </div>
  )
}
