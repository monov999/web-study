'use strict';

const API_URL = 'https://jsonplaceholder.typicode.com';
const POST_LIMIT = 12;
const get = (id) => document.getElementById(id);
const form = get('postForm');
const titleInput = get('title');
const bodyInput = get('body');
const searchInput = get('search');
const postsList = get('postsList');
const state = { posts: [], busy: false, loaded: false, nextKey: 0 };
let notificationTimer;

// Одна функция для GET, POST и DELETE. Возвращает Promise с разобранным JSON.
function ajax(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, API_URL + path, true);
    xhr.timeout = 15000;
    if (data !== null) xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`Сервер вернул ошибку HTTP ${xhr.status}. Попробуйте ещё раз.`));
        return;
      }
      try {
        resolve(xhr.responseText ? JSON.parse(xhr.responseText) : null);
      } catch {
        reject(new Error('Сервер вернул некорректные данные. Попробуйте ещё раз.'));
      }
    };
    xhr.onerror = () => reject(new Error('Проверьте подключение к интернету и попробуйте ещё раз.'));
    xhr.ontimeout = () => reject(new Error('Сервер не ответил за 15 секунд. Попробуйте ещё раз.'));
    xhr.send(data === null ? null : JSON.stringify(data));
  });
}

// Блокируем повторные запросы и одновременное обновление/изменение ленты.
function setBusy(busy) {
  state.busy = busy;
  get('formFields').disabled = busy;
  get('reloadButton').disabled = busy;
  get('retryButton').disabled = busy;
  postsList.setAttribute('aria-busy', String(busy));
  postsList.querySelectorAll('.delete-button').forEach((button) => { button.disabled = busy; });
}

function notify(message, isError = false) {
  clearTimeout(notificationTimer);
  const notification = get('notification');
  notification.textContent = message;
  notification.classList.toggle('is-error', isError);
  notificationTimer = setTimeout(() => { notification.textContent = ''; }, 7000);
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Данные API и пользователя вставляются через textContent, а не как HTML.
function createPostCard(post) {
  const item = document.createElement('li');
  const article = element('article', 'post-card');
  const meta = element('div', 'post-meta');
  meta.append(
    element('span', 'post-index', `ЗАМЕТКА / ${String(post.id).padStart(2, '0')}`),
    element('span', 'post-author', `Автор № ${post.userId}`)
  );
  const heading = element('h3', '', post.title);
  const body = element('p', 'post-body', post.body);
  const footer = element('div', 'post-footer');
  const source = element('span', post.local ? 'post-source local-badge' : 'post-source', post.local ? 'Добавлено вами' : 'JSONPlaceholder');
  const remove = element('button', 'delete-button');
  remove.type = 'button';
  remove.dataset.key = post.key;
  remove.disabled = state.busy;
  remove.setAttribute('aria-label', `Удалить заметку «${post.title}»`);
  // Здесь только статичная разметка иконки, без внешних данных.
  remove.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/></svg><span>Удалить</span>';
  footer.append(source, remove);
  article.append(meta, heading, body, footer);
  item.append(article);
  return item;
}

function renderPosts() {
  const query = searchInput.value.trim().toLocaleLowerCase('ru');
  const visible = state.posts.filter((post) => `${post.title} ${post.body}`.toLocaleLowerCase('ru').includes(query));
  postsList.replaceChildren(...visible.map(createPostCard));
  get('postCount').textContent = state.posts.length;
  get('postCount').setAttribute('aria-label', `Всего заметок: ${state.posts.length}`);
  if (state.loaded) {
    get('feedStatus').textContent = query
      ? `Найдено: ${visible.length} из ${state.posts.length}`
      : `В ленте: ${state.posts.length} · Последние загруженные заметки`;
  }
  get('emptyState').hidden = !state.loaded || visible.length > 0;
  get('emptyTitle').textContent = query ? 'Ничего не нашлось' : 'Пока тихо';
  get('emptyText').textContent = query
    ? 'Попробуйте другое слово или сбросьте поиск.'
    : 'Создайте первую заметку — она появится здесь.';
  get('resetSearch').hidden = !query;
}

// GET: при запуске и по кнопке «Обновить». Старую ленту сохраняем при ошибке.
async function loadPosts() {
  if (state.busy) return;
  setBusy(true);
  get('loadError').hidden = true;
  get('emptyState').hidden = true;
  get('feedStatus').classList.add('is-loading');
  get('feedStatus').textContent = 'Загружаем заметки…';
  try {
    const posts = await ajax('GET', `/posts?_limit=${POST_LIMIT}`);
    if (!Array.isArray(posts) || posts.some((post) => !Number.isInteger(post.id) || !Number.isInteger(post.userId) || typeof post.title !== 'string' || typeof post.body !== 'string')) {
      throw new Error('Ответ сервера не содержит корректный список заметок.');
    }
    state.posts = posts.map((post) => ({ ...post, key: String(++state.nextKey), local: false }));
    state.loaded = true;
    renderPosts();
  } catch (error) {
    get('loadErrorText').textContent = error.message;
    get('loadError').hidden = false;
    get('feedStatus').textContent = state.posts.length ? 'Не удалось обновить. Предыдущие заметки сохранены в ленте.' : 'Ошибка загрузки';
  } finally {
    get('feedStatus').classList.remove('is-loading');
    setBusy(false);
  }
}

// POST: отправляем JSON, добавляем ответ сервера в начало без перезагрузки.
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (state.busy) return;
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  titleInput.setCustomValidity(title ? '' : 'Введите заголовок, а не только пробелы.');
  bodyInput.setCustomValidity(body ? '' : 'Введите текст, а не только пробелы.');
  if (!form.reportValidity()) return;
  setBusy(true);
  get('submitLabel').textContent = 'Публикуем…';
  try {
    const created = await ajax('POST', '/posts', { title, body, userId: 1 });
    if (!created || !Number.isInteger(created.id)) throw new Error('Сервер не вернул номер новой заметки.');
    // API возвращает id=101 при каждом POST. key уникален внутри страницы,
    // поэтому две новые заметки с одинаковым серверным id удаляются независимо.
    state.posts.unshift({ id: created.id, title, body, userId: 1, key: String(++state.nextKey), local: true });
    state.loaded = true;
    searchInput.value = '';
    get('loadError').hidden = true;
    form.reset();
    get('bodyCount').textContent = '0 / 2000';
    renderPosts();
    notify(`Заметка № ${created.id} опубликована в ленте.`);
  } catch (error) {
    notify(`Не удалось опубликовать. ${error.message}`, true);
  } finally {
    get('submitLabel').textContent = 'Опубликовать';
    setBusy(false);
    titleInput.focus();
  }
});

// DELETE: убираем только выбранную карточку и только после успешного ответа.
postsList.addEventListener('click', async (event) => {
  const button = event.target.closest('.delete-button');
  if (!button || state.busy) return;
  const post = state.posts.find((item) => item.key === button.dataset.key);
  if (!post) return;
  setBusy(true);
  button.querySelector('span').textContent = 'Удаляем…';
  try {
    await ajax('DELETE', `/posts/${post.id}`);
    state.posts = state.posts.filter((item) => item.key !== post.key);
    renderPosts();
    notify(`Заметка № ${post.id} удалена из ленты.`);
    // После удаления сфокусированной кнопки возвращаем фокус в ленту.
    searchInput.focus();
  } catch (error) {
    button.querySelector('span').textContent = 'Удалить';
    notify(`Не удалось удалить. ${error.message}`, true);
  } finally {
    setBusy(false);
  }
});

titleInput.addEventListener('input', () => titleInput.setCustomValidity(''));
bodyInput.addEventListener('input', () => {
  bodyInput.setCustomValidity('');
  get('bodyCount').textContent = `${bodyInput.value.length} / 2000`;
});
searchInput.addEventListener('input', renderPosts);
get('resetSearch').addEventListener('click', () => {
  searchInput.value = '';
  renderPosts();
  searchInput.focus();
});
get('reloadButton').addEventListener('click', loadPosts);
get('retryButton').addEventListener('click', loadPosts);
loadPosts();
