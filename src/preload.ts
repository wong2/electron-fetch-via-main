import { ipcRenderer } from "electron";
import type { FetchMessage, RequestInitSubset } from "./types.js";

export async function fetchViaMain(url: string, options?: RequestInitSubset): Promise<Response> {
  const { signal, ...fetchOptions } = options || {};
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    signal?.addEventListener("abort", () => {
      channel.port1.close();
      channel.port2.close();
    });
    const body = new ReadableStream({
      start(controller) {
        channel.port1.onmessage = (event) => {
          const message = event.data as FetchMessage;
          if (message.type === "RESPONSE_METADATA") {
            const response = new Response(body, message.metadata);
            resolve(response);
          } else if (message.type === "RESPONSE_BODY_CHUNK") {
            if (message.done) {
              controller.close();
            } else {
              const chunk = message.value;
              controller.enqueue(chunk);
            }
          } else if (message.type === "FETCH_ERROR") {
            reject(message.error);
          }
        };
        ipcRenderer.postMessage("electron-fetch-via-main", { url, options: fetchOptions }, [
          channel.port2,
        ]);
      },
      cancel(_reason: string) {
        channel.port1.close();
        channel.port2.close();
      },
    });
  });
}
