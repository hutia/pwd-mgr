/**
 * @fileoverview
 * Bug Fix
 * 
 * This is to fix the bug when downloading electron from taobao mirror site.
 * 
 * Usage:
 *      After `yarn install` or `npm install`
 *      run `node ./bugfix.js`
 * 
 */

const fs = require('fs');
const cp = require('child_process');

const FILE_PATH = require.resolve('@electron/get/dist/cjs/artifact-utils.js');

function main() {
    if (!fs.existsSync(FILE_PATH)) {
        console.error('File not exists!');
        return;
    }
    const content = fs.readFileSync(FILE_PATH, 'utf8');
    fs.writeFileSync(FILE_PATH, content.replace(/const path.+;/i, (all) =>
        /\/\/ fixed$/i.test(all) ?
            all :
            all.substring(0, all.length - 1) + '.replace(/^v/, ""); // fixed'
    ));
    console.log('Install file hacked complete');

    cp.fork(require.resolve('electron/install'));
}

main();