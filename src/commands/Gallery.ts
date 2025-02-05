import {
  Uri,
  ExtensionContext,
  workspace,
  window,
  ProgressLocation,
} from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import GalleryPanelProvider from "../providers/WebviewPanelProvider";
import Command from "./Command";
import { getConvertedSvgCode, getOriginSvgCode } from "../utils/babel";

class ShowGallery implements Command {
  public name: string = "svgVisualizer.showGallery";
  private galleryPanelProvider: GalleryPanelProvider;
  private rootPath: string = workspace.workspaceFolders?.[0].uri.fsPath || "";

  constructor(private readonly context: ExtensionContext) {
    this.galleryPanelProvider = new GalleryPanelProvider(
      this.context.extensionUri
    );
  }

  public async execute(uri: Uri) {
    if (uri && uri.fsPath) {
      const _this = this;
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
        path: {
          realPath: string;
          rootPath: string;
        };
        range: t.SourceLocation;
        code: string;
      }[] = [];

      if (!jsFiles.length) {
        return this.showInformationMessage();
      }

      await window.withProgress(
        {
          location: ProgressLocation.Notification,
          title: "Collecting SVG codes",
          cancellable: false,
        },
        async (progress) => {
          for (let i = 0; i < jsFiles.length; i++) {
            const jsFile = jsFiles[i];
            const code = fs.readFileSync(jsFile, "utf8");
            const ast = parser.parse(code, {
              sourceType: "module",
              plugins: ["typescript", "jsx"],
              attachComment: false,
            });

            traverse(ast, {
              JSXElement(path) {
                const _path = getOriginSvgCode(path);
                if (_path) {
                  const svgCode = getConvertedSvgCode(_path);

                  const workspaceFolder = workspace.getWorkspaceFolder(
                    Uri.file(jsFile)
                  );
                  const rootPath = workspaceFolder
                    ? workspaceFolder.uri.fsPath
                    : "";

                  svgCodes.push({
                    path: {
                      realPath: jsFile,
                      rootPath,
                    },
                    range: _path.node.loc as t.SourceLocation,
                    code: svgCode,
                  });
                }
              },
            });
          }
        }
      );

      if (!svgCodes.length) {
        return this.showInformationMessage();
      }

      this.galleryPanelProvider.render({ webviewType: "gallery", svgCodes });
    }
  }

  private showInformationMessage() {
    window.showInformationMessage("No SVG codes found in the selected folder");
  }
}

export default ShowGallery;
