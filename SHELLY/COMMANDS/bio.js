module.exports.config = {
  name: "بايو",
  Auth: 2,
  Owner: "ƤӇƠƬƠƝ 𖠰",
  Info: "تغيير بايو البوت",
  Class: "المطور",
  How: "بايو [نص]",
  cooldowns: 5

}

  module.exports.onPick = async ({ api, event, args}) => {
    api.changeBio(args.join(" "), (e) => {
      if(e) api.sendMessage("حدث خطأ" + e, event.threadID); return api.sendMessage("تم تغيير البايو إلى: \n"+args.join(" "), event.threadID, event.messageID)
    }
    )
  }