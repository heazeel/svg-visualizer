import { CodeLens } from "vscode";

export default abstract class CodeLensModule<T extends any[] = [], P = any> {
  public abstract command: string;
  public abstract commandHandler(...args: T): void;
  public abstract provide(path: P): CodeLens[];
  public abstract resolve(codeLens: CodeLens): CodeLens;
}
