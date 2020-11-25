// 是主动绘制模式，还是镜像模式
export type Mode = 'master' | 'mirror' | 'replay';

export type Source = {
  // 需要展示的图片元素
  imgEle?: HTMLImageElement;

  // 需要展示的图片地址
  imgSrc?: string;
};

export function isNil(mayBeNil: any) {
  return mayBeNil === null || mayBeNil === undefined;
}
