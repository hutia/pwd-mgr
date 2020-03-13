import { ipcMain, IpcMainInvokeEvent } from 'electron';
import * as db from './db';

export function serve() {
    ipcMain.handle('db', (e: IpcMainInvokeEvent, cmd: string, ...args: any[]) => {
        // const args = strArgs.map((s) => JSON.parse(s));
        switch (cmd) {
            case 'insert':
                return db.insert(args[0]);
            case 'find':
                return db.find(args[0], args[1]);
            case 'findOne':
                return db.findOne(args[0]);
            case 'update':
                return db.update(args[0], args[1], args[2]);
            case 'remove':
                return db.remove(args[0], args[1]);
            case 'count':
                return db.count(args[0]);
            default:
                return null;
        }
    });
}
