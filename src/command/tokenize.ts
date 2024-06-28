export default function $tokenize(input: string) {
  const regex = /(?:[^\s"]+|"([^"\\]*(?:\\.[^"\\]*)*)")/g;
  const matches = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    let token = match[0];
    if (token.startsWith('"') && token.endsWith('"')) {
      token = match[1];
      validateEscapes(token);
      token = token.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    matches.push(token);
  }
  return matches;
}

function validateEscapes(token: string) {
  const escapeRegex = /\\./g;
  let match;
  while ((match = escapeRegex.exec(token)) !== null) {
    if (match[0] !== '\\"' && match[0] !== '\\\\') {
      throw new Error(`Invalid escape sequence: ${match[0]}`);
    }
  }
}