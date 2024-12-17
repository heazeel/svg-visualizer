import { Disposable } from "vscode";

abstract class Command {
  public abstract name: string;
  public abstract execute: (...args: any[]) => any;
}

export default Command;
