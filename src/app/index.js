import i18next from 'i18next';
import onChange from 'on-change';
import uniqid from 'uniqid';
import _ from 'lodash';
import validate from './validator';
import parse from './parser';
import request from './request';
import * as ui from './ui';
import {
  REQUEST_TRY_COUNT,
  REFRESH_TIMEOUT,
  LOADING_STATUS_IDLE,
  LOADING_STATUS_SUCCESS,
} from './contants';

export default () => {
  const state = {
    feeds: [],
    posts: [],
    error: null,
    loadingProcess: {
      isLoading: false,
      status: LOADING_STATUS_IDLE,
    },
    form: {
      isValid: true,
    },
  };

  const renderStateMapping = {
    error: ui.renderError,
    'form.isValid': ui.renderFormIsValid,
    'loadingProcess.isLoading': ui.renderLoadingProcessIsLoading,
    'loadingProcess.status': ui.renderLoadingProcessStatus,
    feeds: ui.renderFeeds,
    posts: ui.renderPosts,
  };

  const renderState = (path, value, prevValue) =>
    renderStateMapping[path](value, prevValue);

  const watchedState = onChange(state, renderState);

  const refresh = ({ url, feedId }) => {
    request(url, REQUEST_TRY_COUNT)
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

  const init = () => {
    ui.renderText();

    ui.form.addEventListener('submit', (event) => {
      event.preventDefault();

      watchedState.error = null;
      watchedState.loadingProcess.status = LOADING_STATUS_IDLE;
      watchedState.form.isValid = true;

      validate(new FormData(event.target).get('url'))
        .catch(({ message }) => {
          watchedState.form.isValid = false;
          throw new Error(message);
        })
        .then((url) => {
          if (_.findIndex(state.feeds, ['url', url]) !== -1) {
            throw new Error(i18next.t('errors.alreadyAdded'));
          }
          watchedState.loadingProcess.isLoading = true;
          return url;
        })
        .then((url) => request(url, REQUEST_TRY_COUNT))
        .then(({ url, data }) => {
          const { title, items } = parse(data);
          const feedId = uniqid();
          watchedState.feeds = [...state.feeds, { id: feedId, url, title }];
          watchedState.posts = [
            ...state.posts,
            ...items.map((item) => ({ feedId, id: uniqid(), ...item })),
          ];
          watchedState.loadingProcess.status = LOADING_STATUS_SUCCESS;
          setTimeout(refresh, REFRESH_TIMEOUT, { url, feedId });
        })
        .catch(({ message }) => {
          watchedState.error = message;
        })
        .finally(() => {
          watchedState.loadingProcess.isLoading = false;
        });
    });
  };

  init();
};
