import * as crypto from 'crypto';

export const uid = () => (new Date()).getTime().toString(36).substr(3) + Math.random().toString(36);

export function debounce(func: (...args: any[]) => void, delay = 60) {
    let timer: NodeJS.Timer | undefined;
    return (...args: any[]) => {
        if (timer) { return; }
        timer = setTimeout(() => {
            timer = undefined;
            func(...args);
        }, delay);
    };
}

export function formOption(initialValue?: any, message = '不能为空') {
    return {
        initialValue,
        rules: [{ required: true, message }],
    };
}

export function loopMap<T>(count: number, func: (i: number) => T): T[] {
    const result: T[] = [];
    for (let i = 0; i < count; i++) {
        result[i] = func(i);
    }
    return result;
}

export function sha256(s: string, secret = 'abcdefg'): string {
    return crypto.createHmac('sha256', secret)
        .update(s)
        .digest('hex');
}

export function xorEncode(source: string, pwd: string) {
    return source.split('').map((c, i) =>
        // tslint:disable-next-line: no-bitwise
        String.fromCharCode(c.charCodeAt(0) ^ pwd.charCodeAt(i % pwd.length)),
    ).join('');
}

export function replaceArr<T = any>(arr: T[], index: number, item?: Partial<T>): T[] {
    const re = arr.slice();
    if (typeof item === 'undefined') {
        re.splice(index, 1);
    } else {
        re.splice(index, 1, { ...arr[index], ...item });
    }
    return re;
}
