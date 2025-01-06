import { ExtensionContext } from "vscode";
import { MessageTools } from "../utils/message";

export interface Payload<T> {
  method: string;
  params: T;
}

export abstract class BaseMsgCenter<Received = any> {
  public abstract messageName: string;

  constructor(readonly messageTools: MessageTools) {}

  public abstract handlePayload(Payload: Payload<Received>): void;

  public register() {
    this.messageTools.on(this.messageName, this.handlePayload.bind(this));
  }
}
