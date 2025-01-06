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
import { GalleryMsgCenter } from "../../message/Gallery";
import events from "events";

class WebviewPanelProvider {
  private _panel: WebviewPanel | undefined = undefined;
  private _disposables: Disposable[] = [];
  private _webviewMessageTools: WebviewMessageTools | undefined = undefined;

  public constructor(readonly extensionUri: Uri) {}

  public render(svgCodes: any) {
    if (!this._panel) {
      this._panel = window.createWebviewPanel(
        "svgVisualizer",
        "SVG Gallery",
        ViewColumn.Beside,
        {
          enableScripts: true,
          localResourceRoots: [Uri.joinPath(this.extensionUri, "dist")],
        }
      );
      this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    this._panel.webview.html = this._getWebviewContent(
      this._panel.webview,
      svgCodes
    );
    this._setWebviewMessageListener(this._panel.webview);

    this._panel.reveal(ViewColumn.Beside, true);
  }

  public dispose() {
    this._panel?.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
    this._panel = undefined;
  }

  private _getWebviewContent(webview: Webview, svgCodes: any) {
    const scriptUri = getUri(webview, this.extensionUri, [
      "dist",
      "preview-ui",
      "main.js",
    ]);
    const stylesUri = getUri(webview, this.extensionUri, [
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
          <title>SVG Visualizer</title>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
          <script nonce="${nonce}">
            window.type = "gallery";
            window.svgCodes = ${JSON.stringify(svgCodes)};
          </script>
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
        </head>
        <body>
          <div id="root">
        </body>
      </html>
    `;
  }

  private _setWebviewMessageListener(webview: Webview) {
    this._webviewMessageTools = new WebviewMessageTools(webview);
    new GalleryMsgCenter(this._webviewMessageTools).register();

    // 插件内部通信
    const eventEmitterMessageTools = new EventEmitterMessageTools(
      new events.EventEmitter()
    );
    eventEmitterMessageTools.webviewMessageTools = this._webviewMessageTools;
    eventEmitterMessageTools.on("message", (data: any) => {});
  }
}

export default WebviewPanelProvider;
