let cmd = {
    config: {
        name: "welcome",
        Type: ["log:subscribe"]
    }, 

    Event: async function ({ api , sh , threadsData, usersData, event }) {
        const { threadID } = event;

        const { PREFIX, BOTNAME } = global.config;

        const added = event.logMessageData.addedParticipants;

        if (added.some(item => item.userFbId == config.shellyID)) {

            if (BOTNAME) api.changeNickname(BOTNAME, threadID, config.shellyID);

            api.sendMessage(`⚝ ${threadID} ⚝`, config.TID);

            sh.send(`تم تفعيل شيلي بنجاح ✅

  البادئة الخاصة بي هي [ ${PREFIX} ]  ↬
        `)

        } else if (added.some(item => item.userFbId == config.OWNERID)) return sh.send("❤️😭 مرحباً، سيدي")
        else {
            let msg;
            let threadDat = await threadsData.get(event.threadID);
            let threadData = threadDat.data; 
            
            if (threadDat?.settings?.sendWelcomeMessage == false) return;

            (!threadData.customJoin) 
                ? msg = "🍭مرحبا بك سنفوري انا دورا 🇸🇩" 
                : msg = threadData.customJoin;

            sh.send(msg);
        }
    }
}

module.exports = cmd;
