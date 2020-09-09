import app from './app';
import translate from './translator';

import 'bootstrap/dist/css/bootstrap.min.css';

translate.then((t) => app(t));
