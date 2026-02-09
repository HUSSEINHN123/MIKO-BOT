module.exports.config = {
  name: "خزنه", 
  Auth: 0,
  Class: "وسائط", 
  Owner: "Gry KJ", 
  Hide: false, 
  How: "اكتبه وكتشف",
  Multi: ["clipboard"], 
  Time: 0,
  Info: "تخزين نص"
};

module.exports.onPick = async function({args, event, api, sh: black, usersData}) {
  if((await usersData.get(event.senderID))["gender"] == undefined)
  {
    await usersData.create(event.senderID);
   }
   if (args[0] == "ميديا") {
       const si = event.messageReply ? event.messageReply.attachments.length : 0;
      if (si < 1) return black.reply('رد على صورة او فيديو او اوديو ...');
      const media = event.messageReply.attachments;
      let onData = [];
       if (si > 1) {
          for (let one of media) {
              onData.push((await funcs.topMedia(one.url, media[0].type == "photo" ? "mp3" : media[0].type == "video" ? "mp4" : "png")));
          }
          } else onData = [await funcs.topMedia(media[0].url, media[0].type == "audio" ? "mp3" : media[0].type == "video" ? "mp4" : "png")];
         black.reply({body:"اختر عنوان لميديا التي خزنتها"}, (err, info) => {
          global.shelly.Reply.push(info.messageID, {
            name: "خزنه",
            mid: onData, 
            ID: info.messageID,
            sid: event.senderID,
            type: "media"
          })
        })

   }
  if (args[0] == "عرض") {
    var me7 = await usersData.get(event.senderID);
    let meKnow = me7.data.clipboard;
    if(!meKnow) return black.reply("ما عندك ولا نص حافظه 😔👍");
    let result = `✅ عناوين النصوص لانت حافظها ✅\n\n`;
    let i = 0;
    for (one of meKnow) {
      i += 1;
      result += `${i} ⋆˚ ⬷  ${one.title}\n\n`;
    };
    result += `رد برقم العنوان لبدك عرضه:

    العدد: ${meKnow.length} 🦊`;
    black.reply({body:result}, (err, info) => {
                 global.shelly.Reply.push({
                   name: "خزنه",
                   mid: info.messageID, 
                  ID: info.messageID,
                   sid: event.senderID,
                   type: "showMe"
                 })
               })
  }
  if (args[0] == "مشاهدة") {
      var me7 = await usersData.get(event.senderID);
      let meKnow = me7.data.media;
      if(!meKnow) return black.reply("ما عندك ولا ميديا حافظه 😔👍");
      let result = `✅ عناوين الميديا لانت حافظها ✅\n\n`;
      let i = 0;
      for (one of meKnow) {
        i += 1;
        result += `${i} ⋆˚ ⬷  ${one.title}\n\n`;
      };
      result += `رد برقم العنوان لبدك عرضه:

      العدد: ${meKnow.length} 🦊`;
      black.reply({body:result}, (err, info) => {
                   global.shelly.Reply.push({
                     name: "خزنه",
                     mid: info.messageID, 
                     ID: info.messageID,
                     sid: event.senderID,
                     type: "showMedia"
                   })
                 })
    }
  if (args[0] == "تخزين") {
  black.reply(`مرحبا بك فالامر التخزين عند بلاك 👨‍💼
               هذا الامر تخزن فيه اي نص بدك ويبقى مخزن ف بيانات البوت ✅

               رد بعنوان النص لبدك تخزنو ✅⚙️`, (err, info) => {
                 global.shelly.Reply.push({
                   name: "خزنه",
                   ID: info.messageID,
                   mid: info.messageID,
                   sid: event.senderID,
                   type: "title"
                 })
               })
  }
  const supported = [
    "عرض",
    "تخزين",
    "ميديا",
    "مشاهدة"
    ];
  if (!supported.includes(args[0])) {
    black.reply("الأدوات المتوفرة\n\nعرض: عرض محتويات خزنتك🗄️\n\nتخزين: تخزين نص جديد 🦊\n\nميديا:حفظ ميديا😡\n\nمشاهدة:مشاهدة ميديا👽");
  }
};

module.exports.Reply = async function({args, event, api, sh: black, usersData, Reply}) {
  const { mid, sid, type, title} = Reply;
  if(event.senderID != sid) return;
  if(type == "title") {
    black.unsend(mid);
    const Gdata = await usersData.get(event.senderID);
    let nahStop = Gdata.data.clipboard ? Gdata.data.clipboard : "tf?";
    if (nahStop != "tf?") {
    let shutup = nahStop.find(mok => mok.title == event.body);
    if (shutup != undefined) return black.reply("هذا العنوان موجود بالفعل فحافظتك اختر عنوان اخر من فظلك");
    };
    black.reply("الان رد ب النص لبدك تحفضو ⚙️", (err, info) => {
                 global.shelly.Reply.push(info.messageID, {
                   name: "خزنه",
                   ID: info.messageID,
                   mid: info.messageID, 
                   sid: event.senderID,
                   type: "text",
                   title: event.body
                 });
               });
  };
  if (type == "showMe") {
    if(isNaN(event.body)) return black.reply("رد برقم يا شكب");
    let nono = await usersData.get(event.senderID);
    nono = nono.data.clipboard;
    if (nono[event.body - 1] == undefined) return black.reply("الرقم ذا مش موجود فحافظتك يا شكب 🤨");
    let result = `العنوان : ${nono[event.body - 1].title} 🦊
    النص ✅ :
    ${nono[event.body - 1].text}`;
    black.reply(result);
  }
  if (type == "showMedia") {
      if(isNaN(event.body)) return black.reply("رد برقم يا شكب");
      let nono = await usersData.get(event.senderID);
      nono = nono.data.media;
      if (nono[event.body - 1] == undefined) return black.reply("الرقم ذا مش موجود فحافظتك يا شكب 🤨");
      let result = `العنوان : ${nono[event.body - 1].title} 🦊`;
      let Media = [];
      let yes = nono[event.body - 1].media;
      for (let one of yes)
      {
       Media.push(await funcs.str(one));
      }
      black.reply({body:result, attachment: Media});
    }
  if(type == "text") {
    black.unsend(mid);
    try {
    let data = await usersData.get(event.senderID);
    let bro = data.data;
    if (bro.clipboard) {
    bro.clipboard.push({
      title: title,
      text: event.body
    })
    } else {
      bro.clipboard = [{
        title: title, text: event.body
      }]
    };
    await usersData.set(sid, bro.clipboard, "data.clipboard");
    black.reply("تم حفظ النص بنجاح ✅") ; 
    } catch (error) {
      black.reply("حدث خطأ ❎");
    }
    };
    if(type == "media") {
      black.unsend(Reply.ID);
      try {
      let data = await usersData.get(event.senderID);
      let bro = data.data;
      let nahStop = bro.media ? bro.media : "tf?";
    if (nahStop != "tf?") {
    let shutup = nahStop.find(mok => mok.title == event.body);
    if (shutup != undefined) return black.reply("هذا العنوان موجود بالفعل فحافظتك اختر عنوان اخر من فظلك");
    };
      if (bro.media) {
      bro.media.push({
        title: event.body,
        media: mid
      })
      } else {
        bro.media = [{
          title: event.body, media: mid
        }]
      };
      await usersData.set(sid, bro.media, "data.media");
      black.reply("تم حفض الميديا بنجاح ✅") ; 
      } catch (error) {
        black.reply("حدث خطأ ❎");
      }
      };
};
