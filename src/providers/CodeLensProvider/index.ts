import {
  CodeLensProvider,
  TextDocument,
  CodeLens,
  ExtensionContext,
} from "vscode";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import CodeLensModule from "./modules/CodeLensModule";
import SvgDetectCodeLensModule from "./modules/SvgDetect";

export default class CustomCodeLensProvider implements CodeLensProvider {
  public modules: { [key: string]: CodeLensModule<any> } = {};
  public codeLensModules: CodeLensModule<any>[] = [];
  private codeLenses: CodeLens[] = [];

  constructor(private readonly context: ExtensionContext) {
    this.modules.svgDetect = new SvgDetectCodeLensModule(this.context);
  }

  provideCodeLenses(document: TextDocument): CodeLens[] {
    this.codeLenses = [];

    const ctx = this;
    const ast = parser.parse(document.getText(), {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    traverse(ast, {
      JSXElement(path) {
        const svgDetectcCdeLenses = ctx.modules.svgDetect.provide(path);
        for (const svgDetectcCdeLense of svgDetectcCdeLenses) {
          ctx.codeLensModules.push(ctx.modules.svgDetect);
          ctx.codeLenses.push(svgDetectcCdeLense);
        }
      },
    });

    return this.codeLenses;
  }

  resolveCodeLens(codeLens: CodeLens): CodeLens {
    const index = this.codeLenses.indexOf(codeLens);
    const codeLensModule = this.codeLensModules[index];
    return codeLensModule.resolve(codeLens);
  }
}
