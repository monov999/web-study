import { onBeforeUnmount, onMounted, ref } from 'vue';
import api from '../api/client.js';

export const DEMO_USER_ID = 1;

export function usePosts() {
  const posts = ref([]);
  const users = ref([]);
  const loading = ref(true);
  const error = ref('');
  let activeLoad;

  async function loadPosts() {
    activeLoad?.abort();
    const controller = new AbortController();
    activeLoad = controller;
    loading.value = true;
    error.value = '';

    try {
      const options = { signal: controller.signal };
      const [postsResponse, usersResponse] = await Promise.all([
        api.get('/posts', options),
        api.get('/users', options),
      ]);
      if (controller.signal.aborted) return;
      posts.value = postsResponse.data.map(post => ({ ...post, key: `server-${post.id}` }));
      users.value = usersResponse.data;
    } catch (cause) {
      if (!controller.signal.aborted) error.value = cause.message;
    } finally {
      if (activeLoad === controller) {
        const wasCanceled = controller.signal.aborted;
        controller.abort();
        activeLoad = undefined;
        if (!wasCanceled) loading.value = false;
      }
    }
  }

  async function createPost(title, body) {
    const { data } = await api.post('/posts', { title, body, userId: DEMO_USER_ID });
    // JSONPlaceholder присваивает id=101 каждому новому посту.
    posts.value.unshift({ ...data, key: `local-${crypto.randomUUID()}`, isLocal: true });
  }

  async function removePost(post) {
    await api.delete(`/posts/${post.id}`);
    posts.value = posts.value.filter(item => item.key !== post.key);
  }

  onMounted(loadPosts);
  onBeforeUnmount(() => activeLoad?.abort());

  return { posts, users, loading, error, loadPosts, createPost, removePost };
}
