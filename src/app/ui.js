import i18next from 'i18next';
import _ from 'lodash';

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

export default {
  getElement(name, selector) {
    if (!this[`_${name}`]) {
      this[`_${name}`] = document.querySelector(selector);
    }
    return this[`_${name}`];
  },

  get header() {
    return this.getElement('header', '.header');
  },

  get lead() {
    return this.getElement('lead', '.lead');
  },

  get details() {
    return this.getElement('details', '.details');
  },

  get feeds() {
    return this.getElement('feeds', '.feeds');
  },

  get form() {
    return this.getElement('form', '.feed-form');
  },

  get submit() {
    return this.getElement('submit', '.feed-form__submit');
  },

  get input() {
    return this.getElement('input', '.feed-form__input');
  },

  get message() {
    return this.getElement('message', '.feed-form__message');
  },

  get example() {
    return this.getElement('example', '.feed-form__example');
  },

  renderText() {
    this.header.textContent = i18next.t('header');
    this.lead.textContent = i18next.t('lead');
    this.details.textContent = i18next.t('details');
    this.input.setAttribute(
      'placeholder',
      i18next.t('channelForm.url.placeholder')
    );
    this.submit.textContent = i18next.t('channelForm.submit.value');
    this.example.textContent = i18next.t('channelForm.example');
  },

  renderErrorMessage(message) {
    this.message.textContent = message;
    this.message.classList.remove('text-success');
    this.message.classList.add('text-danger');
  },

  renderSuccessMessage(message) {
    this.message.textContent = message;
    this.message.classList.remove('text-danger');
    this.message.classList.add('text-success');
  },

  renderMessage(message) {
    this.message.textContent = message;
    this.message.classList.remove('text-danger');
    this.message.classList.remove('text-success');
  },

  renderForm({ status, error }) {
    switch (status) {
      case FORM_STATUS_IDLE:
        this.form.reset();
        break;
      case FORM_STATUS_VALID:
        this.input.classList.remove('border-danger');
        this.renderErrorMessage('');
        break;
      case FORM_STATUS_INVALID:
        this.input.classList.add('border-danger');
        this.renderErrorMessage(error);
        break;
      case FORM_STATUS_ENABLED:
        this.submit.removeAttribute('disabled');
        break;
      case FORM_STATUS_DISABLED:
        this.submit.setAttribute('disabled', '');
        break;
      default:
        throw new Error(i18next.t('error.unknownFormStatus'));
    }
  },

  renderLoading({ status, error }) {
    switch (status) {
      case LOADING_STATUS_FAIL:
        this.renderErrorMessage(error);
        break;
      case LOADING_STATUS_PENDING:
        this.renderMessage(i18next.t('loadingProcess.status.pending'));
        break;
      case LOADING_STATUS_SUCCESS:
        this.renderSuccessMessage(i18next.t('loadingProcess.status.success'));
        break;
      default:
        throw new Error(i18next.t('error.unknownLoadingStatus'));
    }
  },

  renderFeeds(feeds, prevFeeds) {
    const newFeedElements = _.differenceBy(feeds, prevFeeds, 'id').map(
      createFeedElement
    );
    this.feeds.prepend(...newFeedElements);
  },

  renderPosts(posts, prevPosts) {
    const newPosts = _.differenceBy(posts, prevPosts, 'id');
    newPosts.reverse().forEach((post) => {
      const postElement = createPostElement(post);
      const postsElement = document.querySelector(`#${post.feedId} > .posts`);
      postsElement.prepend(postElement);
    });
  },
};
