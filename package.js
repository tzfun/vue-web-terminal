import path from 'path'
import fs from 'fs'

function copyFile(src, dest) {
    fs.mkdirSync(dest)
    for (let f of fs.readdirSync(src)) {
        fs.copyFileSync(path.join(src, f), path.join(dest, f));
    }
    console.log('copied', `'${src}'`, '-->', `'${dest}'`)
}

copyFile('./src/css/theme', './lib/theme');
