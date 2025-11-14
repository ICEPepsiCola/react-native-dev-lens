// 为 em-emoji 添加类型声明
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'em-emoji': {
        shortcodes?: string;
        id?: string;
        native?: string;
        size?: string | number;
        set?: 'native' | 'apple' | 'google' | 'twitter' | 'facebook';
        skin?: string | number;
        fallback?: string;
        class?: string;
        style?: React.CSSProperties;
      };
    }
  }
}

type EmojiProps = {
  shortcodes?: string;
  id?: string;
  native?: string;
  size?: string | number;
  set?: 'native' | 'apple' | 'google' | 'twitter' | 'facebook';
  skin?: string | number;
  fallback?: string;
  class?: string;
  style?: React.CSSProperties;
}

export function Emoji({ set = 'apple', ...props }: EmojiProps) {
  return <em-emoji set={set} {...props} />
}
