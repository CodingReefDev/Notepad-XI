

window.addEventListener('DOMContentLoaded', () => {
  const testFolder = process.env.APPDATA + "/Microsoft/Windows/Themes/CachedFiles";
  const { readdir, watch, } = require('fs');
  const { ipcRenderer, nativeImage } = require("electron");
  readdir(testFolder, (err, files) => {
    document.body.querySelector("img").src = (nativeImage.createFromPath(process.env.APPDATA + "/Microsoft/Windows/Themes/CachedFiles/" + files[0]).toDataURL());
  });
  watch(testFolder, (eventType, filename) => {
    setTimeout(() => {
      readdir(testFolder, (err, files) => {
        document.body.querySelector("img").src = (nativeImage.createFromPath(process.env.APPDATA + "/Microsoft/Windows/Themes/CachedFiles/" + files[0]).toDataURL());
      });
    }, 10000);
  });
  ipcRenderer.on('message', function (event, text) {
    var pos = JSON.parse(text);
    document.body.querySelector("img").style.left = "-" + Math.abs(pos[0]) + "px";
    document.body.querySelector("img").style.top = "-" + Math.abs(pos[1]) + "px";
  });
  ipcRenderer.on('screenSize', function (event, text) {
    var pos = JSON.parse(text);
    document.body.querySelector("img").style.width = pos.x + "px";
    document.body.querySelector("img").style.height = pos.y + "px";
  });
  ipcRenderer.on('maximized', function (event, text) {
    document.body.querySelector("img").style.left = "0px";
    document.body.querySelector("img").style.right = "0px";
  });
});