import path from 'path';
import fs from 'fs';
import i18next from 'i18next';
import app from '../src/app';
import validate from '../src/app/validator';
import request from '../src/app/request';

jest.mock('i18next');
jest.mock('axios');
jest.mock('../src/app/validator');
jest.mock('../src/app/request');

const validateError = 'validate error';
const requestError = 'request error';
const text = 'text';

const getFixturePath = (...paths) =>
  path.resolve(__dirname, '../__fixtures__', path.join(...paths));

beforeAll(() => {
  i18next.t.mockImplementation(() => text);

  validate
    .mockImplementationOnce(() => Promise.reject(new Error(validateError)))
    .mockImplementationOnce(() => Promise.resolve('valid url'))
    .mockImplementationOnce(() => Promise.resolve('valid url'));

  const data = fs.readFileSync(getFixturePath('lessons.rss'), 'utf-8');
  request
    .mockImplementationOnce(() => Promise.reject(new Error(requestError)))
    .mockImplementationOnce(() =>
      Promise.resolve({
        url: 'url',
        data,
      })
    );

  document.body.innerHTML = fs.readFileSync(
    getFixturePath('body.html'),
    'utf-8'
  );
  app();
});

describe('app', () => {
  test('should render validate error message', () => {
    document.querySelector('.feed-form .feed-form__submit').click();
    return Promise.resolve(true)
      .then(() => true)
      .then(() => {
        expect(
          document.querySelector('.feed-form .feed-form__message').textContent
        ).toBe(validateError);
      });
  });

  test('should render request error message', () => {
    document.querySelector('.feed-form .feed-form__submit').click();
    return Promise.resolve(true)
      .then(() => true)
      .then(() => true)
      .then(() => true)
      .then(() => true)
      .then(() => true)
      .then(() => true)
      .then(() => {
        expect(
          document.querySelector('.feed-form .feed-form__message').textContent
        ).toBe(requestError);
      });
  });

  test('should render feed', () => {
    document.querySelector('.feed-form .feed-form__submit').click();
    return Promise.resolve(true)
      .then(() => true)
      .then(() => true)
      .then(() => true)
      .then(() => true)
      .then(() => true)
      .then(() => true)
      .then(() => {
        expect(
          document.querySelector('.feed-form .feed-form__message').textContent
        ).toBe(text);
        expect(
          document.querySelector('.feeds').firstChild.querySelector('.posts')
            .childNodes.length
        ).toBe(5);
      });
  });
});
