(async function main() {
  // STATE
  const state = {
    name: "",
    reward: "🍓",
    rounds: 8,
    score: 0,
  };

  // FUNCTIONS
  function clear() {
    terminal.textContent = "";
  }

  function echo(message) {
    const line = document.createElement("div");
    line.classList.add("line");
    line.textContent = message;
    terminal.appendChild(line);
  }

  function generateCharacter() {
    let character = Math.random().toString(36).substring(2, 3);
    if (Math.random() > 0.5) {
      character = character.toUpperCase();
    }
    return character;
  }

  function handleClick(event) {
    const el = document.getElementById("input");
    if (el && !event.target.href) {
      event.preventDefault();
      el.focus();
    }
  }

  function printScore() {
    let string = "";

    for (let i = 0; i < state.score; i++) {
      string += state.reward;
    }

    return string;
  }

  async function read(required = false) {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.id = "input";

      input.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();

          if (!required || event.target.value) {
            resolve(event.target.value);
            input.remove();
            echo(event.target.value);
          }
        }
      });

      terminal.appendChild(input);
      input.focus();
    });
  }

  async function sleep(duration) {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }

  // SETUP
  window.addEventListener("click", handleClick);

  // PROGRAM
  echo("What is your name?");
  const name = await read(true);
  state.name = name;

  echo("What reward are you working towards? (optional)");
  const reward = await read();
  if (reward) state.reward = reward;

  echo(`How many times do you want to practice? (default: ${state.rounds})`);
  const rounds = await read();
  if (rounds) state.rounds = rounds;

  clear();
  echo(`Alright, ${state.name}! Let's practice typing!`);
  await sleep(3000);

  while (state.score < state.rounds) {
    const character = generateCharacter();
    let answer = "";

    while (answer !== character) {
      clear();
      echo("Score: " + printScore());
      echo("Type:  " + character);
      answer = await read(true);

      if (answer !== character) {
        echo("♻️ Try again!");
      }
    }

    state.score++;
    echo("😊 Nice practice!");
    await sleep(2000);
  }

  clear();
  echo("You did it! Great practicing 💪");
  echo(`Enjoy your ${printScore()}`);
})();
