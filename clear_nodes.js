const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf');

const folderPath = '../..';

const isFolder = fileName => {
    return !fs.lstatSync(fileName).isFile()
}

const folders = fs.readdirSync(folderPath);

fs.readdir(folderPath, (err, files) => {
    if (err) throw err;

    for (const file of files) {
        if (file != 'NewReturn'&& file != 'OpenReturn') {
            rimraf(path.join(folderPath, `${file}\\UI\\node_modules\\@hrblock-ocap\\*`), err => {
                if (err) {
                    console.log('\x1b[31m%s\x1b[0m', `Clearing Hrblock libraries in ${file} failed`);
                }
                console.log('\x1b[32m%s\x1b[0m', `Clearing Hrblock libraries in ${file} completed successfully`)
                console.log('\x1b[36m%s\x1b[0m', `Installing Hrblock libraries in ${file}`);
                const location = path.join(folderPath, `${file}\\UI\\`)
                const { exec } = require('child_process');
                exec(`cd ${location} && npm i `, (err) => {
                    if (err) {
                        console.log(err)
                        console.log('\x1b[31m%s\x1b[0m', `Installing Hrblock libraries in ${file} failed`);
                        return;
                    }
                    console.log('\x1b[32m%s\x1b[0m', `Installing Hrblock libraries in ${file} completed successfully`);
                });
            });
        }
    }
});
