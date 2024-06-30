import { $postJson } from './net';

export default async function $log(backendAddress: string, namespace: string, content: string) {
  await $postJson(`${backendAddress}/log`, {
    namespace, content
  });
}