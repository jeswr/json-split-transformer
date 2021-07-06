# template-typescript
Template repo for my Typescript projects
[![GitHub license](https://img.shields.io/github/license/jeswr/json-split-transformer.svg)](https://github.com/jeswr/json-split-transformer/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@jeswr/json-split-transformer.svg)](https://www.npmjs.com/package/@jeswr/json-split-transformer)
[![build](https://img.shields.io/github/workflow/status/jeswr/json-split-transformer/Node.js%20CI)](https://github.com/jeswr/json-split-transformer/tree/main/)
[![Dependabot](https://badgen.net/badge/Dependabot/enabled/green?icon=dependabot)](https://dependabot.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Usage
```ts
import { ArrayIterator } from 'asynciterator'
import JSONSplitTransformer from 'json-split-transformer';

const streamSplitter = new JSONSplitTransformer();

const iterator = new ArrayIterator<string>([
  "{\"time\":1625581",
  "199",
  "479,\"values\":[32,23]}{\"ti",
  "me\":1625581199482,\"values\":[31,12]}"
]);

// New iterator that will emit the objects
// {time: 1625581199479, values: [32, 23]}
// and
// {time: 1625581199482, values: [31, 12]}
const newIterator = iterator
  .map(buffer => buffer.toString())
  // Split up concatenated JSON strings
  .transform<string>({ transform: streamSplitter.transform })
  // Parse each JSON string
  .map(JSON.parse)
```
## License
©2021–present
[Jesse Wright](https://github.com/jeswr),
[MIT License](https://github.com/jeswr/useState/blob/master/LICENSE).
