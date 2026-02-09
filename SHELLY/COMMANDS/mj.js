function GetActions(ActionCode) {
    const ActionsMap = {
        "us1": "upsample_subtle",
        "us1":"redo_upsample_subtle" ,
        "us2":'redo_upsample_creative' ,
        "us2": "upsample_creative",
        "lv": "low_variation",
        "hv": "high_variation",
        "zo2": "zoom_out_2x",
        "zo1.5": "zoom_out_1_5x",
        "sq": "square",
        "pl": "pan_left",
        "pr": "pan_right",
        "pu": "pan_up",
        "pd": "pan_down",
        "u1": "upsample1",
        "u2": "upsample2",
        "u3": "upsample3",
        "u4": "upsample4",
        "🔁": "reroll",
        "v1": "variation1",
        "v2": "variation2",
        "v3": "variation3",
        "v4": "variation4"
    };
    return ActionsMap[ActionCode] || "Invalid action";
}

function MapActions(ActionsArray) {
    const Codes = {
        "upsample_subtle": "us1",
        'redo_upsample_subtle': "us1",
        'redo_upsample_creative': "us2",
        "upsample_creative": "us2",
        "low_variation": "lv",
        "high_variation": "hv",
        "zoom_out_2x": "zo2",
        "zoom_out_1_5x": "zo1.5",
        "square": "sq",
        "pan_left": "pl",
        "pan_right": "pr",
        "pan_up": "pu",
        "pan_down": "pd",
        "upsample1": "u1",
        "upsample2": "u2",
        "upsample3": "u3",
        "upsample4": "u4",
        "reroll": "🔁",
        "variation1": "v1",
        "variation2": "v2",
        "variation3": "v3",
        "variation4": "v4"
    };
    return ActionsArray.map(action => Codes[action] || "Invalid action");
}

class MidJourney {
    constructor() {
        this.config = {
            name: "ميدجورني",
            Multi: ["mj"],
            Owner: "Shady Tarek",
            Class: "ذكاء اصطناعي",
            Auth: 0,
            Time: 5,
                    }
                }

    async onPick({ args, sh: Message, event }) {
        let prompt = args.join(" ");
        if (event.type === "message_reply" && event.messageReply.attachments && event.messageReply.attachments.length > 0 && ["photo", "sticker"].includes(event.messageReply.attachments[0].type)) {
            const image = event.messageReply.attachments[0].url;
            const imgbbUrl = await funcs.topMedia(image);
            prompt = `${prompt} --sref ${imgbbUrl}`;
        }

        if (!prompt) {
            Message.reply("⚠️ | يرجى تقديم نص لإنشاءه");
            return;
        }
        try {
            Message.react("⚙️");
            const Mid = new global.scraper.MidJourney();
            const image = await Mid.Generate(prompt);
            if(image?.code) return Message.react("❌");
            if(!image.raw_image_url) return Message.react("❌");
            const imageStream = await funcs.imgd(image.raw_image_url);
            const Ac = MapActions(image.actions);
            const ImageID = image.image_id;
            const info = await Message.reply({
                body: "✅ | تم الانتهاء بنجاح ✨\n\nاختار : \n" + Ac.map(item => item.toUpperCase()).join(', '),
                attachment: imageStream
            });
                global.shelly.Reply.push({
                    name: "ميدجورني",
                    ID: info.messageID,
                    author: event.senderID,
                    ImageID: ImageID,
                    Actions: image.actions
                });

            await Message.react("✅");
        } catch (error) {
    console.log(error)
       }
    }

    async Reply({ sh: Message, event, Reply }) {
        let { author, ImageID, Actions  } = Reply;
        if (event.senderID !== author) return;
        const args = event.body.split(" ");
        const options = MapActions(Actions);
        const Options = options.map(item => item.toUpperCase())
        const userSelection = args[0]?.toLowerCase();
        if (!options.includes(userSelection)) {
            Message.reply(`⚠️ | اختيار خاطئ اختار بين ${Options}.`);
            return;
        }
        try {
        Message.react("⚙️");
           await Message.reply("⚠️ | جاري تعديل الصورة انتظر...");
           const Mid = new global.scraper.MidJourney();
           const Image = await Mid.Action({action: GetActions(userSelection),  image_id: ImageID}) 
           const options2 = MapActions(Image.actions);
           const Options2 = options2.map(item => item.toUpperCase())
           const info = await  Message.reply({
                body:`✅ | تم تعديل الصورة : ${userSelection.toUpperCase()} تعديلات اخرى: \n ${Options2.join(', ')}`,
                attachment: await funcs.imgd(Image.raw_image_url)
            });
            await Message.react("✔️");
            global.shelly.Reply.push({
                name: "ميدجورني",
                ID: info.messageID,
                author: event.senderID,
                ImageID: Image.image_id,
                Actions: Image.actions
            });
        } catch (error) {
            Message.react("❌");
            Message.reply(".فشل في العملية");
        }
    }
};

module.exports = new MidJourney();
