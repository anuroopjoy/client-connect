const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const { exec } = require('child_process');

const folderPath = '../../../Capabilities';

const isFolder = fileName => {
    return !fs.lstatSync(fileName).isFile()
}

const folders = fs
    .readdirSync(folderPath)
    .filter(fileName => {
        return isFolder(path.join(folderPath, fileName)) && fileName != 'Container' && fileName != 'NewReturn' && fileName != 'OpenReturn'
    });
for (const [i, folder] of folders.entries()) {
    console.log('\x1b[32m%s\x1b[0m', `publishing ${folder} micro-app `)
    exec(`cd ${folderPath}/${folder}/UI && npm run micro`, { maxBuffer:1024*1024*10 }, (err) => {
        if (err) {
            console.log(err)
            console.log('\x1b[31m%s\x1b[0m', `Publishing ${folder} micro app failed`);
            return;
        }
        console.log('\x1b[32m%s\x1b[0m', `${folder} published successfully`)
    });
}
