import * as vscode from "vscode";
import CodeLensProvider from "./providers/CodeLensProvider";
import ShowGallery from "./commands/Gallery";

export function activate(context: vscode.ExtensionContext) {
  const showGallery = new ShowGallery(context);
  context.subscriptions.push(
    vscode.commands.registerCommand(
      showGallery.name,
      showGallery.execute,
      showGallery
    )
  );

  const codeLensProvider = new CodeLensProvider(context);
  vscode.languages.registerCodeLensProvider(
    ["javascript", "javascriptreact", "typescript", "typescriptreact", "xml"],
    codeLensProvider
  );
  const codeLensModules = codeLensProvider.modules;
  Object.keys(codeLensModules).forEach((key) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        codeLensModules[key].command,
        codeLensModules[key].commandHandler,
        codeLensModules[key]
      )
    );
  });
}

export function deactivate() {}
