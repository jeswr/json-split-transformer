import JSONSplitTransformer from '../lib';

describe('Single JSON object split into several chunks', () => {
  let streamSplitter: JSONSplitTransformer;

  beforeEach(() => {
    streamSplitter = new JSONSplitTransformer();
  });

  it('Should work emit single string on last chunk', () => {
    const arr: string[] = [];
    const push = (str: string) => { arr.push(str); };

    streamSplitter.transform('{"time":1625581', () => {}, push);
    expect(arr).toHaveLength(0);
    streamSplitter.transform('199', () => {}, push);
    expect(arr).toHaveLength(0);
    streamSplitter.transform('479,"values":[32,23]}', () => {}, push);
    expect(arr).toEqual(['{"time":1625581199479,"values":[32,23]}']);
  });
});

describe('Two JSON objects split into several chunks', () => {
  let streamSplitter: JSONSplitTransformer;

  beforeEach(() => {
    streamSplitter = new JSONSplitTransformer();
  });

  it('Should work emit single string on last chunk', () => {
    const arr: string[] = [];
    const push = (str: string) => { arr.push(str); };

    streamSplitter.transform('{"time":1625581', () => {}, push);
    expect(arr).toHaveLength(0);
    streamSplitter.transform('199', () => {}, push);
    expect(arr).toHaveLength(0);
    streamSplitter.transform('479,"values":[32,23]}{"ti', () => {}, push);
    expect(arr).toEqual(['{"time":1625581199479,"values":[32,23]}']);
    streamSplitter.transform('me":1625581199482,"values":[31,12]}', () => {}, push);
    expect(arr).toEqual(['{"time":1625581199479,"values":[32,23]}', '{"time":1625581199482,"values":[31,12]}']);
  });

  it('Should work emit single string on last chunk with "{" in string', () => {
    const arr: string[] = [];
    const push = (str: string) => { arr.push(str); };

    streamSplitter.transform('{"time":1625581', () => {}, push);
    expect(arr).toHaveLength(0);
    streamSplitter.transform('199', () => {}, push);
    expect(arr).toHaveLength(0);
    streamSplitter.transform('479,"values":[32,23]}{"ti', () => {}, push);
    expect(arr).toEqual(['{"time":1625581199479,"values":[32,23]}']);
    streamSplitter.transform('m{e":1625581199482,"values":[31,12]}', () => {}, push);
    expect(arr).toEqual(['{"time":1625581199479,"values":[32,23]}', '{"tim{e":1625581199482,"values":[31,12]}']);
  });

  it('Should handle escaping at end of chunks', () => {
    const arr: string[] = [];
    const push = (str: string) => { arr.push(str); };

    streamSplitter.transform('{"time":1625581', () => {}, push);
    expect(arr).toHaveLength(0);
    streamSplitter.transform('199', () => {}, push);
    expect(arr).toHaveLength(0);
    streamSplitter.transform('479,"values":[32,23]}{"ti\\"', () => {}, push);
    expect(arr).toEqual(['{"time":1625581199479,"values":[32,23]}']);
    streamSplitter.transform('m{e":1625581199482,"values":[31,12]}', () => {}, push);
    expect(arr).toEqual(['{"time":1625581199479,"values":[32,23]}', '{"ti\\"m{e":1625581199482,"values":[31,12]}']);
  });

  it('Should handle escaping between chunks', () => {
    const arr: string[] = [];
    const push = (str: string) => { arr.push(str); };

    streamSplitter.transform('{"time":1625581', () => {}, push);
    expect(arr).toHaveLength(0);
    streamSplitter.transform('199', () => {}, push);
    expect(arr).toHaveLength(0);
    streamSplitter.transform('479,"values":[32,23]}{"ti\\', () => {}, push);
    expect(arr).toEqual(['{"time":1625581199479,"values":[32,23]}']);
    streamSplitter.transform('"m{e":1625581199482,"values":[31,12]}', () => {}, push);
    expect(arr).toEqual(['{"time":1625581199479,"values":[32,23]}', '{"ti\\"m{e":1625581199482,"values":[31,12]}']);
  });

  it('Should handle escaping at start of chunk', () => {
    const arr: string[] = [];
    const push = (str: string) => { arr.push(str); };

    streamSplitter.transform('{"time":1625581', () => {}, push);
    expect(arr).toHaveLength(0);
    streamSplitter.transform('199', () => {}, push);
    expect(arr).toHaveLength(0);
    streamSplitter.transform('479,"values":[32,23]}{"ti', () => {}, push);
    expect(arr).toEqual(['{"time":1625581199479,"values":[32,23]}']);
    streamSplitter.transform('\\"m{e":1625581199482,"values":[31,12]}', () => {}, push);
    expect(arr).toEqual(['{"time":1625581199479,"values":[32,23]}', '{"ti\\"m{e":1625581199482,"values":[31,12]}']);
  });
});

describe('Two JSON objects split in one chunk', () => {
  let streamSplitter: JSONSplitTransformer;

  beforeEach(() => {
    streamSplitter = new JSONSplitTransformer();
  });

  it('Should emit both JSON objects', () => {
    const arr: string[] = [];
    const push = (str: string) => { arr.push(str); };

    streamSplitter.transform('{"time":1625581199479,"values":[32,23]} {"tim{e":1625581199482,"values":[31,12]}', () => {}, push);
    expect(arr).toEqual(['{"time":1625581199479,"values":[32,23]}', '{"tim{e":1625581199482,"values":[31,12]}']);
  });

  it('Should handle escaped \\" in literal sections JSON objects', () => {
    const arr: string[] = [];
    const push = (str: string) => { arr.push(str); };

    streamSplitter.transform('{"t\\"ime":1625581199479,"values":[32,23]} {"tim{e":1625581199482,"values":[31,12]}', () => {}, push);
    expect(arr).toEqual(['{"t\\"ime":1625581199479,"values":[32,23]}', '{"tim{e":1625581199482,"values":[31,12]}']);
  });
});

describe('Nested JSON objects', () => {
  let streamSplitter: JSONSplitTransformer;

  beforeEach(() => {
    streamSplitter = new JSONSplitTransformer();
  });

  it('Should emit both JSON objects', () => {
    const arr: string[] = [];
    const push = (str: string) => { arr.push(str); };

    streamSplitter.transform('{"time":1625581199479,"values": { "values" [32,23] }} {"tim{e":1625581199482,"values":[31,12]}', () => {}, push);
    expect(arr).toEqual(['{"time":1625581199479,"values": { "values" [32,23] }}', '{"tim{e":1625581199482,"values":[31,12]}']);
  });
});
