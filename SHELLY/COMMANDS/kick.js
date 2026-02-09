module.exports.config = {
  name: "طرد",
  Auth: 1,
  Owner: "Mirai Team",
  Info: "قم بإزالة الشخص الذي تريد إزالته من المجموعة عن طريق وضع علامة عليه أو الرد على رسالته",
  Class: "ادمنية الكروبات", 
  How: "[tag]", 
  Time: 0,
};

module.exports.hello = {
  "en": {
    "error": "خطأ! حدث خطأ. الرجاء معاودة المحاولة في وقت لاحق!",
    "needPermssion": "شدا سوي دصعدني ادمن اول !",
    "missingTag": "سوي تاك لواحد او رد عليه",
    "kickMessage": "هو من كتب علي نفسه الموت كان مزا جميل لكن للاسف اختار بنفسه 😐🏴‍☠️",
    "cantKickBot": "لايمكنك طرد البوت 🤖 هل انت ذكي؟",
    "cantKickOwner": "لايمكنك طرد المطور البوت يا ذكي 🙂",
    "botOwnerKick": "✅ مسؤول البوت قام بطرد العضو بنجاح"
  }
};

module.exports.onPick = async function({ api, event, threadsData, usersData }) {
  function getText(hi) {
    const mwa = global.shelly.cmds.get("طرد");
    return mwa.hello.en[hi];
  }
  
  const botID = api.getCurrentUserID();
  
  // قائمة مطورين البوت - ضع الـ ID الصحيح هنا
  const protectedUsers = [
    "61579845494950",
    "100089714870040" // حاول تجيب الـ ID الحقيقي من المجموعة
  ];
  
  // إضافة الـ IDs من الـ config
  if (global.config.OWNER) protectedUsers.push(global.config.OWNER);
  if (global.config.OWNERID) protectedUsers.push(global.config.OWNERID);
  if (global.config.ownerID) protectedUsers.push(global.config.ownerID);
  
  // إزالة التكرارات
  const uniqueProtected = [...new Set(protectedUsers)];
  
  console.log("🛡️ Protected users:", uniqueProtected); // للتأكد من الـ IDs
  
  const isBotOwner = uniqueProtected.includes(event.senderID);
  
  var mention = [];
  if (event.type === 'message_reply') {
    mention = [event.messageReply.senderID];
    console.log("👤 Trying to kick (reply):", event.messageReply.senderID);
  } else if (event.mentions) {
    mention = Object.keys(event.mentions);
    console.log("👤 Trying to kick (mention):", mention);
  }
  
  try {
    const threadData = await threadsData.get(event.threadID);
    
    // التحقق من عدم وجود تاك أو رد
    if (!mention || mention.length === 0) {
      return api.sendMessage(getText("missingTag"), event.threadID, event.messageID);
    }
    
    // فحص إذا كان يحاول طرد البوت
    if (mention.includes(botID)) {
      console.log("❌ Attempt to kick bot blocked");
      return api.sendMessage(getText("cantKickBot"), event.threadID, event.messageID);
    }
    
    // فحص إذا كان يحاول طرد أي مطور من المطورين
    for (const uid of mention) {
      if (uniqueProtected.includes(uid)) {
        console.log("❌ Attempt to kick protected user blocked:", uid);
        
        // إذا كان المطور نفسه يحاول طرد نفسه
        if (isBotOwner && uid === event.senderID) {
          return api.sendMessage("😂 انت تحاول طرد نفسك يا مطور؟ ايش القصة!", event.threadID, event.messageID);
        }
        
        // إذا كان شخص آخر يحاول طرد المطور
        return api.sendMessage(getText("cantKickOwner"), event.threadID, event.messageID);
      }
    }
    
    // التحقق من الصلاحيات
    const isBotAdmin = threadData.adminIDs && threadData.adminIDs.includes(botID);
    
    // إذا كان مسؤول البوت، يقدر يطرد (ما عدا البوت والمطورين)
    if (isBotOwner) {
      let kickedCount = 0;
      
      // طرد الأشخاص المحددين
      for (const uid of mention) {
        // تجاهل البوت وجميع المطورين
        if (uid === botID || uniqueProtected.includes(uid)) {
          console.log("⏭️ Skipping protected user:", uid);
          continue;
        }
        
        try {
          console.log("✅ Kicking user:", uid);
          await api.removeUserFromGroup(uid, event.threadID);
          kickedCount++;
          
          // إرسال رسالة بعد الطرد
          setTimeout(() => {
            api.sendMessage(getText("kickMessage"), event.threadID);
          }, 500);
        } catch (err) {
          console.error(`❌ Error kicking user ${uid}:`, err);
        }
      }
      
      if (kickedCount === 0) {
        return api.sendMessage("⚠️ لم يتم طرد أي شخص (محمي)", event.threadID, event.messageID);
      }
      
      return;
    }
    
    // للمستخدمين العاديين (لازم البوت يكون أدمن)
    if (!isBotAdmin) {
      return api.sendMessage(getText("needPermssion"), event.threadID, event.messageID);
    }
    
    let kickedCount = 0;
    
    // طرد الأشخاص
    for (const uid of mention) {
      // تجاهل البوت وجميع المطورين
      if (uid === botID || uniqueProtected.includes(uid)) {
        console.log("⏭️ Skipping protected user:", uid);
        continue;
      }
      
      try {
        console.log("✅ Kicking user:", uid);
        await api.removeUserFromGroup(uid, event.threadID);
        kickedCount++;
        
        // إرسال رسالة بعد الطرد
        setTimeout(() => {
          api.sendMessage(getText("kickMessage"), event.threadID);
        }, 500);
      } catch (err) {
        console.error(`❌ Error kicking user ${uid}:`, err);
      }
    }
    
    if (kickedCount === 0) {
      return api.sendMessage("⚠️ لم يتم طرد أي شخص (محمي)", event.threadID, event.messageID);
    }
    
  } catch (err) {
    console.error("Kick command error:", err);
    return api.sendMessage(getText("error"), event.threadID, event.messageID);
  }
}