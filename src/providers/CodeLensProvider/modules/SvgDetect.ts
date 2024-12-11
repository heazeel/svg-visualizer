import {
  CodeLensProvider,
  TextDocument,
  CodeLens,
  window,
  ViewColumn,
  WebviewPanel,
  commands,
  Range,
} from "vscode";
import { parse } from "@babel/parser";
import generate from "@babel/generator";
import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import CodeLensModule from "./CodeLensModule";
import { createRange } from "../../utils";
import { TextEditorTools } from "../../../utils/editor";

export default class SvgDetectCodeLensModule extends CodeLensModule<
  Range[],
  NodePath
> {
  public command: string = "svgVisualizer.detect";
  private panel: WebviewPanel | undefined;

  public commandHandler(range: Range) {
    const editor = window.activeTextEditor;
    if (editor) {
      const svgContent = TextEditorTools.getTextFromRange(editor, range);
      const ast = parse(svgContent, {
        sourceType: "module",
        plugins: ["jsx"],
      });

      traverse(ast, {
        JSXAttribute(path) {
          const name = path.node.name;
          if (
            t.isJSXIdentifier(name) &&
            /[a-z][A-Z]/.test(name.name) &&
            name.name !== "viewBox"
          ) {
            name.name = name.name.replace(
              /([a-z])([A-Z])/g,
              (match, p1, p2) => {
                return p1 + "-" + p2.toLowerCase();
              }
            );
          }
        },
      });

      let { code: convertedSvgContent } = generate(ast);
      if (convertedSvgContent.endsWith(";")) {
        convertedSvgContent = convertedSvgContent.slice(0, -1);
      }

      if (this.panel) {
        this.panel.webview.html = this.getWebviewContent(convertedSvgContent);
        this.panel.reveal(ViewColumn.Beside, true);
      } else {
        this.panel = window.createWebviewPanel(
          "svgVisualizer",
          "SVG Visualizer",
          ViewColumn.Beside,
          {
            enableScripts: true,
            retainContextWhenHidden: true,
          }
        );

        this.panel.webview.html = this.getWebviewContent(convertedSvgContent);

        this.panel.onDidDispose(() => {
          this.panel = undefined;
        });
      }

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
      <div id="svgContent">${svgContent}</div>
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

    const openingEl = path.node.openingElement;
    const closingEl = path.node.closingElement;
    if (
      t.isJSXIdentifier(openingEl.name) &&
      openingEl.name.name === "svg" &&
      t.isJSXIdentifier(closingEl?.name) &&
      closingEl.name.name === "svg" &&
      path.node.loc
    ) {
      const codeLens = new CodeLens(createRange(path.node.loc));
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
