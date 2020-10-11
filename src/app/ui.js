export const createPostElement = ({ title, link }) => {
  const postElement = document.createElement('div');
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', link);
  linkElement.textContent = title;
  postElement.append(linkElement);
  return postElement;
};

export const createFeedElement = ({ url, title }) => {
  const feedElement = document.createElement('div');
  feedElement.classList.add('mb-5');
  feedElement.dataset.url = url;
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
};
