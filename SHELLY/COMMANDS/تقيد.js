module.exports = {
  config: {
    name: "تقييد",
    Multi: ["restrict", "قيد", "lock", "unlock", "الغاء"],
    author: "GryKJ",
    cooldowns: 3,
    Auth: 2, // المطور فقط
    description: "تقييد البوت من الرد في المجموعة",
    Class: "المطور"
  },

  onPick: async function ({ args, threadsData, sh, event, api }) {
    const getTime = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    try {
      const type = args[0]?.toLowerCase();
      let tid, reason;

      // تحديد معرف المجموعة
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

      // الحصول على معلومات المجموعة
      const threadData = await threadsData.get(tid);
      const threadInfo = await api.getThreadInfo(tid);
      const threadName = threadInfo.threadName || threadData.threadName || "غير متوفر";
      const isRestricted = threadData.restricted?.status || false;

      switch (type) {
        case "lock":
        case "قيد":
        case "تقييد":
        case "-l": {
          if (isRestricted) {
            return sh.reply(`⚠️ المجموعة [${threadName}] مقيدة بالفعل

📌 تفاصيل التقييد:
┣ السبب: ${threadData.restricted.reason}
┣ التاريخ: ${threadData.restricted.date}
┗ المطور: ${threadData.restricted.by || "غير معروف"}`);
          }

          const time = getTime();
          const developerData = await api.getUserInfo(event.senderID);
          const developerName = developerData[event.senderID]?.name || "المطور";

          await threadsData.set(tid, {
            restricted: {
              status: true,
              reason: reason || "لا يوجد سبب محدد",
              date: time,
              by: developerName,
              developerID: event.senderID
            }
          });

          sh.reply(`🔒 تم تقييد البوت من المجموعة

📌 معلومات التقييد:
┣ المجموعة: ${threadName}
┣ المعرف: ${tid}
┣ السبب: ${reason || "لا يوجد سبب محدد"}
┣ التاريخ: ${time}
┗ بواسطة: ${developerName}

⚠️ البوت لن يرد على أي أوامر في هذه المجموعة حتى يتم إلغاء التقييد`);
          break;
        }

        case "unlock":
        case "الغاء":
        case "الغاء_التقييد":
        case "فك":
        case "-u": {
          if (!isRestricted) {
            return sh.reply(`✅ المجموعة [${threadName}] غير مقيدة أصلاً!`);
          }

          const oldRestriction = threadData.restricted;
          
          await threadsData.set(tid, {
            restricted: {
              status: false
            }
          });

          sh.reply(`🔓 تم إلغاء التقييد عن البوت

📌 معلومات:
┣ المجموعة: ${threadName}
┣ المعرف: ${tid}
┣ كان مقيداً بسبب: ${oldRestriction.reason}
┣ تاريخ التقييد: ${oldRestriction.date}
┗ تم إلغاء التقييد: ${getTime()}

✅ البوت الآن يمكنه الرد على الأوامر في هذه المجموعة`);
          break;
        }

        case "check":
        case "فحص":
        case "حالة":
        case "-c": {
          if (!isRestricted) {
            return sh.reply(`✅ المجموعة [${threadName}] غير مقيدة

📌 المعلومات:
┣ اسم المجموعة: ${threadName}
┣ معرف المجموعة: ${tid}
┗ الحالة: نشط ✅`);
          }

          sh.reply(`🔒 المجموعة [${threadName}] مقيدة حالياً

📌 تفاصيل التقييد:
┣ السبب: ${threadData.restricted.reason}
┣ التاريخ: ${threadData.restricted.date}
┣ بواسطة: ${threadData.restricted.by || "غير معروف"}
┗ الحالة: مقيد 🔒`);
          break;
        }

        case "list":
        case "قائمة":
        case "المقيدة":
        case "-ls": {
          const allThreads = await threadsData.getAll();
          const restrictedThreads = allThreads.filter(t => t.restricted?.status === true);

          if (restrictedThreads.length === 0) {
            return sh.reply("✅ لا توجد مجموعات مقيدة حالياً!");
          }

          let message = `🔒 قائمة المجموعات المقيدة (${restrictedThreads.length})\n\n`;
          
          for (let i = 0; i < restrictedThreads.length; i++) {
            const thread = restrictedThreads[i];
            const info = await api.getThreadInfo(thread.threadID).catch(() => null);
            const name = info?.threadName || thread.threadName || "غير متوفر";
            
            message += `${i + 1}. ${name}\n`;
            message += `   ├ المعرف: ${thread.threadID}\n`;
            message += `   ├ السبب: ${thread.restricted.reason}\n`;
            message += `   └ التاريخ: ${thread.restricted.date}\n\n`;
          }

          sh.reply(message);
          break;
        }

        default:
          sh.reply(`⚠️ استخدام خاطئ للأمر

📝 الاستخدامات الصحيحة:

🔒 لتقييد المجموعة:
├ تقييد قيد [السبب]
├ تقييد lock [معرف المجموعة] [السبب]
└ restrict -l [السبب]

🔓 لإلغاء التقييد:
├ تقييد الغاء
├ تقييد unlock [معرف المجموعة]
└ restrict -u

🔍 لفحص الحالة:
├ تقييد فحص
└ restrict check

📋 لعرض القائمة:
├ تقييد قائمة
└ restrict list`);
      }
    } catch (error) {
      console.error("خطأ في أمر التقييد:", error);
      sh.reply("❌ حدث خطأ: " + error.message);
    }
  }
};