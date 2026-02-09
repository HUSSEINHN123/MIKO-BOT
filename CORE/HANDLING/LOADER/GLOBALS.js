global.shelly = new Object({
    cmds: new Map(),
    events: new Array(),
    Time: new Map(),
    Multi: new Map(),
    eventV2: new Map(),
    onListen: new Map(),
    handleSchedule: new Array(),
    React: new Array(),
    Reply: new Array(),
    mainPath: process.cwd(),
    configPath: new String()
});

global.axios = require("axios");
global.fs = require("fs-extra");

global.config = require(global.shelly.mainPath + '/CONFIGURATIONS/CONFIG.json');
if (!global.config) return console.log("config err");

global.funcs = require(global.shelly.mainPath + '/tools/funcs/utils.js');
global.Mods = funcs;
global.scraper = require(global.shelly.mainPath + "/tools/scraper/scraper.js");
global.logger = require(global.shelly.mainPath + '/tools/logger/log.js');

global.loading = global.logger.loader;


global.DBGRY = {
    database: {
        creatingThreadData: [],
        creatingUserData: [],
        creatingDashBoardData: [],
        creatingGlobalData: []
    }
};
global.temp = { createThreadDataError: [] };

global.db = {
    allThreadData: [],
    allUserData: [],
    allGlobalData: [],
    threadModel: null,
    userModel: null,
    globalModel: null,
    threadsData: null,
    usersData: null,
    globalData: null,
    receivedTheFirstMessage: {}
};