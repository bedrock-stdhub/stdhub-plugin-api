export type Task = string | Array<string>;

export type Argument = {
  type: 'string' | 'float' | 'integer' | 'boolean',
  displayName: string
}

export type Pattern = Array<Task | Argument>;

export type ParseType<T extends Argument['type']> =
  T extends 'string' ? string :
    T extends 'float' | 'integer' ? number :
      T extends 'boolean' ? boolean : never;

export type ParsePattern<Ptn extends Pattern> = {
  [Index in keyof Ptn]: Ptn[Index] extends Argument ? ParseType<Ptn[Index]['type']> :
    Ptn[Index] extends string ? Ptn[Index] : Ptn[Index][Exclude<keyof Ptn[Index], keyof []>];
}

export type Unmatched = {
  totally: boolean,
  message: string,
}

const IntegerRegex = /^([+-]?[1-9]\d*|0)$/;
const DecimalRegex = /^-?\d+(\.\d+)?$/;
const BooleanRegex = /^(true|false)$/;

export default function $parse(
  tokens: string[],
  pattern: Pattern
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] | Unmatched  {
  if (tokens.length !== pattern.length) {
    return {
      totally: true,
      message: `Length unmatched ${tokens.length}(provided) vs ${pattern.length}(required)`,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed: any[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const patternSegment = pattern[i];
    if (typeof patternSegment === 'string') {
      if (token !== patternSegment) {
        return {
          totally: true,
          message: 'Task unmatched'
        };
      } else {
        parsed.push(token);
        continue;
      }
    }

    if (Array.isArray(patternSegment)) {
      if (!patternSegment.includes(token)) {
        return {
          totally: true,
          message: 'Task unmatched'
        };
      } else {
        parsed.push(token);
        continue;
      }
    }

    // pattern segment is Argument
    switch (patternSegment.type) {
      case 'string': {
        parsed.push(token);
        break;
      }
      case 'float': {
        if (!DecimalRegex.test(token)) {
          return {
            totally: false,
            message: `Error when parsing ${patternSegment.displayName}: not a valid float`,
          };
        }
        parsed.push(parseFloat(token));
        break;
      }
      case 'integer': {
        if (!IntegerRegex.test(token)) {
          return {
            totally: false,
            message: `Error when parsing ${patternSegment.displayName}: not a valid integer`,
          };
        }
        parsed.push(parseInt(token));
        break;
      }
      case 'boolean': {
        if (!BooleanRegex.test(token)) {
          return {
            totally: false,
            message: `Error when parsing ${patternSegment.displayName}: not a valid boolean`,
          };
        }
        parsed.push(Boolean(token));
        break;
      }
    }
  }

  return parsed;
}