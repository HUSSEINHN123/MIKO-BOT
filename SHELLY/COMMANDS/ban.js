module.exports = {
  config: {
    name: "المستخدم",
    Multi: ["user", "thread", "غروب", "مجموعة"],
    author: "GryKJ",
    cooldowns: 5,
    Auth: 2,
    description: "ادارة المستخدمين [حظر-بحث]",
    Class: "المطور"
  },

  onPick: async function ({ args, usersData, threadsData, sh, event, command }) {
    const getTime = (format) => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    const type = args[0];
    
    if (["thread", "غروب", "مجموعة"].includes(command)) {
      try {
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
            } else {
              tid = event.threadID;
              reason = "لا يوجد سبب محدد";
            }
            
            const threadData = await threadsData.get(tid);
            const name = threadData.threadName || "غير متوفر";
            const status = threadData.banned?.status;

            if (status) {
              return sh.reply(`تم حظر الغروب الذي لديه معرف [${tid} | ${name}] من قبل:\n» السبب: ${threadData.banned.reason}\n» التاريخ: ${threadData.banned.date}`);
            }
            
            const time = getTime();
            await threadsData.set(tid, {
              banned: {
                status: true,
                reason,
                date: time
              }
            });
            sh.reply(`تم حظر الغروب الذي لديه معرف [${name} | ${tid}]:\n» السبب: ${reason}\n» التاريخ: ${time}`);
            break;
          }
          
          case "unban":
          case "الغاء":
          case "-u": { 
            let tid;
            if (!isNaN(args[1])) {
              tid = args[1];
            } else {
              tid = event.threadID;
            }
            
            const threadData = await threadsData.get(tid);
            const name = threadData.threadName || "غير متوفر";
            const status = threadData.banned?.status;
            
            if (!status) {
              return sh.reply(`الغروب الذي لديه معرف ${tid} | ${name} ليس محظورا مسبقا`);
            }
            
            await threadsData.set(tid, {
              banned: {}
            });
            sh.reply(`تم الغاء الحظر على الغروب\n[${name} | ${tid}]`);
            break;
          }
          
          default:
            sh.reply(`استعمال خاطئ للامر\nالمرجو استعمال\nban او unban`);
        }
      } catch (error) {
        console.error(error);
        sh.reply("حدث خطأ: " + error.message);
      }
      return;
    }

    try {
      switch (type) {
        case "بحث":
        case "find":
        case "-f":
        case "search":
        case "-s": {
          const allUser = await usersData.getAll();
          const keyWord = args.slice(1).join(" ");
          
          if (!keyWord) {
            return sh.reply("يرجى إدخال كلمة للبحث");
          }
          
          const result = allUser.filter(item => (item.name || "").toLowerCase().includes(keyWord.toLowerCase()));
          const msg = result.reduce((i, user) => i += `\n╭الاسم: ${user.name}\n╰الايدي: ${user.userID}`, "");
          
          sh.reply(result.length == 0 ? `❌ لم يتم العثور على مستخدم مع الكلمة الرئيسية المطابقة للاسم: ${keyWord} في قاعدة البيانات` : `🔎 تم العثور على ${result.length} مستخدم مع الكلمة المطابقة للاسم ${keyWord} في قاعدة بيانات البوت:${msg}`);
          break;
        }
        
        case "ban":
        case "حظر":
        case "بان":
        case "-b": {
          let uid, reason;
          
          if (event.messageReply) {
            uid = event.messageReply.senderID;
            reason = args.slice(1).join(" ");
          } else if (event.mentions && Object.keys(event.mentions).length > 0) {
            uid = Object.keys(event.mentions)[0];
            reason = args.slice(1).join(" ").replace(event.mentions[uid], "");
          } else if (args[1] && !isNaN(args[1])) {
            uid = args[1];
            reason = args.slice(2).join(" ");
          } else {
            return sh.reply("حط ايدي او منشن شخص ما او رد عليه");
          }

          if (!uid) {
            return sh.reply("حط ايدي او منشن حد ما او رد عليه");
          }
          
          if (!reason) reason = "لا يوجد سبب محدد";
          reason = reason.replace(/\s+/g, ' ').trim();

          const userData = await usersData.get(uid);
       