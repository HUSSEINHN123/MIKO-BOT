const handlerModule = require(__dirname + "/HANDLES/handler.js");
const handler = new handlerModule();
module.exports = function({ threadsData, usersData, globalData , api }) {
  return async (event) => {
    const sh = funcs.message(api, event);
    const PARAMS = {
           api,
           event,
           sh,
           threadsData, 
           usersData, 
           globalData
        };
    const handleCmd = handler.handleCOMMAND;
    const handleReply = handler.handleReply;
    const handleAll = handler.handleCHAT;
    const handleEvent = handler.handleEvent({ usersData, sh, threadsData, globalData, api });
    const handleDB = require(__dirname + "/HANDLES/handleDB")({ usersData, threadsData, globalData, api });
    const onListen = handler.onListen;
    switch (event.type) {
      case "message":
      case "message_reply":
      case "message_unsend":
        handleDB(event);
        handleCmd(PARAMS);
        handleReply(PARAMS);
        handleAll(PARAMS);
        onListen(PARAMS);
        break;
      case "event":
        handleEvent({ event });
        onListen(PARAMS);
      if (event.logMessageType) await threadsData.refreshInfo(event.threadID);
        break;
      case "message_reaction":
        onListen(PARAMS);
        if (event.reaction == "👎" && global.config.AD.includes(event.userID)) {

          if (event.senderID == api.getCurrentUserID()) {
          api.unsendMessage(event.messageID);
          }
        }
        break;
      default:
        break;
    }
  }
}