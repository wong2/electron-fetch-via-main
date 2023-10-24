import type { Session } from "electron";
import { ipcMain, net } from "electron";
import type {
  FetchErrorMessage,
  FetchResponseBodyChunkMessage,
  FetchResponseMetadataMessage,
} from "./types.js";
import { streamAsyncIterable } from "./utils.js";

export function setupMainFetchlistener(session?: Session) {
  ipcMain.on("electron-fetch-via-main", async (event, data) => {
    const port = event.ports[0];

    const abortController = new AbortController();
    port.on("close", () => abortController.abort());

    const options = { ...data.options, signal: abortController.signal };

    let resp: Response;
    try {
      if (session) {
        resp = await session.fetch(data.url, options);
      } else {
        resp = await net.fetch(data.url, options);
      }
    } catch (error) {
      port.postMessage({ type: "FETCH_ERROR", error } as FetchErrorMessage);
      port.close();
      return;
    }

    port.postMessage({
      type: "RESPONSE_METADATA",
      metadata: {
        status: resp.status,
        statusText: resp.statusText,
        headers: Object.fromEntries(resp.headers.entries()),
      },
    } as FetchResponseMetadataMessage);

    for await (const chunk of streamAsyncIterable(resp.body!)) {
      port.postMessage({
        type: "RESPONSE_BODY_CHUNK",
        value: chunk,
        done: false,
      } as FetchResponseBodyChunkMessage);
    }
    port.postMessage({ type: "RESPONSE_BODY_CHUNK", done: true } as FetchResponseBodyChunkMessage);
    port.close();
  });
}
