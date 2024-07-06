import $parse, { ParsePattern, Pattern } from './parse';
import { Player } from '@minecraft/server';
import { Terminal } from '../index';

export class Command {
  constructor() {
  }

  readonly handlers: {
    pattern: Pattern,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (caller: Player | Terminal, args: any) => void;
  }[] = [];

  /**
   * Add a pattern and a corresponding handler.
   *
   * An example of using pattern:
   * ```typescript
   * // ... construct an API instance
   *
   * const cmd = new Command();
   * cmd.addHandler(
   *   [
   *     'push',
   *     [ 'up', 'down' ],
   *     { type: 'integer', displayName: 'blocks' },
   *     { type: 'boolean', displayName: 'break-original' }
   *   ] as const,
   *   (player, [, destination,        blocks,      breakOriginal]) => {
   *     //        ^ 'up' | 'down'     ^ number     ^ boolean
   *     //        IDE will infer correct types
   *
   *     // Your game logic here
   *   }
   * );
   * api.registerCommand('test', cmd);
   * ```
   * In this example, because of the strange but strong type system of TypeScript,
   * your IDE can infer the type of each parameter.
   * Also notice that the [destructuring assignment](https://www.typescriptlang.org/docs/handbook/variable-declarations.html#destructuring)
   * use here skipped the first argument, which is always `push`.
   * You can also skip other fixed arguments.
   *
   * Some inputs that match this pattern could be:
   * ```
   * .test push up 114 true
   * .test push down 514 false
   * ```
   *
   * While such input
   * ```
   * .test push up xxx true
   * ```
   * won't match and will throw such error:
   * ```
   * May match pattern: push [up|down] [blocks: integer] [break-original: boolean]
   *   - Error when parsing blocks: not a valid integer
   * ```
   * and such input
   * ```
   * .test xxx
   * ```
   * that do not match the length(`1` vs `4`) or action(`xxx` vs `push`) of any pattern(s)
   * will throw such error:
   * ```
   * No pattern matched input. Possible:
   *   - push [up|down] [blocks: integer] [break-original: boolean]
   * ```
   *
   * @param pattern The pattern to add.
   * Use with `as const` just like the example above to enable type inferring.
   * A pattern is an array of three types of components:
   * - A plain string (e.g. `'action'`):
   * Only when the argument at this position is equal to the specified string, the parser will continue.
   * - A string array (e.g. `[ 'up', 'down', 'left', 'right' ]`):
   * Only when the argument at this position is one of the provided strings, the parser will continue.
   * - An `Argument` (`{ type: 'string' | 'float' | 'integer' | 'boolean', displayName: string }`):
   * Only when the argument at this position satisfies the specified type, the parser will continue.
   *
   * @param callback The callback function that handles parsed arguments.
   * The provided function should accept two arguments:
   * - `player`: the player that calls the command.
   * - `args`: an array (tuple) that contains parsed arguments.
   * The IDE will infer correct type for every input argument.
   */
  addHandler<T extends Pattern>(
    pattern: T,
    callback: (caller: Player | Terminal, args: ParsePattern<T>) => void,
  ): this {
    this.handlers.push({ pattern, callback });
    return this;
  }

  $handle(player: Player | Terminal, tokens: string[]) {
    const partiallyUnmatched: string[] = [];
    for (const { pattern, callback } of this.handlers) {
      const parsedOrError = $parse(tokens, pattern);
      if (!Array.isArray(parsedOrError)) {
        if (!parsedOrError.totally) {
          partiallyUnmatched.push(`§cMay match pattern: §a${$patternToString(pattern)}`);
          partiallyUnmatched.push(`  §c- ${parsedOrError.message}`);
        }
        continue;
      }
      return callback(player, parsedOrError);
    }
    if (partiallyUnmatched.length === 0) {
      throw '§cNo pattern matched input. Possible:\n' + (
        this.handlers.map(({ pattern }) => `  §a- ${$patternToString(pattern)}`)
      ).join('\n');
    } else {
      throw partiallyUnmatched.join('\n');
    }
  }
}

function $patternToString(pattern: Pattern) {
  return pattern.map(segment => {
    if (typeof segment === 'string') {
      return segment;
    }
    if (Array.isArray(segment)) {
      return `[${segment.join('|')}]`;
    }
    return `[${segment.displayName}: ${segment.type}]`;
  }).join(' ');
}