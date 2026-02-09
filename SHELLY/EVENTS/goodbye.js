const axios = require('axios');

const fs = require('fs');

const path = require('path');

let cmd = {

    config: {

        name: "goodbye",

        Type: ["log:unsubscribe"]

    }, 

    Event: async function ({ api, sh, threadsData, usersData, event }) {

        const { threadID } = event;

        const leftParticipant = event.logMessageData.leftParticipantFbId;

        // إذا كان العضو الذي غادر هو البوت نفسه

        if (leftParticipant == config.shellyID) {

            api.sendMessage(`⚝ تمت إزالة شيلي من المجموعة ⚝\n📍 ID: ${threadID}`, config.TID);

            return;

        }

        

        // الحصول على معلومات العضو الذي غادر

        let userInfo;

        try {

            userInfo = await usersData.get(leftParticipant);

        } catch (e) {

            userInfo = null;

        }

        const userName = userInfo?.name || "العضو";

        // إذا كان العضو الذي غادر هو المالك

        if (leftParticipant == config.OWNERID) {

            return sh.send(`😢💔 وداعاً سيدي ${userName}`);

        }

        // للأعضاء العاديين

        let threadDat = await threadsData.get(threadID);

        let threadData = threadDat?.data || {};

        // التحقق من إعدادات إرسال رسالة الوداع

        if (threadDat?.settings?.sendGoodbyeMessage == false) return;

        let msg;

        

        // إذا كان هناك رسالة وداع مخصصة

        if (threadData.customLeave) {

            msg = threadData.customLeave.replace(/{name}/g, userName);

        } else {

            // رسائل وداع متنوعة عشوائية

            const goodbyeMessages = [

                `━━━━━━━━━━━━━━━━

👋 وداعاً ${userName}

ليش زعلت سنفوري ومشيت مننا 🥺

المجموعة ما راح تكون نفسها بدونك 💔

نتمنى نشوفك قريب 🌸

━━━━━━━━━━━━━━━━`,

                `━━━━━━━━━━━━━━━━

💔 ${userName} غادر المجموعة

مع السلامة يا غالي 🥺

الله معاك وبالتوفيق 💫

راح نفتقدك 😢

━━━━━━━━━━━━━━━━`,

                `━━━━━━━━━━━━━━━━

😢 ${userName} قرر يمشي

ليه يا ${userName}؟ 🥺💔

كنا نتمنى تبقى معانا أكثر

أتمنى كل شي يكون تمام معاك 🌸

━━━━━━━━━━━━━━━━`,

                `━━━━━━━━━━━━━━━━

🚪 ${userName} ترك المجموعة

وداعاً صديقنا العزيز 😭

راح نفتقد وجودك هنا 💙

الله يوفقك في طريقك 🌟

━━━━━━━━━━━━━━━━`,

                `━━━━━━━━━━━━━━━━

💫 ${userName} 

ليش تتركنا كذا؟ 🥺

المجموعة راح تكون فاضية بدونك 😢

نشوفك على خير 💔

━━━━━━━━━━━━━━━━`

            ];

            

            msg = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];

        }

        // تحميل صورة بروفايل العضو المغادر

        try {

            // رابط صورة البروفايل بجودة عالية

            const profilePicUrl = `https://graph.facebook.com/${leftParticipant}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

            

            const tempPath = path.join(__dirname, 'cache', `goodbye_${leftParticipant}_${Date.now()}.jpg`);

            

            // تحميل الصورة

            const response = await axios.get(profilePicUrl, { 

                responseType: 'arraybuffer',

                timeout: 10000 

            });

            

            fs.writeFileSync(tempPath, Buffer.from(response.data));

            // إرسال الرسالة مع صورة البروفايل

            await sh.send({

                body: msg,

                attachment: fs.createReadStream(tempPath)

            });

            // حذف الصورة المؤقتة بعد الإرسال

            setTimeout(() => {

                if (fs.existsSync(tempPath)) {

                    fs.unlinkSync(tempPath);

                }

            }, 5000);

        } catch (error) {

            console.error("خطأ في تحميل صورة البروفايل:", error.message);

            

            // إرسال الرسالة بدون صورة في حالة الخطأ

            sh.send({

                body: msg,

                mentions: [{

                    tag: userName,

                    id: leftParticipant

                }]

            });

        }

    }

}

module.exports = cmd;