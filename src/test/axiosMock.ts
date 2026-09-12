import axios, { AxiosError, AxiosHeaders, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { vi } from 'vitest';

export type RecordedRequest = {
  method: string;
  url: string;
  authorization?: string;
  body?: unknown;
};

type MockReply = { status: number; data?: unknown };
type MockHandler = (request: RecordedRequest) => MockReply | 'network-error';

const HTTP_OK = 200;
const CLIENT_ERROR_MIN = 400;

const toRecordedRequest = (config: InternalAxiosRequestConfig): RecordedRequest => ({
  method: (config.method ?? 'get').toUpperCase(),
  url: `${config.baseURL ?? ''}${config.url ?? ''}`,
  authorization: AxiosHeaders.from(config.headers).get('Authorization')?.toString(),
  body: typeof config.data === 'string' ? JSON.parse(config.data) : config.data,
});

/**
 * Replaces axios' transport with an in-memory adapter so `apiClient` (interceptors included)
 * runs end to end against scripted replies. The adapter is installed on the global defaults,
 * which `axios.create` copies at instance creation — so call this BEFORE importing `apiClient`.
 */
export const installAxiosMock = () => {
  const requests: RecordedRequest[] = [];
  const handler = vi.fn<MockHandler>(() => ({ status: HTTP_OK }));

  const adapter: AxiosAdapter = async (config) => {
    const request = toRecordedRequest(config);
    requests.push(request);
    const reply = handler(request);
    if (reply === 'network-error') {
      throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, config);
    }
    const response = {
      data: reply.data,
      status: reply.status,
      statusText: String(reply.status),
      headers: {},
      config,
    };
    if (reply.status >= CLIENT_ERROR_MIN) {
      throw new AxiosError(
        `Request failed with status code ${reply.status}`,
        AxiosError.ERR_BAD_RESPONSE,
        config,
        undefined,
        response,
      );
    }
    return response;
  };

  axios.defaults.adapter = adapter;

  return {
    requests,
    /** Script the replies; the default handler answers 200 with no body. */
    reply: (next: MockHandler) => handler.mockImplementation(next),
    callsTo: (url: string) => requests.filter((request) => request.url.endsWith(url)),
  };
};
