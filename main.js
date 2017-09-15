const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function(){
  //create new window
  mainWindow = new BrowserWindow({}); // pass empty object

  //Load html into window
  mainWindow.loadURL(url.format({
    pathname : path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  //Quit app when closed
  mainWindow.on('close', function(){
    app.quit();
  });

  //Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //insert MenuMe
  Menu.setApplicationMenu(mainMenu);
});

//Handle Create Add New Item window
function createAddWindow(){
  addWindow = new BrowserWindow(
    {
      width:300,
      height:200,
      title:'Add shopping items to list'
    }
  );

  //load html view to window
  addWindow.loadURL(url.format({
    pathname : path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  //Garbage collection Handle
  addWindow.on('close', function(){
    addWindow = null;
  });

}

//Catch item:add
ipcMain.on('item:add', function(e, item){
  //item comes from add window, need to send to mainWindow
  //console.log('added')
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});


//create menu-template
/**
menu is basically an array of objects
*/
const mainMenuTemplate = [
  {
    label:'File',
    submenu : [
      {
        label:'Add Item',
        click(){
          //new window to add Items
          createAddWindow();
        }
      },
      {
        label:'Clear Items',
        click(){
          console.log('awwoo');
          mainWindow.webContents.send('item:clear');//send nothing to main window, need to catch this at mainWindow
        }
      },
      {
        label:'Quit',  //darwin == mac (we need to check the platform)
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];

//if Mac add add empty object to menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

//add developer tools items if not in production
if(process.env.NODE_ENV != 'production'){
  mainMenuTemplate.push({
    label:'Developer Tools',
    submenu:[
      {
          label:'Toggle Dev Tools',
          accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
          click(item, focusedWindow){ //dev tools appear on the corresponding focussed window
            focusedWindow.toggleDevTools();
          }
      },
      {
        role:'reload'
      }
    ]
  });
}
