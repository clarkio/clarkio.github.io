declare var self: Worker;

export interface WosWorkerMessage {
  eventType: number;
  data: {
    user: {
      name: string;
    };
    letters: string[];
    hitMax: boolean;
  };
}

export interface WosWorkerResult {
  type: 'wos_event';
  username: string;
  letters: string[];
  hitMax: boolean;
}

self.onmessage = function (e: MessageEvent<WosWorkerMessage>) {
  try {
    const { eventType, data } = e.data;

    if (eventType === 3) {
      const result: WosWorkerResult = {
        type: 'wos_event',
        username: data.user.name,
        letters: data.letters,
        hitMax: data.hitMax
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

self.onerror = function (error) {
  console.error('WOS Worker error:', error);
};

self.onmessageerror = function (error) {
  console.error('WOS Worker Message Error:', error);
};
