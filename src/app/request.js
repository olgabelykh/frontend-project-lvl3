import axios from 'axios';
import i18next from 'i18next';

import { PROXY_URL, REQUEST_RETRY_TIMEOUT } from './contants';

const request = (url, tryCount) => {
  if (tryCount === 0) {
    return Promise.reject(new Error(i18next.t('errors.request')));
  }
  return axios
    .get(`${PROXY_URL}/${url}`)
    .then(({ data }) => ({ url, data }))
    .catch(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve(request(url, tryCount - 1)),
            REQUEST_RETRY_TIMEOUT
          )
        )
    );
};

export default request;
