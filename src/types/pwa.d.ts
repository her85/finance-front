declare module 'virtual:pwa-register' {
  type RegisterSWOptions = {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration?: ServiceWorkerRegistration | void) => void;
    onRegisterError?: (err: any) => void;
  };

  export function registerSW(options?: RegisterSWOptions): () => Promise<void>;
  export default registerSW;
}
