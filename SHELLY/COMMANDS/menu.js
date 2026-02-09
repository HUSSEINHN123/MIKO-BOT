let wallpapers = [
  "https://wallpapers-clan.com/wp-content/uploads/2024/04/beautiful-anime-girl-blue-butterflies-desktop-wallpaper-cover.jpg",
  "https://wallpapers-clan.com/wp-content/uploads/2024/02/anime-girl-with-flowers-butterflies-desktop-wallpaper-preview.jpg",
  "https://wallpapers-clan.com/wp-content/uploads/2024/08/glitter-dream-pastel-anime-girl-desktop-wallpaper-cover.jpg",
  "https://wallpapers-clan.com/wp-content/uploads/2024/03/beautiful-anime-girl-with-rainbow-eyes-desktop-wallpaper-cover.jpg"
];

const axios = require("axios");

module.exports.config = {
  name: "اوامر",
  Multi: ["Menu", "help", "الاوامر"],
  Auth: 0,
  Hide: true,
  Owner: "حمودي",
  Info: "قائمة الاوامر",
  Class: "system",
  How: "[Tên module]",
  Time: 1,
};

module.exports.onPick = async function ({ threadsData, usersData, event, sh: Message, Auth, args }) {
  const { cmds } = global.shelly;
  const { threadID, messageID } = event;
  const command = cmds.get((args[0] || "").toLowerCase());
  const prefix = global.Mods.getPrefix(event.threadID);

  if (!command) {
    const objInfo = {};
    const arrayInfo = [];
    const page = parseInt(args[0]) || 1;
    const numberOfOnePage = 10;

    let i = 0;
    let msg = "";

    for (var [name, value] of cmds) {
      let c = shelly.cmds.get(name);
      if (c.config.Hide && c.config.Hide == true) continue;

      let me = shelly.cmds.get(name);
      arrayInfo.push("u");

      if (objInfo[me.config.Class]) objInfo[me.config.Class].push(me.config.name);
      else {
        objInfo[me.config.Class] = [];
        objInfo[me.config.Class].push(me.config.name);
      }
    }

    // ترتيب الأوامر وإضافة الترقيم والعلامات 👑
    const entries = Object.entries(objInfo);
    let counter = 1;
    entries.forEach(([className, namesArray], index) => {
      if (namesArray.length > 0) {
        msg += `✦━━━✥❖✥━━━✦\n\n ❖ ${className} ❖ \n\n✦━━━✥❖✥━━━✦\n`;
        namesArray.forEach((cmdName) => {
          msg += `➥ ${counter} 👑 ${cmdName}\n`;
          counter++;
        });
        if (index < entries.length - 1) {
          msg += `══• •✠•❀•✠• •══\n\n`;
        }
      }
    });

    const siu = `✦━━━✥❖✥━━━✦\n      『قائمة الاوامر』`;
    const text = `\n══• •✠•❀•✠• •══\nعدد الاوامر: ${arrayInfo.length}\n`;

    let hello = siu + "\n\n" + msg + text;
    return Message.reply({
      body: hello
    });
  }

  const infos = command;

  const msg = `
━━━━✦━━━━
    معلومات الأمر

➥ اسم الأمر: ${infos.config.name}
➥ الوصف: ${infos.config.Info || "مافي وصف"}
➥ أسماء أخرى: ${infos.config.Multi.join(", ") || "غير متوفر"}
➥ الصانع: ${infos.config.Owner || "حمودي"}
➥ التصنيف: ${infos.config.Class || "أدوات"}
➥ كيفية الاستعمال: ${infos.config.How || "غير متوفر"}
━━━━✦━━━━
  `;
  return Message.reply({ body: msg });
};
