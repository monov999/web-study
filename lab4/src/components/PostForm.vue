<script setup>
import { ref } from 'vue';

const props = defineProps({
  createPost: { type: Function, required: true },
  disabled: Boolean,
  author: { type: String, default: '' },
});

const title = ref('');
const body = ref('');
const pending = ref(false);
const error = ref('');

async function submit() {
  if (pending.value || props.disabled) return;
  if (!title.value.trim() || !body.value.trim()) {
    error.value = 'Заполните заголовок и текст поста.';
    return;
  }
  error.value = '';
  pending.value = true;
  try {
    await props.createPost(title.value.trim(), body.value.trim());
    title.value = '';
    body.value = '';
  } catch (cause) {
    error.value = cause.message;
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <section class="composer" aria-labelledby="composer-title">
    <h2 id="composer-title">Новый пост</h2>
    <form :aria-busy="pending" @submit.prevent="submit">
      <fieldset :disabled="disabled || pending">
        <label for="post-title">Заголовок</label>
        <input id="post-title" v-model="title" required maxlength="150" placeholder="О чём пост?" />

        <label for="post-body">Текст поста</label>
        <textarea id="post-body" v-model="body" required maxlength="2000" rows="5"
          placeholder="Поделитесь мыслью." />

        <p v-if="author" class="author-note">Автор: {{ author }}</p>
        <button class="button button-primary" type="submit">
          {{ pending ? 'Публикация…' : 'Опубликовать' }}
        </button>
      </fieldset>
      <p v-if="error" class="error-message" role="alert">{{ error }}</p>
    </form>
  </section>
</template>
