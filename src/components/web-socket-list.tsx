import { useState, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useVirtualizer } from '@tanstack/react-virtual'
import dayjs from 'dayjs'
import { Emoji } from './emoji'
import { CopyButton } from './copy-button'
import { shouldTruncateText, truncateText, getHiddenStats } from '@/utils/text-truncate'
import type { NetworkRequest, WebSocketMessage } from '@/types'

interface WebSocketListProps {
  requests: NetworkRequest[]
  standalone?: boolean
}

interface WebSocketGroup {
  url: string;
  allMessages: Array<WebSocketMessage & { connectionId: string }>;
}

export function WebSocketList({ requests, standalone = true }: WebSocketListProps) {
  const { t } = useTranslation()
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null)
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(new Set())
  const parentRef = useRef<HTMLDivElement>(null)

  // 按 URL 分组
  const groupedSockets = useMemo(() => {
    const groups = new Map<string, WebSocketGroup>()

    requests.forEach(req => {
      if (!groups.has(req.url)) {
        groups.set(req.url, {
          url: req.url,
          allMessages: [],
        })
      }

      const group = groups.get(req.url)!

      // 收集所有消息并标记来自哪个连接
      if (req.ws_messages) {
        req.ws_messages.forEach(msg => {
          group.allMessages.push({
            ...msg,
            connectionId: req.id,
          })
        })
      }
    })

    // 按时间戳排序消息
    groups.forEach(group => {
      group.allMessages.sort((a, b) => a.timestamp - b.timestamp)
    })

    return Array.from(groups.values())
  }, [requests])

  const virtualizer = useVirtualizer({
    count: groupedSockets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 8,
    measureElement: element => element.getBoundingClientRect().height,
  })

  const toggleExpand = (url: string) => {
    setExpandedUrl(expandedUrl === url ? null : url)
  }

  const toggleMessageExpand = (msgId: string) => {
    const newExpanded = new Set(expandedMessageIds)
    if (newExpanded.has(msgId)) {
      newExpanded.delete(msgId)
    } else {
      newExpanded.add(msgId)
    }
    setExpandedMessageIds(newExpanded)
  }

  const formatTimestamp = (timestamp: number) => {
    return dayjs(timestamp).format('HH:mm:ss.SSS')
  }

  const renderExpandedContent = (group: WebSocketGroup) => (
    <div className="bg-base-200 p-4">
      {/* 连接信息 */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-300">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm opacity-70">{t('url')}:</span>
          <span className="font-mono text-xs truncate flex-1">{group.url}</span>
          <CopyButton text={group.url} size="xs" />
        </div>
        <span className="text-sm opacity-70 shrink-0 ml-4">
          {group.allMessages.length} {t('messages')}
        </span>
      </div>

      {/* 消息列表 */}
      {group.allMessages.length === 0 ? (
        <div className="text-center py-8 text-sm opacity-50">
          {t('noMessages')}
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {group.allMessages.map(msg => {
            const isExpanded = expandedMessageIds.has(msg.id)
            const shouldTruncate = shouldTruncateText(msg.data)
            const displayData = !isExpanded && shouldTruncate
              ? truncateText(msg.data)
              : msg.data
            const hiddenStats = shouldTruncate ? getHiddenStats(msg.data, displayData) : null

            return (
              <div key={msg.id} className="flex items-start gap-2 bg-base-100 p-2 rounded">
                {/* 时间戳 */}
                <span className="text-xs opacity-50 font-mono shrink-0 mt-1 w-24">
                  {formatTimestamp(msg.timestamp)}
                </span>

                {/* 方向标识 */}
                <span
                  className={`badge badge-xs shrink-0 mt-1 ${
                    msg.direction === 'send' ? 'badge-info' : 'badge-success'
                  }`}
                >
                  {msg.direction === 'send' ? '↑' : '↓'}
                </span>

                {/* 消息内容 */}
                <div className="flex-1 min-w-0">
                  {shouldTruncate && (
                    <button
                      className="btn btn-ghost btn-xs outline-none flex items-center gap-1 mb-1"
                      onClick={() => toggleMessageExpand(msg.id)}
                    >
                      {isExpanded ? (
                        <>
                          <Emoji native="▲" size={12} /> {t('showLess')}
                        </>
                      ) : (
                        <>
                          <Emoji native="▼" size={12} /> {t('showMore')}
                          {hiddenStats && hiddenStats.lines > 0 && ` (${hiddenStats.lines} ${t('moreLines')})`}
                          {hiddenStats && hiddenStats.chars > 0 && hiddenStats.lines === 0 && ` (${hiddenStats.chars} chars)`}
                        </>
                      )}
                    </button>
                  )}
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all m-0 bg-base-200 dark:bg-base-300 p-2 rounded">
                    {displayData}
                  </pre>
                </div>

                {/* 复制按钮 */}
                <CopyButton text={msg.data} size="xs" className="shrink-0 mt-1" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  if (groupedSockets.length === 0) {
    return standalone ? (
      <div className="flex items-center justify-center h-full">
        <p className="text-base-content opacity-50">{t('noRequests')}</p>
      </div>
    ) : null
  }

  // Non-standalone mode: render all items without virtualization
  if (!standalone) {
    return (
      <div>
        {groupedSockets.map(group => {
          const isExpanded = expandedUrl === group.url

          return (
            <div key={group.url} className="border-b border-base-300 bg-base-100">
              {/* 手风琴头部 */}
              <div
                onClick={() => toggleExpand(group.url)}
                className="flex items-center gap-3 p-4 hover-bg cursor-pointer transition-colors"
              >
                <Emoji native={isExpanded ? '▼' : '▶'} size={12} class="shrink-0" />
                <span className="badge badge-primary shrink-0 w-[80px] justify-center">WS</span>
                <span className="font-mono text-sm flex-1 truncate" title={group.url}>
                  {group.url}
                </span>
                <span className="badge badge-outline badge-sm shrink-0 w-[80px] justify-center">
                  {group.allMessages.length}
                </span>
              </div>

              {/* 手风琴内容 */}
              {isExpanded && renderExpandedContent(group)}
            </div>
          )
        })}
      </div>
    )
  }

  // Standalone mode: use virtualization
  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => {
          const group = groupedSockets[virtualItem.index]
          const isExpanded = expandedUrl === group.url

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
              <div className="border-b border-base-300 bg-base-100">
                {/* 手风琴头部 */}
                <div
                  onClick={() => toggleExpand(group.url)}
                  className="flex items-center gap-3 p-4 hover-bg cursor-pointer transition-colors"
                >
                  <Emoji native={isExpanded ? '▼' : '▶'} size={12} class="shrink-0" />
                  <span className="badge badge-primary shrink-0 w-[80px] justify-center">WS</span>
                  <span className="font-mono text-sm flex-1 truncate" title={group.url}>
                    {group.url}
                  </span>
                  <span className="badge badge-outline badge-sm shrink-0 w-[80px] justify-center">
                    {group.allMessages.length}
                  </span>
                </div>

                {/* 手风琴内容 */}
                {isExpanded && renderExpandedContent(group)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
