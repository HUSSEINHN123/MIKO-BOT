module.exports = {
  config: {
    name: "منشن",
    version: "1.0.0",
    Owner: "عبدالرحمن",
    Auth: 0,
    Time: 8,
    Info: "اعدادات منشن المجموعه",
    Class: "اعدادات",
  },

  onPick: async function ({ event, api, args, sh: Message, usersData, threadsData }) {
   const arg = args[0]
const thqq = event.participantIDs;
for (let uid of thqq) {
const D = await usersData.get(uid)
if(!D.name && !D.gender) {
 await usersData.create(uid);
}}

    let mentions = [];
    
    let name;



if( arg === "الكل" ) {
const all = event.participantIDs;
 
for (let uidall of all) {
   name = "منشن لعيونكم كلكم"
  
 await mentions.push({ tag: name, id: uidall });
}

 return Message.reply({
    body:`يبشر اصحو تعالو ي : ${name}`,
    mentions
  
})
}
    


if( arg === "الادمن" ) {

  const ad = await threadsData.get(event.threadID);
const allad = ad.adminIDs;

for (let uidadm of allad) {
   name = "ادمنن"
  
  mentions.push({ tag: name, id: uidadm });
}
 return Message.reply({
    body: `تعالو ياا : ${name}`, 
    mentions

 })



  
}



if( arg === "الاولاد" ) {

  
const alla = event.participantIDs;


for (let uida of alla) {
  let yy = await usersData.get(uida);
  if (yy.gender === 2) {
     name = "اولاااد"
    mentions.push({ tag: name, id: uida });
  }
}

return Message.reply({
  body: `تعالو ياا : ${name}`,
  mentions
})
}


if( arg === "البنات" ) {

  
const alla = event.participantIDs;


for (let uida of alla) {
  let yy = await usersData.get(uida);
  if (yy.gender === 1) {
     name = "بنااات"
    mentions.push({ tag: name, id: uida });
  }
}


return Message.reply({
  body: `تعالن يااا : ${name}`,
  mentions
})
}


    
    
    const rd = `⚝ ◄ اعدادات المنشن ► ⚝\n\⓵ ⚝ منشن الكل ⚝\n⓶ ⚝ منشن الادمن ⚝\n⓷ ⚝ منشن الاولاد ⚝\n⓸ ⚝ منشن المطور ⚝\n⓹ ⚝ منشن البنات ⚝\n⓺ ⚝ منشن الالوان ⚝\n\n- - - - - - - - - - - - - - - - - - - - - - - - - -\n\n ⬷ 𓆩⚝𓆪 الرجاء الرد برقم الاختيار 𓆩⚝𓆪`;

    Message.react("✅");
    return Message.reply({ body: rd }, (error, info) => {
      global.shelly.Reply.push({
        name: "منشن",
        author: event.senderID,
        ID: info.messageID,
        mnn: event.body,
      });
    });
  },

  Reply: async function ({ api, event, Reply, sh: Message, usersData, threadsData }) {
    const { author, messageID } = Reply;
    if (event.senderID != author) return;
    
    let mentions = [];
    let nam = [];
    let name;

    
      switch (event.body) {
      case "1":
        

          const all = event.participantIDs;
 
for (let uidall of all) {
   name = await usersData.getName(uidall);
  nam.push(name);
  mentions.push({ tag: name, id: uidall });
}




          
        break;
      case "2":


          const ad = await threadsData.get(event.threadID);
const allad = ad.adminIDs;

for (let uidadm of allad) {
   name = await usersData.getName(uidadm);
  nam.push(name);
  mentions.push({ tag: name, id: uidadm });
}




          
        break;
      case "3":
        

          const alla = event.participantIDs;


for (let uida of alla) {
  let yy = await usersData.get(uida);
  if (yy.gender === 2) {
     name = await usersData.getName(uida);
    nam.push(name);
    mentions.push({ tag: name, id: uida });
  }
}




          
        break;
      case "4":


          
          const uidona = global.config.AD[0]
          const hhg = event.participantIDs
          if(!hhg.includes(uidona)) {
            api.addUserToGroup(uidona, event.threadID) 
          }


   name = await usersData.getName(uidona);
  nam.push(name);
  mentions.push({ tag: name, id: uidona });

          
        break;
        case "5":

const allg = event.participantIDs;


for (let uidg of allg) {
  let yyg = await usersData.get(uidg);
  if (yyg.gender === 1) {
     name = await usersData.getName(uidg);
    nam.push(name);
    mentions.push({ tag: name, id: uidg });
  }
}
          
        break;
       case "6":
        case "7":


const allgay = event.participantIDs;

for (let uidgay of allgay) {
  let yygay = await usersData.get(uidgay);
  if (yygay.gender === 0 || yygay.gender === 3 || yygay.gender === 4 || yygay.gender === 5 || yygay.gender === 6) {
    name = await usersData.getName(uidgay); 
    nam.push(`ذا الوان ${name}`);
    mentions.push({ tag: name, id: uidgay });
  }
}



          
      break;
      default:
        return Message.reply("𓆩⚝𓆪 رد برقم من 1 الى 7 𓆩⚝𓆪");
    }


    
   



    
    const ren = nam.join("\n");

    return Message.reply({
  body: ren,
  mentions
    });
  },
};
