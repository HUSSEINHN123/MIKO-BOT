const axios = require('axios');
const crypto = require("crypto");
const fs = require('fs');
const path = require('path');

function Sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class MagicAi {
    constructor(d_id, models) {
        this.d_id = d_id || this.GenerateID();
        this.Token = null;
        this.baseUrl = 'https://api.magicaiimage.top';
        this.models = models;
    }
     Seed() {  
       return Math.floor(Math.random() * 1e15);
     }
     Encrypt(OData) {
    const key = Buffer.from([0,0,0,109,97,103,105,0,0,0,0,0,0,0,0,0]); 
    const iv = Buffer.alloc(16, 0);
    const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
    cipher.setAutoPadding(true);
    const encryptedBuffer = Buffer.concat([cipher.update(JSON.stringify(OData), "utf8"), cipher.final()]);
    return encryptedBuffer.toString("base64");
     }

     Decrypt(Edata) {
    const key = Buffer.from([0,0,0,109,97,103,105,0,0,0,0,0,0,0,0,0]); 
    const iv = Buffer.alloc(16, 0);
    const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
    decipher.setAutoPadding(true);
    const encryptedBuffer = Buffer.from(Edata, "base64");
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8"));
     }

    GenerateID() {
        const chars = 'abcdef0123456789';
        let id = '';
        for (let i = 0; i < 16; i++) {
            id += chars[Math.floor(Math.random() * chars.length)];
        }
        return id;
    }

    async Requester(endpoint, param, token = this.Token) {
    const headers = {
        "User-Agent": "okhttp/4.12.0",
        "Accept-Encoding": "gzip",
        "Content-Type": "application/json; charset=UTF-8"
    };

    const data = {
        data: this.Encrypt({
            param: param,
            header: {
                token: token || "",
                "d-id": this.d_id,
                version: "3.1.0",
                "app-code": "magic"
            }
        })
    };

    try {
        const response = await axios.post(
            `${this.baseUrl}${endpoint}`,
            data,
            { headers }
        );

        return this.Decrypt(response.data.data);
    } catch (error) {
        if (error.response) {
            console.error(
                `Request to ${endpoint} failed with status ${error.response.status}:`,
                error.response.data
            );
        } else {
            console.error(`Request to ${endpoint} failed:`, error.message);
        }
        throw error;
    }
    }

    async Login(email = '', password = '') {
        const param = {
            email: email,
            password: password,
            platform: 3,
            d_id: this.d_id,
            lang: 'en',
            d_name: 'SM-A546E',
            sys_version: '12',
            referrer: '',
            timezone: 'GMT-5'
        };
        const result = await this.Requester('/app/login', param, '');
        this.Token = result.data.token;
        return result.data;
    }

    async User() {
        return this.Requester('/app/user/info', {});
    }

    async Daily() {
        return this.Requester('/app/user/sign/task/get', {});
    }

     async Start(Prompt, Model, Ratio, Negative, NUM) {
        const param = {
            positive_prompt: Prompt,
            negative_prompt: Negative || '',
            model_id: parseInt(Model) || 27,
            styles: [
            {
            name: "None",
            weight: "1",
             }
                    ],
             quality_mode: 0,
             proportion: parseInt(Ratio) || 0,
             batch_size: 1,
             public: true,
             cfg: parseInt(this.models[NUM].default.cfg),
             steps: parseInt(this.models[NUM].default.steps),
             random_seed: this.Seed(),
             sampler_name: this.models[NUM].default.sampler_name,
             scheduler: this.models[NUM].default.scheduler_name,
             speed_type: 0,
        };
        const Data = await this.Requester('/app/task/text_to_image/post', param);
        return Data?.data?.task?.id;
    }
    async Prompt() {
        const Prompt = await this.Requester('/app/task/prompt/random/get', {});
        return Prompt.data
    }

    async Pricing() {
        return this.Requester('/app/task/price/quick/get', {});
    }

    async Status(TaskID) {
        const param = { task_id: TaskID };
        return this.Requester('/app/task/status_v2/get', param);
    }

    async Task(TaskID) {
        let result;
        do {
            this.Status(TaskID)
            result = await this.Waiting();
          if (!result.data || !result.data[0] || !result.data[0].progress) break;
         if (result.data[0].progress.overall_percentage === "100.00") break;
            await new Promise(res => setTimeout(res, 2000));
        } while (true);
        return result;
    }

    async Waiting() {
        const param = { page: 1, size: 100 };
        return this.Requester('/app/task/waiting/list/get', param);
    }

    async Pictures(TaskID) {
        const param = { task_id: TaskID };
        await Sleep(5000)
        const Res = await this.Requester('/app/task/image/list/get', param);
        return Res.data[0]
    }

    async Generate(Prompt, Model, Ratio, Negative, NUM) {
       await this.Login()
       await this.User()
       await this.Daily()
        if(!Prompt) {
           Prompt = await this.Prompt()
        }
        const TaskID = await this.Start(Prompt, Model, Ratio, Negative, NUM)
        await this.Pricing()
        await this.Task(TaskID)
        return await this.Pictures(TaskID)
    }
}

const models = [
    {
        id: 27,
        name: "Flux1.1 Pro",
        default: {
            cfg: 3.5,
            steps: 25,
            sampler_name: "euler",
            scheduler_name: "simple"
        }
    }
];

module.exports.config = {
    name: "ماجيك",
    Auth: 0,
    Multi: ["magic"],
    Owner: "Your Name",
    Info: "توليد صورة بالذكاء الاصطناعي",
    Class: "AI",
    How: "<وصف الصورة>",
};

module.exports.onPick = async function({ api, event, args, sh }) {
    if (args.length === 0) {
        return sh.reply("يرجى كتابة وصف الصورة");
    }

    const prompt = args.join(" ");

    try {
        sh.react("⏳");
        await sh.reply("جاري توليد الصورة...");

        const magicAi = new MagicAi(null, models);
        const result = await magicAi.Generate(prompt, 27, 0, "", 0);

        if (!result || !result.url) {
            return sh.reply("فشل التوليد");
        }

        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }

        const imagePath = path.join(cacheDir, `magic_${Date.now()}.jpg`);
        const response = await axios.get(result.url, { responseType: 'arraybuffer' });
        fs.writeFileSync(imagePath, Buffer.from(response.data));

        await sh.reply({
            body: "تم التوليد",
            attachment: fs.createReadStream(imagePath)
        });

        setTimeout(() => {
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }, 60000);

    } catch (e) {
        console.error(e);
        sh.reply("حدث خطأ");
    }
};