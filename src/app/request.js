import axios from 'axios';

const PROXY_URL = `https://cors-anywhere.herokuapp.com`;

export default (url) =>
  axios
    .get(`${PROXY_URL}/${url}`)
    .then(({ data }) => ({ url, data }))
    .catch(() => {
      throw new Error(`Can't get channel. Check RSS link or try again later.`);
    });
