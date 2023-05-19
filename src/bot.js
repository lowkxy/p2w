// @ts-nocheck
const mc = require('mineflayer')
const { printMsg, randomInt, logEvent } = require('./exports')
const config = require('../config.json')

const hostArray = ['top.pika.host', 'proxy001.pikasys.net', 'proxy002.pikasys.net'] // Add more if needed, since pika has "already connected to proxy" issues.
const opfOnly = ['CRATE KEY', 'TREASURE', 'SPECIAL']

let clrRegex = /\u00A7[0-9A-FK-OR]/ig
let version = config.MC_INFO.version

global.bot_amount = 0

/**
 * Class to create minecraft bots using mineflayer.
 */
class Bot {

    constructor(username, password) {
        this.username = username
        this.password = password
        this.host = hostArray[randomInt(0, hostArray.length - 1)]
        this.version = version
        this.spawns = 0
        this.windowsClosed = 0
        this.hasCollected = false
        this.finished = false

        this.initBot()
    }

    initBot() {
        this.bot = mc.createBot({
            'username': this.username,
            'host': this.host,
            'version': this.version,
        })

        this.initEvents()
    }

    initEvents() {
        this.bot.once('login', () => {
            printMsg('SUCCESS', this.bot.username, `Connected to ${this.host} successfully!`)
        })

        this.bot.on('spawn', () => {
            this.spawns++

            if (this.spawns == 1) {
                printMsg('INFO', this.bot.username, `Spawned in login lobby!`)
                this.bot.chat(`/login ${this.password}`)
            } else if (this.spawns % 2 == 0) {
                printMsg('INFO', this.bot.username, `Account in hub!`)
                this.bot.chat(`/server ${config.VARIABLES.server}`)
                // Waits 20 seconds, before retrying, doubt queues can make you wait longer.
                this.joinTimeout = setTimeout(() => {
                    this.bot.quit()
                    this.initBot()
                    printMsg('ERROR', this.bot.username, `Looks like you had problems connecting, retrying!`)
                }, 20 * 1000)
            } else {
                clearTimeout(this.joinTimeout)
                printMsg('INFO', this.bot.username, `Joined!`)
                this.bot.chat('/gkit')
            }
        })

        this.bot.on('windowOpen', (window) => {
            if (window.title?.toUpperCase().includes('CLASSES')) {
                let gkit = window.containerItems().find((i) => {
                    return i.customLore?.some(str => str.toLowerCase().includes('can claim') || str.toLowerCase().includes('to redeem'))
                })
                if (!gkit) {
                    if (!this.hasCollected) printMsg('INFO', this.bot.username, 'This account has no gkits available, checking if there\'s any in inventory.')
                    let check = window.items().some((j) => {
                        return j.customName && (j.customName.replace(clrRegex, '').toUpperCase().includes('GKIT CONTAINER') || j.customName.toUpperCase().replace(clrRegex, '').includes('CLASS CONTAINER') || opfOnly.some(item => j.customName.toUpperCase().includes(item)))
                    })                     
                    if (!check) {
                        printMsg('ERROR', this.bot.username, 'No GKITs. Disconnecting.')
                        this.bot.quit()
                    } else {
                        this.finished = true
                        this.bot.closeWindow(window)
                        this.bot.chat(`/gift ${config.VARIABLES.main_acc}`)
                    }
                } else {
                    this.hasCollected = true
                    this.bot.clickWindow(gkit.slot, 0, 0)
                    printMsg('INFO', this.bot.username, `Collected ${gkit.customName.replace(clrRegex, '')} GKIT!`)
                }
            } else if (window.title?.toUpperCase().includes('SELECT ITEMS TO SEND')) {
                let gkitArr = []
                
                window.items().forEach((j) => {
                    if (j.customName && (j.customName.replace(clrRegex, '').toUpperCase().includes('GKIT CONTAINER') || j.customName.toUpperCase().replace(clrRegex, '').includes('CLASS CONTAINER') || opfOnly.some(item => j.customName.toUpperCase().includes(item)))) {
                        gkitArr.push(j.slot)
                    }
                })

                if (gkitArr.length == 0) {
                    printMsg('ERROR', this.bot.username, 'No gkits in inventory. Disconnecting. (High chance inventory was full and gkits collected are in gift)')
                    this.bot.quit()
                } else {
                    let temp_value = gkitArr.length
                    printMsg('INFO', this.bot.username, `There\'s ${gkitArr.length} GKITs in your inventory, gifting!`)
                    for (let i = 1; i <= temp_value; i++) {
                        setTimeout(() => {
                            let shifted_slot = gkitArr.shift()
                            this.bot.clickWindow(shifted_slot, 0, 0)
                            if (i == temp_value) this.bot.closeWindow(window)
                        }, i * 200) // If you have slow wifi, increase this delay to 1000 or more.
                    }
                }
            } else if (window.title?.toUpperCase().includes('ARE YOU SURE?')) {
                this.giftInterval = setInterval(() => {
                    let confirm = window.containerItems().find((k) => {
                        return k.customName?.toUpperCase().includes('CONFIRM')
                    })
                    confirm && this.bot.clickWindow(confirm.slot, 0, 0)
                }, 3000) // Will keep looping until the server registers the click, won't lose gkits this way.
            }
        })

        this.bot.on('windowClose', async (window) => {
            if (window.title?.toUpperCase().includes('CLASSES') && !this.finished) {
                this.windowsClosed++
                if (this.windowsClosed % 7 == 0) await new Promise(r => setTimeout(r, 2000)) // Avoids "disconnect.spam" kick.
                this.bot.chat('/gkit')
            } else if (window.title?.toUpperCase().includes('ARE YOU SURE?')) {
                clearInterval(this.giftInterval)
                printMsg('SUCCESS', this.bot.username, 'GKITs gifted successfully!')
                this.bot.quit()
            }
        })

        this.bot.on('end', (reason) => {
            global.bot_amount--
            if (reason == 'disconnect.quitting' || 'socketClosed') return
            printMsg('ERROR', this.bot.username, 'Disconnected. Reconnecting.\n')
            setTimeout(() => {
                this.initBot()
            }, 3000)
        })

        this.bot.on('kicked', (reason) => {
            printMsg('ERROR', this.username, 'You were kicked, more information in log. Skipping account.')
            logEvent(`[${this.username}] Kicked for the following reason:\n${reason}`)
        })

        this.bot.on('error', (err) => {
            global.bot_amount--
            if (err.code === 'ECONNREFUSED') {
                printMsg('ERROR', this.username, 'Login Denied.')
            } else {
                printMsg('ERROR', this.username, 'Unhandled exception, more information in log. Skipping account.')
                logEvent(`[${this.username}] Unhandled exception:\n${err}`)
            }
        })
    }
}

module.exports = { Bot }