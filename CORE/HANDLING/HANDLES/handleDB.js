const { db, config } = global;

const log = global.loading;

const { creatingThreadData, creatingUserData } = global.DBGRY.database;

module.exports = function({ usersData, threadsData, globalData, api }) {
  return async function(event) {
    const { threadID, isGroup } = event;
    const senderID = event.senderID || event.author || event.userID;


    if (threadID && isGroup && !db.allThreadData.some(t => t.threadID === threadID)) {
      try {
        if (global.temp.createThreadDataError.includes(threadID)) {
          return;
        }

        const findInCreatingThreadData = creatingThreadData.find(t => t.threadID === threadID);
        if (!findInCreatingThreadData) {
          const threadData = await threadsData.create(threadID);
          const Uc = config.DATABASE.type.substring(0, 3).toUpperCase();
          const Mc = config.DATABASE.type.replace(config.DATABASE.type.substring(0, 3), Uc);

          console.log(`New Thread: ${threadID} | ${threadData.threadName} | ${Mc}`, "DATABASE");
        } else {
          await findInCreatingThreadData.promise;
        }
      } catch (err) {
        global.temp.createThreadDataError.push(threadID);
        console.log(err);
      }
    }


    if (senderID && !db.allUserData.some(u => u.userID === senderID)) {
      try {
        const findInCreatingUserData = creatingUserData.find(u => u.userID === senderID);
        if (!findInCreatingUserData) {
          const userData = await usersData.create(senderID);
          console.log(`New User: ${senderID} | ${userData.name} | ${config.DATABASE.type}`, "DATABASE");
        } else {
          await findInCreatingUserData.promise;
        }
      } catch (err) {
        console.log(err);
      }
    }
  };
};