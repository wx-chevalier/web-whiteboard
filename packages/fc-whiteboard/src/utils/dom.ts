/** 创建包含样式类名的 Div 元素 */
export function createDivWithClassName(className?: string, parent?: HTMLElement) {
  const ele = document.createElement('div');

  if (parent) {
    parent.appendChild(ele);
  }

  if (className) {
    addClassName(ele, className);
  }

  return ele;
}

/** 添加样式类名 */
export function addClassName(ele: HTMLElement, className: string) {
  if (!ele) {
    return;
  }

  ele.className = `${ele.className || ''} ${className}`.trim();
}
