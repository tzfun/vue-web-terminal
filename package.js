import path from 'path'
import fs from 'fs'

function copyFile(src, dest) {
    fs.mkdirSync(dest)
    for (let f of fs.readdirSync(src)) {
        fs.copyFileSync(path.join(src, f), path.join(dest, f));
    }
    console.log('copied', `'${src}'`, '-->', `'${dest}'`)
}

function deleteFile(fileOrDirName) {
    let stat = fs.statSync(fileOrDirName)
    if (stat.isDirectory()) {
        for (let f of fs.readdirSync(fileOrDirName)) {
            let filePath = path.join(fileOrDirName, f)
            deleteFile(filePath)
        }
        fs.rmdirSync(fileOrDirName)
    } else {
        fs.unlinkSync(fileOrDirName)
        console.log(`deleted ==> ${fileOrDirName}`)
    }
}

copyFile('./src/css/theme', './lib/theme');
deleteFile('./lib/ansi')
deleteFile('./lib/common')
deleteFile('./lib/components')
