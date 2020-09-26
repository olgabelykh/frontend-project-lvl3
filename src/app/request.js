import axios from 'axios';
import i18next from 'i18next';

import { PROXY_URL } from './constants';

const request = (url, tryCount, retryTimeout) => {
  if (tryCount === 0) {
    return Promise.reject(new Error(i18next.t('errors.request')));
  }
  return axios
    .get(`${PROXY_URL}/${url}`)
    .then(({ data }) => ({ url, data }))
    .catch(() => {
      return new Promise((resolve) =>
        setTimeout(() => resolve(request(url, tryCount - 1)), retryTimeout)
      );
    });
};

export default request;
