// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const extName = 'meaCtx';
const configuration = vscode.workspace.getConfiguration(`${extName}`);
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

function getWorkspaceFolder(): vscode.WorkspaceFolder | undefined {
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showErrorMessage('No workspace folder found');
		return undefined;
	}
	return vscode.workspace.workspaceFolders[0];
}	
  
function getFilePath(optionName:string): string | undefined {
	const filePath: string = configuration.get(optionName) || '';
	if (!filePath) {
		vscode.window.showErrorMessage(`Bad file in configuration: (${filePath})`);
		return undefined;
	}
	return filePath;
  }

function createFileIfNotExists(absFilePath: string): void {
	if (!fs.existsSync(absFilePath)) {
		fs.writeFileSync(absFilePath, '');
		let info = `File ${absFilePath} created\n`
		let info1 = `Absolute path: ${fs.realpathSync(absFilePath)}\n`;
		vscode.window.showInformationMessage(info + info1);
	}
}

function getEditor(): vscode.TextEditor | undefined {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No active editor found');
		return undefined;
	}
	return editor;
  }

function getSelectedText(): string | undefined {
	const editor = 	getEditor();
	if (!editor)
		return undefined;
  
	const selection = editor.selection;
	const text = editor.document.getText(selection);
	return text;
}

function formatText(text: string, editor: vscode.TextEditor): string {
	const sourceFileName = editor.document.fileName;
	const languageId = editor.document.languageId;
	const mdCode = '```';
	const mdText = `Source file: ${sourceFileName}\n${mdCode}${languageId}\n${text}\n${mdCode}\n\n`;
	return mdText;
}

function formatText_term(text: string): string {
    const mdCode = '```';
    const mdText = `Terminal output:\n${mdCode}\n${text}\n${mdCode}\n\n`;
    return mdText;
}

function getSelectedFormatedText(): string | undefined {
	const editor = 	getEditor();
	if (!editor)
		return undefined;
  
	const selection = editor.selection;
	const text = editor.document.getText(selection);
	const mdText = formatText(text, editor);
	return mdText;
}

export function activate(context: vscode.ExtensionContext) {

	console.log(`Congratulations, your extension "${extName}" is now active!`);
	console.log(`file value: ${JSON.stringify(configuration, null, 4)}`);

	let contextStore_cmd = vscode.commands.registerCommand(`${extName}.contextStore`, () => {
		
		const workspaceFolder = getWorkspaceFolder();
		if (!workspaceFolder) return;

		const filePath = getFilePath("contextFile");
		if (!filePath) return;

		const absFilePath = path.join(workspaceFolder.uri.fsPath, filePath);
		createFileIfNotExists(absFilePath);
		
		const mdText = getSelectedFormatedText()
		if (!mdText) return;
	  
		
		fs.appendFileSync(absFilePath, mdText);
		vscode.window.showInformationMessage(`Context file updated: ${absFilePath}`);
	});

	let contextClear_cmd = vscode.commands.registerCommand(`${extName}.contextClear`, () => {
		const workspaceFolder = getWorkspaceFolder();
		if (!workspaceFolder) return;

		const filePath = getFilePath("contextFile");
		if (!filePath) return;

		const absFilePath = path.join(workspaceFolder.uri.fsPath, filePath);
		if (fs.existsSync(absFilePath)) {
			fs.writeFileSync(absFilePath, '');
			vscode.window.showInformationMessage(`Context file cleared: ${absFilePath}`);
		} else {
			vscode.window.showInformationMessage(`Context file does not exist: ${absFilePath}`);
		}
	});

	let ls2File_cmd = vscode.commands.registerCommand(`${extName}.ls2File`, () => {
		const workspaceFolder = getWorkspaceFolder();
		if (!workspaceFolder) return;
	
		const filePath = getFilePath("terminalOut");
		if (!filePath) return;
	
		const absFilePath = path.join(workspaceFolder.uri.fsPath, filePath);
		createFileIfNotExists(absFilePath);
	
		const terminal = vscode.window.activeTerminal;
		if (!terminal) {
			vscode.window.showErrorMessage('No active terminal found');
			return;
		}
	
		const command = `ls > ${absFilePath}`;
		terminal.sendText(command);
		vscode.window.showInformationMessage(`Output redirected to file: ${absFilePath}`);
	});

	context.subscriptions.push(contextStore_cmd);
	context.subscriptions.push(contextClear_cmd);
	context.subscriptions.push(ls2File_cmd);
}

// This method is called when your extension is deactivated
export function deactivate() {}

