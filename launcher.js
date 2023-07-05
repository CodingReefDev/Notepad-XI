const { app, BrowserWindow, screen, dialog, ipcMain} = require('electron')
const { join } = require('path')

var allWindows = []

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, '/app/preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      height: 30,
      color: "#212121",
      symbolColor: "#ffffff"
    },
    show: false
  });

  allWindows.push(mainWindow);
  mainWindow.loadFile('app/index.html')
  //mainWindow.webContents.openDevTools()


  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  mainWindow.on("move", () => {
    mainWindow.webContents.send('message', JSON.stringify(mainWindow.getPosition()));
  })
  mainWindow.on("maximize", () => {
    mainWindow.webContents.send('maximized', "");
    mainWindow.webContents.send('screenSize', JSON.stringify({ x: width, y: height }));
  })
  mainWindow.on("minimize", () => {
    mainWindow.webContents.send('message', JSON.stringify(mainWindow.getPosition()));
    mainWindow.webContents.send('screenSize', JSON.stringify({ x: width, y: height }));
  })
  mainWindow.on("focus", () => {
    mainWindow.webContents.send('message', JSON.stringify(mainWindow.getPosition()));
    mainWindow.webContents.send('screenSize', JSON.stringify({ x: width, y: height }));
  })
  setTimeout(() => {
    mainWindow.webContents.send('screenSize', JSON.stringify({ x: width, y: height }));
  }, 1000);

  const { Menu, MenuItem } = require('electron')

  mainWindow.webContents.on('context-menu', (event, params) => {
    const menu = new Menu()

    // Add each spelling suggestion
    for (const suggestion of params.dictionarySuggestions) {
      menu.append(new MenuItem({
        label: suggestion,
        click: () => mainWindow.webContents.replaceMisspelling(suggestion)
      }))
    }
    
    // Allow users to add the misspelled word to the dictionary
    if (params.misspelledWord) {
      menu.append(
        new MenuItem({
          label: 'Add to dictionary',
          click: () => mainWindow.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
        })
      )
    }

    menu.popup()
  })
  mainWindow.maximize();
  mainWindow.addListener("ready-to-show", ()=>mainWindow.show())
}
ipcMain.on('darkMode', (event, arg) => {
  allWindows.forEach(e=>{
    e.setTitleBarOverlay({height: 30,
      color: "#212121",
      symbolColor: "#ffffff"})
  })
  event.returnValue = true
})
ipcMain.on('whiteMode', (event, arg) => {
  allWindows.forEach(e=>{
    e.setTitleBarOverlay({height: 30,
      color: "#ffffff",
      symbolColor: "#000000"})
  })
  event.returnValue = true
})
ipcMain.on('getFilePathToBeOpened', (event, arg) => {
  event.returnValue = JSON.stringify(process.argv);
})
ipcMain.on('getFilePathToBeOpened', (event, arg) => {
  event.returnValue = JSON.stringify(process.argv);
})
//get path
ipcMain.on('saveAsPath', (event, arg) => {
  const path = dialog.showSaveDialogSync({
    filters:
      [
        { name: 'Text Documents (*.txt)', extensions: ['txt'] },
      ],
  })
  event.returnValue = path;
})

//get path
ipcMain.on('openPath', (event, arg) => {
  console.log("e");
  const path = dialog.showOpenDialogSync({
    filters:
      [
        { name: 'Text Documents (*.txt)', extensions: ['txt'] },
      ],
  })
  event.returnValue = path;
})

//get path
ipcMain.on('createNW', (event, arg) => {
  createWindow();
  event.returnValue = true;
})
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})