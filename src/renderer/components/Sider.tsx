// tslint:disable-next-line: no-implicit-dependencies
import { FolderAddOutlined, FolderOpenOutlined, FormOutlined, ToolOutlined } from '@ant-design/icons';
import { Layout, Menu, message } from 'antd';
import * as React from 'react';
import { changeRootPass, createItem, IItem, login, selectItem } from '../api';
import { promptPassword } from '../helper/prompt';
import { connect } from '../store';

const { Sider: AntdSider } = Layout;

interface IProps extends React.Props<any> {
    selectedItem?: IItem;
    list?: IItem[];
}

export const Sider = connect(['list', 'selectedItem'], (props: IProps) => {

    const startChangeRootPass = async () => {
        const oldPass = await promptPassword('请输入原密码');
        if (!await login(oldPass)) {
            message.error('原始密码错误！');
            return;
        }
        const newPass = await promptPassword('请输入新密码');
        if (!newPass) { return; }
        const newPass2 = await promptPassword('请再次输入新密码');
        if (typeof newPass2 === 'undefined') { return; }
        if (newPass !== newPass2) {
            message.error('两次密码输入不一致！');
            return;
        }
        await changeRootPass(oldPass, newPass);
        message.success('密码修改成功！');
    };

    const list = props.list && props.list.map((v) => (
        <Menu.Item key={v._id} onClick={() => selectItem(v)}>
            {v.name}
        </Menu.Item>
    ));

    return (
        <AntdSider width={200} style={{ backgroundColor: '#fff' }}>
            <Menu
                selectedKeys={props.selectedItem ? [props.selectedItem._id] : []}
                defaultOpenKeys={['list']}
                mode='inline'
                theme='light'
            >
                <Menu.SubMenu
                    key='tools'
                    title={
                        <span>
                            <FormOutlined />
                            <span>操作</span>
                        </span>
                    }
                >
                    <Menu.Item key='1' onClick={createItem}>
                        <FolderAddOutlined />
                        <span>添加条目</span>
                    </Menu.Item>
                    <Menu.Item key='2' onClick={startChangeRootPass}>
                        <ToolOutlined />
                        <span>更改登录密码</span>
                    </Menu.Item>
                </Menu.SubMenu>
                <Menu.SubMenu
                    key='list'
                    title={
                        <span>
                            <FolderOpenOutlined />
                            <span>清单</span>
                        </span>
                    }
                >
                    {list}
                </Menu.SubMenu>
            </Menu>
        </AntdSider>
    );
});
