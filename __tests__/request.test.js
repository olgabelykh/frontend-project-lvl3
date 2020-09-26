import axios from 'axios';
import i18next from 'i18next';
import request from '../src/app/request.js';

jest.mock('axios');
jest.mock('i18next');

const retryTimeout = 0;
const url = 'http://localhost';

describe('request', () => {
  test('should return data', () => {
    const tryCount = 1;
    const data = 'data';
    axios.get.mockImplementationOnce(() => Promise.resolve({ data }));

    return expect(request(url, tryCount, retryTimeout)).resolves.toEqual({
      url,
      data,
    });
  });

  test('should throw error', () => {
    const tryCount = 1;
    const errorMessage = 'error message';
    axios.get.mockImplementationOnce(() =>
      Promise.reject(new Error(errorMessage))
    );
    i18next.t.mockImplementationOnce(() => errorMessage);

    return expect(request(url, tryCount, retryTimeout)).rejects.toThrow(
      errorMessage
    );
  });

  test('should retry', () => {
    const tryCount = 2;
    axios.get
      .mockImplementationOnce(() => Promise.reject())
      .mockImplementationOnce(() => Promise.resolve(true));

    return expect(request(url, tryCount, retryTimeout)).resolves.toBeDefined();
  });
});
