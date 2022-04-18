"use strict";
var _readline = _interopRequireDefault(require("readline"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function onMessage(callback) {
    const rl = _readline.default.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    rl.on("line", (line)=>{
        try {
            const ev = JSON.parse(line);
            callback(ev);
        } catch (e) {
            process.exit(2);
        }
    });
}
function send(msg) {
    console.log(JSON.stringify(msg));
}
function main() {
    let interval;
    let count = 0;
    onMessage((msg)=>{
        switch(msg.event){
            case "start":
                interval = setInterval(()=>send({
                        event: "run",
                        payload: ++count
                    })
                , 1500);
                break;
            case "stop":
                clearInterval(interval);
                break;
            case "reset":
                count = 0;
                break;
        }
    });
}
main();
