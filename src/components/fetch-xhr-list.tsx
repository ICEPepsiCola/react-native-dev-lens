import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useVirtualizer } from '@tanstack/react-virtual'
import { FetchXHRItem } from './fetch-xhr-item'
import type { NetworkRequest } from '@/types'

interface FetchXHRListProps {
  requests: NetworkRequest[]
  standalone?: boolean
}

export function FetchXHRList({ requests, standalone = true }: FetchXHRListProps) {
  const { t } = useTranslation()
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: requests.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
    measureElement: element => element.getBoundingClientRect().height,
  })

  if (requests.length === 0) {
    return standalone ? (
      <div className="flex items-center justify-center h-full">
        <p className="text-base-content opacity-50">{t('noRequests')}</p>
      </div>
    ) : null
  }

  return (
    <div ref={parentRef} className={standalone ? 'h-full overflow-auto' : ''}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => {
          const req = requests[virtualItem.index]

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
              <FetchXHRItem request={req} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
