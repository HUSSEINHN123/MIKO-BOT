const fs = require("fs-extra");
module.exports = {
  config: { 
  name: "تقييد",
  Auth: 1,
  Owner: "عبدالرحمن",
  Info: "تقيد البوت وتخليه للمسؤلين",
  Class: "ادمنية الكروبات", 
  How: "",
  Time: 0
},
onPick: async function({ args, api, sh: Message, event, threadsData, usersData }) {

const thqq = event.participantIDs;
for (let uid of thqq) {
const D = await usersData.get(uid)
if(!D.name && !D.gender) {
 await usersData.create(uid);
}}

    let name = await usersData.getName(event.senderID);
  let box = await threadsData.get(event.threadID, "settings.adbox");
      if (!box) {
 await threadsData.set(event.threadID, true, "settings.adbox");
  Message.react("🔒");
 api.changeNickname(`✖️*°• ↓ ${config.BOTNAME} ↑ •°*✖️`, event.threadID, api.getCurrentUserID());
return Message.reply(`تم تقييد البوت ✅\nالفاعل: ${name}`);

      return;
      }


if(box) {
 await threadsData.set(event.threadID, false, "settings.adbox");

api.changeNickname(`❑*°• ↓ ${config.BOTNAME} ↑ •°*❒`, event.threadID, api.getCurrentUserID());

 return Message.reply(`تم الغاء تقييد البوت ✅\nالفاعل: ${name}`);
 
}

  }
}
