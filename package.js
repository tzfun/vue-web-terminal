let fs = require('fs')
const projectName = 'vue-web-terminal'
const libPath = './lib/'

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

deleteFile('demo.html')
renameFile(`${projectName}.umd.js`, `${projectName}.js`)
