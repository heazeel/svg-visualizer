import { Uri, ExtensionContext, Range, window } from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";
import RangeTools from "../utils/range";
import WebviewPanelProvider from "../providers/WebviewPanelProvider";
import Command from "./Command";

class ShowGallery implements Command {
  public name: string = "svgVisualizer.showGallery";

  constructor(private readonly context: ExtensionContext) {}

  public execute(uri: Uri) {
    if (uri && uri.fsPath) {
      const jsFiles: string[] = [];

      function traverseDirectory(dir: string) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            traverseDirectory(filePath);
          } else if (
            filePath.endsWith(".js") ||
            filePath.endsWith(".ts") ||
            filePath.endsWith(".jsx") ||
            filePath.endsWith(".tsx") ||
            filePath.endsWith(".svg")
          ) {
            jsFiles.push(filePath);
          }
        }
      }

      traverseDirectory(uri.fsPath);

      const svgCodes: { path: string; range: Range; code: string }[] = [];

      if (jsFiles.length > 0) {
        for (const jsFile of jsFiles) {
          const code = fs.readFileSync(jsFile, "utf8");
          const ast = parser.parse(code, {
            sourceType: "module",
            plugins: ["typescript", "jsx"],
          });

          traverse(ast, {
            JSXElement(path) {
              const openingEl = path.node.openingElement;
              const closingEl = path.node.closingElement;
              if (
                t.isJSXIdentifier(openingEl.name) &&
                openingEl.name.name === "svg" &&
                t.isJSXIdentifier(closingEl?.name) &&
                closingEl.name.name === "svg" &&
                path.node.loc
              ) {
                const svgCode = generate(path.node).code;
                svgCodes.push({
                  path: jsFile,
                  range: RangeTools.createRange(path.node.loc),
                  code: svgCode,
                });
              }
            },
          });
        }

        WebviewPanelProvider.render(this.context.extensionUri);
      } else {
        window.showInformationMessage(
          "No SVG codes found in the selected folder"
        );
      }
    }
  }
}

export default ShowGallery;
