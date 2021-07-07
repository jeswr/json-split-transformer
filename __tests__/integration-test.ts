import { ArrayIterator } from 'asynciterator';
import JSONSplitTransformer from '../lib';

describe('Transorm and parse tests using array iterator', () => {
  let streamSplitter: JSONSplitTransformer;

  beforeEach(() => {
    streamSplitter = new JSONSplitTransformer();
  });

  it('Should work on basic data', async () => {
    const iterator = new ArrayIterator<string>([
      '{"time":1625581',
      '199',
      '479,"values":[32,23]}{"ti',
      'me":1625581199482,"values":[31,12]}',
    ], { autoStart: true });

    const newIterator = iterator
      .transform<string>({ transform: streamSplitter.transform })
      // Parse each JSON string
      .map(JSON.parse);

    const arr = await new Promise((resolve, reject) => {
      const x: Object[] = [];
      newIterator.on('data', (d: Object) => {
        x.push(d);
        if (x.length === 2) {
          resolve(x);
        }
        newIterator.read();
      });
      newIterator.read();
    });

    expect(arr).toEqual([
      { time: 1625581199479, values: [32, 23] },
      { time: 1625581199482, values: [31, 12] },
    ]);
  });
});
