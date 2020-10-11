import i18next from 'i18next';
import { string } from 'yup';
import axios from 'axios';
import _ from 'lodash';
import resources from '../locales';
import parse from './parser';
import ui from './ui';
import watch from './watcher';

import {
  PROXY_URL,
  REFRESH_TIMEOUT,
  LOADING_STATUS_IDLE,
  LOADING_STATUS_PENDING,
  LOADING_STATUS_SUCCESS,
  LOADING_STATUS_FAIL,
  FORM_STATUS_ENABLED,
  FORM_STATUS_DISABLED,
  FORM_STATUS_INVALID,
  FORM_STATUS_VALID,
  FORM_STATUS_IDLE,
} from './constants';

const getProxiedUrl = (url) => `${PROXY_URL}/${url}`;

export default () => {
  const state = {
    feeds: [],
    posts: [],
    loading: {
      status: LOADING_STATUS_IDLE,
      error: null,
      message: null,
    },
    form: {
      status: FORM_STATUS_ENABLED,
      error: null,
    },
  };

  const promise = i18next
    .init({
      lng: 'en',
      resources,
    })
    .then(() => {
      const watchedState = watch(ui, state);

      const initUI = () => {
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

      const handleSubmit = (event) => {
        event.preventDefault();

        watchedState.form = { status: FORM_STATUS_DISABLED };

        const url = new FormData(event.target).get('url');

        try {
          string()
            .required(i18next.t('errors.emptyUrl'))
            .url(i18next.t('errors.invalidUrl'))
            .notOneOf(
              state.feeds.map((item) => item.url),
              i18next.t('errors.alreadyAdded')
            )
            .validateSync(url);
          watchedState.form = { status: FORM_STATUS_VALID };
        } catch ({ message }) {
          watchedState.form = {
            status: FORM_STATUS_INVALID,
            error: message,
          };
          return;
        }

        watchedState.loading = {
          status: LOADING_STATUS_PENDING,
          message: i18next.t('loadingProcess.status.pending'),
        };

        axios
          .get(getProxiedUrl(url))
          .then((response) => {
            const { title, items } = parse(response.data);
            watchedState.feeds = [...state.feeds, { url, title }];
            watchedState.posts = [
              ...state.posts,
              ...items.map((item) => ({ feedUrl: url, ...item })),
            ];

            watchedState.loading = {
              status: LOADING_STATUS_SUCCESS,
              message: i18next.t('loadingProcess.status.success'),
            };
            watchedState.form = { status: FORM_STATUS_IDLE };
          })
          .catch(() => {
            watchedState.loading = {
              status: LOADING_STATUS_FAIL,
              error: i18next.t('errors.cantGetChannel'),
            };
            watchedState.form = { status: FORM_STATUS_ENABLED };
          });
      };

      const refresh = () => {
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
            setTimeout(refresh, REFRESH_TIMEOUT);
          })
          .catch(({ message }) => {
            throw new Error(`Refresh feeds error: ${message}`);
          });
      };

      initUI();
      ui.form.addEventListener('submit', handleSubmit);
      refresh();
    });

  return promise;
};
