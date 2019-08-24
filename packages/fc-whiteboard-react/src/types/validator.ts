/** 执行校验 */
export function validate() {}

/** 判断两个数据是否一致 */
export function compare(newData: any, oldData: any) {
  if (typeof oldData !== 'object') {
    if (oldData !== newData) {
      return false;
    } else {
      return true;
    }
  } else {
    if (JSON.stringify(oldData) !== JSON.stringify(newData)) {
      return false;
    } else {
      return true;
    }
  }
}
