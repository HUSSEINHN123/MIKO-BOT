const { createCanvas, loadImage, registerFont  } = require('canvas');
registerFont(__dirname + '/canvas/fonts/Comic Sans MS.ttf', { family: 'Comic Sans MS' });
const fs = require('fs');
async function makeImage(userData = {}) {
  const width = 1280;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const {
    name = "Sample User",
    gender = "Not specified",
    uid = "12345678",
    pfpUrl = 'https://i.pinimg.com/736x/3c/6f/7c/3c6f7c342d10badc2040234765fcfdb2.jpg'
  } = userData;


  const bgUrl = 'https://img.freepik.com/premium-vector/pink-cloud-with-stars-clouds-it_324137-8942.jpg?semt=ais_hybrid&w=740&q=80';
  const bg = await loadImage(bgUrl);
  ctx.drawImage(bg, 0, 0, width, height);


  const img = await loadImage(pfpUrl);


  const circleX = 250; 
  const circleY = 250; 
  const radius = 150; 

  ctx.save();
  ctx.beginPath();
  ctx.arc(circleX, circleY, radius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(img, circleX - radius, circleY - radius, radius * 2, radius * 2);
  ctx.restore();

  
  ctx.beginPath();
  ctx.arc(circleX, circleY, radius, 0, Math.PI * 2, true);
  ctx.lineWidth = 5; 
  ctx.strokeStyle = 'pink';
  ctx.stroke();


  const drawHeart = (x, y, size) => {
    ctx.save();
    ctx.fillStyle = '#ff69b4';
    ctx.translate(x, y);
    ctx.scale(size, size);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-5, -5, -15, -5, -15, 5);
    ctx.bezierCurveTo(-15, 15, 0, 20, 0, 20);
    ctx.bezierCurveTo(0, 20, 15, 15, 15, 5);
    ctx.bezierCurveTo(15, -5, 5, -5, 0, 0);
    ctx.fill();
    ctx.restore();
  };


  drawHeart(150, 150, 0.8);
  drawHeart(width - 200, 180, 1.2);
  drawHeart(width - 150, height - 200, 0.9);
  drawHeart(200, height - 150, 1.0);


  try {
    const stickerUrl = 'https://mystickermania.com/cdn/stickers/vsco-aesthetics/vsco-pink-ew-512x512.png';
    const sticker = await loadImage(stickerUrl);
    const stickerSize = 120;
    ctx.drawImage(sticker, width - 180, height - 180, stickerSize, stickerSize);
  } catch (error) {
    console.log('Could not load first sticker, continuing without it');
  }

  try {
    const stickerUrl2 = 'https://cdn-icons-png.flaticon.com/256/10757/10757450.png';
    const sticker2 = await loadImage(stickerUrl2);
    const stickerSize2 = 150;
    ctx.drawImage(sticker2, 260, 280, stickerSize2, stickerSize2);
  } catch (error) {
    console.log('Could not load second sticker, continuing without it');
  }


  ctx.textAlign = 'left';
  

  const textStartX = circleX + radius + 80;
  const textStartY = circleY - 60;
  const lineHeight = 70;


  ctx.font = 'bold 48px Comic Sans MS, cursive, Arial';
  ctx.strokeStyle = '#ff1493'; 
  ctx.lineWidth = 3;
  ctx.fillStyle = '#ffffff'; 
  ctx.shadowColor = 'rgba(255, 105, 180, 0.5)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  ctx.strokeText(`- ${name}`, textStartX, textStartY);
  ctx.fillText(`- ${name}`, textStartX, textStartY);

  
  ctx.font = '36px Comic Sans MS, cursive, Arial';
  ctx.strokeStyle = '#ff69b4';
  ctx.lineWidth = 2;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(255, 105, 180, 0.4)';
  ctx.shadowBlur = 6;
  
  ctx.strokeText(`- Gender: ${gender}`, textStartX, textStartY + lineHeight);
  ctx.fillText(`- Gender: ${gender}`, textStartX, textStartY + lineHeight);

 
  ctx.font = '30px Comic Sans MS, cursive, Arial';
  ctx.strokeStyle = '#ff91a4'; 
  ctx.lineWidth = 2;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(255, 145, 164, 0.3)';
  ctx.shadowBlur = 4;
  
  ctx.strokeText(`- UID: ${uid}`, textStartX, textStartY + lineHeight * 2);
  ctx.fillText(`- UID: ${uid}`, textStartX, textStartY + lineHeight * 2);


  const drawSparkle = (x, y, size) => {
    ctx.save();
    ctx.fillStyle = '#ffb6c1';
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-size/2, -size/8, size, size/4);
    ctx.fillRect(-size/8, -size/2, size/4, size);
    ctx.restore();
  };


  drawSparkle(textStartX - 30, textStartY - 30, 20);
  drawSparkle(textStartX + 300, textStartY + 40, 15);
  drawSparkle(textStartX + 250, textStartY + 100, 18);
  drawSparkle(textStartX - 20, textStartY + 160, 16);

  
  ctx.shadowColor = 'transparent';

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(__dirname + '/cache/output.png', buffer);

}
module.exports.config = {
    name: "أيدي",
    Multi: ["uid"],
    Class: "info",
    Auth: 0,
}
module.exports.onPick = async function(sex) {
    const { event, sh, usersData } = sex;
    const target = Object.keys(event.mentions).length !== 0 ? Object.keys(event.mentions)[0] : event.messageReply ? event.messageReply.senderID :  event.senderID;
    const userData = await usersData.get(target);
    await makeImage({
    name: await usersData.getName(target),
    gender: userData.gender == 2 ? "Male" : userData.gender == 1 ? "Female" : "Gay",
    pfpUrl: await usersData.getAvatarUrl(target),
    uid: target
});
    sh.reply({
        body: 'UID: ' + target,
        attachment: fs.createReadStream(__dirname + '/cache/output.png')
    })
}
