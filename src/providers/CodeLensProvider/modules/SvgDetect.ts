import { CodeLens, window, ViewColumn, WebviewPanel, Range } from "vscode";
import { parse } from "@babel/parser";
import generate from "@babel/generator";
import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import CodeLensModule from "./CodeLensModule";
import RangeTools from "../../../utils/range";
import EditorTools from "../../../utils/editor";
import { getConvertedSvgCode, getOriginSvgCode } from "../../../utils/babel";

export default class SvgDetectCodeLensModule extends CodeLensModule<
  Range[],
  NodePath
> {
  public command: string = "svgVisualizer.detect";
  private panel: WebviewPanel | undefined;

  public commandHandler(range: Range) {
    const editor = window.activeTextEditor;
    if (editor) {
      const svgContent = EditorTools.getTextFromRange(editor, range);
      const ast = parse(svgContent, {
        sourceType: "module",
        plugins: ["jsx"],
      });

      const _this = this;

      traverse(ast, {
        Program(path) {
          const svgCode = getConvertedSvgCode(path);

          if (_this.panel) {
            _this.panel.webview.html = _this.getWebviewContent(svgCode);
            _this.panel.reveal(ViewColumn.Beside, true);
          } else {
            _this.panel = window.createWebviewPanel(
              "svgVisualizer",
              "SVG Visualizer",
              ViewColumn.Beside,
              {
                enableScripts: true,
                retainContextWhenHidden: true,
              }
            );

            _this.panel.webview.html = _this.getWebviewContent(svgCode);

            _this.panel.onDidDispose(() => {
              _this.panel = undefined;
            });
          }
        },
      });

      window.showTextDocument(editor.document, editor.viewColumn);
    }
  }

  private getWebviewContent(svgContent: string): string {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SVG Visualizer</title>
    <style>
      body {
        width: 100%;
        height: 100vh;
      }
      #svgContainer {
        display: inline-block;
        position: relative;
      }
      #svgContent {
        transform-origin: top left;
        transition: transform 0.2s;
        display: inline-block;
      }
      .zoom-controls {
        margin-top: 10px;
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ccc;
      }
      .hover {
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <h1>SVG Visualizer</h1>
    <div class="zoom-controls">
      <button class="hover" onclick="zoomIn()">scale (x2)</button>
      <button class="hover" onclick="resetZoom()">recover</button>
    </div>
    <div id="svgContainer">
      <div id="svgContent"><img alt="" src="data:image/svg+xml,${encodeURIComponent(
        svgContent
      )}"></div>
    </div>
    <script>
      let scale = 1;
      function zoomIn() {
        scale *= 2;
        document.getElementById('svgContent').style.transform = 'scale(' + scale + ')';
      }
      function resetZoom() {
        scale = 1;
        document.getElementById('svgContent').style.transform = 'scale(' + scale + ')';
      }
    </script>
  </body>
  </html>`;
  }

  public provide(path: NodePath<t.JSXElement>) {
    const codeLenses: CodeLens[] = [];

    const _path = getOriginSvgCode(path);
    if (_path) {
      const codeLens = new CodeLens(
        RangeTools.createRange(_path.node.loc as t.SourceLocation)
      );
      codeLenses.push(codeLens);
      path.skip();
    }

    return codeLenses;
  }

  public resolve(codeLens: CodeLens) {
    codeLens.command = {
      title: "SVG Visualize",
      command: this.command,
      arguments: [codeLens.range],
    };
    return codeLens;
  }
}
