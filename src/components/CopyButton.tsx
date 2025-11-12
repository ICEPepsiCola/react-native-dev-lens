import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { debounce } from 'lodash-es'
import toast from 'react-hot-toast'
import { Emoji } from './Emoji'

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'solid';
  showIcon?: boolean;
  showText?: boolean;
}

export function CopyButton({
  text,
  className = '',
  size = 'xs',
  variant = 'ghost',
  showIcon = true,
  showText = true,
}: CopyButtonProps) {
  const { t } = useTranslation()

  const handleCopy = useCallback(
    debounce(async () => {
      try {
        await navigator.clipboard.writeText(text)
        toast.success(t('copiedToClipboard'), {
          duration: 2000,
          position: 'top-center',
          className: 'toast-success',
        })
      } catch (_error) {
        toast.error(t('copyFailed'), {
          duration: 2000,
          position: 'top-center',
          className: 'toast-error',
        })
      }
    }, 300),
    [text, t],
  )

  const variantClass = variant === 'ghost' ? 'btn-ghost' : variant === 'outline' ? 'btn-outline' : ''
  const sizeClass = `btn-${size}`

  const iconSize = size === 'xs' ? 14 : size === 'sm' ? 16 : size === 'md' ? 18 : 20

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} outline-none flex items-center gap-1 ${className}`}
      onClick={handleCopy}
      title={t('copy')}
    >
      {showIcon && <Emoji native="📋" size={iconSize} />}
      {showText && <span>{t('copy')}</span>}
    </button>
  )
}
