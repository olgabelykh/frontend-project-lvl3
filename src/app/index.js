import onChange from 'on-change';

import validate from './validator';
import parse from './parser';
import request from './request';

export default () => {
  const state = {
    channels: {},
    status: {},
  };

  const container = document.querySelector('.channels-container');
  const form = document.querySelector('.channel-form');
  const submit = form.querySelector('.channel-form__submit');
  const input = form.querySelector('.channel-form__input');
  const errorMessage = form.querySelector('.channel-form__error-message');
  const successMessage = form.querySelector('.channel-form__success-message');

  const renderValidateStatus = (isSuccess) => {
    if (isSuccess) {
      input.classList.remove('border-danger');
    } else {
      input.classList.add('border-danger');
    }
  };

  const renderPendingStatus = (isPending) => {
    if (isPending) {
      submit.setAttribute('disabled', '');
    } else {
      submit.removeAttribute('disabled');
    }
  };

  const renderError = (message) => {
    errorMessage.textContent = message;
  };

  const renderSuccess = (message) => {
    successMessage.textContent = message;
    if (message) {
      form.reset();
    }
  };

  const renderStatusMapping = {
    isPending: renderPendingStatus,
    isValid: renderValidateStatus,
    error: renderError,
    success: renderSuccess,
  };

  const watchedStatus = onChange(state.status, (path, value) =>
    renderStatusMapping[path](value)
  );

  const renderChannel = (url, { title, items }) => {
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;

    const itemsElement = document.createElement('div');
    const itemElements = Object.values(items).map((item) => {
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', item.link);
      linkElement.textContent = item.title;

      const itemElement = document.createElement('div');
      itemElement.appendChild(linkElement);

      return itemElement;
    });
    itemsElement.append(...itemElements);

    const feedElement = document.createElement('div');
    feedElement.append(titleElement, itemsElement);

    container.prepend(feedElement);
  };

  const watchedChannels = onChange(state.channels, renderChannel);

  const init = () => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const RSSlink = formData.get('url');

      watchedStatus.error = '';
      watchedStatus.success = '';
      watchedStatus.isValid = true;

      validate(RSSlink)
        .catch(({ message }) => {
          watchedStatus.isValid = false;
          throw new Error(message);
        })
        .then((url) => {
          if (state.channels[url]) {
            throw new Error('Channel is already added.');
          }
          watchedStatus.isPending = true;
          return url;
        })
        .then(request)
        .then(({ url, data }) => {
          const channel = parse(data);
          watchedChannels[url] = channel;
          watchedStatus.success = 'Channel successfully added.';
        })
        .catch(({ message }) => {
          watchedStatus.error = message;
        })
        .finally(() => {
          watchedStatus.isPending = false;
        });
    });
  };

  init();
};
