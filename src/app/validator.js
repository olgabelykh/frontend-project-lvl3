import { string, object, setLocale } from 'yup';

setLocale({
  string: {
    url: 'RSS link must be a valid URL',
  },
});

const schema = object().shape({
  url: string().url().required(),
});

export default (url) => schema.validate({ url }).then((valid) => valid.url);
