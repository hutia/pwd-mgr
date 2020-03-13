import { Button, Form, Input, PageHeader } from 'antd';
import * as React from 'react';
import { login } from '../api';
import { connect, setValue } from '../store';

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

interface IProps extends React.Props<any> {
    'loginForm.validateStatus'?: 'success' | 'warning' | 'error' | 'validating' | '';
    'loginForm.validateHelp'?: string;
}

export const LoginForm = connect(['loginForm.validateStatus', 'loginForm.validateHelp'], (props: IProps) => {
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        const { password } = values;
        if (!password) {
            setValue('loginForm.validateStatus', 'error');
            setValue('loginForm.validateHelp', '密码不可以为空');
        } else if (!await login(password)) {
            setValue('loginForm.validateStatus', 'error');
            setValue('loginForm.validateHelp', '密码错误');
        }
    };

    return (
        <PageHeader
            title='请登录'
        >
            <Form
                {...layout}
                name='basic'
                form={form}
                initialValues={{ remember: true }}
                onFinish={onFinish}
            >
                <Form.Item
                    label='Password'
                    name='password'
                    validateStatus={props['loginForm.validateStatus']}
                    help={props['loginForm.validateHelp']}
                >
                    <Input.Password autoFocus placeholder='请输入密码' />
                </Form.Item>

                <Form.Item {...tailLayout}>
                    <Button type='primary' htmlType='submit'>
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </PageHeader>
    );
});
