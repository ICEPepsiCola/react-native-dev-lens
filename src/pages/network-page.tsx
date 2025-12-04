import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FetchXHRList } from '@/components/fetch-xhr-list'
import { WebSocketList } from '@/components/web-socket-list'
import type { NetworkRequest, FilterType } from '@/types'

interface NetworkPageProps {
  networkRequests: NetworkRequest[];
}

export function NetworkPage({ networkRequests }: NetworkPageProps) {
  const { t } = useTranslation()
  const [filterType, setFilterType] = useState<FilterType>('All')
  const [urlFilter, setUrlFilter] = useState<string>('')

  const filteredRequests = networkRequests.filter(req => {
    const typeMatch = filterType === 'All' || req.type === filterType
    const urlMatch = req.url.toLowerCase().includes(urlFilter.toLowerCase())
    return typeMatch && urlMatch
  })

  // 分离 Fetch/XHR 和 WebSocket 请求
  const fetchXHRRequests = filteredRequests.filter(req => req.type === 'Fetch/XHR')
  const socketRequests = filteredRequests.filter(req => req.type === 'Socket')

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-base-100 rounded-lg border border-base-300">
        <input
          type="text"
          placeholder={t('filterByUrl')}
          className="input input-sm grow bg-base-200 border-base-300 outline-none focus:outline-none focus:border-primary"
          value={urlFilter}
          onChange={e => setUrlFilter(e.target.value)}
        />
        <div className="join">
          {(['All', 'Fetch/XHR', 'Socket'] as FilterType[]).map(type => (
            <button
              key={type}
              className={`btn btn-sm join-item outline-none ${filterType === type ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterType(type)}
            >
              {type === 'All' ? t('all') : type}
            </button>
          ))}
        </div>
      </div>

      {/* Network Requests */}
      <div className="flex-1 overflow-auto bg-base-100 rounded-lg border border-base-300">
        {filteredRequests.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-base-content opacity-50">{t('noRequests')}</p>
          </div>
        ) : (
          <div>
            {/* Show Fetch/XHR when filter is All or Fetch/XHR */}
            {(filterType === 'All' || filterType === 'Fetch/XHR') && fetchXHRRequests.length > 0 && (
              <FetchXHRList requests={fetchXHRRequests} standalone={false} />
            )}

            {/* Show WebSocket when filter is All or Socket */}
            {(filterType === 'All' || filterType === 'Socket') && socketRequests.length > 0 && (
              <WebSocketList requests={socketRequests} standalone={false} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
