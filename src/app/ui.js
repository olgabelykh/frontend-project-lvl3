import i18next from 'i18next';
import _ from 'lodash';

import { LOADING_STATUS_IDLE } from './contants';

export const header = document.querySelector('.header');
export const lead = document.querySelector('.lead');
export const details = document.querySelector('.details');
export const container = document.querySelector('.feeds');
export const form = document.querySelector('.feed-form');
export const submit = form.querySelector('.feed-form__submit');
export const input = form.querySelector('.feed-form__input');
export const errorMessage = form.querySelector('.feed-form__error-message');
export const successMessage = form.querySelector('.feed-form__success-message');
export const example = form.querySelector('.feed-form__example');

export const renderText = () => {
  header.textContent = i18next.t('header');
  lead.textContent = i18next.t('lead');
  details.textContent = i18next.t('details');
  input.setAttribute('placeholder', i18next.t('channelForm.url.placeholder'));
  submit.textContent = i18next.t('channelForm.submit.value');
  example.textContent = i18next.t('channelForm.example');
};

const createPostElement = ({ title, link }) => {
  const postElement = document.createElement('div');
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', link);
  linkElement.textContent = title;
  postElement.append(linkElement);
  return postElement;
};

const createFeedElement = ({ id, title }) => {
  const feedElement = document.createElement('div');
  feedElement.classList.add('mb-5');
  feedElement.setAttribute('id', id);
  const titleElement = document.createElement('h3');
  titleElement.textContent = title;
  const postsElement = document.createElement('div');
  postsElement.classList.add('posts');
  feedElement.append(titleElement, postsElement);
  return feedElement;
};

export const renderError = (message) => {
  errorMessage.textContent = message;
};

export const renderFormIsValid = (isValid) => {
  if (isValid) {
    input.classList.remove('border-danger');
  } else {
    input.classList.add('border-danger');
  }
};

export const renderLoadingProcessIsLoading = (isLoading) => {
  if (isLoading) {
    submit.setAttribute('disabled', '');
  } else {
    submit.removeAttribute('disabled');
  }
};

export const renderLoadingProcessStatus = (status) => {
  switch (status) {
    case 'success':
      successMessage.textContent = i18next.t('loadingProcess.status.success');
      form.reset();
      break;
    case LOADING_STATUS_IDLE:
      successMessage.textContent = '';
      break;
    default:
      throw new Error(i18next.t('error.unknownLoadingStatus'));
  }
};

export const renderFeeds = (feeds, prevFeeds) => {
  const newFeedElements = _.differenceBy(feeds, prevFeeds, 'id').map(
    createFeedElement
  );
  container.prepend(...newFeedElements);
};

export const renderPosts = (posts, prevPosts) => {
  const newPosts = _.differenceBy(posts, prevPosts, 'id');
  newPosts.reverse().forEach((post) => {
    const postElement = createPostElement(post);
    const postsElement = document.querySelector(`#${post.feedId} > .posts`);
    postsElement.prepend(postElement);
  });
};
