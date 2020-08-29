const parser = new DOMParser();

export default (string) => {
  const doc = parser.parseFromString(string, 'application/xml');
  const channelElement = doc.querySelector('channel');

  const title = channelElement.querySelector('title').textContent;
  const link = channelElement.querySelector('link').textContent;

  const items = {};
  channelElement.querySelectorAll('item').forEach((itemElement) => {
    const guid = itemElement.querySelector('guid').textContent;
    items[guid] = {
      title: itemElement.querySelector('title').textContent,
      link: itemElement.querySelector('link').textContent,
    };
  });

  return { title, link, items };
};
