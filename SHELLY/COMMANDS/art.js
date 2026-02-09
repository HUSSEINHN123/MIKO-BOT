const FormData = require('form-data');
const crypto = require('crypto');
const { imageSize } = require('image-size');

module.exports.config = {
    name: "تحويل",
    Auth: 0,
    Multi: ["art"],
    Owner: "Gry KJ",
    Info: "يحول صورتك إلى ستايل أنمي باستخدام الذكاء الاصطناعي. استخدم الأمر ورد على صورة.",
    Class: "ذكاء اصطناعي",
    How: "[name]",
};


        
module.exports.onPick = async function({ event, text, sh, usersData, args }) {
    const uid = event.senderID;
    const userData = await usersData.get(uid);

    if (args[0] == "مفضل") {
        let models = await Models();
        const fav = parseInt(args[1]);

        if (!fav) {
            sh.reply("🎨 اختر رقم الستايل من القائمة يا فنان!");
            return;
        }

        if (fav < 0 || fav > models.length) {
            sh.reply(`🚫 رقم المودل غير صحيح. اختر بين 1 و ${models.length} فقط!`);
            return;
        }

        await usersData.set(uid, `${fav}`, "data.styleNum");
        sh.reply('✨ تم! تم تعيين الستايل المفضل لك بنجاح. استعد لتجربة تحويل صورك لأي ستايل يعجبك! 🚀');
        return;
    }

    // Unified pagination logic for "موديلات" and "بحث"
    if (args[0] == "موديلات" || args[0] == "بحث") {
    const isSearch = args[0] == "بحث";
    const searchQuery = isSearch ? args.slice(1).join(" ").trim() : "";
    const page = isSearch ? 1 : args[1] ? args[1] : 1;

    if (isSearch && !searchQuery) {
        sh.reply("🔍 من فضلك، أدخل كلمة مفتاحية للبحث عن الستايلات.\n\nمثال: تحويل بحث أنمي");
        return;
    }

    let models = await Models(searchQuery);

    if (models.length === 0 && isSearch) {
        sh.reply(`😢 لم يتم العثور على ستايلات تطابق "${searchQuery}". حاول بكلمات أخرى!`);
        return;
    }

    const pageSize = 20;
    const totalPages = Math.ceil(models.length / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const modelsPage = models.slice(start, end);

    const title = isSearch ? `🔎 نتائج البحث عن "${searchQuery}"` : `🌟 قائمة الستايلات`;
    let msg = `${title} (صفحة ${page} من ${totalPages}):\n\n`;
    modelsPage.forEach((m, index) => {
        msg += `◉ ${m.originalIndex} : ${m.name}\n`;
    });

    
    
    const info = await sh.reply(msg);
    
    global.shelly.Reply.push({
        name: "تحويل",
        ID: info.messageID,
        pages: models,
        author: event.senderID
    });

    
    return;
}

    if (event?.messageReply && event.messageReply?.attachments[0]?.url && event?.messageReply.attachments[0].type == "photo") {
        let styleNum = 29;
        if (args[0] && !isNaN(args[0])) {
            styleNum = parseInt(args[0]);
            sh.reply(`🎭 جاري تحويل صورتك للستايل رقم ${styleNum}... استعد للنتيجة المدهشة!`);
        } else {
            if (!userData.data?.styleNum) {
                sh.reply("🌌 يتم تحويل صورتك لستايل Starry Girl... انتظر السحر!");
            }
        }

        const img = await axios.get(event.messageReply.attachments[0].url, { responseType: "arraybuffer" });
        const randNum = Math.floor(Math.random() * 999999);

        if (userData.data?.styleNum && !args[0]) {
            styleNum = userData.data.styleNum;
            sh.reply(`💡 تم اختيار ستايلك المفضل رقم ${styleNum} تلقائيًا!`);
        }

        const path = __dirname + "/cache/Art" + randNum + ".png";
        fs.writeFileSync(path, img.data);

        let result;
        try {
            const modelID = await Models();
            result = await Idk(path, modelID[styleNum].id);
            sh.str("🎉 تم! إليك صورتك الجديدة بالستايل المختار:", result);
            fs.unlink(path);
        } catch (e) {
            sh.reply("😢 حدث خطأ أثناء تحويل الصورة. حاول مرة أخرى أو جرب صورة أو ستايل مختلف!");
        }
    } else {
        sh.reply("📸 من فضلك، قم بالرد على صورة لتحويلها.\n\n🔎 لرؤية قائمة الستايلات المتوفرة: اكتب 'تحويل موديلات <رقم الصفحة>'\n🔍 للبحث عن ستايل: اكتب 'تحويل بحث <كلمة مفتاحية> <رقم الصفحة>'\n⭐️ لجعل ستايل مفضل: اكتب 'تحويل مفضل <رقم الستايل>'");
    }
};

async function Models(searchQuery = "") {
    let idgen = gen();
    let config = {
        method: 'GET',
        url: `https://be.aimirror.fun/filter_search?uid=${idgen}`,
        headers: {
            'User-Agent': 'AIMirror/6.2.4+168 (android)',
            'Accept-Encoding': 'gzip',
            'store': 'googleplay',
            'uid': idgen,
            'env': 'PRO',
            'accept-language': 'en',
            'package-name': 'com.ai.polyverse.mirror',
            'content-type': 'application/json',
            'app-version': '6.2.4+168'
        }
    };
    let res = await axios.request(config);
    let cute = res.data.search_info
        .filter(i => !i.key_words.includes("video"))
        .map((i, index) => ({
            id: i.model_id,
            name: i.model,
            key_words: i.key_words,
            originalIndex: index // Store the original index from the full array
        }))
        .sort((a, b) => Number(a.id) - Number(b.id));

    // Remove duplicates by id and name
    cute = [...new Map(cute.map(i => [i.id, i])).values()];
    cute = [...new Map(cute.map(i => [i.name, i])).values()];
    cute = cute.sort((a, b) => Number(a.id) - Number(b.id));

    // Reassign originalIndex to reflect position in the sorted, deduplicated full array
    cute = cute.map((model, index) => ({
        ...model,
        originalIndex: index
    }));

    if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        cute = cute.filter(model =>
            model.name.toLowerCase().includes(lowerQuery) ||
            model.key_words.some(keyword => keyword.toLowerCase().includes(lowerQuery))
        );
    }

    return cute;
}






async function Idk(path, modelid=0,isHd=false, prompt="", isEdit=false) {
  function Rhash() {
  return crypto.randomBytes(20).toString('hex');
  };
  function Size(filePath) {
  const { width, height, type } = imageSize(filePath); 
  return { width, height, type };
};
  async function Edit(ide, prompt, ol ) {
    let pa =  fs.readFileSync(path);
    let ss = Size(Buffer.from(pa));


let data = JSON.stringify({
  "model_id": 30009,
  "cropped_image_key": ol.key,
  "free_size": true,
  "cropped_height": ss.height,
  "cropped_width": ss.width,
  "ext_args": {
    "custom_prompt": prompt
  },
  "package_name": "com.ai.polyverse.mirror",
  "version": "6.2.4"
});

let config = {
  method: 'POST',
  url: `https://be.aimirror.fun/draw?uid=${ide}`,
  headers: {
    'User-Agent': 'AIMirror/6.2.4+168 (android)',
    'Accept-Encoding': 'gzip',
    'Content-Type': 'application/json',
    'store': 'googleplay',
    'uid': ide,
    'env': 'PRO',
    'accept-language': 'en',
    'package-name': 'com.ai.polyverse.mirror',
    'app-version': '6.2.4+168'
  },
  data: data
};

  let res = await axios.request(config);
  return res.data;
}
async function GenImgeToken(ide) {
  let config = {
    method: 'GET',
    url: `https://be.aimirror.fun/app_token/v2?cropped_image_hash=${Rhash()}.jpeg&uid=${ide}`,
    headers: {
      'User-Agent': 'AIMirror/6.2.4+168 (android)',
      'Accept-Encoding': 'gzip',
      'store': 'googleplay',
      'uid': ide,
      'env': 'PRO',
      'accept-language': 'en',
      'package-name': 'com.ai.polyverse.mirror',
      'content-type': 'application/json',
      'app-version': '6.2.4+168'
    }
  };
 let r = await axios.request(config);
  let onechan = r.data;
  return onechan;
    
};
async function UploadImg(obj, img) {
  let data = new FormData();
  data.append('name', obj.name);
  data.append('key', obj.key);
  data.append('policy', obj.policy);
  data.append('OSSAccessKeyId', obj.OSSAccessKeyId);
  data.append('success_action_statu, s', obj.success_action_status);
  data.append('signature', obj.signature);
  data.append('backend_type', obj.backend_type);
  data.append('region', obj.region);
  data.append('file', fs.createReadStream(img));

  let config = {
    method: 'POST',
    url: 'https://aimirror-images-sg.oss-ap-southeast-1.aliyuncs.com',
    headers: {
      'Accept-Encoding': 'gzip'
    },
    data: data
  };

 let res = await axios.request(config);
  return res.status;
    
};
async function GenDrawTask(ide, mid=0, obj, prompt="") {
  let pa =  fs.readFileSync(path);
  let ss = Size(Buffer.from(pa));
  
let data = JSON.stringify({
  "model_id": parseInt(mid),
  "cropped_image_key": obj.key,
  "cropped_height": ss.height,
  "cropped_width": ss.width,
  "package_name": "com.ai.polyverse.mirror",
  "ext_args": {
    "imagine_value2": 50,
    "custom_prompt": ""
  },
  "version": "6.2.4",
  "force_default_pose": true,
  "is_free_trial": true,
  "free_size": true
});


let config = {
  method: 'POST',
  url: `https://be.aimirror.fun/draw?uid=${ide}`,
  headers: {
    'User-Agent': 'AIMirror/6.2.4+168 (android)',
    'Accept-Encoding': 'gzip',
    'Content-Type': 'application/json',
    'store': 'googleplay',
    'uid': ide,
    'env': 'PRO',
    'accept-language': 'en',
    'package-name': 'com.ai.polyverse.mirror',
    'app-version': '6.2.4+168'
  },
  data: data
};

let res = await axios.request(config);
  return res.data;
};
async function CheckTask(ide, task) {
  
let config = {
  method: 'GET',
  url: `https://be.aimirror.fun/draw/process?draw_request_id=${task}&uid=${ide}`,
  headers:  {
    'User-Agent': 'AIMirror/6.2.4+168 (android)',
    'Accept-Encoding': 'gzip',
    'store': 'googleplay',
    'uid': ide,
    'env': 'PRO',
    'accept-language': 'en',
    'package-name': 'com.ai.polyverse.mirror',
    'content-type': 'application/json',
    'app-version': '6.2.4+168'
  }
};

let rr = await axios.request(config);
  return rr.data;
};
async function CheckTaskHD(ide, task) {
  
  let config = {
    method: 'POST',
    url: `https://be.aimirror.fun/highres?draw_request_id=${task}&image_index=0&package_name=com.ai.polyverse.mirror&highres_type=1&uid=${ide}`,
    headers: {
      'User-Agent': 'AIMirror/6.2.4+168 (android)',
      'Accept-Encoding': 'gzip',
      'store': 'googleplay',
      'uid': ide,
      'env': 'PRO',
      'accept-language': 'en',
      'content-length': '0',
      'package-name': 'com.ai.polyverse.mirror',
      'content-type': 'application/json',
      'app-version': '6.2.4+168'
    }
  };

  
let rr = await axios.request(config);
  return rr.data;
};
  let idgen = gen();
    let rest = await GenImgeToken(idgen);
  await UploadImg(rest, path);
  if(!isEdit) {
  let task = await GenDrawTask(idgen, modelid, rest);
    let taskid = task.draw_request_id;
  let tk = task.draw_status;
    let ri;
    while (tk != "SUCCEED") {
       ri = await CheckTask(idgen, taskid);
      tk = ri.draw_status;
    }
if(isHd) {
  let tk1 = "WAITING";
  let ri1;
  while (tk1 != "SUCCEED") {
     ri1 = await CheckTaskHD(idgen, taskid);
    tk1 = ri1.status;
  }
  return ri1.generated_image_address;
} else {
  return ri.generated_image_addresses[0];
}
  };
  if(isEdit) {
    if(!prompt) return new Error("Prompt is required for edit");
    let task = await Edit(idgen, prompt, rest);
  let taskid = task.draw_request_id;
let tk = task.draw_status;
  let ri;
  while (tk != "SUCCEED") {
     ri = await CheckTask(idgen, taskid);
    tk = ri.draw_status;
  };
return ri.generated_image_addresses;
  };
};
function gen() {
const p = 'fe20871';
  const n = 16 - p.length; 
  const hexChars = '0123456789abcdef';
  let r = '';
  for (let i = 0; i < n; i++) {
    r += hexChars[Math.floor(Math.random() * 16)];
  }
  return p + r;
};


module.exports.Reply = async function({ args, event, sh, api, Reply}) {
const { pages, author } = Reply;

if (event.senderID !== author) {
    
    return;
}

const page = parseInt(event.body) || 1;
const pageSize = 20;
const totalPages = Math.ceil(pages.length / pageSize);

if (page < 1 || page > totalPages) {
    sh.reply(`📄 رقم الصفحة غير صحيح. اختر بين 1 و ${totalPages}`);
    return;
}

const start = (page - 1) * pageSize;
const end = start + pageSize;
const modelsPage = pages.slice(start, end);

let msg = `🔎 نتائج البحث (صفحة ${page} من ${totalPages}):\n\n`;
modelsPage.forEach((m, index) => {
    msg += `◉ ${m.originalIndex} : ${m.name}\n`;
});
sh.reply(msg);
}