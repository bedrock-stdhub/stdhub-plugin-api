import { $postJson } from './net';

export async function $readData(backendAddress: string, namespace: string, subDataPath: string) {
  const { response, body } = await $postJson(
    `${backendAddress}/data/read`,
    { namespace, subDataPath }
  );
  if (response.status === 404) {
    throw 'Data file not found';
  }
  return body;
}

export async function $writeData(backendAddress: string, namespace: string, subDataPath: string, data: unknown) {
  await $postJson(
    `${backendAddress}/data/write`,
    { namespace, subDataPath, data }
  );
}

export async function $deleteData(backendAddress: string, namespace: string, subDataPath: string) {
  const { response } = await $postJson(
    `${backendAddress}/data/delete`,
    { namespace, subDataPath }
  );
  if (response.status === 404) {
    throw 'Data file not found';
  }
}