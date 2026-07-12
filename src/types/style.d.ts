declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Allow side-effect CSS imports (e.g. import './globals.css';)
declare module '*!css' {
  const style: unknown;
  export default style;
}
