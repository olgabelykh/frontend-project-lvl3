import onChange from 'on-change';
import _ from 'lodash';
import { createFeedElement, createPostElement } from './ui';

import {
  LOADING_STATUS_SUCCESS,
  FORM_STATUS_IDLE,
  FORM_STATUS_DISABLED,
  FORM_STATUS_VALID,
  FORM_STATUS_INVALID,
  FORM_STATUS_ENABLED,
  LOADING_STATUS_PENDING,
  LOADING_STATUS_FAIL,
} from './constants';

const renderForm = (elements, { status, error }) => {
  switch (status) {
    case FORM_STATUS_IDLE:
      elements.form.reset();
      elements.submit.removeAttribute('disabled');
      break;
    case FORM_STATUS_VALID:
      elements.input.classList.remove('border-danger');
      elements.renderErrorMessage('');
      break;
    case FORM_STATUS_INVALID:
      elements.input.classList.add('border-danger');
      elements.renderErrorMessage(error);
      elements.submit.removeAttribute('disabled');
      break;
    case FORM_STATUS_ENABLED:
      elements.submit.removeAttribute('disabled');
      break;
    case FORM_STATUS_DISABLED:
      elements.submit.setAttribute('disabled', '');
      break;
    default:
      throw new Error('unknown form status');
  }
};

const renderLoading = (elements, { status, error, message }) => {
  switch (status) {
    case LOADING_STATUS_FAIL:
      elements.renderErrorMessage(error);
      break;
    case LOADING_STATUS_PENDING:
      elements.renderMessage(message);
      break;
    case LOADING_STATUS_SUCCESS:
      elements.renderSuccessMessage(message);
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
