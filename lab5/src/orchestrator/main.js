import {
  LOAD_ERROR,
  MOUNTED,
  SKIP_BECAUSE_BROKEN,
  addErrorHandler,
  getAppStatus,
  navigateToUrl,
  registerApplication,
  start,
} from 'single-spa';
import './style.css';

const apps = [
  {
    name: 'lab3-react',
    label: 'React',
    path: '/react',
    container: document.getElementById('react-app'),
    load: () => import('../microfrontends/react/entry.jsx'),
  },
  {
    name: 'lab4-vue',
    label: 'Vue',
    path: '/vue',
    container: document.getElementById('vue-app'),
    load: () => import('../microfrontends/vue/entry.js'),
  },
];

const home = document.getElementById('home');
const routePanel = document.getElementById('route-panel');
const routeHeading = document.getElementById('route-heading');
const routeDescription = document.getElementById('route-description');
const routeHome = document.getElementById('route-home');
const routeRetry = document.getElementById('route-retry');
const menuLinks = document.querySelectorAll('.shell-header [data-route]');
let previousPath;

function normalizePath(pathname) {
  return pathname.replace(/\/+$/, '') || '/';
}

function updatePage() {
  const path = normalizePath(window.location.pathname);
  const current = apps.find(app => app.path === path);
  const status = current && getAppStatus(current.name);
  const isHome = path === '/';
  const isMounted = status === MOUNTED;
  const failed = status === LOAD_ERROR || status === SKIP_BECAUSE_BROKEN;

  for (const link of menuLinks) {
    if (link.pathname === path) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }

  for (const app of apps) app.container.hidden = app !== current || !isMounted;
  home.hidden = !isHome;
  routePanel.hidden = isHome || isMounted;

  if (current) {
    document.title = `${current.label} — лабораторная №5`;
    routeHeading.textContent = failed ? `Не удалось подключить ${current.label}` : `Подключаем ${current.label}…`;
    routeDescription.textContent = failed ? 'Попробуйте загрузить приложение ещё раз.' : 'Загружаем микрофронтенд.';
  } else {
    document.title = 'Микрофронтенды — лабораторная №5';
    routeHeading.textContent = 'Страница не найдена';
    routeDescription.textContent = 'Доступные приложения находятся в меню.';
  }
  routeHome.hidden = Boolean(current);
  routeRetry.hidden = !failed;

  if (previousPath !== undefined && previousPath !== path) window.scrollTo(0, 0);
  previousPath = path;
}

document.addEventListener('click', event => {
  const link = event.target.closest('a[data-route]');
  if (link && !event.defaultPrevented && event.button === 0 &&
      !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
    event.preventDefault();
    if (link.href !== window.location.href) navigateToUrl(link.href);
  }
});

routeRetry.addEventListener('click', () => window.location.reload());
window.addEventListener('single-spa:before-routing-event', updatePage);
window.addEventListener('single-spa:routing-event', updatePage);
addErrorHandler(error => {
  console.error(error);
  updatePage();
});

for (const app of apps) {
  registerApplication({
    name: app.name,
    app: app.load,
    activeWhen: location => normalizePath(location.pathname) === app.path,
    customProps: { domElement: app.container },
  });
}

updatePage();
start({ urlRerouteOnly: true });
