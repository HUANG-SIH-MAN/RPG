import * as readline from "readline";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function heroAction(choose: string) {
  return new Promise<number>((resolve) => {
    rl.question(`選擇行動： ${choose}`, (action) => {
      resolve(Number(action));
    });
  });
}

async function chooseTarget(choose: string, target_amount: number) {
  return new Promise<number[]>((resolve) => {
    rl.question(`選擇${target_amount}位目標: ${choose}`, (answer) => {
      const target = answer.split(" ").map((i) => Number(i));
      resolve(target);
    });
  });
}

export default {
  heroAction,
  chooseTarget,
};
