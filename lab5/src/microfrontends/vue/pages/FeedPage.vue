<script setup>
import { computed, ref, watch } from 'vue';
import PostForm from '../components/PostForm.vue';
import PostItem from '../components/PostItem.vue';
import { DEMO_USER_ID, usePosts } from '../composables/usePosts.js';

const PAGE_SIZE = 10;
const { posts, users, loading, error, loadPosts, createPost, removePost } = usePosts();
const search = ref('');
const authorId = ref('');
const page = ref(1);
const notice = ref('');
const feedHeading = ref(null);

const usersById = computed(() => new Map(users.value.map(user => [user.id, user.name])));
const filteredPosts = computed(() => {
  const query = search.value.trim().toLowerCase();
  return posts.value.filter(post =>
    (!authorId.value || post.userId === authorId.value) &&
    `${post.title} ${post.body}`.toLowerCase().includes(query),
  );
});
const pageCount = computed(() => Math.max(1, Math.ceil(filteredPosts.value.length / PAGE_SIZE)));
const visiblePosts = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE;
  return filteredPosts.value.slice(start, start + PAGE_SIZE);
});

watch([search, authorId], () => { page.value = 1; });
watch(pageCount, count => { page.value = Math.min(page.value, count); });

function resetFilters() {
  search.value = '';
  authorId.value = '';
  page.value = 1;
}

async function publish(title, body) {
  notice.value = '';
  await createPost(title, body);
  resetFilters();
  notice.value = 'Пост добавлен.';
}

async function deletePost(post) {
  notice.value = '';
  await removePost(post);
  notice.value = 'Пост удалён.';
}

function changePage(nextPage) {
  page.value = nextPage;
  feedHeading.value.focus();
}
</script>

<template>
  <a class="skip-link" href="#feed-heading">К списку постов</a>
  <header class="topbar">
    <div class="topbar-inner">
      <span>Лабораторная работа №4</span>
      <a href="https://jsonplaceholder.typicode.com/" target="_blank" rel="noreferrer">JSONPlaceholder ↗</a>
    </div>
  </header>

  <main class="layout">
    <h1>Лента постов</h1>
    <div class="columns">
      <PostForm :create-post="publish" :disabled="loading || Boolean(error)" :author="usersById.get(DEMO_USER_ID)" />

      <section class="feed" aria-labelledby="feed-heading">
        <h2 id="feed-heading" ref="feedHeading" tabindex="-1">Все посты</h2>
        <div class="filters">
          <label for="search">
            Поиск
            <input id="search" v-model="search" type="search" placeholder="Заголовок или текст" />
          </label>
          <label for="author">
            Автор
            <select id="author" v-model="authorId" :disabled="loading || Boolean(error)">
              <option value="">Все авторы</option>
              <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
            </select>
          </label>
        </div>

        <p class="feed-status" role="status">
          {{ loading ? 'Загружаем посты…' : error ? '' : `Найдено: ${filteredPosts.length}` }}
        </p>
        <p class="notice" role="status">{{ notice }}</p>

        <div v-if="loading" class="placeholder" aria-hidden="true">
          <span /><span /><span />
        </div>
        <div v-else-if="error" class="panel">
          <p role="alert">{{ error }}</p>
          <button class="button button-secondary" type="button" @click="loadPosts">Попробовать снова</button>
        </div>
        <div v-else-if="!visiblePosts.length" class="panel">
          <p>Посты не найдены.</p>
          <button v-if="search || authorId" class="button button-secondary" type="button" @click="resetFilters">
            Сбросить фильтры
          </button>
        </div>
        <template v-else>
          <ul class="post-list">
            <li v-for="post in visiblePosts" :key="post.key">
              <PostItem :post="post" :author="usersById.get(post.userId) || `Пользователь ${post.userId}`"
                :remove-post="deletePost" />
            </li>
          </ul>
          <nav v-if="pageCount > 1" class="pagination" aria-label="Страницы постов">
            <button class="button button-secondary" type="button" :disabled="page === 1" @click="changePage(page - 1)">Назад</button>
            <span role="status">{{ page }} из {{ pageCount }}</span>
            <button class="button button-secondary" type="button" :disabled="page === pageCount" @click="changePage(page + 1)">Далее</button>
          </nav>
        </template>
      </section>
    </div>
  </main>
</template>
