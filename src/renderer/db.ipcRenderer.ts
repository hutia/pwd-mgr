import { ipcRenderer } from 'electron';
import Datastore from 'nedb';

export function insert<T>(newDoc: T): Promise<T> {
    return ipcRenderer.invoke('db', 'insert', newDoc);
}

interface IFindOption {
    projection?: any;
    sort?: any;
    skip?: number;
    limit?: number;
}

export function find<T>(query: any, option?: IFindOption): Promise<T[]> {
    return ipcRenderer.invoke('db', 'find', query, option);
}

export function findOne<T>(query: any): Promise<T | undefined> {
    return ipcRenderer.invoke('db', 'findOne', query);
}

export function update(query: any, updateQuery: any, options?: Datastore.UpdateOptions): Promise<number> {
    return ipcRenderer.invoke('db', 'update', query, updateQuery, options);
}

export function remove(query: any, options?: Datastore.RemoveOptions): Promise<number> {
    return ipcRenderer.invoke('db', 'remove', query, options);
}

export function count(query: any): Promise<number> {
    return ipcRenderer.invoke('db', 'count', query);
}
