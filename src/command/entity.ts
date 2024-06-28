import $parse, { ParsePattern, Pattern } from './parse';
import { Player } from '@minecraft/server';

export class Command {
  constructor() {}

  readonly handlers: {
    pattern: Pattern,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (player: Player, args: any) => void;
  }[] = [];

  addHandler<T extends Pattern>(
    pattern: T,
    callback: (player: Player, args: ParsePattern<T>) => void
  ): this {
    this.handlers.push({ pattern, callback });
    return this;
  }

  $handle(player: Player, tokens: string[]) {
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
      throw '§cNo pattern matched input. Possible: §a\n' + (
        this.handlers.map(({ pattern }) => `  - ${$patternToString(pattern)}`)
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