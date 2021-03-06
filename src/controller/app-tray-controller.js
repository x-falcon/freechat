const {
    app,
    Menu,
    nativeImage,
    Tray,
    ipcMain,
    interval,
    iconType
} = require('electron');
const path = require('path');

class AppTrayController {
    constructor(mainController) {
        this.mainController = mainController
        this.unreadType = 'none'
        this.platform = require('os').platform()
        this.init()
    }

    init() {
        this.tray = new Tray(this.createTrayIcon())
        this.tray.setToolTip('Wechat Desktop')

        const context = Menu.buildFromTemplate([{
                label: '切换聊天窗口',
                click: () => {
                    this.cleanTrayFlash()
                    this.mainController.toggle()
                }
            },
            {
                label: '退出',
                click: () => this.cleanupAndExit()
            }
        ])

        this.tray.setContextMenu(context)

        this.tray.on('click', () => this.clickEvent())

        ipcMain.on('updateUnread', (event, value) => {
            if(value !== this.unreadType){
                let trayFlash = true
                if(value==='important'){
                    this.iconType=value;
                }
                if (!this.interval) {
                    this.interval = setInterval(() => {
                        let icon
                        if (trayFlash) {
                            icon = nativeImage.createFromPath(path.join(__dirname, '../../assets/iconFlashBlack.png'))
                            trayFlash = false
                        } else {
                            icon = this.getUnreadImage(this.iconType)
                            trayFlash = true
                        }
                        this.tray.setImage(icon)
                    }, 700)
                }
            }else{
                this.cleanTrayFlash()
            }

        })
    }

    cleanTrayFlash() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.iconType = null;
            this.tray.setImage(this.getUnreadImage());
        }
    }

    clickEvent() {
        this.cleanTrayFlash()
        this.mainController.toggle()
    }

    createTrayIcon() {
        switch (this.platform) {
            case 'darwin':
                let trayIcon = nativeImage.createFromPath(path.join(__dirname, '../../assets/icon.png'))
                trayIcon.setTemplateImage(true)
                return trayIcon
            default:
                return nativeImage.createFromPath(path.join(__dirname, '../../assets/original/icon_tray.png'))
        }
    }

    getUnreadImage(value) {
        this.unreadType = value
        switch (value) {
            case 'important':
                if ('darwin' === this.platform) {
                    let trayIcon = nativeImage.createFromPath(path.join(__dirname, '../../assets/iconImportant.png'))
                    return trayIcon
                } else {
                    return nativeImage.createFromPath(path.join(__dirname, '../../assets/original/icon_tray_important.png'))
                }
            case 'minor':
                if ('darwin' === this.platform) {
                    let trayIcon = nativeImage.createFromPath(path.join(__dirname, '../../assets/iconUnread.png'))
                    return trayIcon
                } else {
                    return nativeImage.createFromPath(path.join(__dirname, '../../assets/original/icon_tray_unread.png'))
                }
            default:
                if ('darwin' === this.platform) {
                    let trayIcon = nativeImage.createFromPath(path.join(__dirname, '../../assets/icon.png'))
                    trayIcon.setTemplateImage(true)
                    return trayIcon
                } else {
                    return nativeImage.createFromPath(path.join(__dirname, '../../assets/original/icon_tray.png'))
                }
        }
    }

    cleanupAndExit() {
        app.exit(0);
    }
}

module.exports = AppTrayController