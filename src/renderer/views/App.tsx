import { Empty, Layout } from 'antd';
import * as React from 'react';
import { IItem } from '../api';
import { DetailView } from '../components/DetailView';
import { Header } from '../components/Header';
import { LoginForm } from '../components/LoginForm';
import { Sider } from '../components/Sider';
import { connect } from '../store';

const { Footer } = Layout;

interface IProps extends React.Props<any> {
    rootPassword?: string;
    selectedItem?: IItem;
}

export const App = connect(['rootPassword', 'selectedItem'], (props: IProps) => {
    if (!props.rootPassword) {
        return <LoginForm />;
    }

    return (
        <Layout>
            <Header />
            <Layout>
                <Sider />
                <Layout style={{ padding: '0 24px 24px' }}>
                    {props.selectedItem ?
                        <DetailView /> :
                        <div style={{ backgroundColor: '#fff', padding: '50px' }}>
                            <Empty />
                        </div>
                    }
                </Layout>
            </Layout>
            <Footer style={{ textAlign: 'center' }}>PWD-MGR ©2020 Created by Hutia</Footer>
        </Layout>
    );
});
