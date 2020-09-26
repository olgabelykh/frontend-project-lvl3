import i18next from 'i18next';
import onChange from 'on-change';
import uniqid from 'uniqid';
import _ from 'lodash';
import validate from './validator';
import parse from './parser';
import request from './request';
import ui from './ui';
import {
  REQUEST_TRY_COUNT,
  REQUEST_RETRY_TIMEOUT,
  REFRESH_TIMEOUT,
  LOADING_STATUS_IDLE,
  LOADING_STATUS_SUCCESS,
  FORM_STATUS_ENABLED,
  FORM_STATUS_DISABLED,
  FORM_STATUS_INVALID,
  FORM_STATUS_IDLE,
  LOADING_STATUS_FAIL,
  FORM_STATUS_VALID,
  LOADING_STATUS_PENDING,
} from './constants';

export default () => {
  const state = {
    feeds: [],
    posts: [],
    loading: {
      status: LOADING_STATUS_IDLE,
      error: null,
    },
    form: {
      status: FORM_STATUS_ENABLED,
      error: null,
    },
  };

  const renderStateMapping = {
    form: ui.renderForm.bind(ui),
    loading: ui.renderLoading.bind(ui),
    feeds: ui.renderFeeds.bind(ui),
    posts: ui.renderPosts.bind(ui),
  };

  const renderState = (path, value, prevValue) =>
    renderStateMapping[path](value, prevValue);

  const watchedState = onChange(state, renderState);

  const refresh = ({ url, feedId }) => {
    request(url, REQUEST_TRY_COUNT, REQUEST_RETRY_TIMEOUT)
      .then(({ data }) => {
        const { items } = parse(data);
        const newPosts = _.differenceBy(items, state.posts, 'guid');
        watchedState.posts = [
          ...state.posts,
          ...newPosts.map((item) => ({ feedId, id: uniqid(), ...item })),
        ];
        setTimeout(refresh, REFRESH_TIMEOUT, { url, feedId });
      })
      .catch(() => {});
  };

  const isExistedFeed = (url) => _.findIndex(state.feeds, ['url', url]) !== -1;

  const validateUrl = (url) =>
    validate(url)
      .then((validUrl) => {
        if (isExistedFeed(url)) {
          throw new Error(i18next.t('errors.alreadyAdded'));
        }
        watchedState.form = { status: FORM_STATUS_VALID };
        return validUrl;
      })
      .catch(({ message }) => {
        watchedState.form = {
          status: FORM_STATUS_INVALID,
          error: message,
        };
        return Promise.reject(new Error(message));
      });

  const getFeed = (link) =>
    request(link, REQUEST_TRY_COUNT, REQUEST_RETRY_TIMEOUT)
      .then(({ url, data }) => {
        watchedState.loading = { status: LOADING_STATUS_SUCCESS };
        return { url, feed: parse(data) };
      })
      .catch(({ message }) => {
        watchedState.loading = {
          status: LOADING_STATUS_FAIL,
          error: message,
        };
        return Promise.reject(new Error(message));
      });

  const init = () => {
    ui.renderText();

    ui.form.addEventListener('submit', (event) => {
      event.preventDefault();

      watchedState.form = { status: FORM_STATUS_DISABLED };

      validateUrl(new FormData(event.target).get('url'))
        .then((url) => {
          watchedState.loading = { status: LOADING_STATUS_PENDING };
          return getFeed(url);
        })
        .then(({ url, feed: { title, items } }) => {
          const feedId = uniqid();
          watchedState.feeds = [...state.feeds, { id: feedId, url, title }];
          watchedState.posts = [
            ...state.posts,
            ...items.map((item) => ({ feedId, id: uniqid(), ...item })),
          ];
          watchedState.form = { status: FORM_STATUS_IDLE };
          setTimeout(refresh, REFRESH_TIMEOUT, { url, feedId });
        })
        .catch(() => {})
        .finally(() => {
          watchedState.form = { status: FORM_STATUS_ENABLED };
        });
    });
  };

  init();
};
