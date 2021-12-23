"use strict";
/**
 * @author github.com/tintinweb
 * @license MIT
 *
 * language definition based on: https://raw.githubusercontent.com/Microsoft/vscode/master/extensions/python/syntaxes/MagicPython.tmLanguage.json (MIT)
 * compilation related parts taken from: https://github.com/trufflesuite/truffle/tree/develop/packages/truffle-compile-vyper (MIT)
 * */

/** imports */
import * as vscode from "vscode";

import * as mod_deco from "./features/deco";
import * as mod_hover from "./features/hover/hover";
import * as settings from "./settings";

/** global vars */
var activeEditor: vscode.TextEditor | undefined;

/** classdecs */

/** funcdecs */

/** event funcs */
async function onDidSave(document) {
    if (document.languageId != settings.LANGUAGE_ID) {
        console.log("langid mismatch");
        return;
    }
}

async function onDidChange() {
    if (
        vscode.window.activeTextEditor?.document?.languageId !=
        settings.LANGUAGE_ID
    ) {
        return;
    }

    if (settings.extensionConfig().decoration.enable) {
        mod_deco.decorateWords(
            activeEditor,
            [
                {
                    regex: "@\\b(public|payable|modifying)\\b",
                    captureGroup: 0,
                },
                {
                    regex: "\\b(send|raw_call|selfdestruct|raw_log|create_forwarder_to|blockhash)\\b",
                    captureGroup: 0,
                    hoverMessage: "❗**potentially unsafe** lowlevel call",
                },
            ],
            mod_deco.styles.foreGroundWarning
        );
        mod_deco.decorateWords(
            activeEditor,
            [
                {
                    regex: "\\b(public|payable|modifying)\\b\\(",
                    captureGroup: 1,
                },
            ],
            mod_deco.styles.foreGroundWarningUnderline
        );
        mod_deco.decorateWords(
            activeEditor,
            [
                {
                    regex: "\\b(\\.balance|msg\\.[\\w]+|block\\.[\\w]+)\\b",
                    captureGroup: 0,
                },
            ],
            mod_deco.styles.foreGroundInfoUnderline
        );
        mod_deco.decorateWords(
            activeEditor,
            [
                {
                    regex: "@?\\b(private|nonrentant|constant)\\b",
                    captureGroup: 0,
                },
            ],
            mod_deco.styles.foreGroundOk
        );
        mod_deco.decorateWords(
            activeEditor,
            [
                {
                    regex: "\\b(log)\\.",
                    captureGroup: 1,
                },
                {
                    regex: "\\b(clear)\\b\\(",
                    captureGroup: 1,
                },
            ],
            mod_deco.styles.foreGroundNewEmit
        );
        mod_deco.decorateWords(
            activeEditor,
            [
                {
                    regex: "\\b(__init__|__default__)\\b",
                    captureGroup: 0,
                },
            ],
            mod_deco.styles.boldUnderline
        );
    }
}
function onInitModules(context, type) {
    mod_hover.init(context, type);
}

/**
 * @param {vscode.ExtensionContext} context
 */
function onActivate(context) {
    const active = vscode.window.activeTextEditor;
    activeEditor = active;

    registerDocType(settings.LANGUAGE_ID);

    function registerDocType(type) {
        // taken from: https://github.com/Microsoft/vscode/blob/master/extensions/python/src/pythonMain.ts ; slightly modified
        // autoindent while typing
        vscode.languages.setLanguageConfiguration(type, {
            onEnterRules: [
                {
                    beforeText:
                        /^\s*(?:struct|def|class|for|if|elif|else|while|try|with|finally|except|async).*?:\s*$/,
                    action: { indentAction: vscode.IndentAction.Indent },
                },
            ],
        });

        /** module init */
        onInitModules(context, type);
        onDidChange();
        if (active) onDidSave(active.document);

        /** event setup */
        /***** OnChange */
        vscode.window.onDidChangeActiveTextEditor(
            (editor) => {
                activeEditor = editor;
                if (editor) {
                    onDidChange();
                }
            },
            null,
            context.subscriptions
        );
        /***** OnChange */
        vscode.workspace.onDidChangeTextDocument(
            (event) => {
                if (activeEditor && event.document === activeEditor.document) {
                    onDidChange();
                }
            },
            null,
            context.subscriptions
        );
        /***** OnSave */

        vscode.workspace.onDidSaveTextDocument(
            (document) => {
                onDidSave(document);
            },
            null,
            context.subscriptions
        );

        /****** OnOpen */
        vscode.workspace.onDidOpenTextDocument(
            (document) => {
                onDidSave(document);
            },
            null,
            context.subscriptions
        );

        /***** SignatureHelper */
        /*
        context.subscriptions.push(
            vscode.languages.registerSignatureHelpProvider(
                { language: type },
                new mod_signatures.VyperSignatureHelpProvider(),
                '(', ','
            )
        );
        */
    }
}

/* exports */
exports.activate = onActivate;
