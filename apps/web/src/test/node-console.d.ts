// Types for the node:console builtin, absent from this browser-typed app config;
// only the test setup imports it (to patch the console happy-dom captured).
declare module 'node:console' {
  const nodeConsole: Console
  export default nodeConsole
}
