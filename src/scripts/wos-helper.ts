// const twitchWorker = new Worker(
//   new URL('../scripts/twitch-chat-worker.ts', import.meta.url),
//   { type: 'module' }
// );
// const wosWorker = new Worker(
//   new URL('../scripts/wos-worker.ts', import.meta.url),
//   { type: 'module' }
// );
import tmi from 'tmi.js';
import io from 'socket.io-client';
export class GameSpectator {
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
  isProcessingWos: boolean = false;
  isProcessingTwitch: boolean = false;

  constructor () {
    this.twitchChatLog = new Map();
    this.wosSocket = null;
    this.twitchClient = null;
    this.startEventProcessors();
  }

  private async startEventProcessors() {
    // WOS Event Processor
    setInterval(async () => {
      if (!this.isProcessingWos && this.wosEventQueue.length > 0) {
        this.isProcessingWos = true;
        const event = this.wosEventQueue.shift();
        await this.processWosEvent(event);
        this.isProcessingWos = false;
      }
    }, 100);

    // Twitch Event Processor
    setInterval(async () => {
      if (!this.isProcessingTwitch && this.twitchEventQueue.length > 0) {
        this.isProcessingTwitch = true;
        const event = this.twitchEventQueue.shift();
        await this.processTwitchEvent(event);
        this.isProcessingTwitch = false;
      }
    }, 100);
  }

  private async processWosEvent(event: { type: number; data: any; }) {
    const eventType = event.type;
    const data = event.data;
    this.log(`Processing WOS event: ${event.type}`, 'wos-game-log');
    let correctWord = '';
    this.log(`Game Event Type: ${eventType}`, this.wosGameLogId);
    // this.log(`Data: ${JSON.stringify(data, null, 2)}`, wosGameLogId)

    // correct guess event
    if (eventType === 3) {
      if (data.letters.includes('?')) {
        // correct guesses are hidden so get the latest message for that user from chat log
        const username = data.user.name.toLowerCase();
        const latestMessage = this.twitchChatLog.get(username);
        if (
          latestMessage &&
          latestMessage.message.length === data.letters.length
        ) {
          this.log(
            `${data.user.name} correctly guessed: ${latestMessage.message}`,
            this.wosGameLogId
          );
          this.currentLevelCorrectWords.push(latestMessage.message);
          correctWord = latestMessage.message;
        } else {
          console.warn(
            `Could not find a matching message for ${data.user.name} in the chat log
                Twitch username: ${username}
                Twitch message: ${latestMessage?.message}
                WOS Hidden Word: ${data.letters.join('')}
                WOS word length: ${data.letters.length}`
          );
        }
      } else {
        this.log(
          `${data.user.name} correctly guessed: ${data.letters.join('')}`,
          this.wosGameLogId
        );
        this.currentLevelCorrectWords.push(data.letters.join(''));
        correctWord = data.letters.join('');
      }

      document.getElementById('correct-words-log')!.innerText =
        this.currentLevelCorrectWords.join(', ');
      if (data.hitMax === true) {
        this.currentLevelBigWord = correctWord
          .split('')
          .join(' ')
          .toUpperCase();
        document.getElementById('big-word')!.innerText =
          this.currentLevelBigWord;
      }
    }

    if (eventType === 4) {
      this.log(`Level ended with ${data.stars} stars`, this.wosGameLogId);
      this.currentLevelCorrectWords = [];
      this.currentLevelBigWord = '';
      document.getElementById('correct-words-log')!.innerText = '';
      document.getElementById('big-word')!.innerText = '';
    }

    if (eventType === 1) {
      this.log(`Level ${data.level} started`, this.wosGameLogId);
      this.currentLevel = parseInt(data.level);
      document.getElementById('level-title')!.innerText =
        `Level: ${data.level}`;
    }

    // round end, clear chat log
    if (eventType === 8) {
      this.twitchChatLog.clear();
    }
  }

  private async processHiddenWosWord(eventType: number, data: any) { }

  private updateCorrectWordsDisplay() {
    const correctWordsDiv = document.getElementById('correct-words-log');
    if (correctWordsDiv) {
      correctWordsDiv.innerHTML = this.currentLevelCorrectWords.join(', ');
    }
  }

  private async processTwitchEvent(event: {
    username: string;
    message: string;
  }) {
    this.log(
      `Processing Twitch message: ${event.username}: ${event.message}`,
      'twitch-chat-log'
    );
    if (
      event.message.length > 4 &&
      event.message.length < 10 &&
      !event.message.includes(' ') &&
      !event.message.includes('<')
    ) {
      this.twitchChatLog.set(event.username.toLowerCase(), {
        message: event.message.toLowerCase(),
        timestamp: Date.now()
      });
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

  connectToGame(mirrorUrl) {
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
      this.wosEventQueue.push({ type: eventType, data });
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
      this.log('WOS Socket error: ' + error, this.wosGameLogId);
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
      this.log(`Twitch Chat - ${tags.username}: ${message}`, this.twitchChatLogId);
      if (
        message.length > 4 &&
        message.length < 10 &&
        !message.includes(' ')
      ) {
        this.twitchChatLog.set(tags.username.toLowerCase(), {
          message: message.toLowerCase(),
          timestamp: Date.now()
        });
        console.dir(this.twitchChatLog);
      }
    });

    this.twitchClient.on('connected', (addr, port) => {
      this.log(`Connected to Twitch chat: ${channel}`, this.twitchChatLogId);
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
    logDiv!.innerHTML += `${message}<br>`;
    console.log(message);
    logDiv!.scrollTop = logDiv!.scrollHeight;
  }
}
