export default class JSONTransformer {
  private string: string | undefined;

  private nesting = 0;

  private start = 0;

  public transform = (str: string, done: () => void, push: (data: string) => void) => {
    let i;
    for (i = this.start; i < str.length; i += 1) {
      switch (str[i]) {
        case '{': {
          if (this.nesting === 0) {
            this.start = i;
          }
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
          while (str[i] !== '"' && i < str.length) i += (str[i] === '\\' ? 2 : 1);
          break;
        }
        default:
      }
    }

    if (this.nesting > 0) {
      this.string = this.string ? this.string + str.slice(this.start) : str.slice(this.start);
    }

    // This is for when the first character in the next string chunk is escaped
    this.start = str.length - i;
    done();
  }
}
