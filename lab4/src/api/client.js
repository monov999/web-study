import axios from 'axios';

const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 15000,
});

api.interceptors.response.use(undefined, error => {
  if (error.response) {
    throw new Error(`Сервер вернул ошибку ${error.response.status}. Попробуйте ещё раз.`, { cause: error });
  }
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    throw new Error('Сервер не ответил за 15 секунд. Попробуйте ещё раз.', { cause: error });
  }
  if (error.code === 'ERR_NETWORK') {
    throw new Error('Не удалось связаться с сервером. Проверьте подключение к интернету.', { cause: error });
  }
  throw error;
});

export default api;
