const mockFetch = jest.fn();

beforeEach(() => {
  (global as unknown as { fetch: jest.Mock }).fetch = mockFetch;
  jest.resetModules();
});

describe('apiFetch', () => {
  it('ok JSON returns parsed object', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{"a":1}'),
    });
    const { apiFetch } = require('../api/client');
    await expect(apiFetch('foo')).resolves.toEqual({ a: 1 });
  });

  it('ok empty body returns undefined', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(''),
    });
    const { apiFetch } = require('../api/client');
    await expect(apiFetch('bar')).resolves.toBeUndefined();
  });

  it('non-ok throws Error containing status', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });
    const { apiFetch } = require('../api/client');
    await expect(apiFetch('baz')).rejects.toThrow(/404/);
  });

  it('uses EXPO_PUBLIC_API_BASE_URL for URL building', async () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:8000';
    jest.resetModules();
    (global as unknown as { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('{}'),
    });
    const { apiFetch } = require('../api/client');
    await apiFetch('api/v1/foo');
    expect((global as unknown as { fetch: jest.Mock }).fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/foo',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });
});
