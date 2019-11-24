// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "enumer" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.Enumerate', function () {
		
		var fmt = {};
		fmt.placeHolder = "[start] [step] [radix]";
		fmt.prompt = "Enter the initial value of the sequence.\nStep is optional.\nRadix is used if input is a number.";

		fmt.validateInput = function (param) {
			if (param === ""){
				return null;
			}

			if (!parse(param.trim())["valid"]){
				return "Error in parsing input";
			}

			return null;
		};

		vscode.window.showInputBox(fmt)
			.then(function (vals) {
				vscode.window.showInformationMessage(vals);
				
				var editor = vscode.window.activeTextEditor
				var info = parse(vals.trim())

				editor.edit(function (builder) {
					for (var i = 0; i < editor.selections.length; i++){
						var val = info["start"] + i * info["step"];
						builder.insert(editor.selections[i].end, val.toString(info["radix"]));
					}
				})

			})

	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

function parse(inp) {
	
	var rgx = [/^[0-9]*$/, /^[0-9]*\.[0-9]*$/, /^[0-9a-f]*$/]

	var start = undefined
	var step = 1
	var radix = 10

	var segments = inp.split(" ");

	var i;
	var j;

	for (i = segments.length; i >= 0 ; i--){
		for (j = 0; j < rgx.length; j++){
			var b = false;
			if (rgx[j].test(segments[i])){
				switch (i) {
					case 0: // Start
						if (j != 1)
							start = parseInt(segments[i], radix);
						else
							start = parseFloat(segments[i]);
						
						b = true;
						break;
					case 1: // Step
						if (j != 1)
							step = parseInt(segments[i], radix);
						else
							step = parseFloat(segments[i]);
						
						b = true;
						break;
					case 2: // Radix
						if (j != 0)
							return [false];
						else{
							radix = parseInt(segments[i], radix);
							b = true;
						}
						break;
				}
			}
			if (b)
				break;
		}
	}

	if (start === undefined)
		return [false];

	return {
		valid: true,
		start: start,
		step: step,
		radix: radix,
	};
}

module.exports = {
	activate,
	deactivate
}
