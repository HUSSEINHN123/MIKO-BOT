module.exports.config = {
  name: "حظر",
  Auth: 1, // للمسؤولين والمطور
  Owner: "Admin",
  Info: "حظر المستخدمين من البوت",
  Class: "الإدارة"
};

module.exports.onPick = async ({ event, api, args, usersData, threadsData, sh }) => {
  const { threadID, messageID, senderID, messageReply, mentions } = event;

  // تهيئة قاعدة البيانات
  if (!global.data) global.data = {};
  if (!global.data.bannedUsers) global.data.bannedUsers = {};

  const action = args[0]?.toLowerCase();

  // عرض القائمة الرئيسية
  if (!action) {
    return sh.reply(
      "🚫 نظام الحظر\n\n" +
      "الأوامر:\n" +
      "• حظر @منشن [السبب] - حظر مستخدم\n" +
      "• حظر الغاء @منشن - إلغاء الحظر\n" +
      "• حظر قائمة - عرض المحظورين\n" +
      "• حظر معلومات @منشن - معلومات الحظر\n\n" +
      "💡 أو رد على رسالة + حظر [السبب]"
    );
  }

  // إلغاء الحظر
  if (action === "الغاء" || action === "unban" || action === "فك") {
    let targetID = null;

    // الحصول على ID المستخدم
    if (messageReply) {
      targetID = messageReply.senderID;
    } else if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else {
      return sh.reply(
        "⚠️ الرجاء منشن المستخدم أو الرد على رسالته!\n\n" +
        "مثال: حظر الغاء @المستخدم"
      );
    }

    // التحقق من أن المستخدم محظور
    if (!global.data.bannedUsers[targetID]) {
      const userName = (await usersData.get(targetID))?.name || "المستخدم";
      return sh.reply(`ℹ️ ${userName} غير محظور أصلاً!`);
    }

    // إلغاء الحظر
    const bannedData = global.data.bannedUsers[targetID];
    delete global.data.bannedUsers[targetID];

    const userName = (await usersData.get(targetID))?.name || "المستخدم";
    
    return sh.reply(
      `✅ تم إلغاء حظر ${userName}\n\n` +
      `📋 كان محظوراً بسبب: ${bannedData.reason}\n` +
      `📅 تاريخ الحظر: ${bannedData.date}`
    );
  }

  // عرض قائمة المحظورين
  if (action === "قائمة" || action === "list" || action === "القائمة") {
    const bannedList = Object.keys(global.data.bannedUsers || {});

    if (bannedList.length === 0) {
      return sh.reply("✅ لا يوجد مستخدمين محظورين!");
    }

    let message = `🚫 قائمة المحظورين (${bannedList.length})\n`;
    message += `${"═".repeat(30)}\n\n`;

    for (let i = 0; i < Math.min(10, bannedList.length); i++) {
      const userID = bannedList[i];
      const banData = global.data.bannedUsers[userID];
      const userName = (await usersData.get(userID))?.name || "مستخدم محذوف";
      
      message += `${i + 1}. ${userName}\n`;
      message += `   💬 السبب: ${banData.reason}\n`;
      message += `   📅 التاريخ: ${banData.date}\n`;
      message += `   👤 بواسطة: ${banData.byName}\n\n`;
    }

    if (bannedList.length > 10) {
      message += `... و ${bannedList.length - 10} مستخدم آخر`;
    }

    return sh.reply(message);
  }

  // معلومات حظر مستخدم
  if (action === "معلومات" || action === "info" || action === "المعلومات") {
    let targetID = null;

    if (messageReply) {
      targetID = messageReply.senderID;
    } else if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else {
      return sh.reply("⚠️ الرجاء منشن المستخدم أو الرد على رسالته!");
    }

    const userName = (await usersData.get(targetID))?.name || "المستخدم";

    if (!global.data.bannedUsers[targetID]) {
      return sh.reply(`ℹ️ ${userName} غير محظور!`);
    }

    const banData = global.data.bannedUsers[targetID];
    
    let message = `📋 معلومات الحظر\n`;
    message += `${"═".repeat(30)}\n\n`;
    message += `👤 المستخدم: ${userName}\n`;
    message += `🆔 ID: ${targetID}\n`;
    message += `💬 السبب: ${banData.reason}\n`;
    message += `📅 التاريخ: ${banData.date}\n`;
    message += `👮 بواسطة: ${banData.byName}\n`;
    message += `🆔 ID المحظِر: ${banData.bannedBy}`;

    return sh.reply(message);
  }

  // حظر مستخدم
  let targetID = null;
  let reason = "لم يتم ذكر السبب";

  // الحصول على المستخدم المراد حظره
  if (messageReply) {
    targetID = messageReply.senderID;
    reason = args.join(" ") || reason;
  } else if (mentions && Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
    const mentionText = Object.values(mentions)[0];
    const fullText = args.join(" ");
    reason = fullText.replace(mentionText, "").replace("@", "").trim() || reason;
  } else {
    return sh.reply(
      "⚠️ الرجاء منشن المستخدم أو الرد على رسالته!\n\n" +
      "مثال:\n" +
      "• حظر @المستخدم السبب\n" +
      "• رد على رسالة + حظر السبب"
    );
  }

  // التحقق من عدم حظر المطور
  const adminIDs = global.config.AD || global.config.ADMIN || [];
  const madIDs = global.config.MAD || [];
  
  if (adminIDs.includes(targetID) || madIDs.includes(targetID)) {
    return sh.reply("❌ لا يمكن حظر المطور!");
  }

  // التحقق من عدم حظر النفس
  if (targetID === senderID) {
    return sh.reply("😅 لا يمكنك حظر نفسك!");
  }

  // التحقق إذا كان محظور مسبقاً
  if (global.data.bannedUsers[targetID]) {
    const userName = (await usersData.get(targetID))?.name || "المستخدم";
    return sh.reply(
      `⚠️ ${userName} محظور مسبقاً!\n\n` +
      `📋 السبب: ${global.data.bannedUsers[targetID].reason}\n` +
      `📅 التاريخ: ${global.data.bannedUsers[targetID].date}\n\n` +
      `💡 استخدم: حظر الغاء @${userName}`
    );
  }

  // حظر المستخدم
  const currentDate = new Date().toLocaleString('ar-EG', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  const bannerName = (await usersData.get(senderID))?.name || "المسؤول";
  const targetName = (await usersData.get(targetID))?.name || "المستخدم";

  global.data.bannedUsers[targetID] = {
    reason: reason,
    date: currentDate,
    bannedBy: senderID,
    byName: bannerName,
    timestamp: Date.now()
  };

  // رسالة التأكيد
  return sh.reply(
    `🚫 تم حظر ${targetName}\n\n` +
    `💬 السبب: ${reason}\n` +
    `📅 التاريخ: ${currentDate}\n` +
    `👮 بواسطة: ${bannerName}\n\n` +
    `⚠️ لن يتمكن من استخدام البوت بعد الآن`
  );
};

module.exports.Reply = async ({ event, api, Reply, sh }) => {
  // يمكن إضافة منطق للردود هنا إذا لزم الأمر
};

module.exports.All = async ({ event, api, sh }) => {
  // يمكن إضافة منطق للرسائل العامة هنا إذا لزم الأمر
};