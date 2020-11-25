declare module '*.less' {
  const styles: Record<string, string>;
  export = styles;
}

declare module '*.css' {
  const content: any;
  export default content;
}
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module 'siema';

declare module 'lodash.debounce';
