const { getTime } = global.funcs;

module.exports = {
  config: {
    name: "المستخدم",
    Multi: ["user", "thread", "غروب", "مجموعة"],
    Owner: "GryKJ",
    Time: 5,
    Auth: 2,
    Info: "ادارة المستخدمين [حظر-بحث]",
    Class: "المطور",
    How: "المستخدم حظر/الغاء"
  },

  onPick: async function ({ args, usersData, threadsData, sh: message, event, command }) {
    const type = args[0];
    if (["thread", "غروب", "مجموعة"].includes(command)) {
      switch (type) {
        case "ban": 
        case "حظر":
      case "بان":
      case "-b": {
        let tid, reason;
        if (!isNaN(args[1])) {
          tid = args[1];
          reason = args.slice(2).join(" ");
        } else if (args[1]) {
          tid = event.threadID;
          reason = args.slice(1).join(" ");
        } else if (!args[1]) {
          tid = event.threadID;
          reason = "لا يوجد سبب محدد";
        }
        const threadData = await threadsData.get(tid);

        const name = threadData.threadName || "غير متوفر";;
        const status = threadData.banned.status;

        if (status)
          return message.reply(`تم حظر الغروب الذي لديه معرف  [${tid} | ${name}] من قبل:\n» السبب: ${threadData.banned.reason}
» التاريخ: ${threadData.banned.date}`);
        const time = getTime("DD/MM/YYYY HH:mm:ss");
        await threadsData.set(tid, {
          banned: {
            status: true,
            reason,
            date: time
          }
        });
        message.reply(`تم حظر الغروب الذي لديه معرف [${name} |  ${tid}]:\n» السبب: ${reason} \n» التاريخ: ${time}`);
        break;
      }
      case "unban":
      case "الغاء":
      case "-u": { 

        let tid;
        if (!isNaN(args[1])) {
          tid = args[1];
        } else if (args[1]) {
          tid = event.threadID;
        } else if (!args[1]) {
          tid = event.threadID;
        }
        const threadData = await threadsData.get(tid);
        const name = threadData.threadName || "غير متوفر";
        const status = threadData.banned.status;
        if (!status)
          return message.reply(`الغروب الذي لديه معرف ${tid} | ${name} ليس محظورا مسبقا`);
        await threadsData.set(tid, {
          banned: {}
        });
        message.reply(`تم الغاء الحظر على الغروب
            [${name} | ${tid}]          `);
        break;
      }
      default:
        message.reply(`استعمال خاطئ للامر
        المرجو استعمال
        ban او unban `)
      }
      return;
    }
    switch (type) {
      case "بحث":
      case "find":
      case "-f":
      case "search":
      case "-s": {
        const allUser = await usersData.getAll();
        const keyWord = args.slice(1).join(" ");
        const result = allUser.filter(item => (item.name || "").toLowerCase().includes(keyWord.toLowerCase()));
        const msg = result.reduce((i, user) => i += `\n╭الاسم: ${user.name}\n╰الايدي: ${user.userID}`, "");
        message.reply(result.length == 0 ? `❌ لم يتم العثور على مستخدم مع الكلمة الرئيسية المطابقة للاسم: ${keyWord} في قاعدة البيانات`  : `🔎 تم العثور على مستخدم مع الكلمة المطابقة للاسم ${keyWord} في قاعدة بيانات البوت : ${msg}`);
        break;
      }
      
      case "ban":
      case "حظر":
      case "بان":
      case "-b": {
        let uid, reason;
        if (event.type == "message_reply") {
          uid = event.messageReply.senderID;
          reason = args.slice(1).join(" ");
        }
        else if (Object.keys(event.mentions).length > 0) {
          const { mentions } = event;
          uid = Object.keys(mentions)[0];
          reason = args.slice(1).join(" ").replace(mentions[uid], "");
        }
        else if (args[1]) {
          uid = args[1];
          reason = args.slice(2).join(" ");
        }
        else return message.reply("حط ايدي او منشن شخص ما او رد عليه");

        if (!uid)
          return message.reply("حط ايدي او منشن حد ما او رد عليه");
        if (!reason) reason = "لا يوجد سبب محدد";
        reason = reason.replace(/\s+/g, ' ');

        const userData = await usersData.get(uid);
        const name = userData.name;
        const status = userData.banned.status;

        if (status)
          return message.reply(`تم حظر المستخدم الذي لديه معرف  [${uid} | ${name}] من قبل:\n» السبب: ${userData.banned.reason}
» التاريخ: ${userData.banned.date}`);
        const time = getTime("DD/MM/YYYY HH:mm:ss");
        await usersData.set(uid, {
          banned: {
            status: true,
            reason,
            date: time
          }
        });
        message.reply(`تم حظر المستخدم الذي لديه معرف [${name} |  ${uid}]:\n» السبب: ${reason} \n» التاريخ: ${time}`);
        break;
      }
      
      case "unban":
      case "الغاء":
      case "-u": {
        let uid;
        if (event.type == "message_reply") {
          uid = event.messageReply.senderID;
        }
        else if (Object.keys(event.mentions).length > 0) {
          const { mentions } = event;
          uid = Object.keys(mentions)[0];
        }
        else if (args[1]) {
          uid = args[1];
        }
        else
          return message.reply("حط ايدي او منشن حد ما او رد عليه")
        if (!uid)
          return message.reply("حط ايدي او منشن حد ما او رد عليه");
        const userData = await usersData.get(uid);
        const name = userData.name;
        const status = userData.banned.status;
        if (!status)
          return message.reply(`المستخدم الذي لديه معرف ${uid} | ${name} ليس محظورا مسبقا`);
        await usersData.set(uid, {
          banned: {}
        });
        message.reply(`تم الغاء الحظر على المسخدم
            [${name} | ${uid}]          `);
        break;
      }
      default:
        return message.reply(`استعمال خاطئ للامر
        المرجو استعمال
        ban او unban او search`)
    }
  }
};