import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { JsonViewer } from '@textea/json-viewer'

interface ConsoleLogViewerProps {
  args: unknown[]
  theme: 'dark' | 'light'
}

export const ConsoleLogViewer = memo(({ args, theme }: ConsoleLogViewerProps) => {
  const { t } = useTranslation()
  if (!args || args.length === 0) {
    return null
  }

  // 将连续的原始类型合并到一行，遇到对象就换行
  const groupedArgs: Array<{ type: 'primitive' | 'object'; content: unknown[] | unknown }> = []

  args.forEach(arg => {
    const isObject = typeof arg === 'object' && arg !== null
    const lastGroup = groupedArgs[groupedArgs.length - 1]

    if (isObject) {
      // 对象单独一行
      groupedArgs.push({ type: 'object', content: arg })
    } else {
      // 原始类型：如果上一组也是原始类型，就合并；否则新建一组
      if (lastGroup && lastGroup.type === 'primitive') {
        (lastGroup.content as unknown[]).push(arg)
      } else {
        groupedArgs.push({ type: 'primitive', content: [arg] })
      }
    }
  })

  return (
    <div className="flex flex-col gap-2">
      {groupedArgs.map((group, index) => (
        <div key={index}>
          {group.type === 'object' ? (
            <JsonObjectViewer value={group.content} theme={theme} t={t} />
          ) : (
            <pre className="font-mono text-sm whitespace-pre-wrap break-all m-0">
              {(group.content as unknown[]).map(arg => String(arg)).join(' ')}
            </pre>
          )}
        </div>
      ))}
    </div>
  )
})

// 判断是否为简单对象/数组（可以直接展示）
// 根据 JSON 字符串长度判断，而不是属性/元素数量
const isSimple = (value: unknown): boolean => {
  try {
    const jsonStr = JSON.stringify(value)
    // 如果 JSON 字符串长度 <= 100 字符，认为是简单的，可以直接展示
    // 例如：{ name: 'John', age: 25 } 会自动展开
    // 但：{ longText: 'very very long string...' } 会折叠
    return jsonStr.length <= 100
  } catch {
    // 如果无法序列化（比如循环引用），认为是复杂的
    return false
  }
}

const JsonObjectViewer = memo(({ value, theme, t }: { value: unknown; theme: 'dark' | 'light'; t: (key: string) => string }) => {
  const simple = isSimple(value)
  const [expanded, setExpanded] = useState(simple)

  if (!expanded) {
    const label = Array.isArray(value)
      ? `[${t('array')}(${value.length})]`
      : `{${t('object')}}`

    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-xs font-mono text-primary hover:underline cursor-pointer text-left"
      >
        {label} ▶ {t('clickToExpand')}
      </button>
    )
  }

  return (
    <div>
      {!simple && (
        <button
          onClick={() => setExpanded(false)}
          className="text-xs font-mono text-primary hover:underline cursor-pointer mb-1"
        >
          ▼ {t('clickToCollapse')}
        </button>
      )}
      <JsonViewer
        value={value}
        theme={theme}
        defaultInspectDepth={1}
        displayDataTypes={false}
        displaySize={false}
        enableClipboard={false}
        rootName={false}
        style={{
          backgroundColor: 'transparent',
          fontSize: '12px',
        }}
      />
    </div>
  )
})
