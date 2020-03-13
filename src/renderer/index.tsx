// tslint:disable-next-line: no-submodule-imports
import 'antd/dist/antd.min.css';
import './style/index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { checkInstall, getList } from './api';
import { App } from './views/App';

export async function initRenderer() {
    await checkInstall();
    await getList();
    ReactDOM.render(
        <App />,
        document.getElementById('root') as HTMLElement,
    );
}
