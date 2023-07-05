/**
 * @var allTabs stores all tabs
 * @var allWindows stores all windows
 * @var currentWindow stores the current window
 */
var allTabs = [], allWindows = [], currentWindow;

//making editor as default priority
localStorage.setItem("priority", localStorage.getItem("priority") || "editor")

//importing ipcRenderer
const { ipcRenderer } = require("electron");

//importing writeFileSync and readFileSync
const { writeFileSync, readFileSync } = require("fs");

//when clicked tab holder, we create a new editor
document.querySelectorAll(".tabsHolder")[0].addEventListener("dblclick", (e) => {
    if (e.path[0].classList[0] == "tabsHolder") {
        new Editor({ title: "Untitled.txt" });
    }
})

//when clicked addTab elm, we create a new editor
document.querySelectorAll("#addTab")[0].addEventListener("click", (e) => {
    new Editor({ title: "Untitled.txt" });
})

//when clicked open File option elm,
document.querySelectorAll("#openTab")[0].addEventListener("click", (e) => {
    //request path from main process
    var paths = ipcRenderer.sendSync('openPath', "") || [];
    //create editor for each file to be opened
    paths.forEach(path => new Editor({ title: "Untitled.txt", path: path, preloadData: true }))
})

//when clicked on recent tab button
document.querySelectorAll("#recentTab")[0].addEventListener("click", () => {
    //fading all the editors and the settings
    document.querySelectorAll(".editors")[0].style.opacity = 0
    document.querySelectorAll(".settings")[0].style.opacity = 0
    setTimeout(() => {
        //hiding all the editors and the settings
        document.querySelectorAll(".editors")[0].style.display = "none"
        document.querySelectorAll(".recents")[0].style.display = "block"
        document.querySelectorAll(".settings")[0].style.display = "block"
        //the highlight animation to show that the tab is selected
        document.querySelectorAll("#settingTab")[0].classList.remove("highlight")
        document.querySelectorAll("#recentTab")[0].classList.add("highlight")
        //displaying the recent tab
        setTimeout(() => {
            document.querySelectorAll(".recents")[0].style.opacity = 1
        }, 10);
    }, 200);
    //removing the active class from all tabs, if it's there
    allTabs.forEach(e => {
        e.classList.remove("active")
    })
})

//when click on settings tab
document.querySelectorAll("#settingTab")[0].addEventListener("click", () => {
    //fading all the editors and the recents
    document.querySelectorAll(".editors")[0].style.opacity = 0
    document.querySelectorAll(".recents")[0].style.opacity = 0
    setTimeout(() => {
        //hiding all the editors and the recents
        document.querySelectorAll(".editors")[0].style.display = "none"
        document.querySelectorAll(".recents")[0].style.display = "none"
        document.querySelectorAll(".settings")[0].style.display = "block"
        //the highlight animation to show that the tab is selected
        document.querySelectorAll("#recentTab")[0].classList.remove("highlight")
        document.querySelectorAll("#settingTab")[0].classList.add("highlight")
        //displaying the recent tab
        setTimeout(() => {
            document.querySelectorAll(".settings")[0].style.opacity = 1
        }, 10);
    }, 200);
    //removing the active class from all tabs, if it's there
    allTabs.forEach(e => {
        e.classList.remove("active")
    })
})

//function that adds the recent path to the app
function addToRecents(path) {
    //when the path is not null
    if (path != null) {
        //getting the recents array from localstorage
        var recents = JSON.parse(localStorage.getItem("recents")) || [];
        //getting the app setting, wether to store the recent or not
        var opt = JSON.parse(localStorage.getItem("recentStats")) || true;
        //checking if the path is already included in the recents filder
        if (!recents.includes(path) && opt) {
            //adding path to the recents array
            recents.push(path);
            //storing the added array
            localStorage.setItem("recents", JSON.stringify(recents))
            //updating the ui to show the newly stored path
            createRecentItem(path);
        }
    }
}

//creating the recent ui
function createRecentItem(path) {
    //creating div
    var div = document.createElement("div");
    //adding style class
    div.classList.add("item");
    //adding html
    div.innerHTML = ` <div class="l">
 <span class="material-symbols-rounded">
   article
 </span>
 <div class="text">
   <p class="top">${path.split("\\")[path.split("\\").length - 1]}</p>
   <p class="bottom">${path}</p>
 </div>
 </div>
 <div class="r">
 <span class="material-symbols-rounded " id="del" style="font-size: 16px;">
   close
 </span>
 <span class="material-symbols-rounded " id="open">
   chevron_right
 </span>
 </div>`
    //adding event listners

    //to remove this path
    div.querySelectorAll("span")[1].addEventListener("click", () => {
        //getting recents from storage
        var recents = JSON.parse(localStorage.getItem("recents")) || [];
        //removing path from array
        recents.splice(recents.indexOf(path), 1);
        //setting recents to storage
        localStorage.setItem("recents", JSON.stringify(recents))
        //reloding ui
        loadRecentsUI();
    })
    //when click on the arrow to open the editor
    div.querySelectorAll("span")[2].addEventListener("click", () => {
        //spawn an editor object
        new Editor({ title: "Untitled.txt", path: path, preloadData: true })
    })

    //when click on the whole ui element
    div.addEventListener("click", (e) => {
        //if its not the delete button or the arrow
        if (e.path[0].id != "del" && e.path[0].id != "open") {
            //spawn an editor object
            new Editor({ title: "Untitled.txt", path: path, preloadData: true })
        }
    })
    //appending the element
    document.querySelectorAll(".recents .content .left")[0].append(div);
}
function loadRecentsUI() {
    //making the recents ui empty
    document.querySelectorAll(".recents .content .left")[0].innerHTML = "";
    //getting recents array from storage
    var recents = JSON.parse(localStorage.getItem("recents")) || [];
    //for each path in array
    recents.forEach(path => {
    //creating div
        var div = document.createElement("div");
    //adding style class
        div.classList.add("item");
    //adding html
        div.innerHTML = ` <div class="l">
         <span class="material-symbols-rounded">
           article
         </span>
         <div class="text">
           <p class="top">${path.split("\\")[path.split("\\").length - 1]}</p>
           <p class="bottom">${path}</p>
         </div>
       </div>
       <div class="r">
         <span class="material-symbols-rounded " id="del" style="font-size: 16px;">
           close
         </span>
         <span class="material-symbols-rounded " id="open">
           chevron_right
         </span>
       </div>`
           //adding event listners

    //to remove this path
        div.querySelectorAll("span")[1].addEventListener("click", () => {
        //getting recents from storage
            var recents = JSON.parse(localStorage.getItem("recents")) || [];
        //removing path from array
            recents.splice(recents.indexOf(path), 1);
        //setting recents to storage
            localStorage.setItem("recents", JSON.stringify(recents))
        //reloding ui
            loadRecentsUI();
        })
    //when click on the arrow to open the editor
        div.querySelectorAll("span")[2].addEventListener("click", () => {
        //spawn an editor object
            new Editor({ title: "Untitled.txt", path: path, preloadData: true })
        })
    //when click on the whole ui element
        div.addEventListener("click", (e) => {
        //if its not the delete button or the arrow
            if (e.path[0].id != "del" && e.path[0].id != "open") {
            //spawn an editor object
                new Editor({ title: "Untitled.txt", path: path, preloadData: true })
            }
        })
    //appending the element
        document.querySelectorAll(".recents .content .left")[0].append(div);
    })
}

//loading the recents ui
loadRecentsUI();

//creating a tab
class Tab {
    //getting the title
    constructor(title) {
        //the bars that are next to the tabs
        this.createdBars = []
        //creating tab element
        this.tab = document.createElement("div");
        //adding its class
        this.tab.classList.add("tab");
        //setting html
        this.tab.innerHTML = `<div class="left">
           <div class="activeIndicator"></div>
           <p>${title}</p>
         </div>
         <div class="save"></div>
         <span id="close" class="material-symbols-rounded">
           close
           </span>`
        //pushing to all tabs
        allTabs.push(this.tab);
        //when the tab is clicked
        this.tab.addEventListener("click", () => {
            //for all the tabs
            allTabs.forEach(e => {
                //remvoving the active indicator
                e.classList.remove("active")
            })
            //adding the active indicator to this tab
            this.tab.classList.add("active");
        })

        //when the close button is press
        this.tab.querySelectorAll("#close")[0].addEventListener("click", () => {
            this.onClose();
        })
        //adding the bar
        this.addBar();
        //then appending the tab
        document.querySelectorAll(".tabsHolder .content")[0].append(this.tab)
    }

    //to change the title
    updateTitle(name) {
        this.tab.querySelectorAll("p")[0].innerHTML = name;
    }

    //to add any event listner to the tab
    addEventListener(type, e) {
        this.tab.addEventListener(type, e);
    }

    //to show the save indicator
    showSave() {
        this.tab.querySelectorAll(".save")[0].style.opacity = 1
    }

    //to hide the save indicator
    hideSave() {
        this.tab.querySelectorAll(".save")[0].style.opacity = 0
    }

    //when closed
    onClose() {

    }

    //to add the bar
    addBar() {
        //creating div
        var bar = document.createElement("div");
        //adding class
        bar.classList.add("di");
        //appending
        document.querySelectorAll(".tabsHolder .content")[0].append(bar)
        //pushing to array
        this.createdBars.push(bar);
    }

    //to remove all the tabs
    destroyAllBars() {
        //for all bars created by this object
        this.createdBars.forEach(e => {
            //remove them
            e.remove();
        })
    }
}

//creating the 
class editorOptionsGroup {
    constructor(title, appendToElm) {
        this.appendToElm = appendToElm;
        this.opened = false;
        this.width = 0;
        this.div = document.createElement("div");
        this.div.classList.add("dropleft")
        this.div.innerHTML = `
         <div class="title">
           <div class="dot"></div>
           <p>${title}</p>
         </div>
         <div class="sel">
         </div>`
        appendToElm.append(this.div)
        this.showTick = false;
    }
    addOption(name, icon, def, showTick) {
        this.showTick = showTick;
        var opt = document.createElement("div");
        opt.classList.add("opt");
        opt.title = name
        opt.innerHTML = def ? `<p style='display:flex; flex-direction: row; align-items: center'> <span class='material-symbols-rounded' style='margin-right: 5px; display: ${showTick ? "none" : "block"}'>  done </span>` + icon + "</p>"
            : `<span class="material-symbols-rounded">${icon}</span>`
        this.div.querySelector(".sel").append(opt)
        return opt;
    }
    activateClick() {
        setTimeout(() => {
            this.setWidth();
            this.div.querySelector(".title").addEventListener("click", () => {
                this.div.querySelector(".sel").style.width = this.opened ? "0px" : (this.width + (this.showTick ? 60 : 0)) + "px";
                this.div.querySelector(".dot").style.opacity = this.opened ? 0 : 1;
                this.div.querySelector(".sel").style.opacity = this.opened ? 0 : 1;
                this.div.querySelector(".dot").style.width = this.opened ? "0px" : "5px";
                this.div.querySelector(".dot").style.marginRight = this.opened ? "0px" : "10px";
                this.opened = !this.opened
            })
            this.div.querySelector(".title").click();
        }, 200);
    }
    addBar() {
        var bar = document.createElement("div");
        bar.classList.add("di");
        this.appendToElm.append(bar)
    }
    setWidth() {
        this.div.querySelector(".sel").style.width = "max-content";
        this.width = this.div.querySelector(".sel").clientWidth;
    }
}

class Editor {
    constructor(options) {
        document.querySelectorAll(".recents")[0].style.opacity = 0
        document.querySelectorAll(".settings")[0].style.opacity = 0
        setTimeout(() => {
            document.querySelectorAll(".recents")[0].style.display = "none"
            document.querySelectorAll(".settings")[0].style.display = "none"
            document.querySelectorAll(".editors")[0].style.display = "block"
            document.querySelectorAll("#recentTab")[0].classList.remove("highlight")
            document.querySelectorAll("#settingTab")[0].classList.remove("highlight")
            setTimeout(() => {
                document.querySelectorAll(".editors")[0].style.opacity = 1
            }, 10);
        }, 200);

        //editor options
        this.editorOptionsGroup = {
            top: document.createElement("div"),
            frame: document.createElement("iframe"),
            frameZoom: 16,
            wordwrap: options.wordwrap || "nowrap",
            //statusBar: document.createElement("div"),//status bar feature removed
            //showBar: options.wordwrap || false//status bar feature removed
            unsearched: ""
        }

        //editor stuff
        this.editor = document.createElement("div");
        this.editor.classList.add("editor");
        document.querySelectorAll(".editors")[0].append(this.editor);

        //tab
        this.tab = new Tab(options.title);
        this.tab.hideSave();
        this.tab.tab.addEventListener("click", () => {
            try {
                currentWindow.style.opacity = 0
                setTimeout(() => {
                    currentWindow.style.display = "none"
                    this.editor.style.display = "block"
                    setTimeout(() => {
                        if (this.editorOptionsGroup) {
                            this.editor.style.opacity = 1
                            currentWindow = this.editor
                            this.editorOptionsGroup.frame.contentDocument.body.focus()
                        }
                    }, 10);
                }, 200);
            } catch (error) {
                this.editor.style.display = "block"
                setTimeout(() => {

                    if (this.editorOptionsGroup) {
                        this.editor.style.opacity = 1
                        currentWindow = this.editor
                        this.editorOptionsGroup.frame.contentDocument.body.focus()
                    }
                }, 100);
            }
            if (this.editorOptionsGroup) {
                document.querySelectorAll(".recents")[0].style.opacity = 0
                document.querySelectorAll(".settings")[0].style.opacity = 0
                setTimeout(() => {
                    document.querySelectorAll(".recents")[0].style.display = "none"
                    document.querySelectorAll(".settings")[0].style.display = "none"
                    document.querySelectorAll(".editors")[0].style.display = "block"
                    document.querySelectorAll("#recentTab")[0].classList.remove("highlight")
                    document.querySelectorAll("#settingTab")[0].classList.remove("highlight")
                    setTimeout(() => {
                        document.querySelectorAll(".editors")[0].style.opacity = 1
                    }, 10);
                }, 200);
            }
        })
        //opening this tab
        this.tab.tab.click();

        //when tab closed
        this.tab.onClose = () => {
            allWindows.splice(allWindows.indexOf(this), 1);
            allTabs.splice(allTabs.indexOf(this.tab), 1);
            document.querySelectorAll(".recents")[0].style.opacity = 0
            document.querySelectorAll(".settings")[0].style.opacity = 0
            setTimeout(() => {
                document.querySelectorAll(".editors")[0].style.opacity = 0
                document.querySelectorAll(".settings")[0].style.opacity = 0
                setTimeout(() => {
                    document.querySelectorAll(".editors")[0].style.display = "none"
                    document.querySelectorAll(".settings")[0].style.display = "none"
                    document.querySelectorAll(".recents")[0].style.display = "block"
                    document.querySelectorAll("#recentTab")[0].classList.add("highlight")
                    document.querySelectorAll("#settingTab")[0].classList.add("highlight")
                    setTimeout(() => {
                        document.querySelectorAll(".recents")[0].style.opacity = 1
                    }, 10);
                }, 200);
            }, 200);
            this.editor.remove();
            this.tab.tab.remove();
            delete this.editorOptionsGroup;
            this.tab.destroyAllBars();
            delete this.tab;
            delete this;
        }

        //appending all elements
        this.editor.append(this.editorOptionsGroup.top);
        this.editor.append(this.editorOptionsGroup.frame);
        // this.editor.append(this.editorOptionsGroup.statusBar); //status bar feature removed

        //creating top bar
        this.editorOptionsGroup.top.classList.add("top");

        if (options.path) {
            this.path = options.path
            addToRecents(this.path);
            this.tab.updateTitle(this.path.split("\\")[this.path.split("\\").length - 1])
        }

        var save = () => {
            if (this.path == "" || !this.path) {
                var path = ipcRenderer.sendSync('saveAsPath', "")
                if (path != undefined && path != null) {
                    this.path = path
                    writeFileSync(path, this.editorOptionsGroup.frame.contentDocument.body.innerText);
                    this.tab.hideSave();
                    this.tab.updateTitle(path.split("\\")[path.split("\\").length - 1])
                }
                addToRecents(path)
            } else {
                writeFileSync(this.path, this.editorOptionsGroup.frame.contentDocument.body.innerText);
                this.tab.hideSave();
            }
        }

        var saveAs = () => {
            var path = ipcRenderer.sendSync('saveAsPath', "")
            addToRecents(path)
            if (path != undefined && path != null) {
                writeFileSync(path, this.editorOptionsGroup.frame.contentDocument.body.innerText);
                this.tab.hideSave();
            }
        }

        //file options
        this.editorOptionsGroup.file = new editorOptionsGroup("File", this.editorOptionsGroup.top)
        this.editorOptionsGroup.file.addOption("Open Window", "open_in_new").addEventListener("click", () => {
            var x = ipcRenderer.sendSync('createNW', "")
        })
        this.editorOptionsGroup.file.addOption("Save", "save").addEventListener("click", save)
        this.editorOptionsGroup.frame.contentDocument.addEventListener("keydown", (e) => {
            this.tab.showSave();
            if (e.ctrlKey && e.key == "s") {
                save()
            }
            if (e.ctrlKey && e.key == "S" && e.shiftKey) {
                saveAs()
            }
        })
        this.editorOptionsGroup.file.addOption("Save As", "save_as").addEventListener("click", saveAs)
        this.editorOptionsGroup.file.addOption("Print", "print").addEventListener("click", () => {
            this.editorOptionsGroup.frame.contentDocument.execCommand("print")
            this.editorOptionsGroup.frame.contentDocument.body.focus()
        });
        this.editorOptionsGroup.file.setWidth();
        this.editorOptionsGroup.file.activateClick();
        this.editorOptionsGroup.file.addBar()
        //end of file options

        //edit options
        this.editorOptionsGroup.edit = new editorOptionsGroup("Edit", this.editorOptionsGroup.top)
        this.editorOptionsGroup.edit.addOption("Undo", "undo").addEventListener("click", () => {
            this.editorOptionsGroup.frame.contentDocument.execCommand("undo")
            this.editorOptionsGroup.frame.contentDocument.body.focus()
        })
        this.editorOptionsGroup.edit.addOption("Redo", "redo").addEventListener("click", () => {
            this.editorOptionsGroup.frame.contentDocument.execCommand("redo")
            this.editorOptionsGroup.frame.contentDocument.body.focus()
        })
        this.editorOptionsGroup.edit.addOption("Cut", "cut").addEventListener("click", () => {
            this.editorOptionsGroup.frame.contentDocument.execCommand("cut")
            this.editorOptionsGroup.frame.contentDocument.body.focus()
        })
        this.editorOptionsGroup.edit.addOption("Copy", "content_copy").addEventListener("click", () => {
            this.editorOptionsGroup.frame.contentDocument.execCommand("copy")
            this.editorOptionsGroup.frame.contentDocument.body.focus()
        })
        this.editorOptionsGroup.edit.addOption("Paste", "content_paste").addEventListener("click", () => {
            this.editorOptionsGroup.frame.contentDocument.execCommand("paste")
            this.editorOptionsGroup.frame.contentDocument.body.focus()
        });
        this.editorOptionsGroup.edit.addOption("Delete", "delete").addEventListener("click", () => {
            this.editorOptionsGroup.frame.contentDocument.execCommand("delete")
            this.editorOptionsGroup.frame.contentDocument.body.focus()
        });
        //search feature removed
        /* 
        this.editorOptionsGroup.edit.addOption("Find", "search").addEventListener("click", ()=>{
            var html = this.editorOptionsGroup.frame.contentDocument.body.innerHTML;
            this.editorOptionsGroup.unsearched = html
            var htmlContent = document.createElement("div");
            var x = html.replaceAll("hi", "<span style='background-color: #eaff0098'>hi</span>")
            this.editorOptionsGroup.frame.contentDocument.body.innerHTML = x;
            
        }) */
        this.editorOptionsGroup.edit.addOption("Select All", "select_all").addEventListener("click", () => {
            this.editorOptionsGroup.frame.contentDocument.execCommand("selectAll")
            this.editorOptionsGroup.frame.contentDocument.body.focus()
        });
        this.editorOptionsGroup.edit.setWidth();
        this.editorOptionsGroup.edit.activateClick();
        this.editorOptionsGroup.edit.addBar();
        //end of edit options

        //view options
        this.editorOptionsGroup.view = new editorOptionsGroup("View", this.editorOptionsGroup.top)
        this.editorOptionsGroup.view.addOption("Zoom In", "zoom_in").addEventListener("click", () => {
            this.editorOptionsGroup.frameZoom += 1;
            this.editorOptionsGroup.frame.contentDocument.body.style.fontSize = this.editorOptionsGroup.frameZoom
        });
        this.editorOptionsGroup.view.addOption("Zoom Out", "zoom_out").addEventListener("click", () => {
            this.editorOptionsGroup.frameZoom -= 1;
            this.editorOptionsGroup.frame.contentDocument.body.style.fontSize = this.editorOptionsGroup.frameZoom
        });
        this.editorOptionsGroup.view.addOption("Restore Default Zoom", "center_focus_weak").addEventListener("click", () => {
            this.editorOptionsGroup.frameZoom = 16;
            this.editorOptionsGroup.frame.contentDocument.body.style.fontSize = this.editorOptionsGroup.frameZoom
        });
        //status bar feature removed
        /*         var statusBarOption = this.editorOptionsGroup.view.addOption("Status Bar", "Status Bar", true, !this.editorOptionsGroup.showBar)
                statusBarOption.addEventListener("click", () => {
                    this.editorOptionsGroup.showBar = !this.editorOptionsGroup.showBar
                    if (this.editorOptionsGroup.showBar) {
                        this.editorOptionsGroup.statusBar.style.padding = "5px 20px"
                        this.editorOptionsGroup.statusBar.style.opacity = 1
                        this.editorOptionsGroup.statusBar.style.height = "max-content"
                        this.editorOptionsGroup.frame.style.height = "calc(100% - 121px)"
                        statusBarOption.querySelectorAll("span")[0].style.display = "block"
                    } else {
                        this.editorOptionsGroup.statusBar.style.padding = "0px 20px"
                        this.editorOptionsGroup.statusBar.style.opacity = 0
                        this.editorOptionsGroup.statusBar.style.height = "0px"
                        this.editorOptionsGroup.frame.style.height = "calc(100% - 85px)"
                        statusBarOption.querySelectorAll("span")[0].style.display = "none"
                    }
                }) */
        var wordwrapOption = this.editorOptionsGroup.view.addOption("Word wrap", "Word wrap", true, this.editorOptionsGroup.wordwrap == "nowrap")
        wordwrapOption.addEventListener("click", () => {
            this.editorOptionsGroup.wordwrap == "nowrap" ? "normal" : "nowrap"
            if (this.editorOptionsGroup.wordwrap == "nowrap") {
                this.editorOptionsGroup.wordwrap = "normal"
                wordwrapOption.querySelectorAll("span")[0].style.display = "block"
            } else {
                this.editorOptionsGroup.wordwrap = "nowrap"
                wordwrapOption.querySelectorAll("span")[0].style.display = "none"
            }
            this.editorOptionsGroup.frame.contentDocument.body.style.whiteSpace = this.editorOptionsGroup.wordwrap
        })

        this.editorOptionsGroup.view.setWidth();
        this.editorOptionsGroup.view.activateClick();
        //end of view options

        //creating editor
        this.editorOptionsGroup.frame.classList.add("frame");
        this.editorOptionsGroup.frame.contentDocument.body.contentEditable = true;

        this.rechkTheme();

        var link1 = document.createElement("link")
        link1.rel = "preconnect"
        link1.href = "https://fonts.googleapis.com"
        var link2 = document.createElement("link")
        link2.crossOrigin = true
        link2.rel = "preconnect"
        link2.href = "https://fonts.gstatic.com"
        var link3 = document.createElement("link")
        link3.rel = "stylesheet"
        link3.href = "https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap"
        var link4 = document.createElement("link")
        link4.rel = "stylesheet"
        link4.href = "https://fonts.googleapis.com/css2?family=Lato&display=swap"
        this.editorOptionsGroup.frame.contentDocument.head.append(link1);
        this.editorOptionsGroup.frame.contentDocument.head.append(link2);
        this.editorOptionsGroup.frame.contentDocument.head.append(link3);
        this.editorOptionsGroup.frame.contentDocument.head.append(link4);

        //status bar NOTE: status bar feature removed
        /* this.editorOptionsGroup.statusBar.classList.add("statusBar");
        this.editorOptionsGroup.statusBar.innerHTML = `
        <p class="left">Line 10, Column 5</p>
 
        <div class="right">
            <div class="di"></div>
            <p>100%</p>
            <div class="di"></div>
            <p>UFT 8</p>
        </div>
        ` */
        allWindows.push(this);

        //loading text when added in option param
        if (options.preloadData) {
            var data = readFileSync(this.path, { encoding: "utf-8" })
            this.editorOptionsGroup.frame.contentDocument.body.innerText = data
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            this.rechkTheme();
        });
    }
    rechkTheme() {
        console.log(this);
        this.editorOptionsGroup.frame.contentDocument.body.style.color = (window.matchMedia('(prefers-color-scheme: dark)').matches ? "#fff" : "#000");
        this.editorOptionsGroup.frame.contentDocument.body.style.color = localStorage.getItem("appTheme") == "dark" ? "#ffffff" : this.editorOptionsGroup.frame.contentDocument.body.style.color;
        this.editorOptionsGroup.frame.contentDocument.body.style.color = localStorage.getItem("appTheme") == "white" ? "#000000" : this.editorOptionsGroup.frame.contentDocument.body.style.color;
        this.editorOptionsGroup.frame.contentDocument.head.querySelectorAll("style").forEach(e => e.remove());
        var scrollCss = document.createElement("style");
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            scrollCss.innerHTML = `::-webkit-scrollbar {width: 7px; border-radius: 4px; height: 7px;}
             ::-webkit-scrollbar-corner {background: #ffffff7e}          
             ::-webkit-scrollbar-thumb {background: #fff5; border-radius: 4px;}
             body,html{
                 white-space: ${this.editorOptionsGroup.wordwrap};
                 width: 100%;
                 height: 100%;
                 margin: 0px
             }
             ` } else {
            scrollCss.innerHTML = `::-webkit-scrollbar {width: 7px; border-radius: 4px; height: 7px;}
                 ::-webkit-scrollbar-corner {background: #0000}          
                 ::-webkit-scrollbar-thumb {background: #0000007e; border-radius: 4px;}
                 body,html{
                     white-space: ${this.editorOptionsGroup.wordwrap};
                     width: 100%;
                     height: 100%;
                     margin: 0px
                 }
                 `
        };
        if (localStorage.getItem("appTheme") == "dark") {
            scrollCss.innerHTML = `::-webkit-scrollbar {width: 7px; border-radius: 4px; height: 7px;}
                 ::-webkit-scrollbar-corner {background: #fff0}          
                 ::-webkit-scrollbar-thumb {background: #ffffff7e; border-radius: 4px;}
                 body,html{
                     white-space: ${this.editorOptionsGroup.wordwrap};
                     width: 100%;
                     height: 100%;
                     margin: 0px
                 }
                 `
        } else if (localStorage.getItem("appTheme") == "white") {
            scrollCss.innerHTML = `::-webkit-scrollbar {width: 7px; border-radius: 4px; height: 7px;}
             ::-webkit-scrollbar-corner {background: #0000}          
             ::-webkit-scrollbar-thumb {background: #0000007e; border-radius: 4px;}
             body,html{
                 white-space: ${this.editorOptionsGroup.wordwrap};
                 width: 100%;
                 height: 100%;
                 margin: 0px
             }
             `
        }
        this.editorOptionsGroup.frame.contentDocument.head.append(scrollCss)
        this.editorOptionsGroup.frame.contentDocument.body.style.fontSize = localStorage.getItem("fontSize");//font change
        this.editorOptionsGroup.frame.contentDocument.body.style.fontFamily = localStorage.getItem("fontFamily") || "'Roboto', sans-serif";//font change
    }
}

//app theme
var recentListner = null;
document.querySelectorAll("#darkmode")[0].addEventListener("click", () => {
    localStorage.setItem("appTheme", "dark")
    setAppTheme()
})
document.querySelectorAll("#whitemode")[0].addEventListener("click", () => {
    localStorage.setItem("appTheme", "white")
    setAppTheme()
})
document.querySelectorAll("#systemmode")[0].addEventListener("click", () => {
    localStorage.setItem("appTheme", "system")
    setAppTheme()
})
function setAppTheme() {
    document.querySelectorAll("#systemmode .radio")[0].classList.add("selected")
    document.querySelectorAll("#darkmode .radio")[0].classList.remove("selected")
    document.querySelectorAll("#whitemode .radio")[0].classList.remove("selected")
    document.head.querySelectorAll("style").forEach(e => e.remove())
    var themeMode = localStorage.getItem("appTheme");
    var style = document.createElement("style");
    if (recentListner) {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener(recentListner)
    }
    if (themeMode == "dark") {
        ipcRenderer.sendSync('darkMode', true)
        document.querySelectorAll("#systemmode .radio")[0].classList.remove("selected")
        document.querySelectorAll("#darkmode .radio")[0].classList.add("selected")
        document.querySelectorAll("#whitemode .radio")[0].classList.remove("selected")
        style.innerHTML = `:root{
             --font-color-primary-white : #ffffff;
             --font-color-secondary-white : #ffffff92;
             --hover-color-primary-white : #ffffff10;
             --hover-lighter-color-primary-white : #ffffff08;
             --background-color-primary-white : #212121;
             --background-color-secondary-white : #212121;
             --accent-color: #008eff;
             --editor-color: #212121cc;
         }`;
        allWindows.forEach(e => {
            e.rechkTheme()
        })
    }
    if (themeMode == "white") {
        ipcRenderer.sendSync('whiteMode', true)
        document.querySelectorAll("#systemmode .radio")[0].classList.remove("selected")
        document.querySelectorAll("#darkmode .radio")[0].classList.remove("selected")
        document.querySelectorAll("#whitemode .radio")[0].classList.add("selected")
        style.innerHTML = `:root{
             --font-color-primary-white : #000000;
             --font-color-secondary-white : #00000092;
             --hover-color-primary-white : #00000010;
             --hover-lighter-color-primary-white : #00000008;
             --background-color-primary-white : #ffffff;
             --background-color-secondary-white : #ffffff;
             --accent-color: #008eff;
             --editor-color: #ffffffcc
         }`;
        allWindows.forEach(e => {
            e.rechkTheme()
        })
    }
    if (themeMode == "system") {
        recentListner = window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                ipcRenderer.sendSync('darkMode', true)
            } else {
                ipcRenderer.sendSync('whiteMode', true)
            }
        });
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            ipcRenderer.sendSync('darkMode', true)
        } else {
            ipcRenderer.sendSync('whiteMode', true)
        }
        allWindows.forEach(e => {
            e.rechkTheme()
        })
    }
    document.head.append(style)
}
setAppTheme()

//saving fontSizes
document.querySelectorAll("#fontSizes div").forEach(e => {
    e.addEventListener("click", () => {
        localStorage.setItem("fontSize", e.querySelector("p").innerHTML);
        document.querySelectorAll("#fontSizesCurrent p")[0].innerHTML = e.querySelector("p").innerHTML;
        document.querySelectorAll("#FontSample")[0].style.fontSize = e.querySelector("p").innerHTML;
        allWindows.forEach(e => {
            e.rechkTheme()
        })
    })
})
//loading saved font styles
document.querySelectorAll("#FontSample")[0].style.fontSize = localStorage.getItem("fontSize");
document.querySelectorAll("#fontSizesCurrent p")[0].innerHTML = localStorage.getItem("fontSize") || "16px";

//saving fontFamilies
document.querySelectorAll("#fontFamilies div").forEach(e => {
    e.addEventListener("click", () => {
        localStorage.setItem("fontFamily", e.querySelector("p").style.fontFamily);
        document.querySelectorAll("#fontFamilyCurrent p")[0].innerHTML = e.querySelector("p").innerHTML;
        document.querySelectorAll("#fontFamilyCurrent p")[0].style.fontFamily = e.querySelector("p").style.fontFamily;
        document.querySelectorAll("#FontSample")[0].style.fontFamily = e.querySelector("p").style.fontFamily;
        allWindows.forEach(e => {
            e.rechkTheme();
        })
    })
})
//loading saved font styles
document.querySelectorAll("#FontSample")[0].style.fontFamily = localStorage.getItem("fontFamily");

var fonts = {
    "Lato, sans-serif": "Lato (Google Fonts)",
    '"Times New Roman", Times, serif': "Times New Roman",
    '"Lucida Sans", "Lucida Sans Regular", "Lucida Grande", "Lucida Sans Unicode", Geneva, Verdana, sans-serif': "Lucida Sans",
    '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif': "Segoe UI",
    "sans-serif": "sans-serif",
    "cursive": "cursive",
    '"Courier New", Courier, monospace': "Courier New",
    "Roboto, sans-serif": "Roboto (Google Fonts)"
}
document.querySelectorAll("#fontFamilyCurrent p")[0].style.fontFamily = localStorage.getItem("fontFamily") || "Roboto, sans-serif";
document.querySelectorAll("#fontFamilyCurrent p")[0].innerHTML = fonts[localStorage.getItem("fontFamily")] || "Roboto (Google Fonts)";

//settings drop down animation
document.querySelectorAll(".settings .left .item").forEach(e => {
    if (e.querySelectorAll(".hiddenOpt")[0] || e.querySelectorAll(".hiddenDrps")[0]) {
        var drp = e.querySelectorAll(".hiddenOpt")[0] || e.querySelectorAll(".hiddenDrps")[0];
        drp.style.height = "0px"
        drp.style.paddingTop = "0px";
        drp.style.paddingBottom = "0px";
        drp.style.opacity = 0
        e.querySelectorAll(".shown")[0].addEventListener("click", () => {
            if (drp.style.height == "0px") {
                drp.style.height = "max-content"
                drp.style.padding = "10px 40px";
                drp.style.opacity = 1
                if (e.querySelectorAll(".hiddenDrps")[0]) {
                    drp.style.paddingTop = "0px";
                    drp.style.paddingBottom = "0px";
                }
            } else {
                drp.style.height = "0px"
                drp.style.paddingTop = "0px";
                drp.style.paddingBottom = "0px";
                drp.style.opacity = 0
            }
        })
    }
})

//recents settings
document.querySelectorAll("#recentsOpt")[0].addEventListener("click", () => {
    var opt = localStorage.getItem("recentStats") || true;
    opt = JSON.parse(opt);
    localStorage.setItem("recentStats", JSON.stringify(!opt));
    if (!opt) {
        document.querySelectorAll("#recentsOpt button")[0].innerHTML = "On"
    } else {
        document.querySelectorAll("#recentsOpt button")[0].innerHTML = "Off"
    }
})
var opt = localStorage.getItem("recentStats") || true;
opt = JSON.parse(opt);
if (opt) {
    document.querySelectorAll("#recentsOpt button")[0].innerHTML = "On"
} else {
    document.querySelectorAll("#recentsOpt button")[0].innerHTML = "Off"
}

document.querySelectorAll("#recentsFirst")[0].addEventListener("click", () => {
    localStorage.setItem("priority", "recents")
    document.querySelectorAll("#recentsFirst .radio")[0].classList.add("selected")
    document.querySelectorAll("#settingsFirst .radio")[0].classList.remove("selected")
    document.querySelectorAll("#editorFirst .radio")[0].classList.remove("selected")
})
document.querySelectorAll("#settingsFirst")[0].addEventListener("click", () => {
    localStorage.setItem("priority", "settings")
    document.querySelectorAll("#recentsFirst .radio")[0].classList.remove("selected")
    document.querySelectorAll("#settingsFirst .radio")[0].classList.add("selected")
    document.querySelectorAll("#editorFirst .radio")[0].classList.remove("selected")
})
document.querySelectorAll("#editorFirst")[0].addEventListener("click", () => {
    localStorage.setItem("priority", "editor")
    document.querySelectorAll("#recentsFirst .radio")[0].classList.remove("selected")
    document.querySelectorAll("#settingsFirst .radio")[0].classList.remove("selected")
    document.querySelectorAll("#editorFirst .radio")[0].classList.add("selected")
})

//for app opened a file
window.onload = () => {
    var paths = JSON.parse(ipcRenderer.sendSync('getFilePathToBeOpened', true));
    paths.forEach(path => {
        if (path && path != undefined && path != "." && path != "--updated" && !(path.includes("electron.exe")) && !(path.includes("Notepad XI.exe"))) {
            addToRecents(path);
            setTimeout(() => {
                new Editor({ title: "Untitled.txt", path: path, preloadData: true })
            }, 100);
        }
    })
}
//showing on open default
var activePriority = localStorage.getItem("priority");
if (activePriority == "recents") {
    document.querySelectorAll("#recentTab")[0].click();
    document.querySelectorAll("#recentsFirst .radio")[0].classList.add("selected")
    document.querySelectorAll("#settingsFirst .radio")[0].classList.remove("selected")
    document.querySelectorAll("#editorFirst .radio")[0].classList.remove("selected")
}
if (activePriority == "settings") {
    document.querySelectorAll("#settingTab")[0].click();
    document.querySelectorAll("#recentsFirst .radio")[0].classList.remove("selected")
    document.querySelectorAll("#settingsFirst .radio")[0].classList.add("selected")
    document.querySelectorAll("#editorFirst .radio")[0].classList.remove("selected")
}
if (activePriority == 'editor') {
    document.querySelectorAll("#recentsFirst .radio")[0].classList.remove("selected")
    document.querySelectorAll("#settingsFirst .radio")[0].classList.remove("selected")
    document.querySelectorAll("#editorFirst .radio")[0].classList.add("selected")
    new Editor({ title: "Untitled.txt" })
}

//opening settings when clicked on opensettings link on recents pg
document.querySelectorAll("#openSettings")[0].addEventListener("click", () => {
    document.querySelectorAll("#settingTab")[0].click();
    document.querySelectorAll("#recentsFirst .radio")[0].classList.remove("selected")
    document.querySelectorAll("#settingsFirst .radio")[0].classList.add("selected")
    document.querySelectorAll("#editorFirst .radio")[0].classList.remove("selected")
})