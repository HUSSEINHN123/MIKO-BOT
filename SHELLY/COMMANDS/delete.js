module.exports.config = {
  name: "احذف",
  Auth: 1,
  Multi: ["حذف", "احذف", "مسح", "امسح", "delete"],
  Owner: "𝙈𝙧𝙏𝙤𝙢𝙓𝙭𝙓",
  Info: "حذف أي رسالة (للبوت أو للأعضاء)",
  Class: "اعدادات",
  How: "رد على رسالة",
  Time: 0
};

module.exports.onPick = async function({ api, event }) {
  // التحقق من وجود رد على رسالة
  if (!event.messageReply) {
    return api.sendMessage("⚠️ رد على الرسالة اللي بدك تحذفها", event.threadID, event.messageID);
  }

  const botID = api.getCurrentUserID();
  const repliedMessageID = event.messageReply.messageID;
  const repliedSenderID = event.messageReply.senderID;

  try {
    // حذف الرسالة (تشتغل للكل)
    await api.unsendMessage(repliedMessageID);
    
    // رد تأكيد
    const confirmMsg = await api.sendMessage(
      `✅ تم حذف الرسالة بنجاح!`,
      event.threadID
    );

    // حذف رسالة التأكيد بعد 3 ثواني
    setTimeout(() => {
      api.unsendMessage(confirmMsg.messageID);
    }, 3000);

  } catch (error) {
    console.error("Error deleting message:", error);
    
    // رسائل خطأ مفصلة
    let errorMsg = "❌ فشل حذف الرسالة!\n\n";
    
    if (repliedSenderID !== botID) {
      errorMsg += "⚠️ السبب المحتمل:\n";
      errorMsg += "• البوت مش أدمن في المجموعة\n";
      errorMsg += "• ما عندو صلاحية حذف رسائل الأعضاء\n";
      errorMsg += "• الرسالة محذوفة مسبقاً\n\n";
      errorMsg += "💡 الحل: خلي البوت أدمن في المجموعة";
    } else {
      errorMsg += "⚠️ الرسالة ممكن تكون محذوفة مسبقاً";
    }
    
    api.sendMessage(errorMsg, event.threadID, event.messageID);
  }
};