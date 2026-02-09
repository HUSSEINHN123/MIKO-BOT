const { config } = global;
class Handles {
    constructor() {
        Object.assign(this, {
            name: "Handles",
            logger: (ci, bi) => {
            let type;
            switch(ci) {
            case "cmd":
            type = "※ CMD ▷ ";
            break;
            case "chat":
            type = "※ CHAT ▷ ";
            break;
            case "reply":
            type = "※ REPLY ▷ ";
            break;
            case "onListen":
            type = "※ onListen ▷ "
            break;
            }
            global.logger([
            {
            message: type,
            color: [...config.THEME.main],
            },
            {
            message: bi,
            color: "red",
            },
            ]);
            }
        })
    }

    async handleCHAT({api, event , sh , threadsData, usersData, globalData}) {
    try {
      if (!event.body) return;
      var {senderID, threadID} = event;
      const threadData = await threadsData.get(event.threadID);
      const userData = await usersData.get(senderID);
      let adbox = await threadsData.get(threadID, "settings.adbox");
      if (!adbox) {
      await threadsData.set(event.threadID, false, "settings.adbox");
      adbox = await threadsData.get(threadID, "settings.adbox");
       }
       if (!config.AD.includes(senderID) && !config.MAD.includes(senderID) && event.isGroup && !threadData.adminIDs.includes(senderID)) {
      if (adbox === true) {
        return;
      }
    }
    if (!config.AD.includes(senderID) && !config.MAD.includes(senderID)) {
      if (config.onlyme) {
        return;
      }
    }
    const body = event.body;
    
    // ✅ التحقق من الحظر العام (global.data.bannedUsers)
    if (!global.data) global.data = {};
    if (!global.data.bannedUsers) global.data.bannedUsers = {};
    
    if (!config.AD.includes(senderID) && !config.MAD.includes(senderID) && global.data.bannedUsers[senderID]) {
      return; // تجاهل الرسالة إذا كان محظور
    }
    
    if (!config.AD.includes(senderID) && !config.MAD.includes(senderID) && (userData.banned.status || threadData.banned.status)) {
      return;
    }
           const PARAMS = {
             threadsData, 
             usersData,
             globalData,
             api,
             args: body.split(" "),
             text: body,
             event,
             sh
            };
        for (let event of global.shelly.events) {
          const cmd = global.shelly.cmds.get(event);
          if (cmd) cmd.All(PARAMS);
        }
    } catch(e) {
    this.logger("all", e);
  }
};


 async handleCOMMAND({api, event , sh , threadsData, usersData, globalData }) {
    try {
    const body = event.body;
    if (!body) return;
    var {senderID, threadID} = event;
    const threadData = await threadsData.get(event.threadID);
    const userData = await usersData.get(senderID);
    let adbox = await threadsData.get(threadID, "settings.adbox");
    if (!adbox) {
      await threadsData.set(event.threadID, false, "settings.adbox");
      adbox = await threadsData.get(threadID, "settings.adbox");

    }
    if (!config.AD.includes(senderID) && !config.MAD.includes(senderID) && event.isGroup && !threadData.adminIDs.includes(senderID)) {
      if (adbox === true) {
        return;
      }
    }

    if (!config.AD.includes(senderID) && !config.MAD.includes(senderID)) {
      if (config.onlyme) {
        return;
      }
    }

    const prefix = global.funcs.getPrefix(event.threadID) || config.PREFIX;

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        
    const prefixRegex = new RegExp(
      `^(<@!?${senderID}>|${escapeRegex(prefix)}|\\s*)`
    );
      
      
      
     if (!event.body.startsWith(prefix)) return;

     const [matchedPrefix] = body.match(prefixRegex),
     args = body.slice(matchedPrefix.length).trim().split(/ +/);

const command = args.shift().toLowerCase();

      // ✅✅✅ إضافة نظام الحظر الجديد هنا ✅✅✅
      // تهيئة قاعدة البيانات
      if (!global.data) global.data = {};
      if (!global.data.bannedUsers) global.data.bannedUsers = {};
      
      // التحقق من الحظر للمستخدمين غير المطورين فقط
      if (!config.AD.includes(senderID) && !config.MAD.includes(senderID) && global.data.bannedUsers[senderID]) {
        const banData = global.data.bannedUsers[senderID];
        return sh.reply(
          `🚫 أنت محظور من استخدام البوت!\n\n` +
          `💬 السبب: ${banData.reason}\n` +
          `📅 التاريخ: ${banData.date}\n` +
          `👮 بواسطة: ${banData.byName}\n\n` +
          `⚠️ للاستفسار تواصل مع المسؤولين`
        );
      }
      // ✅✅✅ نهاية نظام الحظر الجديد ✅✅✅
      
      // نظام الحظر القديم (من قاعدة البيانات)
      if (!config.AD.includes(senderID) && !config.MAD.includes(senderID) && userData.banned.status) {
      return sh.reply(`انت محظور من استعمال البوت :
      [${senderID} | ${userData.name}]
      » السبب: ${userData.banned.reason}
» التاريخ: ${userData.banned.date}`);
    }

      if (!config.AD.includes(senderID) && !config.MAD.includes(senderID) && threadData.banned.status) {
      return sh.reply(`الغروب محظور من استعمال البوت :
        [${senderID} | ${threadData.threadName}]
        » السبب: ${threadData.banned.reason}
  » التاريخ: ${threadData.banned.date}`);;
      }
      var permssion = 0;


      if (config.MAD.includes(senderID.toString())) {
        permssion = 2;
      } else if (config.AD.includes(senderID.toString())) {
        permssion = 3;
      } else if (threadData.adminIDs.includes(senderID.toString())) {
        permssion = 1;
      } 
      if (global.shelly.cmds.has(command) || global.shelly.Multi.has(command)) {
        const DOM = global.shelly.cmds.get(command) || global.shelly.Multi.get(command);
        let obj = threadData.data.Cban;
        if (obj && permssion < 1) {
          if (obj.includes(command)) {
            return;
          }
              }

if (DOM.config.Auth > permssion) {
  return sh.reply(`ليس لديك الصلاحية لاستخدام هذا الأمر "${DOM.config.name}" `);
}
           const PARAMS = {
           threadsData, 
           usersData,
           globalData,
           Auth: permssion,
           api,
           args,
           text: args.join(" "),
           event,
           sh,
           command
        };
        return DOM.onPick(PARAMS);
      } else {
        return sh.react("😭");
      };
    } catch(e) {
    this.logger("cmd", e)
  }
  };
  
  async handleReply ({api, event , sh , threadsData, usersData, globalData }) {
        try {
        if (!event.messageReply) return;
        
        // ✅ التحقق من الحظر في الردود أيضاً
        if (!global.data) global.data = {};
        if (!global.data.bannedUsers) global.data.bannedUsers = {};
        
        const senderID = event.senderID;
        if (!config.AD.includes(senderID) && !config.MAD.includes(senderID) && global.data.bannedUsers[senderID]) {
          const banData = global.data.bannedUsers[senderID];
          return sh.reply(
            `🚫 أنت محظور من استخدام البوت!\n\n` +
            `💬 السبب: ${banData.reason}\n` +
            `📅 التاريخ: ${banData.date}\n` +
            `👮 بواسطة: ${banData.byName}`
          );
        }
        
        const Reply = global.shelly.Reply;
        const indexOfHandle = Reply.findIndex(e => e.ID == event.messageReply.messageID);
        if (indexOfHandle < 0) return;
        const indexOfMessage = Reply[indexOfHandle];
        const ROM = global.shelly.cmds.get(indexOfMessage.name);
        if (!ROM) return sh.reply("missing Reply function aw9");
         const PARAMS = {
         api,
         sh,
         text: event.body, 
         args: event.body.split(" ") ,
         Reply: indexOfMessage,
         event ,
         threadsData,
         usersData, 
         globalData 
         };
        ROM.Reply(PARAMS);
  } catch(e) {
    this.logger("reply", e);
  }
};

 handleEvent ({api , sh , threadsData, usersData, globalData}) {
     const logger = global.loading;
     const bannedUsers = global.db.allUserData.filter(e => e.banned.status == true).map(e => e.userID);
     const bannedThreads = global.db.allThreadData.filter(e => e.banned.status == true).map(e => e.threadID);
     return async function({ event }) {
      const threadData = await threadsData.get(event.threadID);
      if (threadData.banned.status) return;
      if (global.config.onlyme) return;
      
      // ✅ التحقق من الحظر في الأحداث
      if (!global.data) global.data = {};
      if (!global.data.bannedUsers) global.data.bannedUsers = {};
      
      const { eventV2 } = global.shelly;
      const { DeveloperMode } = global.config;
      var { senderID, threadID } = event;
      senderID = String(senderID);
      threadID = String(threadID);
      
      // إضافة المحظورين من النظام الجديد
      const newBannedUsers = Object.keys(global.data.bannedUsers);
      if (bannedUsers.includes(senderID) || newBannedUsers.includes(senderID) || bannedThreads.includes(threadID) || senderID == threadID) return;
      
      for (const [key, value] of eventV2.entries()) {
      if (value.config.Type.indexOf(event.logMessageType) !== -1) {
      const eventRun = eventV2.get(key);
       try {
          const Nona = {
          api,
          sh,
          event,
          usersData,
          threadsData,
          globalData,
          }
          eventRun.Event(Nona);
          if (DeveloperMode == true)
          logger(`${eventRun.config.name} , threadID: ${threadID}`, '[ Event ]');
          } catch (error) {
          logger("eventError: " + eventRun.config.name, "error");
          }
        }
      }
      return;
    };
  };
  
  async onListen ({api, event , sh , threadsData, usersData, globalData }) {
      if (global.shelly.onListen.size == 0) return;
      try {
        global.shelly.onListen.forEach(async (current, KEY) => {
          try {
            const conditionResult = eval(current.condition);
            if (conditionResult) {
              const resultFunction = eval(current.result);
              if (typeof resultFunction === 'function') {
                await resultFunction();
              }
              global.shelly.onListen.delete(KEY);
            }
          } catch (err) {
            this.logger("onListen" ,err);
          }
        });
      } catch (err) {
           this.logger("onListen",err);
      }
}
}


module.exports = Handles;