# electron-fetch-via-main

## Why

This module helps you bypass restrictions when making cross origin requests in renderer process, by delegate the requests to main process.

## Install

```
npm install electron-fetch-via-main
```

## Usage

> Note that this module only work with `contextIsolation: false`

In main process

```
import { setupMainFetchlistener } from 'electron-fetch-via-main'

setupMainFetchlistener()
```

In preload scripts, expose `fetchViaMain` to renderer

```
import { fetchViaMain } from 'electron-fetch-via-main'

window.fetchViaMain = fetchViaMain
```

In renderer process, just replace `fetch` with `fetchViaMain`

```
const resp = await window.fetchViaMain('https://...', {
  method: 'POST',
  body: { ... },
})

// read json
await resp.json()

// streaming response
for await (const chunk of resp.body) {
  ...
}
```
