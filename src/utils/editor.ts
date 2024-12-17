import {
  TextEditor,
  TextDocument,
  Range,
  Position,
  workspace,
  WorkspaceEdit,
  commands,
  TextEditorRevealType,
  Selection,
  window,
} from "vscode";

import FileTools from "./file";

class EditorTools {
  public static getCursorPrefixText(editor: TextEditor) {
    const position = editor.selection.active;
    const range = new Range(new Position(0, 0), position);
    const textBeforeCursor = editor.document.getText(range);
    return textBeforeCursor;
  }

  public static getCursorSuffixText(editor: TextEditor) {
    const position = editor.selection.active;
    const range = new Range(
      position,
      new Position(
        editor.document.lineCount - 1,
        editor.document.lineAt(editor.document.lineCount - 1).text.length
      )
    );
    const textAfterCursor = editor.document.getText(range);
    return textAfterCursor;
  }

  public static getSelectedText(editor: TextEditor) {
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    return selectedText;
  }

  public static async replaceSelectedText(editor: TextEditor, content: string) {
    const selection = editor.selection;
    const done = await editor.edit((editBuilder) => {
      editBuilder.replace(selection, content);
    });
    return done;
  }

  public static async insertText(editor: TextEditor, content: string) {
    const done = await editor.edit((editBuilder) => {
      editBuilder.insert(editor.selection.active, content);
    });
    return done;
  }

  public static async insertTextBeforePreview(
    editor: TextEditor,
    content: string
  ) {
    const currentDocument = editor.document;
    // 对工作区进行编辑
    const workspaceEdit = new WorkspaceEdit();
    workspaceEdit.replace(currentDocument.uri, editor.selection, content);
    workspace.applyEdit(workspaceEdit);

    // 创建临时文件并写入原始内容
    const filePath = workspace.asRelativePath(currentDocument.fileName);
    const currentContent = await workspace.fs.readFile(currentDocument.uri);
    const previewFileUri = await FileTools.writeTmpFile(
      filePath,
      currentContent
    );

    // 对比工作区和临时文件
    if (previewFileUri) {
      commands.executeCommand(
        "vscode.diff",
        previewFileUri,
        currentDocument.uri,
        "crow preview"
      );
    }
  }

  // 获取当前选中文本的语言
  public static getSelectedTextLanguage(editor: TextEditor) {
    const language = editor.document.languageId;
    return language;
  }

  // 移动滚动条，使光标处于屏幕中央
  public static revealCursor(editor: TextEditor) {
    const position = editor.selection.active;
    const range = new Range(position, position);
    editor.revealRange(range, TextEditorRevealType.Default);
  }

  // 移动光标至最后一行
  public static moveCursorToLastLine(
    document: TextDocument,
    editor: TextEditor
  ) {
    const lastLine = document.lineCount - 1;
    const position = new Position(lastLine, 0);
    editor.selection = new Selection(position, position);
  }

  // 保存编辑区内容
  public static async editorSave(editor: TextEditor) {
    await editor.document.save();
  }

  public static getTextFromRange(editor: TextEditor, range: Range) {
    const text = editor.document.getText(range);
    return text;
  }
}

export default EditorTools;
