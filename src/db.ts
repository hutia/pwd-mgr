import Datastore from 'nedb';
import { DB_FILE } from './config';

const db = new Datastore({ filename: DB_FILE, autoload: true });

export function insert<T>(newDoc: T): Promise<T> {
    return new Promise((resolve, reject) => {
        db.insert(newDoc, (err, doc) => {
            if (err) { reject(err); } else { resolve(doc); }
        });
    });
}

interface IFindOption {
    projection?: any;
    sort?: any;
    skip?: number;
    limit?: number;
}

export function find<T>(query: any, option?: IFindOption): Promise<T[]> {
    return new Promise((resolve, reject) => {
        if (option) {
            let cursor = db.find(query);
            if (option.projection) { cursor = cursor.projection(option.projection); }
            if (option.sort) { cursor = cursor.sort(option.sort); }
            if (typeof option.skip === 'number') { cursor = cursor.skip(option.skip); }
            if (typeof option.limit === 'number') { cursor = cursor.limit(option.limit); }
            cursor.exec((err: any, docs: any[]) => {
                if (err) { reject(err); } else { resolve(docs); }
            });
        } else {
            db.find(query, (err: any, docs: T[]) => {
                if (err) { reject(err); } else { resolve(docs); }
            });
        }
    });
}

export function findOne<T>(query: any): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
        db.findOne(query, (err: any, doc: T) => {
            if (err) { reject(err); } else { resolve(doc); }
        });
    });
}

export function update(query: any, updateQuery: any, options?: Datastore.UpdateOptions): Promise<number> {
    return new Promise((resolve, reject) => {
        db.update(query, updateQuery, options || {}, (err, num) => {
            if (err) { reject(err); } else { resolve(num); }
        });
    });
}

export function remove(query: any, options?: Datastore.RemoveOptions): Promise<number> {
    return new Promise((resolve, reject) => {
        db.remove(query, options || {}, (err, num) => {
            if (err) { reject(err); } else { resolve(num); }
        });
    });
}

export function count(query: any): Promise<number> {
    return new Promise((resolve, reject) => {
        db.count(query, (err, num) => {
            if (err) { reject(err); } else { resolve(num); }
        });
    });
}
