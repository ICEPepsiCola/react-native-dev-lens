/**
 * 判断文本是否需要截断
 * @param text 文本内容
 * @param maxLines 最大行数
 * @param maxChars 最大字符数
 * @returns 是否需要截断
 */
export function shouldTruncateText(text: string, maxLines = 3, maxChars = 500): boolean {
  const lines = text.split('\n');
  return lines.length > maxLines || text.length > maxChars;
}

/**
 * 截断文本
 * @param text 文本内容
 * @param maxLines 最大行数
 * @param maxChars 最大字符数
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLines = 3, maxChars = 500): string {
  const lines = text.split('\n');
  
  // 如果行数超过限制，按行截断
  if (lines.length > maxLines) {
    return lines.slice(0, maxLines).join('\n');
  }
  
  // 如果字符数超过限制，按字符截断
  if (text.length > maxChars) {
    return text.substring(0, maxChars) + '...';
  }
  
  return text;
}

/**
 * 获取隐藏的内容统计
 * @param text 完整文本
 * @param truncated 截断后的文本
 * @returns 隐藏的行数和字符数
 */
export function getHiddenStats(text: string, truncated: string): { lines: number; chars: number } {
  const totalLines = text.split('\n').length;
  const visibleLines = truncated.split('\n').length;
  const hiddenLines = totalLines - visibleLines;
  const hiddenChars = text.length - truncated.length;
  
  return {
    lines: hiddenLines,
    chars: hiddenChars,
  };
}
