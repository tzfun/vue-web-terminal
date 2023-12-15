let fs = require('fs')
const projectName = 'vue-web-terminal'
const libPath = './lib/'

function copyDir(src, dest) {
    fs.mkdirSync(dest)
    for (let f of fs.readdirSync(src)) {
        fs.copyFileSync(src + '/' + f, dest + '/' + f)
    }
    console.log('copied', src, '-->', dest)
}

function deleteFile(name) {
    fs.unlink(libPath + name, (err) => {
        if (err) throw err
        console.log(`Delete file ${name}`)
    });
}

function renameFile(oldFile, newFile) {
    fs.rename(libPath + oldFile, libPath + newFile, function (err) {
        if (err) {
            throw err
        } else {
            console.log(`Renamed file ${oldFile} to ${newFile}`)
        }
    })
}

copyDir('./src/css/theme', './lib/theme')
deleteFile('demo.html')
renameFile(`${projectName}.umd.js`, `${projectName}.js`)
