export type RequestInitSubset = {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export interface FetchResponseMetadata {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
}

export interface FetchResponseMetadataMessage {
  type: "RESPONSE_METADATA";
  metadata: FetchResponseMetadata;
}

export type FetchResponseBodyChunkMessage = {
  type: "RESPONSE_BODY_CHUNK";
} & ({ done: true; value: undefined } | { done: false; value: Uint8Array });

export interface FetchErrorMessage {
  type: "FETCH_ERROR";
  error: Error;
}

export type FetchMessage =
  | FetchResponseMetadataMessage
  | FetchResponseBodyChunkMessage
  | FetchErrorMessage;
