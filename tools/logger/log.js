const chalk = require('chalk');
const gradient = require("gradient-string")

const colors = {
  red: "#ff0000",
  green: "#00ff00",
  yellow: "#ffff00",
  blue: "#0000ff",
  magenta: "#ff00ff",
  cyan: "#00ffff",
  white: "#ffffff",
  gray: "#808080",
  ocean: "#00bfff",
};

module.exports = async (messages) => {
  const logMessage = messages
    .map(({ message, color }) => {
      if (Array.isArray(color)) {
        const gradientFunction = gradient(...color);
        return gradientFunction(message);
      } else {
        return chalk.hex(colors[color])(message);
      }
    })
    .join("");
  console.log(logMessage, "");
};