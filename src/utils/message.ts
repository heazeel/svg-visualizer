import { Webview } from "vscode";
import EventEmitter from "events";

export interface Message {
  type: string;
  content: any;
}

export abstract class MessageTools {
  public abstract on(type: string, callback: (content: any) => void): void;
  public abstract postMessage(type: string, content: any): void;
}

/**
 * 插件内部消息代理
 */
export class EventEmitterMessageTools implements MessageTools {
  public webviewMessageTools?: WebviewMessageTools;

  constructor(readonly eventEmitter: EventEmitter) {}

  public on(type: string, callback: (content: any) => void) {
    this.eventEmitter.on("message", (data: Message) => {
      try {
        if (data.type === type) {
          callback(data.content);
        }
      } catch (error) {}
    });
  }

  public postMessage(type: string, content: any) {
    // 发送消息给 Webview UI
    this.webviewMessageTools?.postMessage(type, content);
  }
}

/**
 * Webview 消息代理，负责消息的监听和发送
 */
export class WebviewMessageTools implements MessageTools {
  constructor(readonly webview: Webview) {}

  /**
   * 监听消息
   * @param type 消息类型
   * @param callback 消息回调
   */
  public on(type: string, callback: (content: any) => void) {
    // 相关 API 参考 https://code.visualstudio.com/api/references/vscode-api#Webview
    this.webview.onDidReceiveMessage((message: Message) => {
      if (message.type === type) {
        callback(message.content);
      }
    });
  }

  /**
   * 发送消息
   * @param type 消息类型
   * @param content 消息内容
   */
  public postMessage(type: string, content: any) {
    return this.webview.postMessage({ type, content });
  }
}
