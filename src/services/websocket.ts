import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { HOST_BASE } from './api';
import { ChatMessage } from '../types';

export type MessageCallback = (msg: ChatMessage) => void;

class StompChatService {
  private client: Client | null = null;
  private isConnected: boolean = false;
  private messageListeners: Set<MessageCallback> = new Set();
  private swapSubscriptions: Map<string, StompSubscription> = new Map();
  private connectionCallbacks: Set<(connected: boolean) => void> = new Set();

  public getConnected(): boolean {
    return this.isConnected;
  }

  public onConnectionChange(cb: (connected: boolean) => void): () => void {
    this.connectionCallbacks.add(cb);
    cb(this.isConnected);
    return () => {
      this.connectionCallbacks.delete(cb);
    };
  }

  public connect(): void {
    if (this.client && (this.client.active || this.isConnected)) {
      return;
    }

    // Determine SockJS / WebSocket URL
    let sockJsUrl: string;
    if (HOST_BASE) {
      sockJsUrl = `${HOST_BASE}/ws`;
    } else if (typeof window !== 'undefined') {
      sockJsUrl = `${window.location.protocol}//${window.location.host}/ws`;
    } else {
      sockJsUrl = '/ws';
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(sockJsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg: string) => {
        if (import.meta.env?.DEV) {
          console.debug('[STOMP]', msg);
        }
      },
    });

    client.onConnect = () => {
      console.log('[STOMP] Connected to ThreadLoop WebSocket broker');
      this.isConnected = true;
      this.notifyConnectionState(true);

      // Subscribe to global messages topic
      client.subscribe('/topic/messages', (message) => {
        try {
          const parsed: ChatMessage = JSON.parse(message.body);
          this.notifyMessageReceived(parsed);
        } catch (err) {
          console.error('[STOMP] Failed to parse message body:', err);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('[STOMP] Broker error:', frame.headers['message'], frame.body);
      this.isConnected = false;
      this.notifyConnectionState(false);
    };

    client.onWebSocketClose = () => {
      this.isConnected = false;
      this.notifyConnectionState(false);
    };

    client.onDisconnect = () => {
      this.isConnected = false;
      this.notifyConnectionState(false);
    };

    client.activate();
    this.client = client;
  }

  public disconnect(): void {
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (err) {
        console.error('[STOMP] Deactivate error:', err);
      }
      this.client = null;
      this.isConnected = false;
      this.notifyConnectionState(false);
      this.swapSubscriptions.clear();
    }
  }

  public subscribeToSwap(swapId: string, callback: MessageCallback): () => void {
    this.messageListeners.add(callback);

    if (this.client && this.isConnected && !this.swapSubscriptions.has(swapId)) {
      const destination = `/topic/messages/${swapId}`;
      const sub = this.client.subscribe(destination, (message) => {
        try {
          const parsed: ChatMessage = JSON.parse(message.body);
          this.notifyMessageReceived(parsed);
        } catch (err) {
          console.error('[STOMP] Failed to parse swap message body:', err);
        }
      });
      this.swapSubscriptions.set(swapId, sub);
    }

    return () => {
      this.messageListeners.delete(callback);
    };
  }

  public sendMessage(swapId: string, senderId: string, text: string, actionData?: Record<string, any>): boolean {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      this.client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          swapId,
          senderId,
          text,
          actionData,
        }),
      });
      return true;
    } catch (err) {
      console.error('[STOMP] Publish error:', err);
      return false;
    }
  }

  private notifyMessageReceived(msg: ChatMessage): void {
    this.messageListeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (err) {
        console.error('[STOMP] Listener callback error:', err);
      }
    });
  }

  private notifyConnectionState(connected: boolean): void {
    this.connectionCallbacks.forEach((cb) => {
      try {
        cb(connected);
      } catch (err) {
        console.error('[STOMP] Connection callback error:', err);
      }
    });
  }
}

export const stompChatService = new StompChatService();
