import tmi from 'tmi.js';
import io from 'socket.io-client';

const twitchWorker = new Worker(
  new URL('../scripts/twitch-chat-worker.ts', import.meta.url),
  { type: 'module' }
);
const wosWorker = new Worker(
  new URL('../scripts/wos-worker.ts', import.meta.url),
  { type: 'module' }
);

export class GameSpectator {
  private msgProcessDelay = 500;
  private lastTwitchMessage: {
    username: string;
    message: string;
    timestamp: number;
  } | null = null;
  wosGameLogId = 'wos-game-log';
  twitchChatLogId = 'twitch-chat-log';
  currentLevel: number = 0;
  twitchChatLog: Map<string, { message: string; timestamp: number; }>;
  wosSocket: any;
  twitchClient: any;
  currentLevelBigWord: string = '';
  currentLevelCorrectWords: string[] = [];
  wosEventQueue: any[] = [];
  twitchEventQueue: any[] = [];
  currentLevelLetters: string[] = [];
  isProcessingWos: boolean = false;
  isProcessingTwitch: boolean = false;

  constructor() {
    this.twitchChatLog = new Map();
    this.wosSocket = null;
    this.twitchClient = null;
    this.startEventProcessors();
  }

  private async startEventProcessors() {
    // Set up WOS worker message handler
    wosWorker.onmessage = async (e) => {
      if (e.data.type === 'wos_event') {
        const { wosEventType, wosEventName, username, letters, hitMax, stars, level, falseLetters, hiddenLetters } = e.data;

        const message = username ? `:${username} - ${letters.join('')} - Big Word: ${hitMax}` : '';
        console.log(`[WOS Event] <${wosEventName}>${message}`);

        if (wosEventType === 1 || wosEventType === 12) {
          this.log(`Level ${level} ${wosEventType === 1 ? 'Started' : 'In Progress'}`, this.wosGameLogId);
          this.currentLevel = parseInt(level);
          document.getElementById('level-title')!.innerText =
            `Level:`;
          document.getElementById('level-value')!.innerText =
            `${level}`;
          document.getElementById('letters-label')!.innerText = 'Letters:';
          if (letters.length > 0) {
            this.currentLevelLetters = letters;
            document.getElementById('letters')!.innerText = letters.join(' ').toUpperCase();
          }
        } else if (wosEventType === 3) {
          // Wait for any pending Twitch messages
          await new Promise(resolve => setTimeout(resolve, this.msgProcessDelay));

          // Update UI with processed data
          this.updateGameState(username, letters, hitMax);
        } else if (wosEventType === 4) {
          this.log(`Level ${this.currentLevel} ended with ${stars} stars`, this.wosGameLogId);
          console.log(`[WOS Helper] Level ${this.currentLevel} ended`);

          this.currentLevel += parseInt(stars);
          document.getElementById('level-title')!.innerText =
            `Next Level:`;
          document.getElementById('level-value')!.innerText =
            `${this.currentLevel}`;

          this.clearBoard();
        } else if (wosEventType === 5) {
          this.log(`Game Ended on Level ${level}`, this.wosGameLogId);
          this.clearBoard();
        } else if (wosEventType === 10) {
          this.log(`Hidden/Fake Letters Revealed`, this.wosGameLogId);
          this.log(`Hidden Letters: ${hiddenLetters.join(' ')}`, this.wosGameLogId);
          this.log(`Fake Letters: ${falseLetters.join(' ')}`, this.wosGameLogId);
          if (falseLetters.length > 0) {
            document.getElementById('fake-letter')!.innerText = falseLetters.join(' ').toUpperCase();
          }
          if (hiddenLetters.length > 0) {
            document.getElementById('hidden-letter')!.innerText = hiddenLetters.join(' ').toUpperCase();
          }
        }
      };

      // Set up Twitch worker message handler
      twitchWorker.onmessage = (e) => {
        if (e.data.type === 'twitch_message') {
          const { username, message, timestamp } = e.data;
          this.lastTwitchMessage = { username, message, timestamp };
          this.twitchChatLog.set(username, { message, timestamp });
          this.log(`[Twitch Chat] ${username}: ${message}`, this.twitchChatLogId);
        }
      };
    };
  }

  private clearBoard() {
    console.log('[WOS Helper] Clearing the correct words and big word');
    this.currentLevelCorrectWords = [];
    this.currentLevelBigWord = '';
    this.lastTwitchMessage = null;
    this.twitchChatLog.clear();
    document.getElementById('correct-words-log')!.innerText = '';
    document.getElementById('letters')!.innerText = '';
    document.getElementById('letters-label')!.innerText = 'Letters:';
    document.getElementById('hidden-letter')!.innerText = '';
    document.getElementById('fake-letter')!.innerText = '';
  }

  private updateGameState(username: string, letters: string[], hitMax: boolean) {
    // Log the correct guess
    let word = letters.join('');

    // if (word.includes('?')) {
    // WOS is at level 20+ and hides the correct word
    // Get the latest message from the user in chat log
    // const latestMessage = this.twitchChatLog.get(username);
    const lowerUsername = username.toLowerCase();
    console.log(`[WOS Helper] Looking for ${lowerUsername}'s message in chat log`);
    console.log(`[WOS Helper] Last twitch message: ${JSON.stringify(this.lastTwitchMessage)}`);
    console.log(`[WOS Helper] Chat log entry for ${lowerUsername}: ${JSON.stringify(this.twitchChatLog.get(lowerUsername))}`);
    if (
      this.lastTwitchMessage &&
      this.lastTwitchMessage.username.toLowerCase() === lowerUsername &&
      this.lastTwitchMessage.message.length === letters.length
    ) {
      word = this.lastTwitchMessage.message;
    } else {
      // Fall back to chat log
      const latestMessage = this.twitchChatLog.get(lowerUsername);
      if (latestMessage && latestMessage.message.length === letters.length) {
        word = latestMessage.message;
      } else {
        console.warn(
          `[WOS Helper] Could not find matching message for ${lowerUsername}`,
          `[WOS Helper] Last message: ${JSON.stringify(this.lastTwitchMessage)}`,
          `[WOS Helper] Chat log entry: ${JSON.stringify(latestMessage)}`
        );
        return; // Skip updating UI if we can't find the word
      }
    }
    // }

    this.log(`[WOS Event] ${lowerUsername} correctly guessed: ${word}`, this.wosGameLogId);
    // Add to correct words list
    this.currentLevelCorrectWords.push(word);
    this.currentLevelCorrectWords.sort((a, b) => a.length - b.length);
    // Update correct words display
    document.getElementById('correct-words-log')!.innerText =
      this.currentLevelCorrectWords.join(', ');

    // If hitMax is true, set the current level big word
    if (hitMax) {
      this.currentLevelBigWord = word.split('').join(' ').toUpperCase();
      document.getElementById('letters-label')!.innerText = 'Big Word:';
      document.getElementById('letters')!.innerText = this.currentLevelBigWord;
      this.calculateHiddenLetters(this.currentLevelBigWord);
      this.calculateFakeLetters(this.currentLevelBigWord);
    }
  }

  calculateHiddenLetters(bigWord: string) {
    const bigWordLetters = bigWord.split(' ').map(letter => letter.toLowerCase());
    console.log(`Big Word Letters: ${bigWordLetters.join(' ')}`, this.wosGameLogId);
    console.log(`Current Level Letters: ${this.currentLevelLetters.join(' ')}`, this.wosGameLogId);
    // compare bigWordLetters with currentLevelLetters
    // if a letter is in the bigWordLetters but not in currentLevelLetters, it is hidden
    // if a letter is in the bigWordLetters more than once and is in currentLevelLetters, it is hidden as well
    const hiddenLettersSet = new Set<string>();
    bigWordLetters.forEach(letter => {
      const bigWordLetterCount = bigWordLetters.filter(l => l === letter).length;
      const currentLevelLetterCount = this.currentLevelLetters.filter(l => l === letter).length;
      if (currentLevelLetterCount < bigWordLetterCount) {
        hiddenLettersSet.add(letter);
      }
    });
    const hiddenLetters = Array.from(hiddenLettersSet);
    this.log(`Hidden Letters: ${hiddenLetters.join(' ')}`, this.wosGameLogId);
    if (hiddenLetters.length > 0 && hiddenLetters.length !== this.currentLevelLetters.length) {
      document.getElementById('hidden-letter')!.innerText = hiddenLetters.join(' ').toUpperCase();
    }


    // ? C S R E A L
    // S C A R E D
    // L is Fake and D is Hidden
  }

  calculateFakeLetters(bigWord: string) {
    const bigWordLetters = bigWord.split(' ').map(letter => letter.toLowerCase());
    const fakeLetters = this.currentLevelLetters.filter(letter => !bigWordLetters.includes(letter) && letter !== '?');
    this.log(`Fake Letters: ${fakeLetters.join(' ')}`, this.wosGameLogId);
    if (fakeLetters.length > 0 && fakeLetters.length !== this.currentLevelLetters.length) {
      document.getElementById('fake-letter')!.innerText = fakeLetters.join(' ').toUpperCase();
    }
  }

  getMirrorCode(mirrorUrl) {
    try {
      const url = new URL(mirrorUrl);
      const pathParts = url.pathname.split('/');
      const codeIndex = pathParts.indexOf('r') + 1;
      if (codeIndex > 0 && codeIndex < pathParts.length) {
        return pathParts[codeIndex];
      }
      return null;
    } catch (error) {
      console.error('Error parsing mirror URL:', error);
      return null;
    }
  }

  connectToWosGame(mirrorUrl) {
    const gameCode = this.getMirrorCode(mirrorUrl);
    if (!gameCode) {
      this.log('Invalid mirror URL', this.wosGameLogId);
      return;
    }

    if (this.wosSocket) {
      this.wosSocket.disconnect();
    }

    this.wosSocket = io('wss://wos2.gartic.es', {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 20000,
      transports: ['websocket'],
      query: {
        uid: gameCode
      },
      forceNew: true
    });

    this.wosSocket.on((event, ...args) => {
      this.log(`Event received: ${event}`, this.wosGameLogId);
      this.log(`Data: ${JSON.stringify(args, null, 2)}`, this.wosGameLogId);
    });

    this.wosSocket.on('3', (eventType, data) => {
      // console.log('[WOS Event] Event received: ', eventType, data);
      wosWorker.postMessage({ eventType, data });
    });

    this.wosSocket.on('connect', () => {
      this.log('Connected to WOS game: ' + gameCode, this.wosGameLogId);
    });

    this.wosSocket.on('connect_error', (error) => {
      this.log('WOS Connection error: ' + error, this.wosGameLogId);
    });

    this.wosSocket.on('disconnect', () => {
      this.log('Disconnected from WOS game server', this.wosGameLogId);
    });

    this.wosSocket.on('error', (error) => {
      this.log('WOS Socket error: ', this.wosGameLogId);
    });
  }

  connectToTwitch(channel) {
    if (!channel.startsWith('#')) {
      channel = '#' + channel;
    }

    if (this.twitchClient) {
      this.disconnectTwitch();
    }

    this.twitchClient = new tmi.Client({
      connection: {
        secure: true,
        reconnect: true
      },
      channels: [channel]
    });

    this.twitchClient.on('message', (channel, tags, message, self) => {
      // this.log(`Twitch Chat: ${tags.username}: ${message}`, this.twitchChatLogId);
      twitchWorker.postMessage({
        username: tags.username.toLowerCase(),
        message: message.toLowerCase(),
        timestamp: Date.now()
      });
    });

    this.twitchClient.on('connected', (addr, port) => {
      this.log(`Connected to Twitch chat for channel: ${channel}`, this.twitchChatLogId);
    });

    this.twitchClient.on('disconnected', (reason) => {
      this.log(`Disconnected from Twitch chat: ${reason}`, this.twitchChatLogId);
    });

    this.twitchClient.connect().catch(console.error);
  }

  disconnect() {
    if (this.wosSocket) {
      this.wosSocket.disconnect();
      this.wosSocket = null;
    }
  }

  disconnectTwitch() {
    if (this.twitchClient) {
      this.twitchClient.disconnect();
      this.twitchClient = null;
    }
  }

  log(message, logId) {
    const logDiv = document.getElementById(logId || 'wos-game-log');
    if (typeof message === 'object') {
      message = JSON.stringify(message, null, 2);
    }
    logDiv!.innerText += `${message}\n`;
    console.log(message);
    logDiv!.scrollTop = logDiv!.scrollHeight;
  }

  // private async processWosEvent(event: { type: number; data: any; }) {
  //   const eventType = event.type;
  //   const data = event.data;
  //   this.log(`Processing WOS event: ${event.type}`, 'wos-game-log');
  //   let correctWord = '';
  //   this.log(`Game Event Type: ${eventType}`, this.wosGameLogId);
  //   // this.log(`Data: ${JSON.stringify(data, null, 2)}`, wosGameLogId)

  //   // correct guess event
  //   if (eventType === 3) {
  //     if (data.letters.includes('?')) {
  //       // correct guesses are hidden so get the latest message for that user from chat log
  //       const username = data.user.name.toLowerCase();
  //       const latestMessage = this.twitchChatLog.get(username);
  //       if (
  //         latestMessage &&
  //         latestMessage.message.length === data.letters.length
  //       ) {
  //         this.log(
  //           `${data.user.name} correctly guessed: ${latestMessage.message}`,
  //           this.wosGameLogId
  //         );
  //         this.currentLevelCorrectWords.push(latestMessage.message);
  //         correctWord = latestMessage.message;
  //       } else {
  //         console.warn(
  //           `Could not find a matching message for ${data.user.name} in the chat log
  //               Twitch username: ${username}
  //               Twitch message: ${latestMessage?.message}
  //               WOS Hidden Word: ${data.letters.join('')}
  //               WOS word length: ${data.letters.length}`
  //         );
  //       }
  //     } else {
  //       this.log(
  //         `${data.user.name} correctly guessed: ${data.letters.join('')}`,
  //         this.wosGameLogId
  //       );
  //       this.currentLevelCorrectWords.push(data.letters.join(''));
  //       correctWord = data.letters.join('');
  //     }

  //     document.getElementById('correct-words-log')!.innerText =
  //       this.currentLevelCorrectWords.join(', ');
  //     if (data.hitMax === true) {
  //       this.currentLevelBigWord = correctWord
  //         .split('')
  //         .join(' ')
  //         .toUpperCase();
  //       document.getElementById('big-word')!.innerText =
  //         this.currentLevelBigWord;
  //     }
  //   }

  //   if (eventType === 4) {
  //     this.log(`Level ended with ${data.stars} stars`, this.wosGameLogId);
  //     this.currentLevelCorrectWords = [];
  //     this.currentLevelBigWord = '';
  //     document.getElementById('correct-words-log')!.innerText = '';
  //     document.getElementById('big-word')!.innerText = '';
  //   }

  //   if (eventType === 1) {
  //     this.log(`Level ${data.level} started`, this.wosGameLogId);
  //     this.currentLevel = parseInt(data.level);
  //     document.getElementById('level-title')!.innerText =
  //       `Level: ${data.level}`;
  //   }

  //   // round end, clear chat log
  //   if (eventType === 8) {
  //     this.twitchChatLog.clear();
  //   }
  // }
}
