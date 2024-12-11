import * as vscode from "vscode";
import show from "./commands/show";
import CodeLensProvider from "./providers/CodeLensProvider";

export function activate(context: vscode.ExtensionContext) {
  const codeLensProvider = new CodeLensProvider();
  vscode.languages.registerCodeLensProvider(
    ["javascript", "javascriptreact", "typescript", "typescriptreact", "xml"],
    codeLensProvider
  );
  const codeLensModules = codeLensProvider.modules;
  Object.keys(codeLensModules).forEach((key) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        codeLensModules[key].command,
        codeLensModules[key].commandHandler.bind(codeLensModules[key])
      )
    );
  });
}

export function deactivate() {}
