<script setup>
import { ref } from 'vue';

const props = defineProps({
  post: { type: Object, required: true },
  author: { type: String, required: true },
  removePost: { type: Function, required: true },
});

const pending = ref(false);
const error = ref('');

async function remove() {
  if (pending.value) return;
  error.value = '';
  pending.value = true;
  try {
    await props.removePost(props.post);
  } catch (cause) {
    error.value = cause.message;
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <article class="post" :aria-labelledby="`title-${post.key}`" :aria-busy="pending">
    <div class="post-meta">
      <span>{{ author }}</span>
      <span v-if="post.isLocal" class="local-post">Добавлено вами</span>
    </div>
    <h3 :id="`title-${post.key}`">{{ post.title }}</h3>
    <p class="post-body">{{ post.body }}</p>
    <div class="post-actions">
      <button class="button button-delete" type="button" :disabled="pending"
        :aria-label="`Удалить пост «${post.title}»`" @click="remove">
        {{ pending ? 'Удаление…' : 'Удалить' }}
      </button>
    </div>
    <p v-if="error" class="error-message" role="alert">{{ error }}</p>
  </article>
</template>
