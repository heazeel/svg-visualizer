import {
  WebviewPanel,
  window,
  ViewColumn,
  Uri,
  Webview,
  Disposable,
} from "vscode";
import { getNonce, getUri } from "../../utils/common";
import {
  WebviewMessageTools,
  EventEmitterMessageTools,
} from "../../utils/message";
import events from "events";

class WebviewPanelProvider {
  public static currentPanel: WebviewPanelProvider | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];

  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(
      this._panel.webview,
      extensionUri
    );
    this._setWebviewMessageListener(this._panel.webview);
  }

  public static render(extensionUri: Uri) {
    if (WebviewPanelProvider.currentPanel) {
      WebviewPanelProvider.currentPanel._panel.reveal(ViewColumn.Beside, true);
    } else {
      const panel = window.createWebviewPanel(
        "svgVisualizer",
        "SVG Visualizer",
        ViewColumn.Beside,
        {
          enableScripts: true,
          localResourceRoots: [Uri.joinPath(extensionUri, "dist")],
        }
      );

      WebviewPanelProvider.currentPanel = new WebviewPanelProvider(
        panel,
        extensionUri
      );
    }
  }

  public dispose() {
    WebviewPanelProvider.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    const scriptUri = getUri(webview, extensionUri, [
      "dist",
      "preview-ui",
      "main.js",
    ]);
    const stylesUri = getUri(webview, extensionUri, [
      "dist",
      "preview-ui",
      "index.css",
    ]);
    const nonce = getNonce();

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
					<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}';">
          <title>SVG Visualizer</title>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
        </head>
        <body>
          <div id="root">
        </body>
      </html>
    `;
  }

  private _setWebviewMessageListener(webview: Webview) {
    const webviewMessageTools = new WebviewMessageTools(webview);
    webviewMessageTools.on("preview-msg", (data: any) => {
      window.showInformationMessage(data.text);
    });

    // 插件内部通信
    const eventEmitterMessageTools = new EventEmitterMessageTools(
      new events.EventEmitter()
    );
    eventEmitterMessageTools.webviewMessageTools = webviewMessageTools;
    eventEmitterMessageTools.on("message", (data: any) => {});
  }
}

export default WebviewPanelProvider;
