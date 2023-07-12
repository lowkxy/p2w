// @ts-check
const { configCheck, firstRun, usernamesCheck, printMsg } = require('./exports')

let userArr = []
let gkitInterval = null;

(async () => {
    firstRun()
    configCheck()
    userArr = usernamesCheck()

    const { Bot } = require('./bot')
    // @ts-ignore
    const config = require('../config.json')

    if (userArr.length === 0) return printMsg('INFO', null, 'Add accounts before running the script.')

    gkitInterval = setInterval(() => {
        // if (global.bot_count >= 5) return // Only use this if you have slow wifi and limit to 2-6 depending on it's speed.

        if (userArr.length === 0) return clearInterval(gkitInterval)
    
        let user = userArr.pop().trim()
        let default_pw = config.VARIABLES.password
    
        if (/:/.test(user)) [user, default_pw] = user.split(/:/)

        new Bot(user, default_pw)
        global.bot_count++
    }, config.VARIABLES.delay * 1000)
})();