import { createApp, h } from 'vue';
import singleSpaVue from 'single-spa-vue';
import FeedPage from './pages/FeedPage.vue';
import './style.css';

export const { bootstrap, mount, unmount } = singleSpaVue({
  createApp,
  appOptions: async ({ domElement }) => ({
    el: domElement,
    render: () => h(FeedPage),
  }),
});
