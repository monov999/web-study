import { useRef, useState } from 'react';
import usePosts from '../hooks/usePosts.js';
import PostForm from '../components/PostForm.jsx';
import PostItem from '../components/PostItem.jsx';

const PAGE_SIZE = 10;

export default function FeedPage() {
  const { posts, users, loading, error, notice, retry, addPost, deletePost } = usePosts();
  const [query, setQuery] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [page, setPage] = useState(1);
  const feedHeading = useRef(null);
  const myPosts = posts.filter(post => post.isLocal).length;
  const search = query.trim().toLocaleLowerCase('ru');
  const filtered = posts.filter(post =>
    (!onlyMine || post.isLocal) && (!authorId || post.userId === Number(authorId)) &&
    `${post.title} ${post.body}`.toLocaleLowerCase('ru').includes(search),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visiblePosts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function resetFilters() {
    setQuery('');
    setAuthorId('');
    setOnlyMine(false);
    setPage(1);
  }

  async function handleAdd(title, body) {
    await addPost(title, body);
    resetFilters();
  }

  function changePage(nextPage) {
    setPage(nextPage);
    feedHeading.current?.focus();
    feedHeading.current?.scrollIntoView({ block: 'start' });
  }

  return (
    <>
      <a className="skip-link" href="#feed">К ленте постов</a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="./" aria-label="Лента — главная">
            <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 6h20v15H14l-8 6V6Z" /><path d="M11 12h10m-10 4h6" /></svg>
            лента<span className="brand-dot">.</span>
          </a>
          
          <a className="source-link" href="https://jsonplaceholder.typicode.com/" target="_blank" rel="noreferrer">
            JSONPlaceholder <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>
      <main className="page-shell">
        <div className="page-intro">
          <div>
            <p className="eyebrow">ЛАБОРАТОРНАЯ РАБОТА №3 <span aria-hidden="true"></span></p>
            <h1>Место для ваших мыслей<span>.</span></h1>
            <p className="intro-text">Читайте, находите интересное и добавляйте своё.</p>
          </div>
        </div>
        <div className="workspace">
          <aside className="sidebar">
            <PostForm onAdd={handleAdd} disabled={loading || !!error} currentUser={users.find(user => user.id === 1)} />
            
          </aside>
          <section className="feed" id="feed" tabIndex={-1} aria-labelledby="feed-heading">
            <div className="feed-heading">
              <h2 id="feed-heading" tabIndex={-1} ref={feedHeading}>Лента постов</h2>
              <span className="count-badge">{loading ? '…' : posts.length}</span>
            </div>
            <div className="filters">
              <div className="feed-tabs" role="group" aria-label="Показывать посты">
                <button type="button" aria-pressed={!onlyMine} onClick={() => { setOnlyMine(false); setPage(1); }}>Все посты</button>
                <button type="button" aria-pressed={onlyMine} onClick={() => { setOnlyMine(true); setPage(1); }}>
                  Мои добавленные <span>{myPosts}</span>
                </button>
              </div>
              <div className="search-row">
                <div className="search-field">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
                  <input type="search" aria-label="Поиск по заголовку и тексту" placeholder="Найти в ленте…"
                    value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} />
                </div>
                <select aria-label="Фильтр по автору" value={authorId} disabled={loading || !!error}
                  onChange={event => { setAuthorId(event.target.value); setPage(1); }}>
                  <option value="">Все авторы</option>
                  {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
              </div>
            </div>
            <div className="feed-meta" role="status">
              {loading ? 'Загружаем посты…' : error ? 'Не удалось загрузить ленту' : `Найдено: ${filtered.length}`}
              {!loading && !error && filtered.length > 0 && <span>По {PAGE_SIZE} на странице</span>}
            </div>
            <p className="notice" role="status">{notice}</p>
            {loading ? (
              <div className="skeleton-list" aria-busy="true" aria-label="Загрузка постов">
                {[1, 2, 3].map(item => <div className="skeleton-post" key={item}><span /><span /><span /></div>)}
              </div>
            ) : error ? (
              <div className="empty-state" role="alert">
                <span className="empty-icon" aria-hidden="true">!</span>
                <h3>Лента пока недоступна</h3><p>{error}</p>
                <button className="button primary" type="button" onClick={retry}>Попробовать снова</button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon" aria-hidden="true">⌕</span>
                <h3>{onlyMine && !myPosts ? 'Ваш первый пост ещё впереди' : 'Посты не найдены'}</h3>
                <p>{onlyMine && !myPosts ? 'Добавьте его с помощью формы «Новый пост».' : 'Попробуйте другой запрос или выберите всех авторов.'}</p>
                <button className="button secondary" type="button" onClick={resetFilters}>Показать все посты</button>
              </div>
            ) : (
              <>
                <ul className="post-list">
                  {visiblePosts.map(post => <PostItem key={post.key} post={post}
                    user={users.find(user => user.id === post.userId)} onDelete={deletePost} />)}
                </ul>
                <nav className="pagination" aria-label="Страницы ленты">
                  <button className="button secondary" type="button" disabled={currentPage === 1}
                    onClick={() => changePage(currentPage - 1)}>← Назад</button>
                  <span aria-live="polite">{currentPage} из {pageCount}</span>
                  <button className="button secondary" type="button" disabled={currentPage === pageCount}
                    onClick={() => changePage(currentPage + 1)}>Далее →</button>
                </nav>
              </>
            )}
          </section>
        </div>
        <footer className="site-footer"><span>Учебный проект · Лабораторная №3</span></footer>
      </main>
    </>
  );
}
