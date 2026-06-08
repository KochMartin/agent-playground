# pty-attach — live PTY capture

Spawn a command inside a pseudo-terminal and stream its output in real time.

## Quick start

```ts
import { PtyCapture } from "pty-attach";

const capture = new PtyCapture();

capture.on("data", (chunk) => {
  process.stdout.write(chunk.data);           // live output
  console.log("at", chunk.relativeMs, "ms");  // timing
});

capture.attach({ command: "bash", args: ["-c", "echo hello; sleep 1; echo bye"] });

capture.on("exit", (code) => {
  const snap = capture.getSnapshot();
  console.log("exit code:", code);
  console.log("full output:", snap.fullOutput);
  console.log("duration:", snap.durationMs, "ms");
});
```

## API

### `new PtyCapture()`

Creates a capture instance (not yet attached).

### `.attach(options)`

Spawns a process inside a PTY and starts capturing.

| Option    | Type                        | Default          | Description                              |
|-----------|-----------------------------|------------------|------------------------------------------|
| `command` | `string`                    | **required**     | Executable to run                        |
| `args`    | `string[]`                  | `[]`             | Arguments                                |
| `cols`    | `number`                    | `80`             | Terminal columns                         |
| `rows`    | `number`                    | `24`             | Terminal rows                            |
| `cwd`     | `string`                    | `process.cwd()`  | Working directory                        |
| `env`     | `Record<string, string>`    | `{}`             | Extra env vars (merged with `process.env`) |
| `encoding`| `BufferEncoding \| null`    | `"utf8"`         | Chunk encoding                           |

### `.write(data: string)`

Send keystrokes / commands into the PTY's stdin.

### `.resize(cols: number, rows: number)`

Resize the PTY window.

### `.detach()`

Kill the underlying process and tear down the capture.

### `.getSnapshot(): CaptureSnapshot`

Return an immutable snapshot of everything captured so far:

```ts
interface CaptureSnapshot {
  chunks:      CaptureChunk[];  // individual chunks
  fullOutput:  string;          // concatenated output
  totalBytes:  number;          // byte length of fullOutput
  durationMs:  number;          // time between attach() and stop()
  exitCode:    number | null;   // process exit code (null if still running)
}
```

### Events

| Event   | Payload                          | Description                            |
|---------|----------------------------------|----------------------------------------|
| `data`  | `CaptureChunk`                   | Fired for every chunk received         |
| `exit`  | `(code: number, signal: number)` | Fired when the process exits           |
| `close` | –                                | Fired after full teardown              |
| `error` | `Error`                          | Fired on PTY errors                    |

## Development

```sh
npm install
npm test        # run 24 Jest tests
npm run build   # compile to dist/
```
