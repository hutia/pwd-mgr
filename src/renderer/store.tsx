import React from 'react';
import { uid } from './utils';

type Handler = (id: string, newValue?: any, oldValue?: any) => void;

const eventMap = new Map<string, Handler[]>();
const valueMap = new Map<string, any>();

export function watch(id: string, handler: Handler) {
    const list: Handler[] = eventMap.get(id) || [];
    if (list.includes(handler)) { return; }
    eventMap.set(id, list.concat(handler));
}

export function unwatch(id: string, handler: Handler) {
    const list: Handler[] = (eventMap.get(id) || []).slice();
    const index = list.indexOf(handler);
    if (index === -1) { return; }
    list.splice(index, 1);
    eventMap.set(id, list);
}

export function getValue(id: string): any {
    return valueMap.get(id);
}

export function setValue(id: string, newValue: any, force?: boolean) {
    const oldValue = valueMap.get(id);
    if (oldValue === newValue && !force) { return; }
    valueMap.set(id, newValue);
    emit(id, newValue, oldValue);
}

export function setValueSilently(id: string, newValue: any, force?: boolean) {
    const oldValue = valueMap.get(id);
    if (oldValue === newValue && !force) { return; }
    valueMap.set(id, newValue);
}

export function emit(id: string, newValue?: any, oldValue?: any) {
    const list: Handler[] = eventMap.get(id) || [];
    list.forEach((h) => h(id, newValue, oldValue));
}

export function connect<P = {}>(storeIds: string[], C: React.ElementType): React.ComponentType<P> {
    return (class extends React.Component<P> {
        constructor(props: P) {
            super(props);
            const state: { [key: string]: any } = {};
            storeIds.forEach((key) => state[key] = valueMap.get(key));
            this.state = state;
            this.refresh = this.refresh.bind(this);
        }

        public refresh(id: string) {
            const newState = {} as any;
            newState[id] = valueMap.get(id);
            this.setState(newState);
        }

        public componentDidMount() {
            storeIds.forEach((id) => watch(id, this.refresh));
        }

        public componentWillUnmount() {
            storeIds.forEach((id) => unwatch(id, this.refresh));
        }

        public render() {
            const props: any = { ...this.props, ...this.state };
            return (<C {...props} />);
        }
    });
}

export interface IPrefetchProps {
    refresh: () => void;
    replace: (replacement?: JSX.Element) => void;
}

export function prefetch<P = {}>(func: (props: any) => Promise<any>, C: React.ElementType): React.ComponentType<P> {
    // tslint:disable-next-line: max-classes-per-file
    return (class extends React.Component<P, { loading: boolean, replacement?: JSX.Element }> {
        public result: any = undefined;

        constructor(props: P) {
            super(props);
            this.state = {
                loading: true,
                replacement: undefined,
            };
            this.refresh = this.refresh.bind(this);
            this.replace = this.replace.bind(this);
            this.refresh();
        }

        public async refresh() {
            this.result = await func(this.props);
            this.setState({ loading: false });
        }

        public replace(replacement?: JSX.Element) {
            this.setState({ replacement });
        }

        public render() {
            if (this.state.replacement) {
                return this.state.replacement;
            } else if (this.state.loading) {
                return null;
            } else {
                const props = {
                    ...this.props,
                    ...this.result,
                    refresh: this.refresh,
                    replace: this.replace,
                };
                return (<C {...props} />);
            }
        }
    });
}

export function on(id: string, value: any) {
    return () => {
        setValue(id, value);
    };
}

export function update(id: string) {
    setValue(id, uid());
}
