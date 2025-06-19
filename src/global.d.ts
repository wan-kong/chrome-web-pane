/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare namespace chrome {
  namespace devtools {
    namespace network {
      interface Request {
        request: {
          url: string;
          method: string;
          headers: Array<{ name: string; value: string }>;
          postData?: {
            mimeType: string;
            text: string;
          };
        };
        response?: {
          status: number;
          statusText: string;
          headers: Array<{ name: string; value: string }>;
          content?: {
            mimeType: string;
            size: number;
          };
          bodySize?: number;
        };
        time: number;
        getContent(callback: (content: string, encoding: string) => void): void;
      }

      interface NetworkAPI {
        onRequestFinished: {
          addListener(callback: (request: Request) => void): void;
          removeListener(callback: (request: Request) => void): void;
        };
      }
    }

    namespace panels {
      function create(
        title: string,
        iconPath: string,
        pagePath: string,
        callback?: () => void
      ): void;
    }

    const network: network.NetworkAPI;
    const panels: typeof panels;
  }
}
