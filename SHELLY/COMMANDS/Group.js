module.exports.config = {
  name: "مجموعاتي",
  Auth: 2,
  Owner: "Admin",
  Info: "إدارة مجموعات البوت",
  Class: "الإدارة"
};

module.exports.onPick = async ({ event, api, args }) => {
  const { threadID, messageID, senderID } = event;

  // التحقق من أن المستخدم هو المطور
  const adminIDs = global.config.OWNER || global.config.ADMIN || global.config.AD || [];
  if (!adminIDs.includes(senderID)) {
    return api.sendMessage("⚠️ هذا الأمر متاح للمطور فقط!", threadID, messageID);
  }

  const action = args[0]?.toLowerCase();

  // القائمة الرئيسية
  if (!action) {
    return api.sendMessage(
      "📋 إدارة مجموعات البوت\n\n" +
      "الأوامر:\n" +
      "• مجموعاتي عرض - عرض كل المجموعات\n" +
      "• مجموعاتي مغادرة [رقم] - مغادرة مجموعة\n" +
      "• مجموعاتي قبول - قبول طلبات الانضمام\n" +
      "• مجموعاتي رفض - رفض طلبات الانضمام",
      threadID,
      messageID
    );
  }

  // عرض المجموعات
  if (action === "عرض" || action === "list" || action === "قائمة") {
    const waitMsg = await api.sendMessage("⏳ جاري جلب المجموعات...", threadID);
    
    try {
      // جلب قائمة المحادثات
      let allThreads = [];
      
      try {
        allThreads = await api.getThreadList(100, null, ["INBOX"]);
      } catch (e1) {
        console.log("Error method 1:", e1.message);
        try {
          allThreads = await api.getThreadList(100, null, []);
        } catch (e2) {
          console.log("Error method 2:", e2.message);
        }
      }

      console.log("Total threads:", allThreads?.length || 0);

      // فلترة المجموعات فقط
      const groups = [];
      
      if (allThreads && Array.isArray(allThreads)) {
        for (let thread of allThreads) {
          // التحقق من أن هذه مجموعة
          if (thread && (thread.isGroup === true || thread.threadType === 2)) {
            groups.push(thread);
          }
        }
      }

      console.log("Groups found:", groups.length);

      api.unsendMessage(waitMsg.messageID);

      if (!groups || groups.length === 0) {
        return api.sendMessage(
          "📭 لا توجد مجموعات!\n\n" +
          "💡 تأكد من:\n" +
          "• البوت موجود في مجموعات\n" +
          "• الصلاحيات صحيحة",
          threadID,
          messageID
        );
      }

      // ترتيب المجموعات حسب عدد الأعضاء
      groups.sort((a, b) => {
        const countA = a.participantIDs?.length || a.userInfo?.length || 0;
        const countB = b.participantIDs?.length || b.userInfo?.length || 0;
        return countB - countA;
      });

      // حفظ المجموعات للاستخدام لاحقاً
      if (!global.groupsData) global.groupsData = {};
      global.groupsData[senderID] = groups;

      let message = `📋 قائمة المجموعات (${groups.length})\n`;
      message += `${"═".repeat(30)}\n\n`;

      // عرض أول 10 مجموعات
      const limit = Math.min(10, groups.length);
      for (let i = 0; i < limit; i++) {
        const group = groups[i];
        const groupName = group.name || group.threadName || "بدون اسم";
        const memberCount = group.participantIDs?.length || group.userInfo?.length || 0;
        
        message += `${i + 1}. ${groupName}\n`;
        message += `   👥 ${memberCount} عضو\n`;
        message += `   🆔 ${group.threadID}\n\n`;
      }

      if (groups.length > 10) {
        message += `... و ${groups.length - 10} مجموعة أخرى\n\n`;
      }

      message += `💡 مجموعاتي مغادرة [رقم]`;

      return api.sendMessage(message, threadID, messageID);

    } catch (error) {
      console.error("Error in عرض:", error);
      api.unsendMessage(waitMsg.messageID);
      return api.sendMessage(
        `❌ خطأ: ${error.message}\n\n` +
        `تفاصيل: ${error.stack?.split('\n')[0] || 'غير متوفر'}`,
        threadID,
        messageID
      );
    }
  }

  // مغادرة مجموعة
  else if (action === "مغادرة" || action === "leave" || action === "خروج") {
    if (!args[1]) {
      return api.sendMessage(
        "⚠️ الرجاء تحديد رقم المجموعة!\n\n" +
        "مثال: مجموعاتي مغادرة 3\n\n" +
        "📝 استخدم: مجموعاتي عرض",
        threadID,
        messageID
      );
    }

    const groupNumber = parseInt(args[1]);

    if (isNaN(groupNumber) || groupNumber < 1) {
      return api.sendMessage(
        "❌ رقم غير صحيح!\n\nمثال: مجموعاتي مغادرة 3",
        threadID,
        messageID
      );
    }

    try {
      // استخدام المجموعات المحفوظة
      let groups = global.groupsData?.[senderID] || [];

      // إذا لم تكن محفوظة، جلبها
      if (groups.length === 0) {
        const waitMsg = await api.sendMessage("⏳ جاري جلب المجموعات...", threadID);
        
        try {
          const allThreads = await api.getThreadList(100, null, ["INBOX"]) || [];
          groups = allThreads.filter(t => t && (t.isGroup === true || t.threadType === 2));
          
          groups.sort((a, b) => {
            const countA = a.participantIDs?.length || a.userInfo?.length || 0;
            const countB = b.participantIDs?.length || b.userInfo?.length || 0;
            return countB - countA;
          });

          global.groupsData[senderID] = groups;
        } catch (e) {
          api.unsendMessage(waitMsg.messageID);
          return api.sendMessage("❌ فشل جلب المجموعات", threadID, messageID);
        }
        
        api.unsendMessage(waitMsg.messageID);
      }

      if (groupNumber > groups.length) {
        return api.sendMessage(
          `❌ رقم خاطئ! اختر بين 1 و ${groups.length}`,
          threadID,
          messageID
        );
      }

      const selectedGroup = groups[groupNumber - 1];
      
      if (!selectedGroup) {
        return api.sendMessage("❌ المجموعة غير موجودة!", threadID, messageID);
      }

      const groupName = selectedGroup.name || selectedGroup.threadName || "بدون اسم";
      const memberCount = selectedGroup.participantIDs?.length || selectedGroup.userInfo?.length || 0;

      const confirmMsg = `⚠️ تأكيد المغادرة؟\n\n` +
        `📌 ${groupName}\n` +
        `👥 ${memberCount} عضو\n` +
        `🆔 ${selectedGroup.threadID}\n\n` +
        `رد بـ "نعم" أو "لا"`;

      return api.sendMessage(confirmMsg, threadID, (err, info) => {
        if (!err && info) {
          global.client.handleReply.push({
            name: "مجموعاتي",
            messageID: info.messageID,
            author: senderID,
            type: "confirm_leave",
            groupData: selectedGroup
          });
        }
      }, messageID);

    } catch (error) {
      console.error("Error in مغادرة:", error);
      return api.sendMessage(`❌ خطأ: ${error.message}`, threadID, messageID);
    }
  }

  // قبول الطلبات
  else if (action === "قبول" || action === "approve") {
    const waitMsg = await api.sendMessage("⏳ جاري البحث عن الطلبات...", threadID);
    
    try {
      let pending = [];
      
      try {
        const allPending = await api.getThreadList(50, null, ["PENDING"]);
        pending = allPending.filter(t => t && (t.isGroup === true || t.threadType === 2));
      } catch (e) {
        console.log("No pending threads:", e.message);
      }

      api.unsendMessage(waitMsg.messageID);

      if (pending.length === 0) {
        return api.sendMessage("📭 لا توجد طلبات معلقة!", threadID, messageID);
      }

      let msg = `📨 طلبات معلقة (${pending.length})\n${"═".repeat(30)}\n\n`;
      
      for (let i = 0; i < Math.min(5, pending.length); i++) {
        msg += `${i + 1}. ${pending[i].name || "بدون اسم"}\n`;
        msg += `   🆔 ${pending[i].threadID}\n\n`;
      }

      return api.sendMessage(msg, threadID, messageID);

    } catch (error) {
      api.unsendMessage(waitMsg.messageID);
      return api.sendMessage(`❌ خطأ: ${error.message}`, threadID, messageID);
    }
  }

  // رفض الطلبات
  else if (action === "رفض" || action === "reject") {
    return api.sendMessage("⚠️ هذه الميزة قيد التطوير", threadID, messageID);
  }

  else {
    return api.sendMessage(
      "❌ أمر غير معروف!\n\n" +
      "الأوامر المتاحة:\n" +
      "• عرض\n• مغادرة [رقم]\n• قبول\n• رفض",
      threadID,
      messageID
    );
  }
};

module.exports.handleReply = async ({ event, api, handleReply }) => {
  const { threadID, messageID, senderID, body } = event;

  // التحقق من الصلاحية
  const adminIDs = global.config.OWNER || global.config.ADMIN || global.config.AD || [];
  if (!adminIDs.includes(senderID) || handleReply.author !== senderID) {
    return;
  }

  if (handleReply.type === "confirm_leave") {
    const choice = body.toLowerCase().trim();

    if (choice === "نعم" || choice === "yes" || choice === "1") {
      const group = handleReply.groupData;
      
      if (!group || !group.threadID) {
        return api.sendMessage("❌ خطأ في بيانات المجموعة!", threadID, messageID);
      }

      const waitMsg = await api.sendMessage("⏳ جاري المغادرة...", threadID);

      try {
        await api.removeUserFromGroup(api.getCurrentUserID(), group.threadID);
        
        api.unsendMessage(waitMsg.messageID);
        
        return api.sendMessage(
          `✅ تم المغادرة بنجاح!\n\n` +
          `📌 ${group.name || group.threadName || "المجموعة"}\n` +
          `🆔 ${group.threadID}`,
          threadID,
          messageID
        );
      } catch (error) {
        api.unsendMessage(waitMsg.messageID);
        return api.sendMessage(
          `❌ فشلت المغادرة!\n\nالخطأ: ${error.message}`,
          threadID,
          messageID
        );
      }
    } 
    else if (choice === "لا" || choice === "no" || choice === "2") {
      return api.sendMessage("❌ تم الإلغاء", threadID, messageID);
    }
    else {
      return api.sendMessage("⚠️ رد بـ 'نعم' أو 'لا'", threadID, messageID);
    }
  }
};