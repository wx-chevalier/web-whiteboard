/** 判断是否为有效的 HTMLImageElement */
export function isHTMLImageElement(ele: any) {
  if (typeof ele === 'object' && ele instanceof HTMLImageElement) {
    return true;
  }

  return false;
}
