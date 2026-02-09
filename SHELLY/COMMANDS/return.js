const fs = require("fs-extra");

// ══════════════════════════════════════════════════════
// 📦 تخزين الرسائل مؤقتاً
// ══════════════════════════════════════════════════════
global.messageCache = global.messageCache || new Map();

// ══════════════════════════════════════════════════════
// 🎧 Event Listener - حفظ الرسائل
// ══════════════════════════════════════════════════════
module.exports.handleEvent = async function({ api, event, usersData }) {
  // حفظ الرسالة عند إرسالها
  if (event.type === "message" || event.type === "message_reply") {
    const messageData = {
      messageID: event.messageID,
      threadID: event.threadID,
      senderID: event.senderID,
      body: event.body || "",
      attachments: event.attachments || [],
      timestamp: Date.now(),
      isGroup: event.isGroup
    };
    
    // حفظ في الذاكرة المؤقتة
    global.messageCache.set(event.messageID, messageData);
    
    // حذف الرسائل القديمة (أكثر من ساعة)
    const oneHour = 60 * 60 * 1000;
    for (const [msgID, data] of global.messageCache.entries()) {
      if (Date.now() - data.timestamp > oneHour) {
        global.messageCache.delete(msgID);
      }
    }
  }
  
  // عند حذف رسالة
  if (event.type === "message_unsend") {
    const deletedMsg = global.messageCache.get(event.messageID);
    
    if (!deletedMsg) return; // الرسالة غير محفوظة
    
    try {
      const senderName = await usersData.getName(deletedMsg.senderID);
      const deleterName = await usersData.getName(event.senderID);
      
      let replyMsg = `🗑️ رسالة محذوفة!\n\n`;
      replyMsg += `👤 المرسل: ${senderName}\n`;
      replyMsg += `🚫 المحذِف: ${deleterName}\n`;
      replyMsg += `📅 الوقت: ${new Date(deletedMsg.timestamp).toLocaleString('ar-EG')}\n`;
      
      if (deletedMsg.body) {
        replyMsg += `\n💬 المحتوى:\n${deletedMsg.body}`;
      }
      
      // إرسال الرسالة
      if (deletedMsg.attachments && deletedMsg.attachments.length > 0) {
        const attachmentURLs = deletedMsg.attachments.map(att => att.url).filter(Boolean);
        
        if (attachmentURLs.length > 0) {
          replyMsg += `\n\n📎 المرفقات: ${attachmentURLs.length}`;
          
          // إرسال مع المرفقات
          const streams = await Promise.all(
            attachmentURLs.map(url => global.funcs.streamURL(url, 'jpg'))
          );
          
          api.sendMessage({
            body: replyMsg,
            attachment: streams
          }, deletedMsg.threadID);
        } else {
          api.sendMessage(replyMsg, deletedMsg.threadID);
        }
      } else {
        api.sendMessage(replyMsg, deletedMsg.threadID);
      }
      
    } catch (err) {
      console.error("Error handling unsend:", err);
    }
  }
};

// ══════════════════════════════════════════════════════
// 🔧 أمر إرجاع الرسالة المحذوفة يدوياً
// ══════════════════════════════════════════════════════
module.exports.config = {
  name: "ارجاع",
  Auth: 0,
  Multi: ["استرجاع", "unsend", "retrieve"],
  Owner: "Admin",
  Info: "عرض آخر رسالة محذوفة في المجموعة",
  Class: "أدوات",
  How: "ارجاع",
  Time: 0
};

module.exports.onPick = async function({ api, sh, event, usersData }) {
  try {
    // البحث عن آخر رسالة محذوفة في المجموعة
    let lastDeleted = null;
    let latestTime = 0;
    
    for (const [msgID, data] of global.messageCache.entries()) {
      if (data.threadID === event.threadID && data.timestamp > latestTime) {
        latestTime = data.timestamp;
        lastDeleted = data;
      }
    }
    
    if (!lastDeleted) {
      return sh.reply("❌ لا توجد رسائل محذوفة محفوظة في الذاكرة المؤقتة");
    }
    
    const senderName = await usersData.getName(lastDeleted.senderID);
    
    let msg = `📨 آخر رسالة محذوفة:\n\n`;
    msg += `👤 المرسل: ${senderName}\n`;
    msg += `📅 الوقت: ${new Date(lastDeleted.timestamp).toLocaleString('ar-EG')}\n`;
    
    if (lastDeleted.body) {
      msg += `\n💬 المحتوى:\n${lastDeleted.body}`;
    }
    
    // إرسال مع المرفقات إن وجدت
    if (lastDeleted.attachments && lastDeleted.attachments.length > 0) {
      const attachmentURLs = lastDeleted.attachments.map(att => att.url).filter(Boolean);
      
      if (attachmentURLs.length > 0) {
        msg += `\n\n📎 المرفقات: ${attachmentURLs.length}`;
        
        try {
          const streams = await Promise.all(
            attachmentURLs.map(url => global.funcs.streamURL(url, 'jpg'))
          );
          
          return sh.reply({
            body: msg,
            attachment: streams
          });
        } catch (err) {
          console.error("Error loading attachments:", err);
          msg += `\n⚠️ فشل تحميل المرفقات`;
        }
      }
    }
    
    return sh.reply(msg);
    
  } catch (err) {
    console.error("Retrieve command error:", err);
    return sh.reply("❌ حدث خطأ: " + err.message);
  }
};