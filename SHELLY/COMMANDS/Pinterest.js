const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "بين",
    Aliases: ["pin", "pint", "بن", "Pinterest", "pinterest", "صور"],
    author: "YourName",
    cooldowns: 5,
    Auth: 0,
    description: "البحث عن صور من Pinterest",
    category: "بحث",
    usage: "<كلمة البحث> [عدد الصور]"
  },

  onPick: async function ({ api, event, args, sh }) {
    try {
      if (args.length === 0) {
        return sh.reply("⚠️ الرجاء إدخال كلمة البحث!\n\n📝 مثال: بين cat");
      }

      let count = 8;
      const lastArg = args[args.length - 1];
      if (!isNaN(lastArg) && parseInt(lastArg) > 0) {
        count = Math.min(parseInt(lastArg), 20);
        args.pop();
      }

      const query = args.join(" ");

      const waitMsg = await sh.reply(`🔍 جاري البحث عن "${query}"...\n⏳ الرجاء الانتظار...`);

      const params = {
        data: JSON.stringify({
          options: {
            query: query,
            scope: "pins",
            appliedProductFilters: "---",
            domains: null,
            user: null,
            seoDrawerEnabled: false,
            applied_unified_filters: null,
            auto_correction_disabled: false,
            journey_depth: null,
            source_module_id: null,
            selected_one_bar_modules: null,
            query_pin_sigs: null,
            page_size: 200,
            price_max: null,
            price_min: null,
            request_params: null,
            top_pin_ids: null,
            article: null,
            corpus: null,
            customized_rerank_type: null,
            filters: null,
            rs: "ac",
            redux_normalize_feed: true
          },
          context: {}
        }),
        _: Date.now()
      };

      const { data } = await axios.get(
        "https://www.pinterest.com/resource/BaseSearchResource/get/",
        {
          headers: {
            "accept": "application/json, text/javascript, */*, q=0.01",
            "x-pinterest-appstate": "active",
            "x-pinterest-pws-handler": "www/search/[scope].js",
            "x-pinterest-source-url": `/search/pins/?q=${encodeURIComponent(query)}&rs=typed`,
            "cookie": "_pinterest_sess=TWc9PSZ4NDFaQmU0Ymh3OWtMUy8xaVA1OGJVUlhCTUg3Q1B5MXJSb3VuM2tPbEJMcXd6MFppYVE4YnZDRHY0N25JVHZkVlRIL0xKa0RXRWE0RkdIVGlmYmg3YjJBUjBsYnRucHdxSVcvQ25tQmR3VT0mQVk4cWNkemVWbnlRNXNNSzMzTURKNXhWV2tNPQ==; _auth=0; csrftoken=936140a434d486d3b1cfb2b10ab494ab; _routing_id=\"1d08a466-2002-4691-af11-647525500eb2\"; g_state={\"i_l\":0,\"i_ll\":1761916384803,\"i_b\":\"/F4SB/TlvCIY3sFJm8curOsI8O4o57NgKUqso59TJM0\"}",
            "Referer": "https://www.pinterest.com/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          },
          params
        }
      );

      const jsonString = JSON.stringify(data);
      const imageRegex = /https:\/\/i\.pinimg\.com\/(736|1200)x\/[a-f0-9]{2}\/[a-f0-9]{2}\/[a-f0-9]{2}\/[a-f0-9]+\.(jpg|png|webp)/gi;
      const images = jsonString.match(imageRegex);

      api.unsendMessage(waitMsg.messageID);

      if (!images || images.length === 0) {
        return sh.reply(`❌ لم يتم العثور على صور لـ "${query}"\n\n💡 جرب كلمة بحث أخرى!`);
      }

      const uniqueImages = [...new Set(images)];

      const shuffledImages = [...uniqueImages];
      for (let i = shuffledImages.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledImages[i], shuffledImages[j]] = [shuffledImages[j], shuffledImages[i]];
      }

      const selectedImages = shuffledImages.slice(0, Math.min(count, shuffledImages.length));

      const attachments = [];

      for (let i = 0; i < selectedImages.length; i++) {
        try {
          const imgUrl = selectedImages[i];
          const imgPath = path.join(__dirname, `cache/pinterest_${Date.now()}_${i}.jpg`);
          
          const response = await axios.get(imgUrl, { responseType: "stream" });
          const writer = fs.createWriteStream(imgPath);
          
          response.data.pipe(writer);
          
          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });

          attachments.push(fs.createReadStream(imgPath));
        } catch (error) {
          console.error(`Error downloading image ${i}:`, error);
        }
      }

      if (attachments.length > 0) {
        sh.reply({
          body: `✅ تم العثور على ${attachments.length} صورة عشوائية لـ "${query}"\n\n🎲 نتائج عشوائية من Pinterest`,
          attachment: attachments
        });

        setTimeout(() => {
          const cacheDir = path.join(__dirname, "cache");
          fs.readdir(cacheDir, (err, files) => {
            if (err) return;
            files.forEach(file => {
              if (file.startsWith("pinterest_")) {
                fs.unlink(path.join(cacheDir, file), () => {});
              }
            });
          });
        }, 5000);
      } else {
        return sh.reply(`⚠️ حدث خطأ أثناء تحميل الصور لـ "${query}"`);
      }
    } catch (error) {
      console.error(error);
      return sh.reply("❌ حدث خطأ أثناء البحث في Pinterest!");
    }
  }
};