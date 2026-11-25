import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function usePosts() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const requestOptions = { signal: controller.signal };
    setLoading(true);
    setError('');

    Promise.all([
      api.get('/posts', requestOptions),
      api.get('/users', requestOptions),
    ])
      .then(([postsResponse, usersResponse]) => {
        if (controller.signal.aborted) return;
        setPosts(postsResponse.data.map(post => ({ ...post, key: `server-${post.id}` })));
        setUsers(usersResponse.data);
      })
      .catch(cause => { if (!controller.signal.aborted) setError(cause.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });

    return () => controller.abort();
  }, [attempt]);

  async function addPost(title, body) {
    const { data: created } = await api.post('/posts', { title, body, userId: 1 });
    // API возвращает id=101 при каждом POST. Ключи React должны быть уникальны.
    const post = { ...created, key: `local-${crypto.randomUUID()}`, isLocal: true };
    setPosts(current => [post, ...current]);
    setNotice('Пост добавлен.');
  }

  async function deletePost(post) {
    await api.delete(`/posts/${post.id}`);
    setPosts(current => current.filter(item => item.key !== post.key));
    setNotice(`Пост «${post.title}» удалён.`);
  }

  return {
    posts, users, loading, error, notice, addPost, deletePost,
    retry: () => { setLoading(true); setAttempt(value => value + 1); },
  };
}
