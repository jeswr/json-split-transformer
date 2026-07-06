import JSONSplitTransformer from '../lib';

describe('Reset method', () => {
  let streamSplitter: JSONSplitTransformer;

  beforeEach(() => {
    streamSplitter = new JSONSplitTransformer();
  });

  it('Should discard a partially buffered object', () => {
    const arr: string[] = [];
    const push = (str: string) => { arr.push(str); };

    streamSplitter.transform('{"time":1625581', () => {}, push);
    expect(arr).toHaveLength(0);
    streamSplitter.reset();
    streamSplitter.transform('{"values":[31,12]}', () => {}, push);
    expect(arr).toEqual(['{"values":[31,12]}']);
  });

  it('Should clear string state when reset mid string literal', () => {
    const arr: string[] = [];
    const push = (str: string) => { arr.push(str); };

    streamSplitter.transform('{"ti', () => {}, push);
    expect(arr).toHaveLength(0);
    streamSplitter.reset();
    streamSplitter.transform('{"time":1625581199479}', () => {}, push);
    expect(arr).toEqual(['{"time":1625581199479}']);
  });

  it('Should clear escape state when reset after a chunk ending mid escape', () => {
    const arr: string[] = [];
    const push = (str: string) => { arr.push(str); };

    streamSplitter.transform('{"ti\\', () => {}, push);
    expect(arr).toHaveLength(0);
    streamSplitter.reset();
    streamSplitter.transform('{"time":1625581199479}', () => {}, push);
    expect(arr).toEqual(['{"time":1625581199479}']);
  });

  it('Should be a no-op on a fresh transformer', () => {
    const arr: string[] = [];
    const push = (str: string) => { arr.push(str); };

    streamSplitter.reset();
    streamSplitter.transform('{"time":1625581199479}', () => {}, push);
    expect(arr).toEqual(['{"time":1625581199479}']);
  });
});
