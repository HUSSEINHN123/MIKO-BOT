const fs = require("fs-extra");

// ══════════════════════════════════════════════════════
// 📊 تخزين الإحصائيات
// ══════════════════════════════════════════════════════
global.userStats = global.userStats || new Map();

// ══════════════════════════════════════════════════════
// 🎧 Event Listener - تسجيل النشاطات
// ══════════════════════════════════════════════════════
module.exports.handleEvent = async function({ api, event, threadsData }) {
  const { threadID, senderID, type, messageID } = event;
  
  // إنشاء مفتاح فريد لكل مستخدم في كل مجموعة
  const statsKey = `${threadID}_${senderID}`;
  
  // جلب أو إنشاء إحصائيات المستخدم
  if (!global.userStats.has(statsKey)) {
    global.userStats.set(statsKey, {
      threadID,
      userID: senderID,
      messages: 0,
      reactions: 0,
      deletedMessages: 0,
      lastActive: Date.now()
    });
  }
  
  const stats = global.userStats.get(statsKey);
  
  // ══════════════════════════════════════════════════════
  // 💬 عد الرسائل
  // ══════════════════════════════════════════════════════
  if (type === "message" || type === "message_reply") {
    stats.messages++;
    stats.lastActive = Date.now();
    
    // حفظ في قاعدة البيانات
    try {
      const threadData = await threadsData.get(threadID);
      if (!threadData.data) await threadsData.set(threadID, {}, "data");
      if (!threadData.data.userStats) await threadsData.set(threadID, {}, "data.userStats");
      
      await threadsData.set(threadID, stats, `data.userStats.${senderID}`);
    } catch (err) {
      console.error("Error saving stats:", err);
    }
  }
  
  // ══════════════════════════════════════════════════════
  // ❤️ عد التفاعلات
  // ══════════════════════════════════════════════════════
  if (type === "message_reaction") {
    stats.reactions++;
    stats.lastActive = Date.now();
    
    try {
      const threadData = await threadsData.get(threadID);
      if (!threadData.data) await threadsData.set(threadID, {}, "data");
      if (!threadData.data.userStats) await threadsData.set(threadID, {}, "data.userStats");
      
      await threadsData.set(threadID, stats, `data.userStats.${senderID}`);
    } catch (err) {
      console.error("Error saving reaction stats:", err);
    }
  }
  
  // ══════════════════════════════════════════════════════
  // 🗑️ عد الرسائل المحذوفة
  // ══════════════════════════════════════════════════════
  if (type === "message_unsend") {
    stats.deletedMessages++;
    stats.lastActive = Date.now();
    
    try {
      const threadData = await threadsData.get(threadID);
      if (!threadData.data) await threadsData.set(threadID, {}, "data");
      if (!threadData.data.userStats) await threadsData.set(threadID, {}, "data.userStats");
      
      await threadsData.set(threadID, stats, `data.userStats.${senderID}`);
    } catch (err) {
      console.error("Error saving delete stats:", err);
    }
  }
};

// ══════════════════════════════════════════════════════
// 📊 أمر عرض الإحصائيات
// ══════════════════════════════════════════════════════
module.exports.config = {
  name: "احصائيات",
  Auth: 0,
  Multi: ["stats", "نشاط", "رسائل"],
  Owner: "Admin",
  Info: "عرض إحصائيات نشاط العضو في المجموعة",
  Class: "معلومات",
  How: "احصائيات [@منشن/رد]\nاحصائيات الكل",
  Time: 0
};

module.exports.onPick = async function({ api, sh, event, args, threadsData, usersData }) {
  const { threadID, senderID, messageReply, mentions } = event;
  
  try {
    // ══════════════════════════════════════════════════════
    // 📋 عرض إحصائيات جميع الأعضاء
    // ══════════════════════════════════════════════════════
    if (args[0] === "الكل" || args[0] === "all" || args[0] === "top") {
      const threadData = await threadsData.get(threadID);
      const allStats = threadData.data?.userStats || {};
      
      if (Object.keys(allStats).length === 0) {
        return sh.reply("📊 لا توجد إحصائيات محفوظة لهذه المجموعة");
      }
      
      // ترتيب حسب عدد الرسائل
      const sortedUsers = Object.entries(allStats)
        .sort((a, b) => b[1].messages - a[1].messages)
        .slice(0, 10); // أفضل 10 أعضاء
      
      let msg = `📊 أفضل 10 أعضاء نشاطاً:\n\n`;
      
      for (let i = 0; i < sortedUsers.length; i++) {
        const [userID, stats] = sortedUsers[i];
        const userName = await usersData.getName(userID);
        const rank = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
        
        msg += `${rank} ${userName}\n`;
        msg += `   💬 ${stats.messages} رسالة\n`;
        msg += `   ❤️ ${stats.reactions} تفاعل\n`;
        msg += `   🗑️ ${stats.deletedMessages} محذوفة\n\n`;
      }
      
      return sh.reply(msg);
    }
    
    // ══════════════════════════════════════════════════════
    // 👤 عرض إحصائيات عضو معين
    // ══════════════════════════════════════════════════════
    let targetUID;
    
    // تحديد المستخدم المستهدف
    if (messageReply) {
      targetUID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetUID = Object.keys(mentions)[0];
    } else if (args[0] && !isNaN(args[0])) {
      targetUID = args[0];
    } else {
      targetUID = senderID; // إحصائياته الخاصة
    }
    
    // جلب الإحصائيات من قاعدة البيانات
    const threadData = await threadsData.get(threadID);
    const userStatsData = threadData.data?.userStats?.[targetUID];
    
    // جلب من الذاكرة المؤقتة إذا لم توجد في قاعدة البيانات
    const statsKey = `${threadID}_${targetUID}`;
    const memoryStats = global.userStats.get(statsKey);
    
    const stats = userStatsData || memoryStats || {
      messages: 0,
      reactions: 0,
      deletedMessages: 0
    };
    
    const userName = await usersData.getName(targetUID);
    
    // حساب النسب
    const totalActivity = stats.messages + stats.reactions;
    const deleteRate = stats.messages > 0 
      ? ((stats.deletedMessages / stats.messages) * 100).toFixed(1)
      : 0;
    
    // بناء الرسالة
    let msg = `📊 إحصائيات ${userName}\n`;
    msg += `${'═'.repeat(30)}\n\n`;
    
    msg += `💬 الرسائل المرسلة: ${stats.messages}\n`;
    msg += `❤️ التفاعلات: ${stats.reactions}\n`;
    msg += `🗑️ الرسائل المحذوفة: ${stats.deletedMessages}\n\n`;
    
    msg += `📈 التحليل:\n`;
    msg += `├ إجمالي النشاط: ${totalActivity}\n`;
    msg += `└ معدل الحذف: ${deleteRate}%\n\n`;
    
    // تقييم النشاط
    let activityLevel;
    if (totalActivity >= 1000) activityLevel = "🔥 نشيط جداً";
    else if (totalActivity >= 500) activityLevel = "⭐ نشيط";
    else if (totalActivity >= 100) activityLevel = "✨ متوسط";
    else if (totalActivity >= 10) activityLevel = "💤 قليل النشاط";
    else activityLevel = "😴 غير نشيط";
    
    msg += `🎯 مستوى النشاط: ${activityLevel}`;
    
    // إرسال مع منشن
    if (targetUID !== senderID) {
      return api.sendMessage({
        body: msg,
        mentions: [{
          tag: userName,
          id: targetUID
        }]
      }, threadID);
    }
    
    return sh.reply(msg);
    
  } catch (err) {
    console.error("Stats command error:", err);
    return sh.reply("❌ حدث خطأ في جلب الإحصائيات: " + err.message);
  }
};

// ══════════════════════════════════════════════════════
// 🔄 حفظ الإحصائيات عند إيقاف البوت
// ══════════════════════════════════════════════════════
module.exports.onUnload = async function({ threadsData }) {
  try {
    // حفظ جميع الإحصائيات من الذاكرة إلى قاعدة البيانات
    for (const [key, stats] of global.userStats.entries()) {
      const { threadID, userID } = stats;
      
      const threadData = await threadsData.get(threadID);
      if (!threadData.data) await threadsData.set(threadID, {}, "data");
      if (!threadData.data.userStats) await threadsData.set(threadID, {}, "data.userStats");
      
      await threadsData.set(threadID, stats, `data.userStats.${userID}`);
    }
    
    console.log("✅ User stats saved successfully");
  } catch (err) {
    console.error("Error saving stats on unload:", err);
  }
};