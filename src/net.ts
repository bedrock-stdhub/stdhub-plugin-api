import { http, HttpRequest } from '@minecraft/server-net';

export type FetchOptions = {
  method?: 'Get' | 'Post' | 'Put' | 'Delete' | 'Head',
  headers?: Record<string, string>
  body?: string
}

export async function $fetch(url: string, options?: FetchOptions) {
  if (!options) {
    return http.get(url);
  } else {
    const httpRequest = new HttpRequest(url);
    // eslint-disable-next-line
    // @ts-ignore
    httpRequest.method = options.method ?? 'Get';
    if (options.headers) {
      for (const headerKey in options.headers) {
        const headerValue = options.headers[headerKey];
        httpRequest.addHeader(headerKey, headerValue);
      }
    }
    options.body && httpRequest.setBody(options.body);
    return http.request(httpRequest);
  }
}

export async function $postJson(url: string, body: unknown, headers?: Record<string, string>) {
  const response = await $fetch(url, {
    method: 'Post',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body),
  });
  if (response.status === 502) {
    throw 'Backend internal error';
  }
  return {
    response,
    ok: Math.floor(response.status / 100) === 2,
    body: JSON.parse(response.body)
  };
}