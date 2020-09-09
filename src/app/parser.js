import i18next from 'i18next';

const parser = new DOMParser();

export default (string) => {
  const doc = parser.parseFromString(string, 'application/xml');

  const error = doc.querySelector('parsererror');
  if (error) {
    throw new Error(i18next.t('errors.parse'));
  }

  return {
    title: doc.querySelector('channel > title').textContent,
    items: Object.values(doc.querySelectorAll('item')).map((item) => ({
      title: item.querySelector('title').textContent,
      link: item.querySelector('link').textContent,
      guid: item.querySelector('guid').textContent,
    })),
  };
};
