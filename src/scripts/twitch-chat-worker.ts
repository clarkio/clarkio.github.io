// Worker type definition
declare var self: Worker;

export interface TwitchWorkerMessage {
  username: string;
  message: string;
  timestamp: number;
}

export interface TwitchWorkerResult {
  type: 'twitch_message';
  username: string;
  message: string;
  timestamp: number;
}

// Worker implementation
self.onmessage = function (e: MessageEvent<TwitchWorkerMessage>) {
  try {
    const { username, message, timestamp } = e.data;

    if (message.length > 4 && message.length < 10 && !message.includes(' ')) {
      const result: TwitchWorkerResult = {
        type: 'twitch_message',
        username: username.toLowerCase(),
        message: message.toLowerCase(),
        timestamp
      };

      self.postMessage(result);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message
    });
  }
};

// Handle worker errors
self.onerror = function (error) {
  console.error('Twitch Worker Error:', error);
};

self.onmessageerror = function (error) {
  console.error('Twitch Worker Message Error:', error);
};
