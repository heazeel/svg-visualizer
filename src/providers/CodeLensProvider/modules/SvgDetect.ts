import {
  CodeLens,
  window,
  Range,
  workspace,
  ExtensionContext,
  Uri,
} from "vscode";
import { parse } from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import CodeLensModule from "./CodeLensModule";
import RangeTools from "@/utils/range";
import EditorTools from "@/utils/editor";
import { getConvertedSvgCode, getOriginSvgCode } from "@/utils/babel";
import PreviewPanelProvider from "@/providers/WebviewPanelProvider";

export default class SvgDetectCodeLensModule extends CodeLensModule<
  Range[],
  NodePath
> {
  public command: string = "svgVisualizer.detect";
  private previewPanelProvider: PreviewPanelProvider;

  constructor(private readonly context: ExtensionContext) {
    super();
    this.previewPanelProvider = new PreviewPanelProvider(
      this.context.extensionUri
    );
  }

  public commandHandler(range: Range) {
    const editor = window.activeTextEditor;
    if (editor) {
      const svgContent = EditorTools.getTextFromRange(editor, range);
      const ast = parse(svgContent, {
        sourceType: "module",
        plugins: ["jsx"],
        attachComment: false,
      });

      const _this = this;

      traverse(ast, {
        Program(path) {
          const svgCode = getConvertedSvgCode(path);

          if (svgCode) {
            const workspaceFolder = workspace.getWorkspaceFolder(
              Uri.file(editor.document.uri.fsPath)
            );
            const rootPath = workspaceFolder ? workspaceFolder.uri.fsPath : "";

            _this.previewPanelProvider.render({
              webviewType: "preview",
              svgCodes: [
                {
                  path: { realPath: editor.document.uri.fsPath, rootPath },
                  code: svgCode,
                  range: path.node.loc as t.SourceLocation,
                },
              ],
            });
          }
        },
      });

      window.showTextDocument(editor.document, editor.viewColumn);
    }
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
