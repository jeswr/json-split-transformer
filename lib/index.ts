export default class JSONTransformer {
  private string: string | undefined;

  private nesting = 0;

  private escaped = false;

  private start = 0;

  public transform = (str: string, done: () => void, push: (data: string) => void) => {
    let i = this.start;
    if (this.escaped) {
      while (str[i] !== '"' && i < str.length) { i += (str[i] === '\\' ? 2 : 1); }
      this.escaped = str[i] !== '"';
      i += 1;
    }

    for (; i < str.length; i += 1) {
      switch (str[i]) {
        case '{': {
          if (this.nesting === 0) this.start = i;
          this.nesting += 1;
          break;
        }
        case '}': {
          this.nesting -= 1;
          if (this.nesting === 0) {
            if (this.string) {
              push(this.string + str.slice(0, i + 1));
              delete this.string;
            } else {
              push(str.slice(this.start, i + 1));
            }
          }
          break;
        }
        case '"': {
          i += 1;
          while (str[i] !== '"' && i < str.length) { i += (str[i] === '\\' ? 2 : 1); }
          this.escaped = str[i] !== '"';
          break;
        }
        default:
      }
    }

    if (this.nesting > 0) {
      this.string = this.string ? this.string + str : str.slice(this.start);
    }

    // When a chunk ends part-way through an escape sequence the scan overshoots
    // the end of the chunk by one; the first character of the next chunk is the
    // escaped character and must not be re-scanned as a delimiter
    this.start = this.escaped ? i - str.length - 1 : 0;
    done();
  }
}
