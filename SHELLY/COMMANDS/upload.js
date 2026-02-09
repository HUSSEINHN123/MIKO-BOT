const axios = require("axios");

module.exports = {
  config: {
    name: "رفع",
    Multi: ["upload"],
    version: "1.0.0",
    Auth: 0,
    Owner: "Gry KJ",
    Info: "رفع صورة لرابط",
    Class: "ادوات",
    How: "",
    CDown: 0
  },
  onPick: async ({ sh: Message, event, api, text }) => {
    if (event.type !== "message_reply" || !["photo", "sticker"].includes(event.messageReply.attachments[0].type || !text)) {
      return Message.reply("رد عا صوره🙂🚮");
    }


   let imageUrl = event.messageReply.attachments[0].url;
                



    Message.react("🫧");

    try {
         Message.reply(await Mods.imgbb(await Mods.imgd(imageUrl)));
        Message.react("✅");
        
    } catch(error) {
      Message.send("❌ | حدث خطأ");
         console.error(error);
      Message.react("😔");
    }
  }
};