import i18next from 'i18next';
import onChange from 'on-change';
import _ from 'lodash';
import { createFeedElement, createPostElement } from './ui';

import {
  FORM_STATUS,
  LOADING_STATUS,
} from './constants';

const renderForm = (elements, { status, error }) => {
  switch (status) {
    case FORM_STATUS.idle:
      elements.form.reset();
      elements.submit.removeAttribute('disabled');
      break;
    case FORM_STATUS.valid:
      elements.input.classList.remove('border-danger');
      elements.renderErrorMessage('');
      break;
    case FORM_STATUS.invalid:
      elements.input.classList.add('border-danger');
      elements.renderErrorMessage(i18next.t(error));
      elements.submit.removeAttribute('disabled');
      break;
    case FORM_STATUS.enabled:
      elements.submit.removeAttribute('disabled');
      break;
    case FORM_STATUS.disabled:
      elements.submit.setAttribute('disabled', '');
      break;
    default:
      throw new Error('unknown form status');
  }
};

const renderLoading = (elements, { status, error }) => {
  switch (status) {
    case LOADING_STATUS.fail:
      elements.renderErrorMessage(i18next.t(error));
      break;
    case LOADING_STATUS.pending:
      elements.renderMessage(i18next.t('loadingProcess.status.pending'));
      break;
    case LOADING_STATUS.success:
      elements.renderSuccessMessage(i18next.t('loadingProcess.status.success'));
      break;
    default:
      throw new Error('Unknown loading status');
  }
};

const renderFeeds = (elements, feeds, prevFeeds) => {
  const newFeedElements = _.differenceBy(feeds, prevFeeds, 'url').map(
    createFeedElement
  );
  elements.feeds.prepend(...newFeedElements);
};

const renderPosts = (elements, posts, prevPosts) => {
  const newPosts = _.differenceBy(posts, prevPosts, 'guid');
  newPosts.reverse().forEach((post) => {
    const postElement = createPostElement(post);
    const postsElement = elements.feeds.querySelector(
      `[data-url="${post.feedUrl}"] > .posts`
    );
    postsElement.prepend(postElement);
  });
};

export default (elements, initialState) => {
  const watchedState = onChange(initialState, (path, value, prevValue) => {
    switch (path) {
      case 'form':
        renderForm(elements, value);
        break;
      case 'loading':
        renderLoading(elements, value);
        break;
      case 'feeds':
        renderFeeds(elements, value, prevValue);
        break;
      case 'posts':
        renderPosts(elements, value, prevValue);
        break;
      default:
        throw new Error('Unknown state path.');
    }
  });
  return watchedState;
};
