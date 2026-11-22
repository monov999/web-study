const API_URL = 'https://jsonplaceholder.typicode.com';

// Общая обёртка: JSON, проверка HTTP-статуса, таймаут и отмена запроса.
export async function request(path, { method = 'GET', data, signal } = {}) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener('abort', cancel, { once: true });
  if (signal?.aborted) cancel();
  const timer = setTimeout(cancel, 15000);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      signal: controller.signal,
      headers: data ? { 'Content-Type': 'application/json; charset=UTF-8' } : {},
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) throw new Error(`Сервер вернул ошибку ${response.status}. Попробуйте ещё раз.`);
    return response.status === 204 ? null : await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    if (controller.signal.aborted) throw new Error('Сервер не ответил за 15 секунд. Попробуйте ещё раз.');
    if (error instanceof TypeError) throw new Error('Не удалось связаться с сервером. Проверьте подключение к интернету.');
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}
