import { $postJson } from './net';

export async function $readFileAsText(backendAddress: string, path: string) {
  const { response, body } = await $postJson(
    `${backendAddress}/file/read`,
    { path, response: 'text' }
  );
  if (response.status === 404) {
    throw 'File not found';
  }
  return <string>body.result;
}

export async function $readFileAsBytes(backendAddress: string, path: string) {
  const { response, body } = await $postJson(
    `${backendAddress}/file/read`,
    { path, response: 'bytes' }
  );
  if (response.status === 404) {
    throw 'File not found';
  }
  return <number[]>body.result;
}
