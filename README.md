# json-split-transformer
A fast and lightweight transformer to transform chunks of JSON strings to valid JSON strings

[![GitHub license](https://img.shields.io/github/license/jeswr/json-split-transformer.svg)](https://github.com/jeswr/json-split-transformer/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/json-split-transformer.svg)](https://www.npmjs.com/package/json-split-transformer)
[![build](https://img.shields.io/github/workflow/status/jeswr/json-split-transformer/Node.js%20CI)](https://github.com/jeswr/json-split-transformer/tree/main/)
[![Dependabot](https://badgen.net/badge/Dependabot/enabled/green?icon=dependabot)](https://dependabot.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## What it does

Given a stream of string chunks containing one or more concatenated JSON objects —
where object boundaries need not line up with chunk boundaries — `JSONSplitTransformer`
re-emits the stream as one complete, parseable JSON string per top-level object.
Characters between top-level objects (such as whitespace or newlines) are skipped,
so streams of newline-delimited JSON also work.

The transformer is stateful: it buffers any partially received object between calls,
so use a fresh instance per stream. The `transform` method is a bound class property,
which means it can be passed straight into an [asynciterator](https://github.com/RubenVerborgh/AsyncIterator)
`transform` pipeline without wrapping.

## Usage with asynciterator

The `transform` method has the exact signature expected by the `transform` option of
asynciterator's `.transform()`, so splitting and parsing a chunked JSON stream is a
three-step pipeline:

```ts
import { ArrayIterator } from 'asynciterator';
import JSONSplitTransformer from 'json-split-transformer';

const streamSplitter = new JSONSplitTransformer();

const chunks = new ArrayIterator<string>([
  '{"time":1625581',
  '199',
  '479,"values":[32,23]}{"ti',
  'me":1625581199482,"values":[31,12]}',
]);

// New iterator that will emit the objects
// {time: 1625581199479, values: [32, 23]}
// and
// {time: 1625581199482, values: [31, 12]}
const objects = chunks
  // Split up concatenated JSON strings
  .transform<string>({ transform: streamSplitter.transform })
  // Parse each JSON string
  .map(JSON.parse);
```

### Wrapping a Node.js stream

Use asynciterator's `wrap` to consume any Node.js readable stream, such as a file
or an HTTP response body. Read with an explicit encoding so that chunks arrive as
strings (this also keeps multi-byte characters intact across chunk boundaries):

```ts
import { wrap } from 'asynciterator';
import { createReadStream } from 'fs';
import JSONSplitTransformer from 'json-split-transformer';

const streamSplitter = new JSONSplitTransformer();

const objects = wrap<string>(createReadStream('./objects.json', 'utf8'))
  .transform<string>({ transform: streamSplitter.transform })
  .map(JSON.parse);

objects.on('data', (obj) => console.log(obj));
```

## Limitations

- Only concatenated JSON *objects* (`{...}`) are split; a stream consisting of a
  single top-level array or bare primitives is not supported.
- Emitted strings are not validated — malformed input will surface as a
  `JSON.parse` error downstream.

## License
©2021–present
[Jesse Wright](https://github.com/jeswr),
[MIT License](https://github.com/jeswr/json-split-transformer/blob/master/LICENSE).
