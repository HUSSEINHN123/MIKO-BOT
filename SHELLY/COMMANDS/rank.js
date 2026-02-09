
const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont(__dirname + '/canvas/fonts/Comic Sans MS.ttf', { family: 'Comic Sans MS' });
const fs = require('fs');

async function makeLevelCard(userData = {}) {
  const width = 1000;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const {
    name = "مستخدم",
    pfpUrl = 'https://i.pinimg.com/736x/3c/6f/7c/3c6f7c342d10badc2040234765fcfdb2.jpg',
    level = 1,
    exp = 0,
    maxExp = 100,
    rank = "N/A"
  } = userData;

  // خلفية داكنة
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, '#1a1a2e');
  bgGradient.addColorStop(1, '#16213e');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // صورة البروفايل
  const img = await loadImage(pfpUrl);
  const imgSize = 200;
  const imgX = 50;
  const imgY = (height - imgSize) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
  ctx.restore();

  // إطار الصورة
  ctx.beginPath();
  ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#0f3460';
  ctx.stroke();

  // النصوص
  const textX = imgX + imgSize + 50;
  
  ctx.font = 'bold 50px Comic Sans MS';
  ctx.fillStyle = '#e94560';
  ctx.fillText(name, textX, 100);

  ctx.font = '35px Comic Sans MS';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`المستوى: ${level}`, textX, 160);
  ctx.fillText(`الترتيب: #${rank}`, textX, 210);

  // شريط التقدم
  const barX = textX;
  const barY = 250;
  const barWidth = width - textX - 50;
  const barHeight = 40;
  const progress = exp / maxExp;

  // خلفية الشريط
  ctx.fillStyle = '#0f3460';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth, barHeight, 20);
  ctx.fill();

  // التقدم
  const progressGradient = ctx.createLinearGradient(barX, 0, barX + barWidth * progress, 0);
  progressGradient.addColorStop(0, '#e94560');
  progressGradient.addColorStop(1, '#ff6b9d');
  ctx.fillStyle = progressGradient;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth * progress, barHeight, 20);
  ctx.fill();

  // نص التقدم
  ctx.font = 'bold 25px Comic Sans MS';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(`${exp} / ${maxExp} XP`, barX + barWidth/2, barY + 28);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(__dirname + '/cache/level.png', buffer);
}

module.exports.config = {
    name: "مستوى",
    Multi: ["level", "rank"],
    Class: "info",
    Auth: 0,
}

module.exports.onPick = async function(sex) {
    const { event, sh, usersData } = sex;
    const target = Object.keys(event.mentions)[0] || event.senderID;
    const userData = await usersData.get(target);
    
    const exp = userData.exp || 0;
    const level = Math.floor(exp / 100) + 1;
    const currentLevelExp = exp % 100;
    
    await makeLevelCard({
        name: await usersData.getName(target),
        pfpUrl: await usersData.getAvatarUrl(target),
        level: level,
        exp: currentLevelExp,
        maxExp: 100,
        rank: userData.rank || "N/A"
    });
    
    sh.reply({
        body: `مستوى ${await usersData.getName(target)}: ${level} 🏆`,
        attachment: fs.createReadStream(__dirname + '/cache/level.png')
    });
}