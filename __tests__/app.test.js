import path from 'path';
import fs from 'fs';
import axios from 'axios';
import app from '../src/app';

jest.mock('axios');

const getFixturePath = (...paths) =>
  path.resolve(__dirname, '../__fixtures__', path.join(...paths));

beforeAll(() => {
  document.body.innerHTML = fs.readFileSync(
    getFixturePath('body.html'),
    'utf-8'
  );
});

describe('app', () => {
  test('should render feed', () => {
    const data = fs.readFileSync(getFixturePath('lessons.rss'), 'utf-8');
    axios.get.mockImplementationOnce((url) =>
      Promise.resolve({
        data,
        headers: { 'x-final-url': url },
      })
    );
    return app().then(() => {
      const form = document.querySelector('.feed-form');
      form.elements.url.value = 'http://rss2.test';
      document.querySelector('.feed-form__submit').click();
      return Promise.resolve(true).then(() => {
        expect(
          document.querySelector('.feed-form .feed-form__message').textContent
        ).toBe('Channel successfully added.');
        const feeds = document.querySelector('.feeds');
        expect(feeds.children.length).toBe(1);
        expect(feeds.firstChild.querySelector('.posts').children.length).toBe(
          5
        );
      });
    });
  });

  test('should render request error message', () => {
    axios.get
      .mockImplementationOnce(() => Promise.reject(new Error('error')))
      .mockImplementationOnce(() => Promise.reject(new Error('error')));
    return app().then(() => {
      const form = document.querySelector('.feed-form');
      form.elements.url.value = 'http://rss1.test';
      document.querySelector('.feed-form .feed-form__submit').click();
      return Promise.resolve(true)
        .then(() => true)
        .then(() => {
          expect(
            document.querySelector('.feed-form .feed-form__message').textContent
          ).toBe(`Can't add channel.`);
        });
    });
  });

  test('should render validation error message', () => {
    return app().then(() => {
      const form = document.querySelector('.feed-form');
      form.elements.url.value = 'error url';
      document.querySelector('.feed-form .feed-form__submit').click();
      expect(
        document.querySelector('.feed-form .feed-form__message').textContent
      ).toBe(`Rss link must be a valid url.`);
    });
  });
});
