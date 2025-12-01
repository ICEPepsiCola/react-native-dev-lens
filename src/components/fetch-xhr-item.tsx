import React, { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Emoji } from './emoji'
import { CopyButton } from './copy-button'
import { RequestViewer } from './request-viewer'
import { ResponseViewer } from './response-viewer'
import type { NetworkRequest, DetailTab } from '@/types'

interface FetchXHRItemProps {
  request: NetworkRequest
}

export const FetchXHRItem = memo(
  ({ request }: FetchXHRItemProps) => {
    const { t } = useTranslation()
    const [isExpanded, setIsExpanded] = useState(false)
    const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('General')

    const toHeaderCase = (str: string): string => {
      return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('-')
    }

    const toggleDetails = () => {
      setIsExpanded(prev => !prev)
      if (!isExpanded) {
        setActiveDetailTab('General')
      }
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

    const renderDetailView = () => {
      const detailTabs: { key: DetailTab; label: string }[] = [
        { key: 'General', label: t('general') },
        { key: 'Headers', label: t('headers') },
        { key: 'Params', label: t('params') },
        { key: 'Request', label: t('request') },
        { key: 'Response', label: t('response') },
        { key: 'Cookies', label: t('cookies') },
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
                  <span className="font-mono text-sm break-all">{request.url}</span>
                  <CopyButton text={request.url} size="xs" className="shrink-0" />
                </div>
                <span className="font-semibold opacity-70">{t('requestMethod')}:</span>
                <span className="badge badge-primary">{request.method}</span>
                <span className="font-semibold opacity-70">{t('statusCode')}:</span>
                <span className={`badge ${request.status >= 400 ? 'badge-error' : 'badge-success'}`}>{request.status}</span>
                <span className="font-semibold opacity-70">{t('type')}:</span>
                <span className="badge badge-outline">{request.type}</span>
              </div>
            )}
            {activeDetailTab === 'Headers' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold mb-3 opacity-70">{t('requestHeaders')}</h3>
                  {renderHeaders(request.headers.request)}
                </div>
                <div className="divider my-4"></div>
                <div>
                  <h3 className="text-sm font-bold mb-3 opacity-70">{t('responseHeaders')}</h3>
                  {renderHeaders(request.headers.response)}
                </div>
              </div>
            )}
            {activeDetailTab === 'Params' && (
              <div>
                {request.query_params && Object.keys(request.query_params).length > 0 ? (
                  <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm items-baseline">
                    {Object.entries(request.query_params)
                      .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
                      .map(([key, value]) => (
                        <React.Fragment key={key}>
                          <span className="font-semibold opacity-70 truncate">{key}:</span>
                          <span className="break-all font-mono text-xs">{value}</span>
                        </React.Fragment>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm opacity-50">
                    {t('noQueryParams')}
                  </div>
                )}
              </div>
            )}
            {activeDetailTab === 'Request' && (
              <RequestViewer content={request.request_body} />
            )}
            {activeDetailTab === 'Response' && (
              <ResponseViewer content={request.response_body} />
            )}
            {activeDetailTab === 'Cookies' && (
              <div>
                {request.cookies && Object.keys(request.cookies).length > 0 ? (
                  <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm items-baseline">
                    {Object.entries(request.cookies)
                      .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
                      .map(([key, value]) => (
                        <React.Fragment key={key}>
                          <span className="font-semibold opacity-70 truncate">{key}:</span>
                          <span className="break-all font-mono text-xs">{value}</span>
                        </React.Fragment>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm opacity-50">
                    {t('noCookies')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="border-b border-base-300 bg-base-100">
        {/* 手风琴头部 */}
        <div
          onClick={toggleDetails}
          className="flex items-center gap-3 p-4 hover-bg cursor-pointer transition-colors"
        >
          <Emoji native={isExpanded ? '▼' : '▶'} size={12} class="shrink-0" />
          <span className="badge badge-primary font-mono shrink-0 w-[80px] justify-center">{request.method}</span>
          <span className="truncate text-sm flex-1">{request.url}</span>
          <span className={`badge ${request.status >= 400 ? 'badge-error' : 'badge-success'} font-bold shrink-0`}>
            {request.status}
          </span>
          <span className="font-mono text-sm opacity-70 shrink-0 w-[80px] text-right">{request.response_time}ms</span>
        </div>

        {/* 手风琴内容 */}
        {isExpanded && renderDetailView()}
      </div>
    )
  },
)

FetchXHRItem.displayName = 'FetchXHRItem'
