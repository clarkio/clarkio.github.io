declare var self: Worker;

export interface WosWorkerMessage {
  eventType: number;
  data: {
    user?: {
      name?: string;
    };
    letters?: string[];
    hitMax?: boolean;
    level?: number;
    stars?: number;
    falseLetters?: string[];
    hiddenLetters?: string[];
    slots?: any[];
  };
}

export interface WosWorkerResult {
  type: 'wos_event';
  wosEventType: number;
  wosEventName: string;
  username: string;
  letters: string[];
  stars: number;
  level: number;
  hitMax: boolean;
  falseLetters: string[];
  hiddenLetters: string[];
  slots: any[];
}

let currentLevel = 0;

self.onmessage = function (e: MessageEvent<WosWorkerMessage>) {
  try {
    const { eventType, data } = e.data;
    currentLevel = data.level || currentLevel;
    let result: WosWorkerResult = {
      type: 'wos_event',
      wosEventType: eventType,
      wosEventName: 'unkown',
      username: data.user?.name?.toLowerCase() || '',
      letters: data.letters || [],
      stars: data.stars || 0,
      level: data.level || 0,
      hitMax: data.hitMax || false,
      falseLetters: data.falseLetters || [],
      hiddenLetters: data.hiddenLetters || [],
      slots: data.slots || [],
    };

    // console.log(`[WOS Worker] Event Type: ${eventType}`, data);

    if (eventType === 1) {
      currentLevel = data.level!;
      result.wosEventName = 'Level Started';
      self.postMessage(result);
    } else if (eventType === 3) {
      result.wosEventName = 'Correct Guess';
      self.postMessage(result);
    } else if (eventType === 4) {
      result.wosEventName = 'Level Results';
      self.postMessage(result);
    } else if (eventType === 5) {
      result.wosEventName = 'Game Ended';
      self.postMessage(result);
    } else if (eventType === 7) {
      result.wosEventName = 'Letters Cycled';
      self.postMessage(result);
    } else if (eventType === 8) {
      result.wosEventName = 'Level Ended';
      self.postMessage(result);
    } else if (eventType === 10) {
      result.wosEventName = 'Hidden/Fake Letters Revealed';
      self.postMessage(result);
    } else if (eventType === 11) {
      result.wosEventName = 'Guessing Unlocked';
      self.postMessage(result);
    } else if (eventType === 12) {
      currentLevel = data.level!;
      result.wosEventName = 'Game Connected';
      self.postMessage(result);
    } else {
      console.log(`[WOS Worker] Unhandled WOS event type: ${eventType}`);
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
