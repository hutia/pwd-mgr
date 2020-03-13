import { Input, Modal } from 'antd';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface IProps extends React.ComponentProps<any> {
    title?: string;
    defaultValue?: string;
    onComplete: (s?: string) => void;
    message?: string;
    type?: 'text' | 'password';
}

interface IState extends React.ComponentState {
    visible?: boolean;
    value: string;
}

class PromptDialog extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            value: props.defaultValue || '',
            visible: true,
        };
        this.onOk = this.onOk.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    public onChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ value: e.target.value });
    }

    public onOk() {
        this.props.onComplete(this.state.value);
        this.setState({ visible: false });
    }

    public onCancel() {
        this.props.onComplete();
        this.setState({ visible: false });
    }

    public render() {
        return (
            <Modal
                title={this.props.title || 'Please Input'}
                visible={this.state.visible}
                onOk={this.onOk}
                onCancel={this.onCancel}
                destroyOnClose={true}
            >
                {
                    this.props.type === 'password' ?
                        <Input.Password
                            autoFocus
                            value={this.state.value}
                            onChange={this.onChange}
                            onPressEnter={this.onOk}
                            placeholder={this.props.message}
                        /> :
                        <Input
                            autoFocus
                            value={this.state.value}
                            onChange={this.onChange}
                            onPressEnter={this.onOk}
                            placeholder={this.props.message}
                        />
                }
            </Modal>
        );
    }
}

export function prompt(message?: string, defaultValue?: string): Promise<string | undefined> {
    return new Promise((resolve) => {
        const node = document.createElement('div');
        document.body.appendChild(node);
        ReactDOM.render(<PromptDialog
            onComplete={resolve}
            message={message}
            defaultValue={defaultValue}
        />, node);
    });
}

export function promptPassword(message?: string): Promise<string | undefined> {
    return new Promise((resolve) => {
        const node = document.createElement('div');
        document.body.appendChild(node);
        ReactDOM.render(<PromptDialog
            onComplete={resolve}
            message={message}
            type='password'
        />, node);
    });
}
