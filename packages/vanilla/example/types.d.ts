declare module '*.less' {
  const styles: Record<string, string>;
  export = styles;
}

declare module '*.css' {
  const content: any;
  export default content;
}
