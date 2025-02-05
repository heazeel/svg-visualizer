import {
  TextEditor,
  Range,
  workspace,
  TextEditorRevealType,
  Selection,
  window,
  ViewColumn,
  Uri,
} from "vscode";

class EditorTools {
  // 获取编辑区内容
  public static getTextFromRange(editor: TextEditor, range: Range) {
    const text = editor.document.getText(range);
    return text;
  }

  public static async openDocumentAndSelectRange(path: string, range: Range) {
    const uri = Uri.file(path);
    const document = await workspace.openTextDocument(uri);

    const selection = new Selection(
      range.start.line,
      range.start.character,
      range.end.line,
      range.end.character
    );

    const editor = await window.showTextDocument(document, {
      viewColumn: ViewColumn.One,
      preserveFocus: false,
      preview: true,
      selection,
    });

    editor.revealRange(
      new Range(selection.start, selection.end),
      TextEditorRevealType.InCenter
    );
  }
}

export default EditorTools;
