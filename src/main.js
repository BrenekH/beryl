const {app, BrowserWindow, Menu, MenuItem} = require('electron')
const path = require('path')

function createWindow () {
  const mainWindow = new BrowserWindow({
    title: "Beryl",
	  webPreferences: {
	    show: false, // Don't show before maximizing to prevent a jarring flash.
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.maximize()
  mainWindow.show()

  mainWindow.loadFile('index.html')

  const menu = new Menu();
  menu.append(new MenuItem({
    label: "View",
    submenu: [{
      accelerator: "F11",
      role: "togglefullscreen"
    }]
  }));
  menu.append(new MenuItem({
    label: "About",
    submenu: [{
      label: "Show DevTools",
      accelerator: 'CommandOrControl+Shift+I',
      click: () => { mainWindow.webContents.openDevTools(); }
    }]
  }));
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

try {
  require('electron-reloader')(module)
} catch (_) {}

const myFunc = () => {
  console.log("MyFunc");
  setTimeout(myFunc, 5000);
}

myFunc();
