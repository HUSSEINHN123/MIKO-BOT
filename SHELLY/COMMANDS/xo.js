function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


global.game = new Object();
global.fff = new Array();


module.exports = {
  config: {
    name: "اكسو",
    Multi: ["xo"],
    Owner: "gpt",
    Auth: 0,
    Time: 5,
    Info: "لعبه اكس او انت والي تمنشنه",
    Class: "العاب"
  },


    onPick: async function ({ event, sh: message, usersData, args }) {
    
        const mention = Object.keys(event.mentions);

        if (args[0] === "انهاء") {
            if (!global.game.hasOwnProperty(event.threadID) || !global.game[event.threadID].on) {
                message.reply("لا توجد أي لعبة بادئة في هذا القروب 🔖");
            } else {
                if (event.senderID === global.game[event.threadID].player1.id || event.senderID === global.game[event.threadID].player2.id) {
                    const winner = event.senderID === global.game[event.threadID].player1.id ? global.game[event.threadID].player2 : global.game[event.threadID].player1;
                    message.reply(`الفائز هو ${winner.name}.`);
                    global.game[event.threadID].on = false;
                } else {
                    message.reply("ليس لديك أي لعبة بالمجموعة هذه.");
                }
            }
        } else {
            if (mention.length === 0) {
                message.reply("من فضلك منشن شخصاً ما 🔖");
            } else if (!global.game.hasOwnProperty(event.threadID) || !global.game[event.threadID].on) {
                let yet = await usersData.get(mention[0]);
                let yet2 = await usersData.get(event.senderID);
                if (!yet.gender)
                { await usersData.create(mention[0]);}
                else if (!yet2.gender) { await usersData.create(event.senderID);}
                global.game[event.threadID] = {
                    on: true,
                    board: "🔲🔲🔲\n🔲🔲🔲\n🔲🔲🔲",
                    bid: "",
                    board2: "123456789",
                    avcell: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
                    turn: mention[0],
                    player1: { id: mention[0], name: await usersData.getName(mention[0]) },
                    player2: { id: event.senderID, name: await usersData.getName(event.senderID) },
                    bidd: "❌",
                    ttrns: [],
                    counting: 0
                };
                message.send(global.game[event.threadID].board, (err, info) => {
                    global.game[event.threadID].bid = info.messageID;
                    global.fff.push(info.messageID);
                    
                });
            } else {
                message.reply("اللعبة بادئة بالفعل في هذا القروب.");
            }
        }
    },
    All: async function ({ event, sh: message }) {
        if (event.type === "message_reply" && global.game[event.threadID] && global.game[event.threadID].on) {
            if (event.messageReply.messageID === global.game[event.threadID].bid) {
                if (global.game[event.threadID].turn === event.senderID) {
                    if (["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(event.body)) {
                        if (global.game[event.threadID].avcell.includes(event.body)) {
                            global.game[event.threadID].avcell.splice(global.game[event.threadID].avcell.indexOf(event.body), 1);
                            let input2 = event.body * 2;
                            global.game[event.threadID].ttrns.forEach(e => {
                                if (e < event.body) {
                                    input2--;
                                }
                            });
                            if (["4", "5", "6"].includes(event.body)) {
                                input2++;
                            } else if (["7", "8", "9"].includes(event.body)) {
                                input2 += 2;
                            }
                            global.game[event.threadID].board = global.game[event.threadID].board.replaceAt("🔲", global.game[event.threadID].bidd, input2 - 2);
                            global.game[event.threadID].board2 = global.game[event.threadID].board2.replace(event.body, global.game[event.threadID].bidd);
                            message.send(global.game[event.threadID].board, (err, infos) => {
                                global.game[event.threadID].bid = infos.messageID;
                                global.fff.push(infos.messageID);
                            });
                            let winncomb = [
                                [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
                            ];
                            for (let i = 0; i < winncomb.length; i++) {
                                const [a, b, c] = winncomb[i];
                                if (global.game[event.threadID].board2[a] === global.game[event.threadID].bidd &&
                                    global.game[event.threadID].board2[b] === global.game[event.threadID].bidd &&
                                    global.game[event.threadID].board2[c] === global.game[event.threadID].bidd) {
                                    const winnerName = global.game[event.threadID].bidd === "❌" ? global.game[event.threadID].player1.name : global.game[event.threadID].player2.name;
                                    await delay(1000);
                                    message.send(`${winnerName} فاز باللعبة! 🚀🔖`);
                                    global.game[event.threadID].on = false;
                                    return;
                                }
                            }
                            if (global.game[event.threadID].counting === 8) {
                                await delay(1000);
                                message.send("روحو نامو تعادل 🌚🍻");
                                global.game[event.threadID].on = false;
                            } else {
                                global.game[event.threadID].counting++;
                                message.unsend(event.messageReply.messageID);
                                global.game[event.threadID].ttrns.push(event.body);
                                global.game[event.threadID].turn = global.game[event.threadID].turn === global.game[event.threadID].player1.id ? global.game[event.threadID].player2.id : global.game[event.threadID].player1.id;
                                global.game[event.threadID].bidd = global.game[event.threadID].bidd === "❌" ? "⭕" : "❌";
                            }
                        } else {
                            message.reply("في لعبه هون");
                        }
                    } else {
                        message.reply("يرجى الرد برقم من 1 إلى 9 فقط.");
                    }
                } else {
                    message.reply("ليس دورك في اللعبة الآن.");
                }
            } else {
                
            }
        }
    }
};

String.prototype.replaceAt = function (search, replace, from) {
    if (this.length > from) {
        return this.slice(0, from) + this.slice(from).replace(search, replace);
    }
    return this;
};
