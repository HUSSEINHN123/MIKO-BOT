const fs = require("fs-extra");

// ══════════════════════════════════════════════════════
// 📊 تخزين الإحصائيات
// ══════════════════════════════════════════════════════
global.userStats = global.userStats || new Map();

// ══════════════════════════════════════════════════════
// 🎧 Event Listener - تسجيل النشاطات والعرض التلقائي
// ══════════════════════════════════════════════════════
module.exports.handleEvent = async function({ api, event, threadsData, usersData }) {
  const { threadID, senderID, type, messageID, messageReply, attachments } = event;
  
  // إنشاء مفتاح فريد لكل مستخدم في كل مجموعة
  const statsKey = `${threadID}_${senderID}`;
  
  // جلب أو إنشاء إحصائيات المستخدم
  if (!global.userStats.has(statsKey)) {
    try {
      const threadData = await threadsData.get(threadID);
      const savedStats = threadData.data?.userStats?.[senderID];
      
      if (savedStats) {
        global.userStats.set(statsKey, savedStats);
      } else {
        global.userStats.set(statsKey, {
          threadID,
          userID: senderID,
          messages: 0,
          reactions: 0,
          replies: 0,
          images: 0,
          deletedMessages: 0,
          points: 0,
          lastActive: Date.now()
        });
      }
    } catch (err) {
      global.userStats.set(statsKey, {
        threadID,
        userID: senderID,
        messages: 0,
        reactions: 0,
        replies: 0,
        images: 0,
        deletedMessages: 0,
        points: 0,
        lastActive: Date.now()
      });
    }
  }
  
  const stats = global.userStats.get(statsKey);
  
  // ══════════════════════════════════════════════════════
  // 💬 عد الرسائل وحساب النقاط
  // ══════════════════════════════════════════════════════
  if (type === "message" || type === "message_reply") {
    stats.messages++;
    stats.points += 1;
    stats.lastActive = Date.now();
    
    // عد الردود
    if (type === "message_reply" && messageReply) {
      stats.replies++;
      stats.points += 0.5; // نقطة إضافية للرد
    }
    
    // عد الصور
    if (attachments && attachments.length > 0) {
      const imageCount = attachments.filter(att => att.type === "photo").length;
      if (imageCount > 0) {
        stats.images += imageCount;
        stats.points += imageCount * 0.5; // نقطة لكل صورة
      }
    }
    
    // حفظ في قاعدة البيانات
    try {
      const threadData = await threadsData.get(threadID);
      if (!threadData.data) await threadsData.set(threadID, {}, "data");
      if (!threadData.data.userStats) await threadsData.set(threadID, {}, "data.userStats");
      
      await threadsData.set(threadID, stats, `data.userStats.${senderID}`);
    } catch (err) {
      console.error("Error saving stats:", err);
    }
    
    // ══════════════════════════════════════════════════════
    // 🎯 عرض الإحصائيات عندما يرد شخص على رسالة
    // ══════════════════════════════════════════════════════
    if (type === "message_reply" && messageReply && messageReply.senderID) {
      const repliedUserID = messageReply.senderID;
      
      // تجاهل إذا كان يرد على نفسه
      if (repliedUserID === senderID) return;
      
      // جلب إحصائيات الشخص الذي تم الرد عليه
      const repliedStatsKey = `${threadID}_${repliedUserID}`;
      
      try {
        const threadData = await threadsData.get(threadID);
        const repliedUserStats = threadData.data?.userStats?.[repliedUserID] || 
                                 global.userStats.get(repliedStatsKey) || {
          messages: 0,
          reactions: 0,
          replies: 0,
          images: 0,
          deletedMessages: 0,
          points: 0
        };
        
        const repliedUserName = await usersData.getName(repliedUserID);
        const points = Math.floor(repliedUserStats.points);
        
        // تحديد الرتبة
        let rank, rankEmoji;
        if (points >= 1000) {
          rank = "أسطوري";
          rankEmoji = "👑";
        } else if (points >= 500) {
          rank = "خبير";
          rankEmoji = "💎";
        } else if (points >= 250) {
          rank = "محترف";
          rankEmoji = "⭐";
        } else if (points >= 100) {
          rank = "نشيط";
          rankEmoji = "🔥";
        } else if (points >= 50) {
          rank = "متوسط";
          rankEmoji = "✨";
        } else {
          rank = "مبتدئ";
          rankEmoji = "🌱";
        }
        
        // بناء رسالة الإحصائيات
        let msg = `╭━━━━━━━━━━━━━━━━━━━━━╮\n`;
        msg += `│  📊 Member Activity  │\n`;
        msg += `╰━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
        
        msg += `👤 ${repliedUserName}\n`;
        msg += `${rankEmoji} ${rank} • ⭐ ${points} نقطة\n\n`;
        
        msg += `💬 الرسائل: ${repliedUserStats.messages}\n`;
        msg += `↩️ الردود: ${repliedUserStats.replies}\n`;
        msg += `❤️ التفاعلات: ${repliedUserStats.reactions}\n`;
        msg += `📷 الصور: ${repliedUserStats.images}\n`;
        msg += `🗑️ المحذوفة: ${repliedUserStats.deletedMessages}`;
        
        // إرسال الإحصائيات
        return api.sendMessage({
          body: msg,
          mentions: [{
            tag: repliedUserName,
            id: repliedUserID
          }]
        }, threadID);
        
      } catch (err) {
        console.error("Error showing stats:", err);
      }
    }
  }
  
  // ══════════════════════════════════════════════════════
  // ❤️ عد التفاعلات
  // ══════════════════════════════════════════════════════
  if (type === "message_reaction") {
    stats.reactions++;
    stats.points += 0.5;
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
    stats.points = Math.max(0, stats.points - 0.5);
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
// 📊 أمر عرض الإحصائيات اليدوي (اختياري)
// ══════════════════════════════════════════════════════
module.exports.config = {
  name: "احصائيات",
  Auth: 0,
  Multi: ["stats", "نشاط", "rank", "رتبة"],
  Owner: "Admin",
  Info: "عرض إحصائيات الأعضاء",
  Class: "معلومات",
  How: "احصائيات [@منشن]\nاحصائيات الكل",
  Time: 0
};

module.exports.onPick = async function({ api, sh, event, args, threadsData, usersData }) {
  const { threadID, senderID, messageReply, mentions } = event;
  
  try {
    // ══════════════════════════════════════════════════════
    // 📋 عرض أفضل 10 أعضاء
    // ══════════════════════════════════════════════════════
    if (args[0] === "الكل" || args[0] === "all" || args[0] === "top") {
      const threadData = await threadsData.get(threadID);
      const allStats = threadData.data?.userStats || {};
      
      if (Object.keys(allStats).length === 0) {
        return sh.reply("📊 لا توجد إحصائيات محفوظة لهذه المجموعة");
      }
      
      const sortedUsers = Object.entries(allStats)
        .sort((a, b) => b[1].points - a[1].points)
        .slice(0, 10);
      
      let msg = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`;
      msg += `│   🏆 TOP 10 MEMBERS   │\n`;
      msg += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
      
      for (let i = 0; i < sortedUsers.length; i++) {
        const [userID, stats] = sortedUsers[i];
        const userName = await usersData.getName(userID);
        const rank = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
        
        msg += `${rank} ${userName}\n`;
        msg += `   ⭐ ${Math.floor(stats.points)} | 💬 ${stats.messages}\n\n`;
      }
      
      return sh.reply(msg);
    }
    
    // ══════════════════════════════════════════════════════
    // 👤 عرض إحصائيات عضو معين
    // ══════════════════════════════════════════════════════
    let targetUID = senderID;
    
    if (messageReply) {
      targetUID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetUID = Object.keys(mentions)[0];
    }
    
    const threadData = await threadsData.get(threadID);
    const userStatsData = threadData.data?.userStats?.[targetUID];
    const statsKey = `${threadID}_${targetUID}`;
    const memoryStats = global.userStats.get(statsKey);
    
    const stats = userStatsData || memoryStats || {
      messages: 0,
      reactions: 0,
      replies: 0,
      images: 0,
      deletedMessages: 0,
      points: 0
    };
    
    const userName = await usersData.getName(targetUID);
    const points = Math.floor(stats.points);
    
    let rank, rankEmoji;
    if (points >= 1000) {
      rank = "أسطوري";
      rankEmoji = "👑";
    } else if (points >= 500) {
      rank = "خبير";
      rankEmoji = "💎";
    } else if (points >= 250) {
      rank = "محترف";
      rankEmoji = "⭐";
    } else if (points >= 100) {
      rank = "نشيط";
      rankEmoji = "🔥";
    } else if (points >= 50) {
      rank = "متوسط";
      rankEmoji = "✨";
    } else {
      rank = "مبتدئ";
      rankEmoji = "🌱";
    }
    
    let msg = `╭━━━━━━━━━━━━━━━━━━━━━━━╮\n`;
    msg += `│   📊 MEMBER STATS     │\n`;
    msg += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
    
    msg += `👤 ${userName}\n`;
    msg += `${rankEmoji} ${rank} • ⭐ ${points} نقطة\n\n`;
    
    msg += `💬 الرسائل: ${stats.messages}\n`;
    msg += `↩️ الردود: ${stats.replies}\n`;
    msg += `❤️ التفاعلات: ${stats.reactions}\n`;
    msg += `📷 الصور: ${stats.images}\n`;
    msg += `🗑️ المحذوفة: ${stats.deletedMessages}`;
    
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
    return sh.reply("❌ حدث خطأ: " + err.message);
  }
};

// ══════════════════════════════════════════════════════
// 🔄 حفظ الإحصائيات عند إيقاف البوت
// ══════════════════════════════════════════════════════
module.exports.onUnload = async function({ threadsData }) {
  try {
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