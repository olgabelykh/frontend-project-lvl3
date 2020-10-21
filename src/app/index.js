import i18next from 'i18next';
import { string, setLocale } from 'yup';
import axios from 'axios';
import _ from 'lodash';
import resources from '../locales';
import parse from './parser';
import ui from './ui';
import watch from './watcher';

import {
  PROXY_URL,
  TRACK_NEW_POSTS_TIMEOUT,
  LOADING_STATUS,
  FORM_STATUS,
} from './constants';

const getProxiedUrl = (url) => `${PROXY_URL}/${url}`;

export default () => {
  const state = {
    feeds: [],
    posts: [],
    loading: {
      status: LOADING_STATUS.idle,
      error: null,
    },
    form: {
      status: FORM_STATUS.enabled,
      error: null,
    },
  };

  setLocale({
    mixed: {
        notOneOf: 'errors.alreadyAdded',
        required: 'errors.emptyUrl',
    },
    string: {
        url: 'errors.invalidUrl'
    },
  });

  const promise = i18next
    .init({
      lng: 'en',
      resources,
    })
    .then(() => {
      const watchedState = watch(ui, state);

      const renderLocale = () => {
        ui.header.textContent = i18next.t('header');
        ui.lead.textContent = i18next.t('lead');
        ui.details.textContent = i18next.t('details');
        ui.input.setAttribute(
          'placeholder',
          i18next.t('channelForm.url.placeholder')
        );
        ui.submit.textContent = i18next.t('channelForm.submit.value');
        ui.example.textContent = i18next.t('channelForm.example');
      };

      const validateUrl = (url) => 
      string()
        .required()
        .url()
        .notOneOf(state.feeds.map((item) => item.url))
        .validateSync(url);

      const handleSubmit = (event) => {
        event.preventDefault();

        watchedState.form = { status: FORM_STATUS.disabled };

        const url = new FormData(event.target).get('url');

        try {
          validateUrl(url);
          watchedState.form = { status: FORM_STATUS.valid };
        } catch ({ message }) {
          watchedState.form = {
            status: FORM_STATUS.invalid,
            error: message,
          };
          return;
        }

        watchedState.loading = { status: LOADING_STATUS.pending };

        axios
          .get(getProxiedUrl(url))
          .then((response) => {
            const { title, items } = parse(response.data);
            watchedState.feeds = [...state.feeds, { url, title }];
            watchedState.posts = [
              ...state.posts,
              ...items.map((item) => ({ feedUrl: url, ...item })),
            ];

            watchedState.loading = { status: LOADING_STATUS.success };
            watchedState.form = { status: FORM_STATUS.idle };
          })
          .catch(() => {
            watchedState.loading = {
              status: LOADING_STATUS.fail,
              error: 'errors.cantGetChannel',
            };
            watchedState.form = { status: FORM_STATUS.enabled };
          });
      };

      const trackNewPosts = () => {
        Promise.allSettled(
          state.feeds.map(({ url }) => axios.get(getProxiedUrl(url)))
        )
          .then((responses) => {
            responses.forEach((response) => {
              const { status, value } = response;
              if (status === 'rejected') {
                return;
              }

              const { data, headers } = value;
              const { items } = parse(data);
              const newPosts = _.differenceBy(items, state.posts, 'guid');
              watchedState.posts = [
                ...state.posts,
                ...newPosts.map((item) => ({
                  feedUrl: headers['x-final-url'],
                  ...item,
                })),
              ];
            });
            setTimeout(trackNewPosts, TRACK_NEW_POSTS_TIMEOUT);
          })
          .catch(({ message }) => {
            throw new Error(`Refresh feeds error: ${message}`);
          });
      };

      renderLocale();
      ui.form.addEventListener('submit', handleSubmit);
      trackNewPosts();
    });

  return promise;
};
