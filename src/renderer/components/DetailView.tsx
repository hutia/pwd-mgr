// tslint:disable-next-line: no-implicit-dependencies
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
    Button, Descriptions, Drawer, Empty, Form, Input,
    Layout, message, notification, Popconfirm, Switch, Typography,
} from 'antd';
import * as React from 'react';
import { decodeRow, encodeRow, IItem, IRow, removeItem, selectItem, updateItem } from '../api';
import { promptPassword } from '../helper/prompt';
import { connect, getValue, setValue } from '../store';
import { replaceArr, sha256 } from '../utils';

const { Content: AntdContent } = Layout;

interface IProps extends React.Props<any> {
    selectedItem?: IItem;
    editingRowIndex?: number;
    editingRow?: IRow;
}

export const DetailView = connect([
    'selectedItem',
    'editingRowIndex',
    'editingRow',
], (props: IProps) => {

    const { selectedItem, editingRowIndex } = props;

    if (!selectedItem) { return null; }

    const { rows } = selectedItem;

    const editingRow: IRow = props.editingRow || {
        name: '',
        value: '',
    };

    const [form] = Form.useForm();

    if (typeof editingRowIndex !== 'undefined') {
        setTimeout(() =>
            form.setFieldsValue({
                ...editingRow,
                confirm: editingRow.password,
            }));
    }

    const saveTitle = (s: string) => updateItem({
        ...props.selectedItem,
        name: s,
    });

    const addRow = async () => {
        const row = {
            encoded: false,
            hint: '',
            name: 'new row',
            password: '',
            value: 'new value',
        };
        const item = {
            ...selectedItem,
            rows: rows.concat(row),
        };
        await updateItem(item);
        selectItem(item, true);
        setValue('editingRow', row);
        setValue('editingRowIndex', rows.length);
    };

    const openDrawer = async (index: number) => {
        const row = rows[index];
        if (!row) { return; }
        if (row.encoded) {
            if (sha256(getValue('rootPassword')) === row.password) {
                setValue('editingRow', decodeRow(row, getValue('rootPassword')));
            } else {
                const pwd = await promptPassword('请输入密码');
                if (typeof pwd === 'undefined') { return; }
                if (sha256(pwd) !== row.password) {
                    message.error('Wrong password!');
                    return;
                }
                setValue('editingRow', decodeRow(row, pwd));
            }
        } else {
            setValue('editingRow', row);
        }
        setValue('editingRowIndex', index);
    };

    const closeDrawer = () => {
        setValue('editingRowIndex', undefined);
    };

    const changeEncoded = async (encoded: boolean) => {
        if (!editingRow) { return; }
        const result = form.getFieldsValue();
        setValue('editingRow', {
            encoded,
            hint: result.hint || '',
            name: result.name,
            password: result.password || '',
            value: result.value,
        });
    };

    const saveEditingRow = async () => {
        if (!editingRow) { return; }
        try {
            const result = await form.validateFields();
            const row: IRow = {
                encoded: editingRow.encoded,
                hint: result.hint || '',
                name: result.name,
                password: result.password || '',
                value: result.value,
            };
            const item = {
                ...selectedItem,
                rows: replaceArr(rows, editingRowIndex, encodeRow(row)),
            };
            closeDrawer();
            await updateItem(item);
            selectItem(item, true);
        } catch (e) {
            // Nothing
        }
    };

    const removeRow = async () => {
        if (!editingRow) { return; }
        const item = {
            ...selectedItem,
            rows: replaceArr(rows, editingRowIndex),
        };
        closeDrawer();
        await updateItem(item);
        selectItem(item, true);
    };

    const peep = async (index: number) => {
        const row = rows[index];
        if (!row) { return; }
        if (sha256(getValue('rootPassword')) === row.password) {
            const { value } = decodeRow(row, getValue('rootPassword'));
            notification.open({ message: value });
        } else {
            const pwd = await promptPassword('请输入密码');
            if (typeof pwd === 'undefined') { return; }
            if (sha256(pwd) !== row.password) {
                message.error('Wrong password!');
                return;
            }
            const { value } = decodeRow(row, pwd);
            notification.open({ message: value });
        }
    };

    const title = (
        <Typography.Title
            editable={{ onChange: saveTitle }}
        >
            {props.selectedItem.name}
        </Typography.Title>
    );

    const rowMapper = (row: IRow, index: number) => (
        <Descriptions.Item
            key={index}
            label={<a onClick={() => openDrawer(index)}>{row.name}</a>}
        >
            {row.encoded ?
                <a onClick={() => peep(index)}><Typography.Text mark>{(row.hint || '***')}</Typography.Text></a> :
                row.value
            }
        </Descriptions.Item>
    );

    return (
        <AntdContent
            style={{
                background: '#fff',
                margin: 0,
                minHeight: 280,
                padding: 24,
            }}
        >
            <Descriptions title={title} bordered>
                {
                    rows.length === 0 ?
                        <Descriptions.Item><Empty /></Descriptions.Item> :
                        rows.map(rowMapper)
                }
            </Descriptions>
            <div style={{ marginTop: '20px' }}>
                <Button
                    type='primary'
                    icon={<PlusOutlined />}
                    onClick={addRow}
                    style={{ marginRight: '20px' }}
                >
                    添加条目
                </Button>
                <Popconfirm
                    title='确认要删除当前记录吗？'
                    onConfirm={() => removeItem(props.selectedItem)}
                    okText='删除'
                    cancelText='取消'
                >
                    <Button type='danger' icon={<DeleteOutlined />}>删除</Button>
                </Popconfirm>
            </div>
            <Drawer
                title='编辑条目'
                width={480}
                onClose={closeDrawer}
                visible={typeof editingRowIndex !== 'undefined'}
            >
                <Form
                    layout='vertical'
                    key={editingRowIndex}
                    initialValues={editingRow}
                    form={form}
                    onFinish={saveEditingRow}
                >
                    <Form.Item
                        name='name'
                        label='名称'
                        rules={[{ required: true, message: '请输入名称' }]}
                    >
                        <Input placeholder='请输入名称' autoFocus />
                    </Form.Item>
                    <Form.Item
                        name='value'
                        label='值'
                        rules={[{ required: true, message: '请输入值' }]}
                    >
                        <Input placeholder='请输入值' />
                    </Form.Item>
                    <Form.Item label='加密'>
                        <Switch
                            key={'encoded-' + editingRowIndex}
                            onChange={changeEncoded}
                            checked={editingRow.encoded}
                        />
                    </Form.Item>
                    {
                        editingRow.encoded &&
                        <Form.Item
                            name='password'
                            label='密码'
                            dependencies={['confirm']}
                            rules={[
                                ({ getFieldValue }) => ({
                                    validator(rule, value) {
                                        if (!value || getFieldValue('confirm') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject('两遍的密码输入不一致!');
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder='请输入密码（可以留空）' />
                        </Form.Item>
                    }
                    {
                        editingRow.encoded &&
                        <Form.Item
                            name='confirm'
                            label='再次输入密码'
                            dependencies={['password']}
                            rules={[
                                ({ getFieldValue }) => ({
                                    validator(rule, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject('两遍的密码输入不一致!');
                                    },
                                }),
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                    }
                    {
                        editingRow.encoded &&
                        <Form.Item name='hint' label='提示'>
                            <Input placeholder='请输入提示' />
                        </Form.Item>
                    }
                    <div style={{ textAlign: 'right' }}>
                        <Popconfirm
                            title='确认要删除当前条目吗？'
                            onConfirm={removeRow}
                            okText='删除'
                            cancelText='取消'
                        >
                            <Button type='danger' icon={<DeleteOutlined />}>删除</Button>
                        </Popconfirm>
                        <Button onClick={closeDrawer} htmlType='reset' style={{ margin: '0 10px' }}>
                            关闭
                        </Button>
                        <Button type='primary' htmlType='submit'>
                            保存
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </AntdContent>
    );
});
