let cmd = {
  config: {
    name: "امر",
    Auth: 1, 
    Multi: ["cmd"],
    Info: "حظر اوامر من مجموعتك",
    How: undefined,
    Hide: false,
    Class: "اعدادات",
    Time: 0
  },
  
  onPick: async function({api, sh, event, threadsData, args}) {
    const type = args[0];
    if (!type) return sh.reply("اكتب حظر او الغاء");
    switch (type) {
      case "ban":
        case "بان":
          case "حظر":
          case "-b": {
            if (!args[1]) return sh.reply("اكتب اسم الامر لبدك تبندو");
            if(!global.shelly.cmds.has(args[1])) return sh.reply("انت بدك تنبد امر مش موجود او كيف");
            
            if (!(await threadsData.get(event.threadID)).data.Cban) await threadsData.set(event.threadID, [], "data.Cban");
            
            let obj = (await threadsData.get(event.threadID)).data.Cban;
            
            if(obj.includes(args[1])) return sh.reply("هذا الامر مبند بالفعل يا خرا");
            
            obj.push(args[1]);
            
            await threadsData.set(event.threadID , obj , "data.Cban");
            
            sh.reply("تم تبنيد امر: " + args[1])
            
            break;
          }
            case "uban":
        case "الغاء":
          case "-u": {
            if (!args[1]) return sh.reply("اكتب اسم الامر لبدك تفك البان عنو");
            let obj = (await threadsData.get(event.threadID)).data.Cban;
            if (!obj) return sh.reply("ما عندك ولا امر مبند اصلا");
            if(!obj.includes(args[1])) {
              return sh.reply("هذا الامر  غير مبند من قبل");
            }
            
            
            obj = obj.filter(x => x !== args[1]);
            
            await threadsData.set(event.threadID , obj , "data.Cban");
            
              sh.reply("تم فك تبنيد امر: " + args[1]);
              
              break;
          }
              
              default: return sh.reply("اكتب بس حظر او الغاء")
            
    }
    
    
  }
}



module.exports = cmd;