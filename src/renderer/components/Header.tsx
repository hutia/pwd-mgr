// tslint:disable: no-submodule-imports
import { Col, Input, Layout, Row } from 'antd';
import * as React from 'react';
import { getList } from '../api';
import { setValue } from '../store';

const { Header: AntdHeader } = Layout;

interface IProps extends React.Props<any> {
}

export const Header: React.FC<IProps> = (props) => {
    const doSearch = (s: string) => {
        setValue('search', s);
        getList();
    };

    return (
        <AntdHeader className='header'>
            <Row justify='center' align='middle' gutter={[16, 16]}>
                <Col span={6}>

                </Col>
                <Col span={18}>
                    <Input.Search onSearch={doSearch} />
                </Col>
            </Row>
        </AntdHeader>
    );
};
