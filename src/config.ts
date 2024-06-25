import { $postJson } from './net';

export async function $readRootConfig<T>(backendAddress: string, namespace: string, defaults: T){
  return (await $postJson(
    `${backendAddress}/config`,
    { namespace, defaults }
  )).body as T;
}

export async function $readSubConfig<T>(backendAddress: string, namespace: string, subConfigName: string, defaults: T){
  return (await $postJson(
    `${backendAddress}/config`,
    { namespace, subConfigName, defaults }
  )).body as T;
}

/*
 * Config files should be read-only.
 * If you want your plugin to write something into storage,
 * consider using `data` API instead.

  export async function $writeRootConfig<T> (namespace: string, config: T){
    return (await postJson(
      // url
      { namespace, config }
    )).body as T;
  }

  export async function $writeSubConfig<T>(namespace: string, subConfigName: string, config: T){
    return (await postJson(
      // url
      { namespace, subConfigName, config }
    )).body as T;
  }
*/
