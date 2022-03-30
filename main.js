(async function main() {
  // STATE
  const state = {
    list: [],
    mode: "",
    name: "",
    reward: "🍓",
    rounds: 8,
    score: 0,
  };

  // FUNCTIONS
  function clear() {
    terminal.textContent = "";
  }

  function echo(message, dangerouslyUseInnerHTML = false) {
    const line = document.createElement("div");
    line.classList.add("line");
    if (dangerouslyUseInnerHTML) {
      line.innerHTML = message;
    } else {
      line.textContent = message;
    }
    terminal.appendChild(line);
  }

  function generateExpected() {
    if (state.mode === "C") {
      let character = Math.random().toString(36).substring(2, 3);
      if (Math.random() > 0.5) {
        character = character.toUpperCase();
      }
      return character;
    } else if (state.mode === "W") {
      let word = state.list[state.score];
      if (word === "god" || Math.random() > 0.5) {
        word = word[0].toUpperCase() + word.slice(1);
      }
      return word;
    }
  }

  function handleClick(event) {
    const el = document.querySelector("input");
    if (
      el &&
      !event.target.href &&
      document.activeElement.nodeName !== "INPUT"
    ) {
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

  function read(required = false) {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.autocomplete = "off";
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

  function readEmoji() {
    return new Promise((resolve) => {
      const options = ["🍓", "🍌", "🍇", "🍒", "🌭", "🍕", "⭐️", "💚"];
      const fieldset = document.createElement("fieldset");
      let innerHTML = "";
      options.forEach((option, i) => {
        innerHTML += `
          <label>
            <input checked="${
              i === 0
            }" type="radio" name="emoji" value="${option}" />
            <span>${option}</span>
          </label>
        `;
      });
      fieldset.innerHTML = innerHTML;
      terminal.appendChild(fieldset);
      fieldset.querySelector("input").focus();

      function cleanUp(selection) {
        fieldset.remove();
        echo(selection);
        document.removeEventListener("keypress", handleKeyPress);
        resolve(selection);
      }

      function handleKeyPress(event) {
        if (
          event.key === "Enter" &&
          fieldset.contains(document.activeElement)
        ) {
          cleanUp(document.activeElement.value);
        } else if (event.key === "Escape") {
          cleanUp(options[0]);
        }
      }

      // Wait for the previous event to complete before adding listener
      setTimeout(() => {
        document.addEventListener("keypress", handleKeyPress);
      }, 0);
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

  echo("Practice characters (C) or words (W)?");
  while (!state.mode) {
    const mode = (await read(true)).toUpperCase();
    if (mode === "C" || mode === "W") {
      state.mode = mode;
    } else {
      echo("😅 Oops! Please enter C or W:");
    }
  }

  echo("What reward are you working towards?");
  const reward = await readEmoji();
  state.reward = reward;

  echo(`How many times do you want to practice? (default: ${state.rounds})`);
  const rounds = await read();
  if (rounds) state.rounds = rounds;
  if (state.mode === "W") {
    const { default: cvcWords } = await import("./cvc-words.js");
    // h/t https://stackoverflow.com/a/46545530/8486161
    state.list = cvcWords
      .map((a) => ({ sort: Math.random(), value: a }))
      .sort((a, b) => a.sort - b.sort)
      .map((a) => a.value)
      .slice(0, state.rounds);
  }

  clear();
  echo(`Alright, ${state.name}! Let's practice typing!`);
  await sleep(3000);

  while (state.score < state.rounds) {
    const expected = generateExpected();
    let answer = "";

    while (answer !== expected) {
      clear();
      echo("Score: " + printScore());
      echo("Type:&nbsp;&nbsp;<b>" + expected + "</b>", true);
      answer = await read(true);

      if (answer !== expected) {
        echo("🤔 Try again!");
        await sleep(2000);
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
