module.exports = {
  config: {
    name: "طرد",
    Multi: ["kick", "remove", "إزالة"],
    author: "GryKJ",
    cooldowns: 5,
    Auth: 1,
    description: "طرد عضو من المجموعة",
    Class: "المجموعة"
  },

  onPick: async function ({ api, args, usersData, threadsData, sh, event, getDeveloper }) {
    const axios = require('axios');
    const fs = require('fs');
    const path = require('path');
    
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

    try {
      let uid, reason;
      
      // تحديد المستخدم المراد طرده
      if (event.messageReply) {
        uid = event.messageReply.senderID;
        reason = args.join(" ");
      } else if (event.mentions && Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
        reason = args.join(" ").replace(event.mentions[uid], "");
      } else if (args[0] && !isNaN(args[0])) {
        uid = args[0];
        reason = args.slice(1).join(" ");
      } else {
        return sh.reply("⚠️ يرجى منشن العضو أو الرد على رسالته أو كتابة معرفه");
      }

      if (!uid) {
        return sh.reply("⚠️ لم يتم العثور على المستخدم");
      }

      // الحصول على معرف البوت
      const botID = api.getCurrentUserID();
      
      // الحصول على قائمة المطورين
      const developers = getDeveloper || global.config?.developers || [];
      
      // التحقق من أن المستخدم ليس البوت
      if (uid === botID) {
        return sh.reply("❌ لا يمكنك طرد البوت من المجموعة! 🤖");
      }
      
      // التحقق من أن المستخدم ليس مطور
      if (developers.includes(uid)) {
        return sh.reply("❌ لا يمكنك طرد المطور من المجموعة! 👨‍💻");
      }

      // التحقق من صلاحيات البوت
      const threadInfo = await api.getThreadInfo(event.threadID);
      const isAdmin = threadInfo.adminIDs.some(admin => admin.id === botID);
      
      if (!isAdmin) {
        return sh.reply("❌ البوت ليس مشرفاً في المجموعة!");
      }

      // التحقق من أن المستخدم موجود في المجموعة
      const isInGroup = threadInfo.participantIDs.includes(uid);
      if (!isInGroup) {
        return sh.reply("❌ المستخدم غير موجود في المجموعة");
      }

      // الحصول على معلومات المستخدم
      const userData = await usersData.get(uid);
      const userName = userData?.name || "غير معروف";
      const kickerData = await usersData.get(event.senderID);
      const kickerName = kickerData?.name || "غير معروف";
      
      if (!reason || reason.trim() === "") {
        reason = "لا يوجد سبب محدد";
      }
      reason = reason.trim();

      const currentTime = getTime();

      // تحميل صورة العضو المطرود
      const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const imagePath = path.join(__dirname, 'cache', `${uid}_avatar.jpg`);
      
      // إنشاء مجلد cache إذا لم يكن موجوداً
      if (!fs.existsSync(path.join(__dirname, 'cache'))) {
        fs.mkdirSync(path.join(__dirname, 'cache'));
      }

      // تحميل الصورة
      const writer = fs.createWriteStream(imagePath);
      const response = await axios({
        url: avatarUrl,
        method: 'GET',
        responseType: 'stream'
      });

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // طرد العضو
      await api.removeUserFromGroup(uid, event.threadID);

      // إرسال رسالة التأكيد مع الصورة
      const message = `✅ Hina ✅

- نحن أقوى من أن تدمرنا كلمات
يطلقها أشباه البشـــــر 📕🤝✨

‣ : اسمـك ‣ ${userName}

‣ : سبـب ‣ ${reason}

‣ : التاريـخ ‣ ${currentTime}

تمت إزالة ${userName} من المجموعة من قبل ${kickerName}`;

      await api.sendMessage({
        body: message,
        attachment: fs.createReadStream(imagePath)
      }, event.threadID);

      // حذف الصورة بعد الإرسال
      fs.unlinkSync(imagePath);

    } catch (error) {
      console.error("خطأ في أمر الطرد:", error);
      sh.reply("❌ حدث خطأ أثناء محاولة طرد العضو: " + error.message);
    }
  }
};