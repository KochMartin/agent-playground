# live-node

**live-node** is a lightweight TypeScript library for attaching a *live capture node* to any push-based data source and rendering the captured frames in a browser UI widget.

---

## Features

| Feature | Details |
|---------|---------|
| **LiveNode** | Core state machine (`idle → connecting → capturing → stopped`) with a typed event emitter |
| **LiveNodeUI** | Zero-dependency DOM component – start / stop / clear / export controls and a scrolling frame log |
| **WebSocketSource** | Production-ready WebSocket adapter with optional JSON auto-parsing |
| **MockSource** | Deterministic timer-based source for tests and local development |
| **Rolling window** | Configurable `maxFrames` to bound memory usage |
| **Export** | One-click JSON download of captured frames |

---

## Quick start

```ts
import { LiveNode, MockSource, LiveNodeUI } from "live-node";

const source = new MockSource({ intervalMs: 200 });
const node   = new LiveNode(source, { label: "demo", maxFrames: 500 });
const ui     = new LiveNodeUI(node);

document.body.appendChild(ui.element);
node.start();
```

Open `demo/index.html` in a browser to see two live nodes running side-by-side without any build step.

---

## API

### `LiveNode`

```ts
const node = new LiveNode(source, options?);

node.start()   // idle | stopped → connecting → capturing
node.stop()    // capturing → stopped
node.clear()   // drops all retained frames, resets seq counter
node.reset()   // stop + clear + back to idle

node.state     // LiveNodeState
node.frames    // readonly LiveFrame[]
node.latest    // LiveFrame | undefined

node.on("statechange", ({ previous, current }) => …)
node.on("frame",       (frame) => …)
node.on("error",       ({ message, cause }) => …)
node.on("cleared",     () => …)
```

### `LiveFrame`

```ts
type LiveFrame = {
  seq:       number;   // monotonically increasing from 0 (reset on clear())
  timestamp: string;   // ISO-8601
  payload:   unknown;  // as delivered by the source
};
```

### `LiveNodeUI`

```ts
const ui = new LiveNodeUI(node, {
  maxVisible?:       number,                                 // default 50
  timestampFormat?:  "time" | "iso" | "elapsed",            // default "time"
  onExport?:         (frames: readonly LiveFrame[]) => void, // default JSON download
});

document.body.appendChild(ui.element);
```

### `WebSocketSource`

```ts
const source = new WebSocketSource("wss://example.com/stream", {
  protocols?:  string | string[],
  parseJson?:  boolean,   // default true
});
```

### `MockSource`

```ts
const source = new MockSource({
  intervalMs?:     number,                    // default 200
  errorAfter?:     number,                    // emit error after N frames
  payloadFactory?: (count: number) => unknown // default: { value, count }
});
```

---

## Development

```bash
npm install
npm test      # run Jest test suite
npm run build # compile TypeScript → dist/
```

---

## Work item

Implements requirement **RQ071088** – *qa-UIlive-2026-06-08 live node (live capture)*.
