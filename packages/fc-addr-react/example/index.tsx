import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as smoothscroll from 'smoothscroll-polyfill';
import Simple from './Simple';

smoothscroll.polyfill();

ReactDOM.render(<Simple />, document.getElementById('root'));
