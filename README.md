<p align="center" style="margin-bottom: 0px !important;">
  <img width="200" src="https://i.ibb.co/T4yBqXr/pika.png" alt="pika" align="center">
</p>
<h1 align="center" style="margin-top: 0px;">P2W Helper</h1>

<p align="center">Most efficient way to collect your gkits!</p>

Collects gkits for you and gifts them to your main account. Saves a ton of time on all modes across pika-network.

## Installation

- Download [nodejs](https://nodejs.org/en/download) on your computer.
- Open a command prompt in your [folder's directory](https://www.youtube.com/watch?v=bgSSJQolR0E).
- Install dependencies.
```bash
npm install
```
- Run index.js.
```bash
cd src
node index.js
```
## FAQ

### What if all my accounts have different passwords?

That's simple, just put a coloumn between them in the usernames text file, like so:

```txt
Account1
Account2
Account3
Account4:IHaveADifferentPassword
Account5
```

### Does this work on all modes?

Yes, just change the mode in the config.json file, no shortforms. To test if your input would work try '/server <your input>' on pika before entering it to avoid confusion.

### Where is the usernames text file & config json?

They will be created with prompts on your first run. However, you can create the usernames.txt yourself.

### Why is it getting blocked by v4guard?

If your gkit alt accounts match a pattern, they get flagged for botting. Increase delay. Example of a similar pattern would be as below:

```txt
TreasureAcc1
TreasureAcc2
TreasureAcc3
```

## Features

- Works on Linux, Unix, macOS, Microsoft Windows, and more.
- Supports all modes.
- Fast.

## Feedback

If you have any feedback or you require support, reach out to me on discord.  
@rehire