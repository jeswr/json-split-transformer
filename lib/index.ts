// Character codes of the structural characters; comparing integer char codes
// avoids materialising a single-character string for every input character
const QUOTE = 34; // "
const BACKSLASH = 92; // \
const OPEN_BRACE = 123; // {
const CLOSE_BRACE = 125; // }

export default class JSONTransformer {
  private string: string | undefined;

  private nesting = 0;

  private escaped = false;

  private start = 0;

  public transform = (str: string, done: () => void, push: (data: string) => void) => {
    let i = this.start;
    if (this.escaped) {
      // charCodeAt returns NaN past the end of the string, which never equals
      // QUOTE, so the bounds check behaves as it did with str[i] === undefined
      let code = str.charCodeAt(i);
      while (code !== QUOTE && i < str.length) {
        i += (code === BACKSLASH ? 2 : 1);
        code = str.charCodeAt(i);
      }
      this.escaped = code !== QUOTE;
      i += 1;
    }

    for (; i < str.length; i += 1) {
      switch (str.charCodeAt(i)) {
        case OPEN_BRACE: {
          if (this.nesting === 0) this.start = i;
          this.nesting += 1;
          break;
        }
        case CLOSE_BRACE: {
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
        case QUOTE: {
          i += 1;
          let code = str.charCodeAt(i);
          while (code !== QUOTE && i < str.length) {
            i += (code === BACKSLASH ? 2 : 1);
            code = str.charCodeAt(i);
          }
          this.escaped = code !== QUOTE;
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
