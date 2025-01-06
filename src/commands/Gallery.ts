import { Uri, ExtensionContext, Range, window } from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";
import RangeTools from "../utils/range";
import GalleryPanelProvider from "../providers/WebviewPanelProvider";
import Command from "./Command";
import { getConvertedSvgCode, getOriginSvgCode } from "../utils/babel";

class ShowGallery implements Command {
  public name: string = "svgVisualizer.showGallery";
  private galleryPanelProvider: GalleryPanelProvider;

  constructor(private readonly context: ExtensionContext) {
    this.galleryPanelProvider = new GalleryPanelProvider(
      this.context.extensionUri
    );
  }

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

      const svgCodes: {
        path: string;
        range: t.SourceLocation;
        code: string;
      }[] = [];

      if (jsFiles.length > 0) {
        for (const jsFile of jsFiles) {
          const code = fs.readFileSync(jsFile, "utf8");
          const ast = parser.parse(code, {
            sourceType: "module",
            plugins: ["typescript", "jsx"],
          });

          traverse(ast, {
            JSXElement(path) {
              const _path = getOriginSvgCode(path);
              if (_path) {
                const svgCode = getConvertedSvgCode(_path);

                svgCodes.push({
                  path: jsFile,
                  range: _path.node.loc as t.SourceLocation,
                  code: svgCode,
                });
              }
            },
          });
        }

        this.galleryPanelProvider.render(svgCodes);
      } else {
        window.showInformationMessage(
          "No SVG codes found in the selected folder"
        );
      }
    }
  }
}

export default ShowGallery;
