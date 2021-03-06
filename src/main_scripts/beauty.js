const fs = require('fs');
const { app } = require('electron')
const electron = require("electron")
const ipc = electron.ipcMain;
const dataFolder = app.getPath('userData')

var path = dataFolder + "/cosmetics-install"

fs.access(path, function(error) {
  if (error) {
    fs.mkdirSync(path)

  } else {

    fs.readdir(path, (err, files) => {

        files.forEach(file => {

            fs.access(path + '/' + file + '/style.css', function(error) {

                if(!error) {
                    ipc.on('loadCss', function(c) {
                        var element = `${path + '\\' + file + '\\style.css'}`;
                        console.log('css element : ' + element)
                        c.sender.send("displayCss", element);

                    })

                }

            });

        });
    });
    
  }
})
