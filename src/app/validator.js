import { string, object } from 'yup';

const schema = object().shape({
  link: string().url().required(),
});

export default (link) => schema.validate({ link }).then((valid) => valid.link);
