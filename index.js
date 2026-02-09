const logger = require("./tools/logger/log");
const chalk = require("chalk");
const THEME = (require("./CONFIGURATIONS/CONFIG.json")).THEME;
const cv = chalk.bold.hex("#bf00ff");
const gradient = require("gradient-string");
const logo = `        
 _____ _       _ _     
|   __| |_ ___| | |_ _     
|__   |   | -_| | | | |       by Gry KJ
|_____|_|_|___|_|_|_  |       
                  |___|     
`;

const c = [...THEME.main];
const redToGreen = gradient(...THEME.main);
console.log(redToGreen("━ ".repeat(20), { interpolation: "hsv" }));
const text = gradient(c).multiline(logo);
console.log(text);
console.log(redToGreen("━ ".repeat(20), { interpolation: "hsv" }));

console.log(cv(`\n` + `● SHELLY HAS STARTED`));


logger([
  {
  message: "※ START ▷ ",
   color: [...THEME.main],
  },
  {
  message: `Getting Started`,
  color: THEME.text,
  },
]);

const { spawn } = require('child_process');
const Fastify = require('fastify');
class Bot {
  constructor() {
    this.app = Fastify();
    this.PORT = 3000;
    this.countRestart = 0;
    this.child = null;
    this.init();
  }

  init() {
    this.startApp();
    this.startBot();
  }

  startApp() {
    this.app.get("/", (req, reply) => {
      reply.send("Shelly BOT is running")
    });

    const listenOptions = {
      port: this.PORT,
      host: '0.0.0.0',
    };

    this.app.listen(listenOptions, (err, address) => {
      if (err) {
        logger([
          {
          message: "※ SERVER ▷ ",
           color: "red"
          },
          {
          message: `Error starting server: ${err}`,
          color: THEME.text,
          },
        ]);
        process.exit(1);
      }
      logger([
        {
        message: "※ SERVER ▷ ",
         color: [...THEME.main],
        },
        {
        message: `App deployed on port ${this.PORT}`,
        color: "white",
        },
      ]);
    });
  }
  startBot() {
    const options = {
      cwd: __dirname,
      stdio: "inherit",
      shell: true,
    };
    this.child = spawn(
      "node",
      [ "--no-deprecation", "--async-stack-traces", "main.js" ],
      options
    );
    this.child.on("close", (codeExit) => {
      if (codeExit !== 0 && this.countRestart < 5) {
        this.countRestart += 1;
        this.startBot();
      }
    });
    this.child.on("error", (error) => {
      console.error("An error occurred: " + JSON.stringify(error), "error");
    });
  }
}

const Shelly = new Bot(); 