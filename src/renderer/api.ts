import * as db from './db.ipcRenderer';
import * as store from './store';
import { sha256, xorEncode } from './utils';

export interface IRow {
    name: string;
    value: string;
    encoded?: boolean;
    password?: string;
    hint?: string;
}

export interface IItem {
    _id: string;
    type: 'item';
    name: string;
    rows: IRow[];
}

export async function isInstalled(): Promise<boolean> {
    const re = await db.findOne({ type: 'installed' });
    return !!re;
}

export async function checkInstall() {
    if (await isInstalled()) { return; }
    await db.insert({ type: 'installed' });
    await db.insert({ type: 'rootPassword', value: sha256('defaultAdmin') });
}

export async function login(password: string): Promise<boolean> {
    const passwordHash = sha256(password);
    const re = await db.findOne({ type: 'rootPassword', value: passwordHash });
    if (!re) {
        return false;
    }
    store.setValue('rootPassword', password);
    return true;
}

export async function getList() {
    const search = store.getValue('search');
    const list = await db.find<IItem>({ type: 'item' });
    if (!search) {
        store.setValue('list', list);
        return;
    }
    const reg = new RegExp(String(search || '').replace(/(\W)/g, '\\$1'), 'i');
    store.setValue('list', list.filter((item) =>
        reg.test(item.name) ||
        item.rows.some((row) =>
            reg.test(row.name) ||
            reg.test(row.hint) || (
                !row.encoded && reg.test(row.value)
            )),
    ));
}

export async function createItem() {
    const item: IItem = await db.insert({
        name: 'new item',
        rows: [],
        type: 'item',
    }) as any;
    await getList();
    selectItem(item);
}

export function selectItem(item: IItem, force?: boolean) {
    store.setValue('selectedItem', item, force);
}

export async function updateItem(item: IItem) {
    await db.update({ _id: item._id }, { $set: item });
    await getList();
    selectItem(item, true);
}

export async function removeItem(item: IItem) {
    await db.remove({ _id: item._id });
    await getList();
    selectItem(undefined, true);
}

function maskPassword(pwd?: string) {
    pwd = pwd || store.getValue('rootPassword') || '';
    if (pwd.length > 2) {
        pwd = pwd.charAt(pwd.length - 1) + pwd.substring(1, pwd.length - 1);
    }
    return sha256(`**${pwd}##`);
}

export function encodeRow(row: IRow) {
    if (!row.encoded) { return row; }

    const pwd = row.password || store.getValue('rootPassword') || '';

    return {
        ...row,
        password: sha256(pwd),
        value: xorEncode(row.value, maskPassword(pwd)),
    };
}

export function decodeRow(row: IRow, pwd?: string) {
    if (!row.encoded) { return row; }
    if (row.password !== sha256(pwd || store.getValue('rootPassword') || '')) {
        throw new Error('Wrong password! Failed to decode row!');
    }
    return {
        ...row,
        password: pwd,
        value: xorEncode(row.value, maskPassword(pwd)),
    };
}

export async function changeRootPass(oldPass: string, newPass: string) {
    const oldHash = sha256(oldPass);

    if (!await login(oldPass)) { return; }

    const newHash = sha256(newPass);
    await db.update({ type: 'rootPassword' }, { $set: { value: newHash } });
    store.setValue('rootPassword', newPass);

    const list = await db.find<IItem>({ type: 'item' });
    for (const item of list) {
        await db.update({ _id: item._id }, {
            $set: {
                ...item,
                rows: item.rows.map((row) => {
                    if (!row.encoded || row.password !== oldHash) { return row; }
                    return {
                        ...row,
                        password: newHash,
                        value: xorEncode(xorEncode(row.value, maskPassword(oldPass)), maskPassword(newPass)),
                    };
                }),
            },
        });
    }

    getList();
}
