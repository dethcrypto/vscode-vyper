/******/ (() => {
    // webpackBootstrap
    /******/ var __webpack_modules__ = [
        ,
        /* 0 */ /* 1 */
        /***/ (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";

            /**
             * @author github.com/tintinweb
             * @license MIT
             *
             * language definition based on: https://raw.githubusercontent.com/Microsoft/vscode/master/extensions/python/syntaxes/MagicPython.tmLanguage.json (MIT)
             * compilation related parts taken from: https://github.com/trufflesuite/truffle/tree/develop/packages/truffle-compile-vyper (MIT)
             * */

            /** imports */
            const vscode = __webpack_require__(2);

            const IS_WEB = vscode.env.uiKind === vscode.UIKind.Web;

            const mod_deco = __webpack_require__(3);
            const mod_signatures = __webpack_require__(4);
            const mod_hover = __webpack_require__(5);
            const mod_compile = !IS_WEB && __webpack_require__(7);
            const settings = __webpack_require__(6);
            /** global vars */
            var activeEditor;

            /** classdecs */

            /** funcdecs */

            /** event funcs */
            async function onDidSave(document) {
                if (document.languageId != settings.LANGUAGE_ID) {
                    console.log("langid mismatch");
                    return;
                }

                //always run on save
                if (settings.extensionConfig().compile.onSave) {
                    mod_compile.compileContractCommand(document);
                }
            }

            async function onDidChange(event) {
                if (
                    vscode.window.activeTextEditor.document.languageId !=
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
                                hoverMessage:
                                    "❗**potentially unsafe** lowlevel call",
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
                mod_compile.init(context, type);
            }

            /**
             * @param {vscode.ExtensionContext} context
             */
            function onActivate(context) {
                const active = vscode.window.activeTextEditor;
                activeEditor = active;

                registerDocType(settings.LANGUAGE_ID);

                function registerDocType(type) {
                    context.subscriptions.push(vscode.languages.reg);

                    // taken from: https://github.com/Microsoft/vscode/blob/master/extensions/python/src/pythonMain.ts ; slightly modified
                    // autoindent while typing
                    vscode.languages.setLanguageConfiguration(type, {
                        onEnterRules: [
                            {
                                beforeText:
                                    /^\s*(?:struct|def|class|for|if|elif|else|while|try|with|finally|except|async).*?:\s*$/,
                                action: {
                                    indentAction: vscode.IndentAction.Indent,
                                },
                            },
                        ],
                    });

                    context.subscriptions.push(
                        vscode.commands.registerCommand(
                            "vyper.compileContract",
                            mod_compile.compileContractCommand
                        )
                    );

                    if (!settings.extensionConfig().mode.active) {
                        console.log(
                            "ⓘ activate extension: entering passive mode. not registering any active code augmentation support."
                        );
                        return;
                    }
                    /** module init */
                    onInitModules(context, type);
                    onDidChange();
                    onDidSave(active.document);

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
                            if (
                                activeEditor &&
                                event.document === activeEditor.document
                            ) {
                                onDidChange(event);
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

            /***/
        },
        /* 2 */
        /***/ (module) => {
            "use strict";
            module.exports = require("vscode");

            /***/
        },
        /* 3 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            /**
             * @author github.com/tintinweb
             * @license MIT
             *
             * */
            const vscode = __webpack_require__(2);

            const styles = {
                foreGroundOk: vscode.window.createTextEditorDecorationType({
                    dark: {
                        color: "#84f56293",
                    },
                    light: {
                        color: "#2a9b0e",
                    },
                    fontWeight: "bold",
                }),
                foreGroundWarning: vscode.window.createTextEditorDecorationType(
                    {
                        dark: {
                            color: "#f56262",
                        },
                        light: {
                            color: "#d65353",
                        },
                        fontWeight: "bold",
                    }
                ),
                foreGroundWarningUnderline:
                    vscode.window.createTextEditorDecorationType({
                        dark: {
                            color: "#f56262",
                        },
                        light: {
                            color: "#d65353",
                        },
                        textDecoration: "underline",
                    }),
                foreGroundInfoUnderline:
                    vscode.window.createTextEditorDecorationType({
                        dark: {
                            color: "#ffc570",
                        },
                        light: {
                            color: "#e4a13c",
                        },
                        textDecoration: "underline",
                    }),
                foreGroundNewEmit: vscode.window.createTextEditorDecorationType(
                    {
                        dark: {
                            color: "#fffffff5",
                        },
                        light: {
                            color: "",
                        },
                        fontWeight: "#c200b2ad",
                    }
                ),
                boldUnderline: vscode.window.createTextEditorDecorationType({
                    fontWeight: "bold",
                    textDecoration: "underline",
                }),
            };

            async function decorateWords(editor, decorules, decoStyle) {
                return new Promise((resolve) => {
                    if (!editor) {
                        return;
                    }
                    var decos = [];
                    const text = editor.document.getText();

                    decorules.forEach(function (rule) {
                        //var regEx = new RegExp("\\b" +word+"\\b" ,"g");
                        var regEx = new RegExp(rule.regex, "g");
                        let match;
                        while ((match = regEx.exec(text))) {
                            var startPos = editor.document.positionAt(
                                match.index
                            );
                            var endPos = editor.document.positionAt(
                                match.index +
                                    match[rule.captureGroup].trim().length
                            );
                            //endPos.line = startPos.line; //hacky force
                            var decoration = {
                                range: new vscode.Range(startPos, endPos),
                                hoverMessage: rule.hoverMessage,
                            };
                            decos.push(decoration);
                        }
                    });
                    editor.setDecorations(decoStyle, decos);
                    resolve();
                });
            }

            module.exports = {
                decorateWords: decorateWords,
                styles: styles,
            };

            /***/
        },
        /* 4 */
        /***/ (module) => {
            "use strict";

            /**
             * @author github.com/tintinweb
             * @license MIT
             *
             * */

            class VyperSignatureHelpProvider {
                provideSignatureHelp(document, position, token, context) {
                    return new Promise((resolve, reject) => {
                        position = position.translate(0, -1);
                        let range = document.getWordRangeAtPosition(position);
                        let name;
                        if (!range) {
                            return reject();
                        }
                        name = document.getText(range);
                        console.log(name);
                        console.log(context);
                    });
                }
            }

            module.exports = {
                VyperSignatureHelpProvider: VyperSignatureHelpProvider,
            };

            /***/
        },
        /* 5 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            /**
             * @author github.com/tintinweb
             * @license MIT
             *
             * */
            const vscode = __webpack_require__(2);
            const fs = __webpack_require__(
                Object(
                    (function webpackMissingModule() {
                        var e = new Error("Cannot find module 'fs'");
                        e.code = "MODULE_NOT_FOUND";
                        throw e;
                    })()
                )
            );
            const path = __webpack_require__(
                Object(
                    (function webpackMissingModule() {
                        var e = new Error("Cannot find module 'path'");
                        e.code = "MODULE_NOT_FOUND";
                        throw e;
                    })()
                )
            );
            const settings = __webpack_require__(6);

            const builtinsArr = __webpack_require__(79);

            function createHover(name, snippet, type) {
                function isSet(val) {
                    return typeof val != "undefined" && val != "";
                }

                var text = Array();

                if (isSet(snippet.instr_args) || isSet(snippet.instr_returns)) {
                    text.push(
                        "_asm_ :: __" +
                            name +
                            "__ (" +
                            snippet.instr_args.join(", ") +
                            ")" +
                            (isSet(snippet.instr_returns)
                                ? " : " + snippet.instr_returns.join(", ")
                                : "")
                    );
                }

                if (text.length > 0) text.push("");
                if (isSet(snippet.instr_gas)) {
                    text.push("__⟶__ gas (min): " + snippet.instr_gas);
                }
                if (isSet(snippet.instr_fork)) {
                    text.push("__⟶__ since: " + snippet.instr_fork);
                }

                if (text.length > 0) text.push("");
                if (isSet(snippet.example)) {
                    text.push(snippet.example);
                }

                if (text.length > 0) text.push("");
                if (isSet(snippet.description)) {
                    var txt_descr =
                        snippet.description instanceof Array
                            ? snippet.description.join("\n ")
                            : snippet.description;
                    text.push("💡 " + txt_descr);
                }

                if (text.length > 0) text.push("");
                if (isSet(snippet.security)) {
                    text.push("");
                    var txt_security =
                        snippet.security instanceof Array
                            ? snippet.security.join("\n* ❗")
                            : snippet.security;
                    text.push("* ❗ " + txt_security);
                }

                if (text.length > 0) text.push("");
                if (isSet(snippet.reference)) {
                    text.push("🌎 [more...](" + snippet.reference + ")");
                }

                //const commentCommandUri = vscode.Uri.parse(`command:editor.action.addCommentLine`);
                //text.push("[Add comment](${commentCommandUri})")
                const contents = new vscode.MarkdownString(text.join("  \n"));
                contents.isTrusted = true;
                return new vscode.Hover(contents);
            }

            function provideHoverHandler(document, position, token, type) {
                if (!settings.extensionConfig().hover.enable) {
                    return;
                }
                const range = document.getWordRangeAtPosition(
                    position,
                    /(tx\.gasprice|tx\.origin|msg\.data|msg\.sender|msg\.sig|msg\.value|block\.coinbase|block\.difficulty|block\.gaslimit|block\.number|block\.timestamp|abi\.encodePacked|abi\.encodeWithSelector|abi\.encodeWithSignature|abi\.decode|abi\.encode|\.?[0-9_\w>]+)/
                );
                if (!range || range.length <= 0) return;
                const word = document.getText(range);

                //console.log(word);

                for (const snippet in builtinsArr) {
                    if (
                        builtinsArr[snippet].prefix == word ||
                        builtinsArr[snippet].hover == word
                    ) {
                        return createHover(snippet, builtinsArr[snippet], type);
                    }
                }
            }

            function init(context, type) {
                context.subscriptions.push(
                    vscode.languages.registerHoverProvider(type, {
                        provideHover(document, position, token) {
                            return provideHoverHandler(
                                document,
                                position,
                                token,
                                type
                            );
                        },
                    })
                );
            }

            module.exports = {
                init: init,
            };

            /***/
        },
        /* 6 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            /**
             * @author github.com/tintinweb
             * @license MIT
             *
             *
             * */
            /** imports */
            const vscode = __webpack_require__(2);

            const LANGUAGE_ID = "vyper";

            function extensionConfig() {
                return vscode.workspace.getConfiguration(LANGUAGE_ID);
            }

            module.exports = {
                LANGUAGE_ID: LANGUAGE_ID,
                extensionConfig: extensionConfig,
            };

            /***/
        },
        /* 7 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";
            /* provided dependency */ var process = __webpack_require__(9);

            /**
             * @author github.com/tintinweb
             * @license MIT
             *
             * compilation related parts taken from: https://github.com/trufflesuite/truffle/tree/develop/packages/truffle-compile-vyper (MIT)
             * */

            const vscode = __webpack_require__(2);
            const path = __webpack_require__(
                Object(
                    (function webpackMissingModule() {
                        var e = new Error("Cannot find module 'path'");
                        e.code = "MODULE_NOT_FOUND";
                        throw e;
                    })()
                )
            );
            const exec = Object(
                (function webpackMissingModule() {
                    var e = new Error("Cannot find module 'child_process'");
                    e.code = "MODULE_NOT_FOUND";
                    throw e;
                })()
            );
            const async = __webpack_require__(8);
            const mod_analyze = __webpack_require__(10);
            const shellescape = __webpack_require__(78);
            const settings = __webpack_require__(6);

            var extensionContext;
            var compiler = {
                name: settings.LANGUAGE_ID,
                version: null,
            };

            var VYPER_ID = null;
            const VYPER_PATTERN = " **/*.{vy,v.py,vyper.py}";

            const compile = {};
            var diagnosticCollections = {
                compiler: null,
                mythx: null,
            };

            compile.display = function (paths, options) {
                if (options.quiet !== true) {
                    if (!Array.isArray(paths)) {
                        paths = Object.keys(paths);
                    }

                    paths.sort().forEach((contract) => {
                        if (path.isAbsolute(contract)) {
                            contract =
                                "." +
                                path.sep +
                                path.relative(
                                    options.working_directory,
                                    contract
                                );
                        }
                        options.logger.log("> Compiling " + contract);
                    });
                }
            };

            function workspaceForFile(fpath) {
                let workspace = vscode.workspace.getWorkspaceFolder(
                    vscode.Uri.file(fpath)
                );
                return workspace ? workspace.uri.fsPath : "";
            }

            // Check that vyper is available, save its version
            function checkVyper(source_file, callback) {
                //allow anything as command - no shellescape to even allow python -m vyper --version etc...
                exec(
                    `${settings.extensionConfig().command} --version`,
                    { cwd: workspaceForFile(source_file) },
                    function (err, stdout, stderr) {
                        if (err)
                            return callback(
                                `Error executing vyper:\n${stderr}`
                            );

                        compiler.version = stdout.trim();

                        callback(null);
                    }
                );
            }

            // Execute vyper for single source file
            function execVyper(source_path, callback) {
                const formats = ["abi", "bytecode", "bytecode_runtime"];
                let escapedTarget;
                if (process.platform.startsWith("win")) {
                    //nasty windows shell..
                    if (source_path.includes('"')) {
                        return callback(
                            `Compilation of ${source_path} failed. Invalid Filename (quotes).`
                        );
                    }
                    escapedTarget = `"${source_path}"`;
                } else {
                    //assume linux/macos.bash.
                    escapedTarget = `${shellescape([source_path])}`; //is quoted.
                }
                const command = `${
                    settings.extensionConfig().command
                } -f${formats.join(",")} ${escapedTarget}`;
                //console.log(command);
                exec(
                    command,
                    { cwd: workspaceForFile(source_path) },
                    function (err, stdout, stderr) {
                        if (err)
                            return callback(
                                `${stderr}\nCompilation of ${source_path} failed. See above.`
                            );
                        var outputs = stdout.split(/\r?\n/);

                        const compiled_contract = outputs.reduce(function (
                            contract,
                            output,
                            index
                        ) {
                            return Object.assign(contract, {
                                [formats[index]]: output,
                            });
                        },
                        {});

                        callback(null, compiled_contract);
                    }
                );
            }

            // compile all options.paths
            function compileAll(options, callback) {
                options.logger = options.logger || console;

                compile.display(options.paths, options);
                async.map(
                    options.paths,
                    function (source_path, c) {
                        execVyper(
                            source_path,
                            function (err, compiled_contract) {
                                if (err) return c(err);
                                // remove first extension from filename
                                const extension = path.extname(source_path);
                                const basename = path.basename(
                                    source_path,
                                    extension
                                );

                                // if extension is .py, remove second extension from filename
                                const contract_name =
                                    extension !== ".py"
                                        ? basename
                                        : path.basename(
                                              basename,
                                              path.extname(basename)
                                          );

                                const contract_definition = {
                                    contract_name: contract_name,
                                    sourcePath: source_path,

                                    abi: compiled_contract.abi,
                                    bytecode: compiled_contract.bytecode,
                                    deployedBytecode:
                                        compiled_contract.bytecode_runtime,

                                    compiler: compiler,
                                };

                                c(null, contract_definition);
                            }
                        );
                    },
                    function (err, contracts) {
                        if (err) return callback(err);

                        const result = contracts.reduce(function (
                            result,
                            contract
                        ) {
                            result[contract.contract_name] = contract;

                            return result;
                        },
                        {});

                        const compilerInfo = {
                            name: "vyper",
                            version: compiler.version,
                        };

                        callback(null, result, options.paths, compilerInfo);
                    }
                );
            }

            // Check that vyper is available then forward to internal compile function
            function compileVyper(options, callback) {
                // filter out non-vyper paths

                // no vyper files found, no need to check vyper
                if (options.paths.length === 0) return callback(null, {}, []);

                checkVyper(options.paths[0], function (err) {
                    //@use first files workspaces as CWD
                    if (err) return callback(err);

                    return compileAll(options, callback);
                });
            }

            // append .vy pattern to contracts_directory in options and return updated options
            function updateContractsDirectory(options) {
                return options.with({
                    contracts_directory: path.join(
                        options.contracts_directory,
                        VYPER_PATTERN
                    ),
                });
            }

            // wrapper for compile.all. only updates contracts_directory to find .vy
            compileVyper.all = function (options, callback) {
                return compile.all(updateContractsDirectory(options), callback);
            };

            // wrapper for compile.necessary. only updates contracts_directory to find .vy
            compileVyper.necessary = function (options, callback) {
                return compile.necessary(
                    updateContractsDirectory(options),
                    callback
                );
            };

            function compileActiveFileCommand(contractFile) {
                if (!contractFile) {
                    contractFile = vscode.window.activeTextEditor.document;
                }
                compileActiveFile(contractFile)
                    .then(
                        (success) => {
                            diagnosticCollections.compiler.delete(
                                contractFile.uri
                            );
                            diagnosticCollections.mythx.delete(
                                contractFile.uri
                            );
                            vscode.window.showInformationMessage(
                                "[Compiler success] " +
                                    Object.keys(success).join(",")
                            );

                            // precedence: (1) vyperConfig, otherwise (2) process.env
                            let password =
                                settings.extensionConfig().analysis.mythx
                                    .password || process.env.MYTHX_PASSWORD;
                            let ethAddress =
                                settings.extensionConfig().analysis.mythx
                                    .ethAddress ||
                                process.env.MYTHX_ETH_ADDRESS;

                            //set to trial?
                            if (ethAddress == "trial") {
                                ethAddress = ""; // "0x0000000000000000000000000000000000000000" //@note tin: there's no trial :/
                                password = "trial";
                            }

                            if (
                                settings.extensionConfig().analysis.onSave &&
                                ethAddress &&
                                password
                            ) {
                                //if mythx is configured
                                // bytecode
                                for (let contractKey in success) {
                                    mod_analyze.analyze
                                        .mythXjs(
                                            ethAddress,
                                            password,
                                            success[contractKey].bytecode,
                                            success[contractKey]
                                                .deployedBytecode
                                        )
                                        .then((result) => {
                                            let diagIssues = [];

                                            result.forEach(function (_result) {
                                                _result.issues.forEach(
                                                    function (issue) {
                                                        let shortmsg = `[${issue.severity}] ${issue.swcID}: ${issue.description.head}`;
                                                        let errormsg = `[${issue.severity}] ${issue.swcID}: ${issue.swcTitle}\n${issue.description.head}\n${issue.description.tail}\n\nCovered Instructions/Paths: ${_result.meta.coveredInstructions}/${_result.meta.coveredPaths}`;
                                                        let lineNr = 1; // we did not submit any source so just pin it to line 0

                                                        diagIssues.push({
                                                            code: "",
                                                            message: shortmsg,
                                                            range: new vscode.Range(
                                                                new vscode.Position(
                                                                    lineNr - 1,
                                                                    0
                                                                ),
                                                                new vscode.Position(
                                                                    lineNr - 1,
                                                                    255
                                                                )
                                                            ),
                                                            severity:
                                                                mod_analyze
                                                                    .mythXSeverityToVSCodeSeverity[
                                                                    issue
                                                                        .severity
                                                                ],
                                                            source: errormsg,
                                                            relatedInformation:
                                                                [],
                                                        });
                                                    }
                                                );
                                            });
                                            diagnosticCollections.mythx.set(
                                                contractFile.uri,
                                                diagIssues
                                            );
                                            vscode.window.showInformationMessage(
                                                `[MythX success] ${contractKey}: ${diagIssues.length} issues`
                                            );
                                        })
                                        .catch((err) => {
                                            vscode.window.showErrorMessage(
                                                "[MythX error] " + err
                                            );
                                            console.log(err);
                                        });
                                }
                            }
                        },
                        (errormsg) => {
                            diagnosticCollections.compiler.delete(
                                contractFile.uri
                            );
                            diagnosticCollections.mythx.delete(
                                contractFile.uri
                            );
                            vscode.window.showErrorMessage(
                                "[Compiler Error] " + errormsg
                            );
                            let lineNr = 1; // add default errors to line 0 if not known
                            let matches = /(?:line\s+(\d+))/gm.exec(errormsg);
                            if (matches && matches.length == 2) {
                                //only one line ref
                                lineNr = parseInt(matches[1]);
                            }

                            let lines = errormsg.split(/\r?\n/);
                            console.log(errormsg);
                            let shortmsg = lines[0];

                            // IndexError
                            if (
                                lines.indexOf("SyntaxError: invalid syntax") >
                                -1
                            ) {
                                let matches = /line (\d+)/gm.exec(errormsg);
                                if (matches.length >= 2) {
                                    lineNr = parseInt(matches[1]);
                                }
                                shortmsg = "SyntaxError: invalid syntax";
                            } else {
                                //match generic vyper exceptions
                                let matches =
                                    /vyper\.exceptions\.\w+Exception:\s+(?:line\s+(\d+)).*$/gm.exec(
                                        errormsg
                                    );
                                if (matches && matches.length > 0) {
                                    shortmsg = matches[0];
                                    if (matches.length >= 2) {
                                        lineNr = parseInt(matches[1]);
                                    }
                                }
                            }
                            if (errormsg) {
                                diagnosticCollections.compiler.set(
                                    contractFile.uri,
                                    [
                                        {
                                            code: "",
                                            message: shortmsg,
                                            range: new vscode.Range(
                                                new vscode.Position(
                                                    lineNr - 1,
                                                    0
                                                ),
                                                new vscode.Position(
                                                    lineNr - 1,
                                                    255
                                                )
                                            ),
                                            severity:
                                                vscode.DiagnosticSeverity.Error,
                                            source: errormsg,
                                            relatedInformation: [],
                                        },
                                    ]
                                );
                            }
                        }
                    )
                    .catch((ex) => {
                        vscode.window.showErrorMessage(
                            "[Compiler Exception] " + ex
                        );
                        console.error(ex);
                    });
            }

            function compileActiveFile(contractFile) {
                return new Promise((resolve, reject) => {
                    if (!contractFile || contractFile.languageId !== VYPER_ID) {
                        reject("Not a vyper source file");
                        return;
                    }

                    let options = {
                        contractsDirectory: "./contracts",
                        working_directory: "",
                        all: true,
                        paths: [contractFile.uri.fsPath],
                    };

                    compileVyper(
                        options,
                        function (err, result, paths, compilerInfo) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(result, paths, compilerInfo);
                            }
                        }
                    );
                });
            }

            function init(context, type) {
                VYPER_ID = type;
                diagnosticCollections.compiler =
                    vscode.languages.createDiagnosticCollection(
                        "Vyper Compiler"
                    );
                context.subscriptions.push(diagnosticCollections.compiler);
                diagnosticCollections.mythx =
                    vscode.languages.createDiagnosticCollection(
                        "MythX Security Platform"
                    );
                context.subscriptions.push(diagnosticCollections.mythx);
                extensionContext = context;
            }

            module.exports = {
                init: init,
                compileContractCommand: compileActiveFileCommand,
                compileContract: compileActiveFile,
            };

            /***/
        },
        /* 8 */
        /***/ function (module, exports, __webpack_require__) {
            /* module decorator */ module = __webpack_require__.nmd(module);
            /* provided dependency */ var process = __webpack_require__(9);
            (function (global, factory) {
                true ? factory(exports) : 0;
            })(this, function (exports) {
                "use strict";

                function slice(arrayLike, start) {
                    start = start | 0;
                    var newLen = Math.max(arrayLike.length - start, 0);
                    var newArr = Array(newLen);
                    for (var idx = 0; idx < newLen; idx++) {
                        newArr[idx] = arrayLike[start + idx];
                    }
                    return newArr;
                }

                /**
                 * Creates a continuation function with some arguments already applied.
                 *
                 * Useful as a shorthand when combined with other control flow functions. Any
                 * arguments passed to the returned function are added to the arguments
                 * originally passed to apply.
                 *
                 * @name apply
                 * @static
                 * @memberOf module:Utils
                 * @method
                 * @category Util
                 * @param {Function} fn - The function you want to eventually apply all
                 * arguments to. Invokes with (arguments...).
                 * @param {...*} arguments... - Any number of arguments to automatically apply
                 * when the continuation is called.
                 * @returns {Function} the partially-applied function
                 * @example
                 *
                 * // using apply
                 * async.parallel([
                 *     async.apply(fs.writeFile, 'testfile1', 'test1'),
                 *     async.apply(fs.writeFile, 'testfile2', 'test2')
                 * ]);
                 *
                 *
                 * // the same process without using apply
                 * async.parallel([
                 *     function(callback) {
                 *         fs.writeFile('testfile1', 'test1', callback);
                 *     },
                 *     function(callback) {
                 *         fs.writeFile('testfile2', 'test2', callback);
                 *     }
                 * ]);
                 *
                 * // It's possible to pass any number of additional arguments when calling the
                 * // continuation:
                 *
                 * node> var fn = async.apply(sys.puts, 'one');
                 * node> fn('two', 'three');
                 * one
                 * two
                 * three
                 */
                var apply = function (fn /*, ...args*/) {
                    var args = slice(arguments, 1);
                    return function (/*callArgs*/) {
                        var callArgs = slice(arguments);
                        return fn.apply(null, args.concat(callArgs));
                    };
                };

                var initialParams = function (fn) {
                    return function (/*...args, callback*/) {
                        var args = slice(arguments);
                        var callback = args.pop();
                        fn.call(this, args, callback);
                    };
                };

                /**
                 * Checks if `value` is the
                 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
                 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
                 *
                 * @static
                 * @memberOf _
                 * @since 0.1.0
                 * @category Lang
                 * @param {*} value The value to check.
                 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
                 * @example
                 *
                 * _.isObject({});
                 * // => true
                 *
                 * _.isObject([1, 2, 3]);
                 * // => true
                 *
                 * _.isObject(_.noop);
                 * // => true
                 *
                 * _.isObject(null);
                 * // => false
                 */
                function isObject(value) {
                    var type = typeof value;
                    return (
                        value != null &&
                        (type == "object" || type == "function")
                    );
                }

                var hasSetImmediate =
                    typeof setImmediate === "function" && setImmediate;
                var hasNextTick =
                    typeof process === "object" &&
                    typeof process.nextTick === "function";

                function fallback(fn) {
                    setTimeout(fn, 0);
                }

                function wrap(defer) {
                    return function (fn /*, ...args*/) {
                        var args = slice(arguments, 1);
                        defer(function () {
                            fn.apply(null, args);
                        });
                    };
                }

                var _defer;

                if (hasSetImmediate) {
                    _defer = setImmediate;
                } else if (hasNextTick) {
                    _defer = process.nextTick;
                } else {
                    _defer = fallback;
                }

                var setImmediate$1 = wrap(_defer);

                /**
                 * Take a sync function and make it async, passing its return value to a
                 * callback. This is useful for plugging sync functions into a waterfall,
                 * series, or other async functions. Any arguments passed to the generated
                 * function will be passed to the wrapped function (except for the final
                 * callback argument). Errors thrown will be passed to the callback.
                 *
                 * If the function passed to `asyncify` returns a Promise, that promises's
                 * resolved/rejected state will be used to call the callback, rather than simply
                 * the synchronous return value.
                 *
                 * This also means you can asyncify ES2017 `async` functions.
                 *
                 * @name asyncify
                 * @static
                 * @memberOf module:Utils
                 * @method
                 * @alias wrapSync
                 * @category Util
                 * @param {Function} func - The synchronous function, or Promise-returning
                 * function to convert to an {@link AsyncFunction}.
                 * @returns {AsyncFunction} An asynchronous wrapper of the `func`. To be
                 * invoked with `(args..., callback)`.
                 * @example
                 *
                 * // passing a regular synchronous function
                 * async.waterfall([
                 *     async.apply(fs.readFile, filename, "utf8"),
                 *     async.asyncify(JSON.parse),
                 *     function (data, next) {
                 *         // data is the result of parsing the text.
                 *         // If there was a parsing error, it would have been caught.
                 *     }
                 * ], callback);
                 *
                 * // passing a function returning a promise
                 * async.waterfall([
                 *     async.apply(fs.readFile, filename, "utf8"),
                 *     async.asyncify(function (contents) {
                 *         return db.model.create(contents);
                 *     }),
                 *     function (model, next) {
                 *         // `model` is the instantiated model object.
                 *         // If there was an error, this function would be skipped.
                 *     }
                 * ], callback);
                 *
                 * // es2017 example, though `asyncify` is not needed if your JS environment
                 * // supports async functions out of the box
                 * var q = async.queue(async.asyncify(async function(file) {
                 *     var intermediateStep = await processFile(file);
                 *     return await somePromise(intermediateStep)
                 * }));
                 *
                 * q.push(files);
                 */
                function asyncify(func) {
                    return initialParams(function (args, callback) {
                        var result;
                        try {
                            result = func.apply(this, args);
                        } catch (e) {
                            return callback(e);
                        }
                        // if result is Promise object
                        if (
                            isObject(result) &&
                            typeof result.then === "function"
                        ) {
                            result.then(
                                function (value) {
                                    invokeCallback(callback, null, value);
                                },
                                function (err) {
                                    invokeCallback(
                                        callback,
                                        err.message ? err : new Error(err)
                                    );
                                }
                            );
                        } else {
                            callback(null, result);
                        }
                    });
                }

                function invokeCallback(callback, error, value) {
                    try {
                        callback(error, value);
                    } catch (e) {
                        setImmediate$1(rethrow, e);
                    }
                }

                function rethrow(error) {
                    throw error;
                }

                var supportsSymbol = typeof Symbol === "function";

                function isAsync(fn) {
                    return (
                        supportsSymbol &&
                        fn[Symbol.toStringTag] === "AsyncFunction"
                    );
                }

                function wrapAsync(asyncFn) {
                    return isAsync(asyncFn) ? asyncify(asyncFn) : asyncFn;
                }

                function applyEach$1(eachfn) {
                    return function (fns /*, ...args*/) {
                        var args = slice(arguments, 1);
                        var go = initialParams(function (args, callback) {
                            var that = this;
                            return eachfn(
                                fns,
                                function (fn, cb) {
                                    wrapAsync(fn).apply(that, args.concat(cb));
                                },
                                callback
                            );
                        });
                        if (args.length) {
                            return go.apply(this, args);
                        } else {
                            return go;
                        }
                    };
                }

                /** Detect free variable `global` from Node.js. */
                var freeGlobal =
                    typeof __webpack_require__.g == "object" &&
                    __webpack_require__.g &&
                    __webpack_require__.g.Object === Object &&
                    __webpack_require__.g;

                /** Detect free variable `self`. */
                var freeSelf =
                    typeof self == "object" &&
                    self &&
                    self.Object === Object &&
                    self;

                /** Used as a reference to the global object. */
                var root = freeGlobal || freeSelf || Function("return this")();

                /** Built-in value references. */
                var Symbol$1 = root.Symbol;

                /** Used for built-in method references. */
                var objectProto = Object.prototype;

                /** Used to check objects for own properties. */
                var hasOwnProperty = objectProto.hasOwnProperty;

                /**
                 * Used to resolve the
                 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
                 * of values.
                 */
                var nativeObjectToString = objectProto.toString;

                /** Built-in value references. */
                var symToStringTag$1 = Symbol$1
                    ? Symbol$1.toStringTag
                    : undefined;

                /**
                 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
                 *
                 * @private
                 * @param {*} value The value to query.
                 * @returns {string} Returns the raw `toStringTag`.
                 */
                function getRawTag(value) {
                    var isOwn = hasOwnProperty.call(value, symToStringTag$1),
                        tag = value[symToStringTag$1];

                    try {
                        value[symToStringTag$1] = undefined;
                        var unmasked = true;
                    } catch (e) {}

                    var result = nativeObjectToString.call(value);
                    if (unmasked) {
                        if (isOwn) {
                            value[symToStringTag$1] = tag;
                        } else {
                            delete value[symToStringTag$1];
                        }
                    }
                    return result;
                }

                /** Used for built-in method references. */
                var objectProto$1 = Object.prototype;

                /**
                 * Used to resolve the
                 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
                 * of values.
                 */
                var nativeObjectToString$1 = objectProto$1.toString;

                /**
                 * Converts `value` to a string using `Object.prototype.toString`.
                 *
                 * @private
                 * @param {*} value The value to convert.
                 * @returns {string} Returns the converted string.
                 */
                function objectToString(value) {
                    return nativeObjectToString$1.call(value);
                }

                /** `Object#toString` result references. */
                var nullTag = "[object Null]";
                var undefinedTag = "[object Undefined]";

                /** Built-in value references. */
                var symToStringTag = Symbol$1
                    ? Symbol$1.toStringTag
                    : undefined;

                /**
                 * The base implementation of `getTag` without fallbacks for buggy environments.
                 *
                 * @private
                 * @param {*} value The value to query.
                 * @returns {string} Returns the `toStringTag`.
                 */
                function baseGetTag(value) {
                    if (value == null) {
                        return value === undefined ? undefinedTag : nullTag;
                    }
                    return symToStringTag && symToStringTag in Object(value)
                        ? getRawTag(value)
                        : objectToString(value);
                }

                /** `Object#toString` result references. */
                var asyncTag = "[object AsyncFunction]";
                var funcTag = "[object Function]";
                var genTag = "[object GeneratorFunction]";
                var proxyTag = "[object Proxy]";

                /**
                 * Checks if `value` is classified as a `Function` object.
                 *
                 * @static
                 * @memberOf _
                 * @since 0.1.0
                 * @category Lang
                 * @param {*} value The value to check.
                 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
                 * @example
                 *
                 * _.isFunction(_);
                 * // => true
                 *
                 * _.isFunction(/abc/);
                 * // => false
                 */
                function isFunction(value) {
                    if (!isObject(value)) {
                        return false;
                    }
                    // The use of `Object#toString` avoids issues with the `typeof` operator
                    // in Safari 9 which returns 'object' for typed arrays and other constructors.
                    var tag = baseGetTag(value);
                    return (
                        tag == funcTag ||
                        tag == genTag ||
                        tag == asyncTag ||
                        tag == proxyTag
                    );
                }

                /** Used as references for various `Number` constants. */
                var MAX_SAFE_INTEGER = 9007199254740991;

                /**
                 * Checks if `value` is a valid array-like length.
                 *
                 * **Note:** This method is loosely based on
                 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
                 *
                 * @static
                 * @memberOf _
                 * @since 4.0.0
                 * @category Lang
                 * @param {*} value The value to check.
                 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
                 * @example
                 *
                 * _.isLength(3);
                 * // => true
                 *
                 * _.isLength(Number.MIN_VALUE);
                 * // => false
                 *
                 * _.isLength(Infinity);
                 * // => false
                 *
                 * _.isLength('3');
                 * // => false
                 */
                function isLength(value) {
                    return (
                        typeof value == "number" &&
                        value > -1 &&
                        value % 1 == 0 &&
                        value <= MAX_SAFE_INTEGER
                    );
                }

                /**
                 * Checks if `value` is array-like. A value is considered array-like if it's
                 * not a function and has a `value.length` that's an integer greater than or
                 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
                 *
                 * @static
                 * @memberOf _
                 * @since 4.0.0
                 * @category Lang
                 * @param {*} value The value to check.
                 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
                 * @example
                 *
                 * _.isArrayLike([1, 2, 3]);
                 * // => true
                 *
                 * _.isArrayLike(document.body.children);
                 * // => true
                 *
                 * _.isArrayLike('abc');
                 * // => true
                 *
                 * _.isArrayLike(_.noop);
                 * // => false
                 */
                function isArrayLike(value) {
                    return (
                        value != null &&
                        isLength(value.length) &&
                        !isFunction(value)
                    );
                }

                // A temporary value used to identify if the loop should be broken.
                // See #1064, #1293
                var breakLoop = {};

                /**
                 * This method returns `undefined`.
                 *
                 * @static
                 * @memberOf _
                 * @since 2.3.0
                 * @category Util
                 * @example
                 *
                 * _.times(2, _.noop);
                 * // => [undefined, undefined]
                 */
                function noop() {
                    // No operation performed.
                }

                function once(fn) {
                    return function () {
                        if (fn === null) return;
                        var callFn = fn;
                        fn = null;
                        callFn.apply(this, arguments);
                    };
                }

                var iteratorSymbol =
                    typeof Symbol === "function" && Symbol.iterator;

                var getIterator = function (coll) {
                    return (
                        iteratorSymbol &&
                        coll[iteratorSymbol] &&
                        coll[iteratorSymbol]()
                    );
                };

                /**
                 * The base implementation of `_.times` without support for iteratee shorthands
                 * or max array length checks.
                 *
                 * @private
                 * @param {number} n The number of times to invoke `iteratee`.
                 * @param {Function} iteratee The function invoked per iteration.
                 * @returns {Array} Returns the array of results.
                 */
                function baseTimes(n, iteratee) {
                    var index = -1,
                        result = Array(n);

                    while (++index < n) {
                        result[index] = iteratee(index);
                    }
                    return result;
                }

                /**
                 * Checks if `value` is object-like. A value is object-like if it's not `null`
                 * and has a `typeof` result of "object".
                 *
                 * @static
                 * @memberOf _
                 * @since 4.0.0
                 * @category Lang
                 * @param {*} value The value to check.
                 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
                 * @example
                 *
                 * _.isObjectLike({});
                 * // => true
                 *
                 * _.isObjectLike([1, 2, 3]);
                 * // => true
                 *
                 * _.isObjectLike(_.noop);
                 * // => false
                 *
                 * _.isObjectLike(null);
                 * // => false
                 */
                function isObjectLike(value) {
                    return value != null && typeof value == "object";
                }

                /** `Object#toString` result references. */
                var argsTag = "[object Arguments]";

                /**
                 * The base implementation of `_.isArguments`.
                 *
                 * @private
                 * @param {*} value The value to check.
                 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
                 */
                function baseIsArguments(value) {
                    return isObjectLike(value) && baseGetTag(value) == argsTag;
                }

                /** Used for built-in method references. */
                var objectProto$3 = Object.prototype;

                /** Used to check objects for own properties. */
                var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

                /** Built-in value references. */
                var propertyIsEnumerable = objectProto$3.propertyIsEnumerable;

                /**
                 * Checks if `value` is likely an `arguments` object.
                 *
                 * @static
                 * @memberOf _
                 * @since 0.1.0
                 * @category Lang
                 * @param {*} value The value to check.
                 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
                 *  else `false`.
                 * @example
                 *
                 * _.isArguments(function() { return arguments; }());
                 * // => true
                 *
                 * _.isArguments([1, 2, 3]);
                 * // => false
                 */
                var isArguments = baseIsArguments(
                    (function () {
                        return arguments;
                    })()
                )
                    ? baseIsArguments
                    : function (value) {
                          return (
                              isObjectLike(value) &&
                              hasOwnProperty$2.call(value, "callee") &&
                              !propertyIsEnumerable.call(value, "callee")
                          );
                      };

                /**
                 * Checks if `value` is classified as an `Array` object.
                 *
                 * @static
                 * @memberOf _
                 * @since 0.1.0
                 * @category Lang
                 * @param {*} value The value to check.
                 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
                 * @example
                 *
                 * _.isArray([1, 2, 3]);
                 * // => true
                 *
                 * _.isArray(document.body.children);
                 * // => false
                 *
                 * _.isArray('abc');
                 * // => false
                 *
                 * _.isArray(_.noop);
                 * // => false
                 */
                var isArray = Array.isArray;

                /**
                 * This method returns `false`.
                 *
                 * @static
                 * @memberOf _
                 * @since 4.13.0
                 * @category Util
                 * @returns {boolean} Returns `false`.
                 * @example
                 *
                 * _.times(2, _.stubFalse);
                 * // => [false, false]
                 */
                function stubFalse() {
                    return false;
                }

                /** Detect free variable `exports`. */
                var freeExports =
                    typeof exports == "object" &&
                    exports &&
                    !exports.nodeType &&
                    exports;

                /** Detect free variable `module`. */
                var freeModule =
                    freeExports &&
                    "object" == "object" &&
                    module &&
                    !module.nodeType &&
                    module;

                /** Detect the popular CommonJS extension `module.exports`. */
                var moduleExports =
                    freeModule && freeModule.exports === freeExports;

                /** Built-in value references. */
                var Buffer = moduleExports ? root.Buffer : undefined;

                /* Built-in method references for those with the same name as other `lodash` methods. */
                var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

                /**
                 * Checks if `value` is a buffer.
                 *
                 * @static
                 * @memberOf _
                 * @since 4.3.0
                 * @category Lang
                 * @param {*} value The value to check.
                 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
                 * @example
                 *
                 * _.isBuffer(new Buffer(2));
                 * // => true
                 *
                 * _.isBuffer(new Uint8Array(2));
                 * // => false
                 */
                var isBuffer = nativeIsBuffer || stubFalse;

                /** Used as references for various `Number` constants. */
                var MAX_SAFE_INTEGER$1 = 9007199254740991;

                /** Used to detect unsigned integer values. */
                var reIsUint = /^(?:0|[1-9]\d*)$/;

                /**
                 * Checks if `value` is a valid array-like index.
                 *
                 * @private
                 * @param {*} value The value to check.
                 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
                 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
                 */
                function isIndex(value, length) {
                    var type = typeof value;
                    length = length == null ? MAX_SAFE_INTEGER$1 : length;

                    return (
                        !!length &&
                        (type == "number" ||
                            (type != "symbol" && reIsUint.test(value))) &&
                        value > -1 &&
                        value % 1 == 0 &&
                        value < length
                    );
                }

                /** `Object#toString` result references. */
                var argsTag$1 = "[object Arguments]";
                var arrayTag = "[object Array]";
                var boolTag = "[object Boolean]";
                var dateTag = "[object Date]";
                var errorTag = "[object Error]";
                var funcTag$1 = "[object Function]";
                var mapTag = "[object Map]";
                var numberTag = "[object Number]";
                var objectTag = "[object Object]";
                var regexpTag = "[object RegExp]";
                var setTag = "[object Set]";
                var stringTag = "[object String]";
                var weakMapTag = "[object WeakMap]";

                var arrayBufferTag = "[object ArrayBuffer]";
                var dataViewTag = "[object DataView]";
                var float32Tag = "[object Float32Array]";
                var float64Tag = "[object Float64Array]";
                var int8Tag = "[object Int8Array]";
                var int16Tag = "[object Int16Array]";
                var int32Tag = "[object Int32Array]";
                var uint8Tag = "[object Uint8Array]";
                var uint8ClampedTag = "[object Uint8ClampedArray]";
                var uint16Tag = "[object Uint16Array]";
                var uint32Tag = "[object Uint32Array]";

                /** Used to identify `toStringTag` values of typed arrays. */
                var typedArrayTags = {};
                typedArrayTags[float32Tag] =
                    typedArrayTags[float64Tag] =
                    typedArrayTags[int8Tag] =
                    typedArrayTags[int16Tag] =
                    typedArrayTags[int32Tag] =
                    typedArrayTags[uint8Tag] =
                    typedArrayTags[uint8ClampedTag] =
                    typedArrayTags[uint16Tag] =
                    typedArrayTags[uint32Tag] =
                        true;
                typedArrayTags[argsTag$1] =
                    typedArrayTags[arrayTag] =
                    typedArrayTags[arrayBufferTag] =
                    typedArrayTags[boolTag] =
                    typedArrayTags[dataViewTag] =
                    typedArrayTags[dateTag] =
                    typedArrayTags[errorTag] =
                    typedArrayTags[funcTag$1] =
                    typedArrayTags[mapTag] =
                    typedArrayTags[numberTag] =
                    typedArrayTags[objectTag] =
                    typedArrayTags[regexpTag] =
                    typedArrayTags[setTag] =
                    typedArrayTags[stringTag] =
                    typedArrayTags[weakMapTag] =
                        false;

                /**
                 * The base implementation of `_.isTypedArray` without Node.js optimizations.
                 *
                 * @private
                 * @param {*} value The value to check.
                 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
                 */
                function baseIsTypedArray(value) {
                    return (
                        isObjectLike(value) &&
                        isLength(value.length) &&
                        !!typedArrayTags[baseGetTag(value)]
                    );
                }

                /**
                 * The base implementation of `_.unary` without support for storing metadata.
                 *
                 * @private
                 * @param {Function} func The function to cap arguments for.
                 * @returns {Function} Returns the new capped function.
                 */
                function baseUnary(func) {
                    return function (value) {
                        return func(value);
                    };
                }

                /** Detect free variable `exports`. */
                var freeExports$1 =
                    typeof exports == "object" &&
                    exports &&
                    !exports.nodeType &&
                    exports;

                /** Detect free variable `module`. */
                var freeModule$1 =
                    freeExports$1 &&
                    "object" == "object" &&
                    module &&
                    !module.nodeType &&
                    module;

                /** Detect the popular CommonJS extension `module.exports`. */
                var moduleExports$1 =
                    freeModule$1 && freeModule$1.exports === freeExports$1;

                /** Detect free variable `process` from Node.js. */
                var freeProcess = moduleExports$1 && freeGlobal.process;

                /** Used to access faster Node.js helpers. */
                var nodeUtil = (function () {
                    try {
                        // Use `util.types` for Node.js 10+.
                        var types =
                            freeModule$1 &&
                            freeModule$1.require &&
                            freeModule$1.require("util").types;

                        if (types) {
                            return types;
                        }

                        // Legacy `process.binding('util')` for Node.js < 10.
                        return (
                            freeProcess &&
                            freeProcess.binding &&
                            freeProcess.binding("util")
                        );
                    } catch (e) {}
                })();

                /* Node.js helper references. */
                var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

                /**
                 * Checks if `value` is classified as a typed array.
                 *
                 * @static
                 * @memberOf _
                 * @since 3.0.0
                 * @category Lang
                 * @param {*} value The value to check.
                 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
                 * @example
                 *
                 * _.isTypedArray(new Uint8Array);
                 * // => true
                 *
                 * _.isTypedArray([]);
                 * // => false
                 */
                var isTypedArray = nodeIsTypedArray
                    ? baseUnary(nodeIsTypedArray)
                    : baseIsTypedArray;

                /** Used for built-in method references. */
                var objectProto$2 = Object.prototype;

                /** Used to check objects for own properties. */
                var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

                /**
                 * Creates an array of the enumerable property names of the array-like `value`.
                 *
                 * @private
                 * @param {*} value The value to query.
                 * @param {boolean} inherited Specify returning inherited property names.
                 * @returns {Array} Returns the array of property names.
                 */
                function arrayLikeKeys(value, inherited) {
                    var isArr = isArray(value),
                        isArg = !isArr && isArguments(value),
                        isBuff = !isArr && !isArg && isBuffer(value),
                        isType =
                            !isArr && !isArg && !isBuff && isTypedArray(value),
                        skipIndexes = isArr || isArg || isBuff || isType,
                        result = skipIndexes
                            ? baseTimes(value.length, String)
                            : [],
                        length = result.length;

                    for (var key in value) {
                        if (
                            (inherited || hasOwnProperty$1.call(value, key)) &&
                            !(
                                skipIndexes &&
                                // Safari 9 has enumerable `arguments.length` in strict mode.
                                (key == "length" ||
                                    // Node.js 0.10 has enumerable non-index properties on buffers.
                                    (isBuff &&
                                        (key == "offset" || key == "parent")) ||
                                    // PhantomJS 2 has enumerable non-index properties on typed arrays.
                                    (isType &&
                                        (key == "buffer" ||
                                            key == "byteLength" ||
                                            key == "byteOffset")) ||
                                    // Skip index properties.
                                    isIndex(key, length))
                            )
                        ) {
                            result.push(key);
                        }
                    }
                    return result;
                }

                /** Used for built-in method references. */
                var objectProto$5 = Object.prototype;

                /**
                 * Checks if `value` is likely a prototype object.
                 *
                 * @private
                 * @param {*} value The value to check.
                 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
                 */
                function isPrototype(value) {
                    var Ctor = value && value.constructor,
                        proto =
                            (typeof Ctor == "function" && Ctor.prototype) ||
                            objectProto$5;

                    return value === proto;
                }

                /**
                 * Creates a unary function that invokes `func` with its argument transformed.
                 *
                 * @private
                 * @param {Function} func The function to wrap.
                 * @param {Function} transform The argument transform.
                 * @returns {Function} Returns the new function.
                 */
                function overArg(func, transform) {
                    return function (arg) {
                        return func(transform(arg));
                    };
                }

                /* Built-in method references for those with the same name as other `lodash` methods. */
                var nativeKeys = overArg(Object.keys, Object);

                /** Used for built-in method references. */
                var objectProto$4 = Object.prototype;

                /** Used to check objects for own properties. */
                var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

                /**
                 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
                 *
                 * @private
                 * @param {Object} object The object to query.
                 * @returns {Array} Returns the array of property names.
                 */
                function baseKeys(object) {
                    if (!isPrototype(object)) {
                        return nativeKeys(object);
                    }
                    var result = [];
                    for (var key in Object(object)) {
                        if (
                            hasOwnProperty$3.call(object, key) &&
                            key != "constructor"
                        ) {
                            result.push(key);
                        }
                    }
                    return result;
                }

                /**
                 * Creates an array of the own enumerable property names of `object`.
                 *
                 * **Note:** Non-object values are coerced to objects. See the
                 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
                 * for more details.
                 *
                 * @static
                 * @since 0.1.0
                 * @memberOf _
                 * @category Object
                 * @param {Object} object The object to query.
                 * @returns {Array} Returns the array of property names.
                 * @example
                 *
                 * function Foo() {
                 *   this.a = 1;
                 *   this.b = 2;
                 * }
                 *
                 * Foo.prototype.c = 3;
                 *
                 * _.keys(new Foo);
                 * // => ['a', 'b'] (iteration order is not guaranteed)
                 *
                 * _.keys('hi');
                 * // => ['0', '1']
                 */
                function keys(object) {
                    return isArrayLike(object)
                        ? arrayLikeKeys(object)
                        : baseKeys(object);
                }

                function createArrayIterator(coll) {
                    var i = -1;
                    var len = coll.length;
                    return function next() {
                        return ++i < len ? { value: coll[i], key: i } : null;
                    };
                }

                function createES2015Iterator(iterator) {
                    var i = -1;
                    return function next() {
                        var item = iterator.next();
                        if (item.done) return null;
                        i++;
                        return { value: item.value, key: i };
                    };
                }

                function createObjectIterator(obj) {
                    var okeys = keys(obj);
                    var i = -1;
                    var len = okeys.length;
                    return function next() {
                        var key = okeys[++i];
                        return i < len ? { value: obj[key], key: key } : null;
                    };
                }

                function iterator(coll) {
                    if (isArrayLike(coll)) {
                        return createArrayIterator(coll);
                    }

                    var iterator = getIterator(coll);
                    return iterator
                        ? createES2015Iterator(iterator)
                        : createObjectIterator(coll);
                }

                function onlyOnce(fn) {
                    return function () {
                        if (fn === null)
                            throw new Error("Callback was already called.");
                        var callFn = fn;
                        fn = null;
                        callFn.apply(this, arguments);
                    };
                }

                function _eachOfLimit(limit) {
                    return function (obj, iteratee, callback) {
                        callback = once(callback || noop);
                        if (limit <= 0 || !obj) {
                            return callback(null);
                        }
                        var nextElem = iterator(obj);
                        var done = false;
                        var running = 0;
                        var looping = false;

                        function iterateeCallback(err, value) {
                            running -= 1;
                            if (err) {
                                done = true;
                                callback(err);
                            } else if (
                                value === breakLoop ||
                                (done && running <= 0)
                            ) {
                                done = true;
                                return callback(null);
                            } else if (!looping) {
                                replenish();
                            }
                        }

                        function replenish() {
                            looping = true;
                            while (running < limit && !done) {
                                var elem = nextElem();
                                if (elem === null) {
                                    done = true;
                                    if (running <= 0) {
                                        callback(null);
                                    }
                                    return;
                                }
                                running += 1;
                                iteratee(
                                    elem.value,
                                    elem.key,
                                    onlyOnce(iterateeCallback)
                                );
                            }
                            looping = false;
                        }

                        replenish();
                    };
                }

                /**
                 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs a maximum of `limit` async operations at a
                 * time.
                 *
                 * @name eachOfLimit
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.eachOf]{@link module:Collections.eachOf}
                 * @alias forEachOfLimit
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {number} limit - The maximum number of async operations at a time.
                 * @param {AsyncFunction} iteratee - An async function to apply to each
                 * item in `coll`. The `key` is the item's key, or index in the case of an
                 * array.
                 * Invoked with (item, key, callback).
                 * @param {Function} [callback] - A callback which is called when all
                 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
                 */
                function eachOfLimit(coll, limit, iteratee, callback) {
                    _eachOfLimit(limit)(coll, wrapAsync(iteratee), callback);
                }

                function doLimit(fn, limit) {
                    return function (iterable, iteratee, callback) {
                        return fn(iterable, limit, iteratee, callback);
                    };
                }

                // eachOf implementation optimized for array-likes
                function eachOfArrayLike(coll, iteratee, callback) {
                    callback = once(callback || noop);
                    var index = 0,
                        completed = 0,
                        length = coll.length;
                    if (length === 0) {
                        callback(null);
                    }

                    function iteratorCallback(err, value) {
                        if (err) {
                            callback(err);
                        } else if (
                            ++completed === length ||
                            value === breakLoop
                        ) {
                            callback(null);
                        }
                    }

                    for (; index < length; index++) {
                        iteratee(
                            coll[index],
                            index,
                            onlyOnce(iteratorCallback)
                        );
                    }
                }

                // a generic version of eachOf which can handle array, object, and iterator cases.
                var eachOfGeneric = doLimit(eachOfLimit, Infinity);

                /**
                 * Like [`each`]{@link module:Collections.each}, except that it passes the key (or index) as the second argument
                 * to the iteratee.
                 *
                 * @name eachOf
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @alias forEachOf
                 * @category Collection
                 * @see [async.each]{@link module:Collections.each}
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {AsyncFunction} iteratee - A function to apply to each
                 * item in `coll`.
                 * The `key` is the item's key, or index in the case of an array.
                 * Invoked with (item, key, callback).
                 * @param {Function} [callback] - A callback which is called when all
                 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
                 * @example
                 *
                 * var obj = {dev: "/dev.json", test: "/test.json", prod: "/prod.json"};
                 * var configs = {};
                 *
                 * async.forEachOf(obj, function (value, key, callback) {
                 *     fs.readFile(__dirname + value, "utf8", function (err, data) {
                 *         if (err) return callback(err);
                 *         try {
                 *             configs[key] = JSON.parse(data);
                 *         } catch (e) {
                 *             return callback(e);
                 *         }
                 *         callback();
                 *     });
                 * }, function (err) {
                 *     if (err) console.error(err.message);
                 *     // configs is now a map of JSON data
                 *     doSomethingWith(configs);
                 * });
                 */
                var eachOf = function (coll, iteratee, callback) {
                    var eachOfImplementation = isArrayLike(coll)
                        ? eachOfArrayLike
                        : eachOfGeneric;
                    eachOfImplementation(coll, wrapAsync(iteratee), callback);
                };

                function doParallel(fn) {
                    return function (obj, iteratee, callback) {
                        return fn(eachOf, obj, wrapAsync(iteratee), callback);
                    };
                }

                function _asyncMap(eachfn, arr, iteratee, callback) {
                    callback = callback || noop;
                    arr = arr || [];
                    var results = [];
                    var counter = 0;
                    var _iteratee = wrapAsync(iteratee);

                    eachfn(
                        arr,
                        function (value, _, callback) {
                            var index = counter++;
                            _iteratee(value, function (err, v) {
                                results[index] = v;
                                callback(err);
                            });
                        },
                        function (err) {
                            callback(err, results);
                        }
                    );
                }

                /**
                 * Produces a new collection of values by mapping each value in `coll` through
                 * the `iteratee` function. The `iteratee` is called with an item from `coll`
                 * and a callback for when it has finished processing. Each of these callback
                 * takes 2 arguments: an `error`, and the transformed item from `coll`. If
                 * `iteratee` passes an error to its callback, the main `callback` (for the
                 * `map` function) is immediately called with the error.
                 *
                 * Note, that since this function applies the `iteratee` to each item in
                 * parallel, there is no guarantee that the `iteratee` functions will complete
                 * in order. However, the results array will be in the same order as the
                 * original `coll`.
                 *
                 * If `map` is passed an Object, the results will be an Array.  The results
                 * will roughly be in the order of the original Objects' keys (but this can
                 * vary across JavaScript engines).
                 *
                 * @name map
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {AsyncFunction} iteratee - An async function to apply to each item in
                 * `coll`.
                 * The iteratee should complete with the transformed item.
                 * Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called when all `iteratee`
                 * functions have finished, or an error occurs. Results is an Array of the
                 * transformed items from the `coll`. Invoked with (err, results).
                 * @example
                 *
                 * async.map(['file1','file2','file3'], fs.stat, function(err, results) {
                 *     // results is now an array of stats for each file
                 * });
                 */
                var map = doParallel(_asyncMap);

                /**
                 * Applies the provided arguments to each function in the array, calling
                 * `callback` after all functions have completed. If you only provide the first
                 * argument, `fns`, then it will return a function which lets you pass in the
                 * arguments as if it were a single function call. If more arguments are
                 * provided, `callback` is required while `args` is still optional.
                 *
                 * @name applyEach
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @category Control Flow
                 * @param {Array|Iterable|Object} fns - A collection of {@link AsyncFunction}s
                 * to all call with the same arguments
                 * @param {...*} [args] - any number of separate arguments to pass to the
                 * function.
                 * @param {Function} [callback] - the final argument should be the callback,
                 * called when all functions have completed processing.
                 * @returns {Function} - If only the first argument, `fns`, is provided, it will
                 * return a function which lets you pass in the arguments as if it were a single
                 * function call. The signature is `(..args, callback)`. If invoked with any
                 * arguments, `callback` is required.
                 * @example
                 *
                 * async.applyEach([enableSearch, updateSchema], 'bucket', callback);
                 *
                 * // partial application example:
                 * async.each(
                 *     buckets,
                 *     async.applyEach([enableSearch, updateSchema]),
                 *     callback
                 * );
                 */
                var applyEach = applyEach$1(map);

                function doParallelLimit(fn) {
                    return function (obj, limit, iteratee, callback) {
                        return fn(
                            _eachOfLimit(limit),
                            obj,
                            wrapAsync(iteratee),
                            callback
                        );
                    };
                }

                /**
                 * The same as [`map`]{@link module:Collections.map} but runs a maximum of `limit` async operations at a time.
                 *
                 * @name mapLimit
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.map]{@link module:Collections.map}
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {number} limit - The maximum number of async operations at a time.
                 * @param {AsyncFunction} iteratee - An async function to apply to each item in
                 * `coll`.
                 * The iteratee should complete with the transformed item.
                 * Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called when all `iteratee`
                 * functions have finished, or an error occurs. Results is an array of the
                 * transformed items from the `coll`. Invoked with (err, results).
                 */
                var mapLimit = doParallelLimit(_asyncMap);

                /**
                 * The same as [`map`]{@link module:Collections.map} but runs only a single async operation at a time.
                 *
                 * @name mapSeries
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.map]{@link module:Collections.map}
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {AsyncFunction} iteratee - An async function to apply to each item in
                 * `coll`.
                 * The iteratee should complete with the transformed item.
                 * Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called when all `iteratee`
                 * functions have finished, or an error occurs. Results is an array of the
                 * transformed items from the `coll`. Invoked with (err, results).
                 */
                var mapSeries = doLimit(mapLimit, 1);

                /**
                 * The same as [`applyEach`]{@link module:ControlFlow.applyEach} but runs only a single async operation at a time.
                 *
                 * @name applyEachSeries
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @see [async.applyEach]{@link module:ControlFlow.applyEach}
                 * @category Control Flow
                 * @param {Array|Iterable|Object} fns - A collection of {@link AsyncFunction}s to all
                 * call with the same arguments
                 * @param {...*} [args] - any number of separate arguments to pass to the
                 * function.
                 * @param {Function} [callback] - the final argument should be the callback,
                 * called when all functions have completed processing.
                 * @returns {Function} - If only the first argument is provided, it will return
                 * a function which lets you pass in the arguments as if it were a single
                 * function call.
                 */
                var applyEachSeries = applyEach$1(mapSeries);

                /**
                 * A specialized version of `_.forEach` for arrays without support for
                 * iteratee shorthands.
                 *
                 * @private
                 * @param {Array} [array] The array to iterate over.
                 * @param {Function} iteratee The function invoked per iteration.
                 * @returns {Array} Returns `array`.
                 */
                function arrayEach(array, iteratee) {
                    var index = -1,
                        length = array == null ? 0 : array.length;

                    while (++index < length) {
                        if (iteratee(array[index], index, array) === false) {
                            break;
                        }
                    }
                    return array;
                }

                /**
                 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
                 *
                 * @private
                 * @param {boolean} [fromRight] Specify iterating from right to left.
                 * @returns {Function} Returns the new base function.
                 */
                function createBaseFor(fromRight) {
                    return function (object, iteratee, keysFunc) {
                        var index = -1,
                            iterable = Object(object),
                            props = keysFunc(object),
                            length = props.length;

                        while (length--) {
                            var key = props[fromRight ? length : ++index];
                            if (
                                iteratee(iterable[key], key, iterable) === false
                            ) {
                                break;
                            }
                        }
                        return object;
                    };
                }

                /**
                 * The base implementation of `baseForOwn` which iterates over `object`
                 * properties returned by `keysFunc` and invokes `iteratee` for each property.
                 * Iteratee functions may exit iteration early by explicitly returning `false`.
                 *
                 * @private
                 * @param {Object} object The object to iterate over.
                 * @param {Function} iteratee The function invoked per iteration.
                 * @param {Function} keysFunc The function to get the keys of `object`.
                 * @returns {Object} Returns `object`.
                 */
                var baseFor = createBaseFor();

                /**
                 * The base implementation of `_.forOwn` without support for iteratee shorthands.
                 *
                 * @private
                 * @param {Object} object The object to iterate over.
                 * @param {Function} iteratee The function invoked per iteration.
                 * @returns {Object} Returns `object`.
                 */
                function baseForOwn(object, iteratee) {
                    return object && baseFor(object, iteratee, keys);
                }

                /**
                 * The base implementation of `_.findIndex` and `_.findLastIndex` without
                 * support for iteratee shorthands.
                 *
                 * @private
                 * @param {Array} array The array to inspect.
                 * @param {Function} predicate The function invoked per iteration.
                 * @param {number} fromIndex The index to search from.
                 * @param {boolean} [fromRight] Specify iterating from right to left.
                 * @returns {number} Returns the index of the matched value, else `-1`.
                 */
                function baseFindIndex(array, predicate, fromIndex, fromRight) {
                    var length = array.length,
                        index = fromIndex + (fromRight ? 1 : -1);

                    while (fromRight ? index-- : ++index < length) {
                        if (predicate(array[index], index, array)) {
                            return index;
                        }
                    }
                    return -1;
                }

                /**
                 * The base implementation of `_.isNaN` without support for number objects.
                 *
                 * @private
                 * @param {*} value The value to check.
                 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
                 */
                function baseIsNaN(value) {
                    return value !== value;
                }

                /**
                 * A specialized version of `_.indexOf` which performs strict equality
                 * comparisons of values, i.e. `===`.
                 *
                 * @private
                 * @param {Array} array The array to inspect.
                 * @param {*} value The value to search for.
                 * @param {number} fromIndex The index to search from.
                 * @returns {number} Returns the index of the matched value, else `-1`.
                 */
                function strictIndexOf(array, value, fromIndex) {
                    var index = fromIndex - 1,
                        length = array.length;

                    while (++index < length) {
                        if (array[index] === value) {
                            return index;
                        }
                    }
                    return -1;
                }

                /**
                 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
                 *
                 * @private
                 * @param {Array} array The array to inspect.
                 * @param {*} value The value to search for.
                 * @param {number} fromIndex The index to search from.
                 * @returns {number} Returns the index of the matched value, else `-1`.
                 */
                function baseIndexOf(array, value, fromIndex) {
                    return value === value
                        ? strictIndexOf(array, value, fromIndex)
                        : baseFindIndex(array, baseIsNaN, fromIndex);
                }

                /**
                 * Determines the best order for running the {@link AsyncFunction}s in `tasks`, based on
                 * their requirements. Each function can optionally depend on other functions
                 * being completed first, and each function is run as soon as its requirements
                 * are satisfied.
                 *
                 * If any of the {@link AsyncFunction}s pass an error to their callback, the `auto` sequence
                 * will stop. Further tasks will not execute (so any other functions depending
                 * on it will not run), and the main `callback` is immediately called with the
                 * error.
                 *
                 * {@link AsyncFunction}s also receive an object containing the results of functions which
                 * have completed so far as the first argument, if they have dependencies. If a
                 * task function has no dependencies, it will only be passed a callback.
                 *
                 * @name auto
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @category Control Flow
                 * @param {Object} tasks - An object. Each of its properties is either a
                 * function or an array of requirements, with the {@link AsyncFunction} itself the last item
                 * in the array. The object's key of a property serves as the name of the task
                 * defined by that property, i.e. can be used when specifying requirements for
                 * other tasks. The function receives one or two arguments:
                 * * a `results` object, containing the results of the previously executed
                 *   functions, only passed if the task has any dependencies,
                 * * a `callback(err, result)` function, which must be called when finished,
                 *   passing an `error` (which can be `null`) and the result of the function's
                 *   execution.
                 * @param {number} [concurrency=Infinity] - An optional `integer` for
                 * determining the maximum number of tasks that can be run in parallel. By
                 * default, as many as possible.
                 * @param {Function} [callback] - An optional callback which is called when all
                 * the tasks have been completed. It receives the `err` argument if any `tasks`
                 * pass an error to their callback. Results are always returned; however, if an
                 * error occurs, no further `tasks` will be performed, and the results object
                 * will only contain partial results. Invoked with (err, results).
                 * @returns undefined
                 * @example
                 *
                 * async.auto({
                 *     // this function will just be passed a callback
                 *     readData: async.apply(fs.readFile, 'data.txt', 'utf-8'),
                 *     showData: ['readData', function(results, cb) {
                 *         // results.readData is the file's contents
                 *         // ...
                 *     }]
                 * }, callback);
                 *
                 * async.auto({
                 *     get_data: function(callback) {
                 *         console.log('in get_data');
                 *         // async code to get some data
                 *         callback(null, 'data', 'converted to array');
                 *     },
                 *     make_folder: function(callback) {
                 *         console.log('in make_folder');
                 *         // async code to create a directory to store a file in
                 *         // this is run at the same time as getting the data
                 *         callback(null, 'folder');
                 *     },
                 *     write_file: ['get_data', 'make_folder', function(results, callback) {
                 *         console.log('in write_file', JSON.stringify(results));
                 *         // once there is some data and the directory exists,
                 *         // write the data to a file in the directory
                 *         callback(null, 'filename');
                 *     }],
                 *     email_link: ['write_file', function(results, callback) {
                 *         console.log('in email_link', JSON.stringify(results));
                 *         // once the file is written let's email a link to it...
                 *         // results.write_file contains the filename returned by write_file.
                 *         callback(null, {'file':results.write_file, 'email':'user@example.com'});
                 *     }]
                 * }, function(err, results) {
                 *     console.log('err = ', err);
                 *     console.log('results = ', results);
                 * });
                 */
                var auto = function (tasks, concurrency, callback) {
                    if (typeof concurrency === "function") {
                        // concurrency is optional, shift the args.
                        callback = concurrency;
                        concurrency = null;
                    }
                    callback = once(callback || noop);
                    var keys$$1 = keys(tasks);
                    var numTasks = keys$$1.length;
                    if (!numTasks) {
                        return callback(null);
                    }
                    if (!concurrency) {
                        concurrency = numTasks;
                    }

                    var results = {};
                    var runningTasks = 0;
                    var hasError = false;

                    var listeners = Object.create(null);

                    var readyTasks = [];

                    // for cycle detection:
                    var readyToCheck = []; // tasks that have been identified as reachable
                    // without the possibility of returning to an ancestor task
                    var uncheckedDependencies = {};

                    baseForOwn(tasks, function (task, key) {
                        if (!isArray(task)) {
                            // no dependencies
                            enqueueTask(key, [task]);
                            readyToCheck.push(key);
                            return;
                        }

                        var dependencies = task.slice(0, task.length - 1);
                        var remainingDependencies = dependencies.length;
                        if (remainingDependencies === 0) {
                            enqueueTask(key, task);
                            readyToCheck.push(key);
                            return;
                        }
                        uncheckedDependencies[key] = remainingDependencies;

                        arrayEach(dependencies, function (dependencyName) {
                            if (!tasks[dependencyName]) {
                                throw new Error(
                                    "async.auto task `" +
                                        key +
                                        "` has a non-existent dependency `" +
                                        dependencyName +
                                        "` in " +
                                        dependencies.join(", ")
                                );
                            }
                            addListener(dependencyName, function () {
                                remainingDependencies--;
                                if (remainingDependencies === 0) {
                                    enqueueTask(key, task);
                                }
                            });
                        });
                    });

                    checkForDeadlocks();
                    processQueue();

                    function enqueueTask(key, task) {
                        readyTasks.push(function () {
                            runTask(key, task);
                        });
                    }

                    function processQueue() {
                        if (readyTasks.length === 0 && runningTasks === 0) {
                            return callback(null, results);
                        }
                        while (
                            readyTasks.length &&
                            runningTasks < concurrency
                        ) {
                            var run = readyTasks.shift();
                            run();
                        }
                    }

                    function addListener(taskName, fn) {
                        var taskListeners = listeners[taskName];
                        if (!taskListeners) {
                            taskListeners = listeners[taskName] = [];
                        }

                        taskListeners.push(fn);
                    }

                    function taskComplete(taskName) {
                        var taskListeners = listeners[taskName] || [];
                        arrayEach(taskListeners, function (fn) {
                            fn();
                        });
                        processQueue();
                    }

                    function runTask(key, task) {
                        if (hasError) return;

                        var taskCallback = onlyOnce(function (err, result) {
                            runningTasks--;
                            if (arguments.length > 2) {
                                result = slice(arguments, 1);
                            }
                            if (err) {
                                var safeResults = {};
                                baseForOwn(results, function (val, rkey) {
                                    safeResults[rkey] = val;
                                });
                                safeResults[key] = result;
                                hasError = true;
                                listeners = Object.create(null);

                                callback(err, safeResults);
                            } else {
                                results[key] = result;
                                taskComplete(key);
                            }
                        });

                        runningTasks++;
                        var taskFn = wrapAsync(task[task.length - 1]);
                        if (task.length > 1) {
                            taskFn(results, taskCallback);
                        } else {
                            taskFn(taskCallback);
                        }
                    }

                    function checkForDeadlocks() {
                        // Kahn's algorithm
                        // https://en.wikipedia.org/wiki/Topological_sorting#Kahn.27s_algorithm
                        // http://connalle.blogspot.com/2013/10/topological-sortingkahn-algorithm.html
                        var currentTask;
                        var counter = 0;
                        while (readyToCheck.length) {
                            currentTask = readyToCheck.pop();
                            counter++;
                            arrayEach(
                                getDependents(currentTask),
                                function (dependent) {
                                    if (
                                        --uncheckedDependencies[dependent] === 0
                                    ) {
                                        readyToCheck.push(dependent);
                                    }
                                }
                            );
                        }

                        if (counter !== numTasks) {
                            throw new Error(
                                "async.auto cannot execute tasks due to a recursive dependency"
                            );
                        }
                    }

                    function getDependents(taskName) {
                        var result = [];
                        baseForOwn(tasks, function (task, key) {
                            if (
                                isArray(task) &&
                                baseIndexOf(task, taskName, 0) >= 0
                            ) {
                                result.push(key);
                            }
                        });
                        return result;
                    }
                };

                /**
                 * A specialized version of `_.map` for arrays without support for iteratee
                 * shorthands.
                 *
                 * @private
                 * @param {Array} [array] The array to iterate over.
                 * @param {Function} iteratee The function invoked per iteration.
                 * @returns {Array} Returns the new mapped array.
                 */
                function arrayMap(array, iteratee) {
                    var index = -1,
                        length = array == null ? 0 : array.length,
                        result = Array(length);

                    while (++index < length) {
                        result[index] = iteratee(array[index], index, array);
                    }
                    return result;
                }

                /** `Object#toString` result references. */
                var symbolTag = "[object Symbol]";

                /**
                 * Checks if `value` is classified as a `Symbol` primitive or object.
                 *
                 * @static
                 * @memberOf _
                 * @since 4.0.0
                 * @category Lang
                 * @param {*} value The value to check.
                 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
                 * @example
                 *
                 * _.isSymbol(Symbol.iterator);
                 * // => true
                 *
                 * _.isSymbol('abc');
                 * // => false
                 */
                function isSymbol(value) {
                    return (
                        typeof value == "symbol" ||
                        (isObjectLike(value) && baseGetTag(value) == symbolTag)
                    );
                }

                /** Used as references for various `Number` constants. */
                var INFINITY = 1 / 0;

                /** Used to convert symbols to primitives and strings. */
                var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined;
                var symbolToString = symbolProto
                    ? symbolProto.toString
                    : undefined;

                /**
                 * The base implementation of `_.toString` which doesn't convert nullish
                 * values to empty strings.
                 *
                 * @private
                 * @param {*} value The value to process.
                 * @returns {string} Returns the string.
                 */
                function baseToString(value) {
                    // Exit early for strings to avoid a performance hit in some environments.
                    if (typeof value == "string") {
                        return value;
                    }
                    if (isArray(value)) {
                        // Recursively convert values (susceptible to call stack limits).
                        return arrayMap(value, baseToString) + "";
                    }
                    if (isSymbol(value)) {
                        return symbolToString ? symbolToString.call(value) : "";
                    }
                    var result = value + "";
                    return result == "0" && 1 / value == -INFINITY
                        ? "-0"
                        : result;
                }

                /**
                 * The base implementation of `_.slice` without an iteratee call guard.
                 *
                 * @private
                 * @param {Array} array The array to slice.
                 * @param {number} [start=0] The start position.
                 * @param {number} [end=array.length] The end position.
                 * @returns {Array} Returns the slice of `array`.
                 */
                function baseSlice(array, start, end) {
                    var index = -1,
                        length = array.length;

                    if (start < 0) {
                        start = -start > length ? 0 : length + start;
                    }
                    end = end > length ? length : end;
                    if (end < 0) {
                        end += length;
                    }
                    length = start > end ? 0 : (end - start) >>> 0;
                    start >>>= 0;

                    var result = Array(length);
                    while (++index < length) {
                        result[index] = array[index + start];
                    }
                    return result;
                }

                /**
                 * Casts `array` to a slice if it's needed.
                 *
                 * @private
                 * @param {Array} array The array to inspect.
                 * @param {number} start The start position.
                 * @param {number} [end=array.length] The end position.
                 * @returns {Array} Returns the cast slice.
                 */
                function castSlice(array, start, end) {
                    var length = array.length;
                    end = end === undefined ? length : end;
                    return !start && end >= length
                        ? array
                        : baseSlice(array, start, end);
                }

                /**
                 * Used by `_.trim` and `_.trimEnd` to get the index of the last string symbol
                 * that is not found in the character symbols.
                 *
                 * @private
                 * @param {Array} strSymbols The string symbols to inspect.
                 * @param {Array} chrSymbols The character symbols to find.
                 * @returns {number} Returns the index of the last unmatched string symbol.
                 */
                function charsEndIndex(strSymbols, chrSymbols) {
                    var index = strSymbols.length;

                    while (
                        index-- &&
                        baseIndexOf(chrSymbols, strSymbols[index], 0) > -1
                    ) {}
                    return index;
                }

                /**
                 * Used by `_.trim` and `_.trimStart` to get the index of the first string symbol
                 * that is not found in the character symbols.
                 *
                 * @private
                 * @param {Array} strSymbols The string symbols to inspect.
                 * @param {Array} chrSymbols The character symbols to find.
                 * @returns {number} Returns the index of the first unmatched string symbol.
                 */
                function charsStartIndex(strSymbols, chrSymbols) {
                    var index = -1,
                        length = strSymbols.length;

                    while (
                        ++index < length &&
                        baseIndexOf(chrSymbols, strSymbols[index], 0) > -1
                    ) {}
                    return index;
                }

                /**
                 * Converts an ASCII `string` to an array.
                 *
                 * @private
                 * @param {string} string The string to convert.
                 * @returns {Array} Returns the converted array.
                 */
                function asciiToArray(string) {
                    return string.split("");
                }

                /** Used to compose unicode character classes. */
                var rsAstralRange = "\\ud800-\\udfff";
                var rsComboMarksRange = "\\u0300-\\u036f";
                var reComboHalfMarksRange = "\\ufe20-\\ufe2f";
                var rsComboSymbolsRange = "\\u20d0-\\u20ff";
                var rsComboRange =
                    rsComboMarksRange +
                    reComboHalfMarksRange +
                    rsComboSymbolsRange;
                var rsVarRange = "\\ufe0e\\ufe0f";

                /** Used to compose unicode capture groups. */
                var rsZWJ = "\\u200d";

                /** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
                var reHasUnicode = RegExp(
                    "[" +
                        rsZWJ +
                        rsAstralRange +
                        rsComboRange +
                        rsVarRange +
                        "]"
                );

                /**
                 * Checks if `string` contains Unicode symbols.
                 *
                 * @private
                 * @param {string} string The string to inspect.
                 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
                 */
                function hasUnicode(string) {
                    return reHasUnicode.test(string);
                }

                /** Used to compose unicode character classes. */
                var rsAstralRange$1 = "\\ud800-\\udfff";
                var rsComboMarksRange$1 = "\\u0300-\\u036f";
                var reComboHalfMarksRange$1 = "\\ufe20-\\ufe2f";
                var rsComboSymbolsRange$1 = "\\u20d0-\\u20ff";
                var rsComboRange$1 =
                    rsComboMarksRange$1 +
                    reComboHalfMarksRange$1 +
                    rsComboSymbolsRange$1;
                var rsVarRange$1 = "\\ufe0e\\ufe0f";

                /** Used to compose unicode capture groups. */
                var rsAstral = "[" + rsAstralRange$1 + "]";
                var rsCombo = "[" + rsComboRange$1 + "]";
                var rsFitz = "\\ud83c[\\udffb-\\udfff]";
                var rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")";
                var rsNonAstral = "[^" + rsAstralRange$1 + "]";
                var rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}";
                var rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
                var rsZWJ$1 = "\\u200d";

                /** Used to compose unicode regexes. */
                var reOptMod = rsModifier + "?";
                var rsOptVar = "[" + rsVarRange$1 + "]?";
                var rsOptJoin =
                    "(?:" +
                    rsZWJ$1 +
                    "(?:" +
                    [rsNonAstral, rsRegional, rsSurrPair].join("|") +
                    ")" +
                    rsOptVar +
                    reOptMod +
                    ")*";
                var rsSeq = rsOptVar + reOptMod + rsOptJoin;
                var rsSymbol =
                    "(?:" +
                    [
                        rsNonAstral + rsCombo + "?",
                        rsCombo,
                        rsRegional,
                        rsSurrPair,
                        rsAstral,
                    ].join("|") +
                    ")";

                /** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
                var reUnicode = RegExp(
                    rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq,
                    "g"
                );

                /**
                 * Converts a Unicode `string` to an array.
                 *
                 * @private
                 * @param {string} string The string to convert.
                 * @returns {Array} Returns the converted array.
                 */
                function unicodeToArray(string) {
                    return string.match(reUnicode) || [];
                }

                /**
                 * Converts `string` to an array.
                 *
                 * @private
                 * @param {string} string The string to convert.
                 * @returns {Array} Returns the converted array.
                 */
                function stringToArray(string) {
                    return hasUnicode(string)
                        ? unicodeToArray(string)
                        : asciiToArray(string);
                }

                /**
                 * Converts `value` to a string. An empty string is returned for `null`
                 * and `undefined` values. The sign of `-0` is preserved.
                 *
                 * @static
                 * @memberOf _
                 * @since 4.0.0
                 * @category Lang
                 * @param {*} value The value to convert.
                 * @returns {string} Returns the converted string.
                 * @example
                 *
                 * _.toString(null);
                 * // => ''
                 *
                 * _.toString(-0);
                 * // => '-0'
                 *
                 * _.toString([1, 2, 3]);
                 * // => '1,2,3'
                 */
                function toString(value) {
                    return value == null ? "" : baseToString(value);
                }

                /** Used to match leading and trailing whitespace. */
                var reTrim = /^\s+|\s+$/g;

                /**
                 * Removes leading and trailing whitespace or specified characters from `string`.
                 *
                 * @static
                 * @memberOf _
                 * @since 3.0.0
                 * @category String
                 * @param {string} [string=''] The string to trim.
                 * @param {string} [chars=whitespace] The characters to trim.
                 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
                 * @returns {string} Returns the trimmed string.
                 * @example
                 *
                 * _.trim('  abc  ');
                 * // => 'abc'
                 *
                 * _.trim('-_-abc-_-', '_-');
                 * // => 'abc'
                 *
                 * _.map(['  foo  ', '  bar  '], _.trim);
                 * // => ['foo', 'bar']
                 */
                function trim(string, chars, guard) {
                    string = toString(string);
                    if (string && (guard || chars === undefined)) {
                        return string.replace(reTrim, "");
                    }
                    if (!string || !(chars = baseToString(chars))) {
                        return string;
                    }
                    var strSymbols = stringToArray(string),
                        chrSymbols = stringToArray(chars),
                        start = charsStartIndex(strSymbols, chrSymbols),
                        end = charsEndIndex(strSymbols, chrSymbols) + 1;

                    return castSlice(strSymbols, start, end).join("");
                }

                var FN_ARGS =
                    /^(?:async\s+)?(function)?\s*[^\(]*\(\s*([^\)]*)\)/m;
                var FN_ARG_SPLIT = /,/;
                var FN_ARG = /(=.+)?(\s*)$/;
                var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;

                function parseParams(func) {
                    func = func.toString().replace(STRIP_COMMENTS, "");
                    func = func.match(FN_ARGS)[2].replace(" ", "");
                    func = func ? func.split(FN_ARG_SPLIT) : [];
                    func = func.map(function (arg) {
                        return trim(arg.replace(FN_ARG, ""));
                    });
                    return func;
                }

                /**
                 * A dependency-injected version of the [async.auto]{@link module:ControlFlow.auto} function. Dependent
                 * tasks are specified as parameters to the function, after the usual callback
                 * parameter, with the parameter names matching the names of the tasks it
                 * depends on. This can provide even more readable task graphs which can be
                 * easier to maintain.
                 *
                 * If a final callback is specified, the task results are similarly injected,
                 * specified as named parameters after the initial error parameter.
                 *
                 * The autoInject function is purely syntactic sugar and its semantics are
                 * otherwise equivalent to [async.auto]{@link module:ControlFlow.auto}.
                 *
                 * @name autoInject
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @see [async.auto]{@link module:ControlFlow.auto}
                 * @category Control Flow
                 * @param {Object} tasks - An object, each of whose properties is an {@link AsyncFunction} of
                 * the form 'func([dependencies...], callback). The object's key of a property
                 * serves as the name of the task defined by that property, i.e. can be used
                 * when specifying requirements for other tasks.
                 * * The `callback` parameter is a `callback(err, result)` which must be called
                 *   when finished, passing an `error` (which can be `null`) and the result of
                 *   the function's execution. The remaining parameters name other tasks on
                 *   which the task is dependent, and the results from those tasks are the
                 *   arguments of those parameters.
                 * @param {Function} [callback] - An optional callback which is called when all
                 * the tasks have been completed. It receives the `err` argument if any `tasks`
                 * pass an error to their callback, and a `results` object with any completed
                 * task results, similar to `auto`.
                 * @example
                 *
                 * //  The example from `auto` can be rewritten as follows:
                 * async.autoInject({
                 *     get_data: function(callback) {
                 *         // async code to get some data
                 *         callback(null, 'data', 'converted to array');
                 *     },
                 *     make_folder: function(callback) {
                 *         // async code to create a directory to store a file in
                 *         // this is run at the same time as getting the data
                 *         callback(null, 'folder');
                 *     },
                 *     write_file: function(get_data, make_folder, callback) {
                 *         // once there is some data and the directory exists,
                 *         // write the data to a file in the directory
                 *         callback(null, 'filename');
                 *     },
                 *     email_link: function(write_file, callback) {
                 *         // once the file is written let's email a link to it...
                 *         // write_file contains the filename returned by write_file.
                 *         callback(null, {'file':write_file, 'email':'user@example.com'});
                 *     }
                 * }, function(err, results) {
                 *     console.log('err = ', err);
                 *     console.log('email_link = ', results.email_link);
                 * });
                 *
                 * // If you are using a JS minifier that mangles parameter names, `autoInject`
                 * // will not work with plain functions, since the parameter names will be
                 * // collapsed to a single letter identifier.  To work around this, you can
                 * // explicitly specify the names of the parameters your task function needs
                 * // in an array, similar to Angular.js dependency injection.
                 *
                 * // This still has an advantage over plain `auto`, since the results a task
                 * // depends on are still spread into arguments.
                 * async.autoInject({
                 *     //...
                 *     write_file: ['get_data', 'make_folder', function(get_data, make_folder, callback) {
                 *         callback(null, 'filename');
                 *     }],
                 *     email_link: ['write_file', function(write_file, callback) {
                 *         callback(null, {'file':write_file, 'email':'user@example.com'});
                 *     }]
                 *     //...
                 * }, function(err, results) {
                 *     console.log('err = ', err);
                 *     console.log('email_link = ', results.email_link);
                 * });
                 */
                function autoInject(tasks, callback) {
                    var newTasks = {};

                    baseForOwn(tasks, function (taskFn, key) {
                        var params;
                        var fnIsAsync = isAsync(taskFn);
                        var hasNoDeps =
                            (!fnIsAsync && taskFn.length === 1) ||
                            (fnIsAsync && taskFn.length === 0);

                        if (isArray(taskFn)) {
                            params = taskFn.slice(0, -1);
                            taskFn = taskFn[taskFn.length - 1];

                            newTasks[key] = params.concat(
                                params.length > 0 ? newTask : taskFn
                            );
                        } else if (hasNoDeps) {
                            // no dependencies, use the function as-is
                            newTasks[key] = taskFn;
                        } else {
                            params = parseParams(taskFn);
                            if (
                                taskFn.length === 0 &&
                                !fnIsAsync &&
                                params.length === 0
                            ) {
                                throw new Error(
                                    "autoInject task functions require explicit parameters."
                                );
                            }

                            // remove callback param
                            if (!fnIsAsync) params.pop();

                            newTasks[key] = params.concat(newTask);
                        }

                        function newTask(results, taskCb) {
                            var newArgs = arrayMap(params, function (name) {
                                return results[name];
                            });
                            newArgs.push(taskCb);
                            wrapAsync(taskFn).apply(null, newArgs);
                        }
                    });

                    auto(newTasks, callback);
                }

                // Simple doubly linked list (https://en.wikipedia.org/wiki/Doubly_linked_list) implementation
                // used for queues. This implementation assumes that the node provided by the user can be modified
                // to adjust the next and last properties. We implement only the minimal functionality
                // for queue support.
                function DLL() {
                    this.head = this.tail = null;
                    this.length = 0;
                }

                function setInitial(dll, node) {
                    dll.length = 1;
                    dll.head = dll.tail = node;
                }

                DLL.prototype.removeLink = function (node) {
                    if (node.prev) node.prev.next = node.next;
                    else this.head = node.next;
                    if (node.next) node.next.prev = node.prev;
                    else this.tail = node.prev;

                    node.prev = node.next = null;
                    this.length -= 1;
                    return node;
                };

                DLL.prototype.empty = function () {
                    while (this.head) this.shift();
                    return this;
                };

                DLL.prototype.insertAfter = function (node, newNode) {
                    newNode.prev = node;
                    newNode.next = node.next;
                    if (node.next) node.next.prev = newNode;
                    else this.tail = newNode;
                    node.next = newNode;
                    this.length += 1;
                };

                DLL.prototype.insertBefore = function (node, newNode) {
                    newNode.prev = node.prev;
                    newNode.next = node;
                    if (node.prev) node.prev.next = newNode;
                    else this.head = newNode;
                    node.prev = newNode;
                    this.length += 1;
                };

                DLL.prototype.unshift = function (node) {
                    if (this.head) this.insertBefore(this.head, node);
                    else setInitial(this, node);
                };

                DLL.prototype.push = function (node) {
                    if (this.tail) this.insertAfter(this.tail, node);
                    else setInitial(this, node);
                };

                DLL.prototype.shift = function () {
                    return this.head && this.removeLink(this.head);
                };

                DLL.prototype.pop = function () {
                    return this.tail && this.removeLink(this.tail);
                };

                DLL.prototype.toArray = function () {
                    var arr = Array(this.length);
                    var curr = this.head;
                    for (var idx = 0; idx < this.length; idx++) {
                        arr[idx] = curr.data;
                        curr = curr.next;
                    }
                    return arr;
                };

                DLL.prototype.remove = function (testFn) {
                    var curr = this.head;
                    while (!!curr) {
                        var next = curr.next;
                        if (testFn(curr)) {
                            this.removeLink(curr);
                        }
                        curr = next;
                    }
                    return this;
                };

                function queue(worker, concurrency, payload) {
                    if (concurrency == null) {
                        concurrency = 1;
                    } else if (concurrency === 0) {
                        throw new Error("Concurrency must not be zero");
                    }

                    var _worker = wrapAsync(worker);
                    var numRunning = 0;
                    var workersList = [];

                    var processingScheduled = false;
                    function _insert(data, insertAtFront, callback) {
                        if (
                            callback != null &&
                            typeof callback !== "function"
                        ) {
                            throw new Error("task callback must be a function");
                        }
                        q.started = true;
                        if (!isArray(data)) {
                            data = [data];
                        }
                        if (data.length === 0 && q.idle()) {
                            // call drain immediately if there are no tasks
                            return setImmediate$1(function () {
                                q.drain();
                            });
                        }

                        for (var i = 0, l = data.length; i < l; i++) {
                            var item = {
                                data: data[i],
                                callback: callback || noop,
                            };

                            if (insertAtFront) {
                                q._tasks.unshift(item);
                            } else {
                                q._tasks.push(item);
                            }
                        }

                        if (!processingScheduled) {
                            processingScheduled = true;
                            setImmediate$1(function () {
                                processingScheduled = false;
                                q.process();
                            });
                        }
                    }

                    function _next(tasks) {
                        return function (err) {
                            numRunning -= 1;

                            for (var i = 0, l = tasks.length; i < l; i++) {
                                var task = tasks[i];

                                var index = baseIndexOf(workersList, task, 0);
                                if (index === 0) {
                                    workersList.shift();
                                } else if (index > 0) {
                                    workersList.splice(index, 1);
                                }

                                task.callback.apply(task, arguments);

                                if (err != null) {
                                    q.error(err, task.data);
                                }
                            }

                            if (numRunning <= q.concurrency - q.buffer) {
                                q.unsaturated();
                            }

                            if (q.idle()) {
                                q.drain();
                            }
                            q.process();
                        };
                    }

                    var isProcessing = false;
                    var q = {
                        _tasks: new DLL(),
                        concurrency: concurrency,
                        payload: payload,
                        saturated: noop,
                        unsaturated: noop,
                        buffer: concurrency / 4,
                        empty: noop,
                        drain: noop,
                        error: noop,
                        started: false,
                        paused: false,
                        push: function (data, callback) {
                            _insert(data, false, callback);
                        },
                        kill: function () {
                            q.drain = noop;
                            q._tasks.empty();
                        },
                        unshift: function (data, callback) {
                            _insert(data, true, callback);
                        },
                        remove: function (testFn) {
                            q._tasks.remove(testFn);
                        },
                        process: function () {
                            // Avoid trying to start too many processing operations. This can occur
                            // when callbacks resolve synchronously (#1267).
                            if (isProcessing) {
                                return;
                            }
                            isProcessing = true;
                            while (
                                !q.paused &&
                                numRunning < q.concurrency &&
                                q._tasks.length
                            ) {
                                var tasks = [],
                                    data = [];
                                var l = q._tasks.length;
                                if (q.payload) l = Math.min(l, q.payload);
                                for (var i = 0; i < l; i++) {
                                    var node = q._tasks.shift();
                                    tasks.push(node);
                                    workersList.push(node);
                                    data.push(node.data);
                                }

                                numRunning += 1;

                                if (q._tasks.length === 0) {
                                    q.empty();
                                }

                                if (numRunning === q.concurrency) {
                                    q.saturated();
                                }

                                var cb = onlyOnce(_next(tasks));
                                _worker(data, cb);
                            }
                            isProcessing = false;
                        },
                        length: function () {
                            return q._tasks.length;
                        },
                        running: function () {
                            return numRunning;
                        },
                        workersList: function () {
                            return workersList;
                        },
                        idle: function () {
                            return q._tasks.length + numRunning === 0;
                        },
                        pause: function () {
                            q.paused = true;
                        },
                        resume: function () {
                            if (q.paused === false) {
                                return;
                            }
                            q.paused = false;
                            setImmediate$1(q.process);
                        },
                    };
                    return q;
                }

                /**
                 * A cargo of tasks for the worker function to complete. Cargo inherits all of
                 * the same methods and event callbacks as [`queue`]{@link module:ControlFlow.queue}.
                 * @typedef {Object} CargoObject
                 * @memberOf module:ControlFlow
                 * @property {Function} length - A function returning the number of items
                 * waiting to be processed. Invoke like `cargo.length()`.
                 * @property {number} payload - An `integer` for determining how many tasks
                 * should be process per round. This property can be changed after a `cargo` is
                 * created to alter the payload on-the-fly.
                 * @property {Function} push - Adds `task` to the `queue`. The callback is
                 * called once the `worker` has finished processing the task. Instead of a
                 * single task, an array of `tasks` can be submitted. The respective callback is
                 * used for every task in the list. Invoke like `cargo.push(task, [callback])`.
                 * @property {Function} saturated - A callback that is called when the
                 * `queue.length()` hits the concurrency and further tasks will be queued.
                 * @property {Function} empty - A callback that is called when the last item
                 * from the `queue` is given to a `worker`.
                 * @property {Function} drain - A callback that is called when the last item
                 * from the `queue` has returned from the `worker`.
                 * @property {Function} idle - a function returning false if there are items
                 * waiting or being processed, or true if not. Invoke like `cargo.idle()`.
                 * @property {Function} pause - a function that pauses the processing of tasks
                 * until `resume()` is called. Invoke like `cargo.pause()`.
                 * @property {Function} resume - a function that resumes the processing of
                 * queued tasks when the queue is paused. Invoke like `cargo.resume()`.
                 * @property {Function} kill - a function that removes the `drain` callback and
                 * empties remaining tasks from the queue forcing it to go idle. Invoke like `cargo.kill()`.
                 */

                /**
                 * Creates a `cargo` object with the specified payload. Tasks added to the
                 * cargo will be processed altogether (up to the `payload` limit). If the
                 * `worker` is in progress, the task is queued until it becomes available. Once
                 * the `worker` has completed some tasks, each callback of those tasks is
                 * called. Check out [these](https://camo.githubusercontent.com/6bbd36f4cf5b35a0f11a96dcd2e97711ffc2fb37/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130382f62626330636662302d356632392d313165322d393734662d3333393763363464633835382e676966) [animations](https://camo.githubusercontent.com/f4810e00e1c5f5f8addbe3e9f49064fd5d102699/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130312f38346339323036362d356632392d313165322d383134662d3964336430323431336266642e676966)
                 * for how `cargo` and `queue` work.
                 *
                 * While [`queue`]{@link module:ControlFlow.queue} passes only one task to one of a group of workers
                 * at a time, cargo passes an array of tasks to a single worker, repeating
                 * when the worker is finished.
                 *
                 * @name cargo
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @see [async.queue]{@link module:ControlFlow.queue}
                 * @category Control Flow
                 * @param {AsyncFunction} worker - An asynchronous function for processing an array
                 * of queued tasks. Invoked with `(tasks, callback)`.
                 * @param {number} [payload=Infinity] - An optional `integer` for determining
                 * how many tasks should be processed per round; if omitted, the default is
                 * unlimited.
                 * @returns {module:ControlFlow.CargoObject} A cargo object to manage the tasks. Callbacks can
                 * attached as certain properties to listen for specific events during the
                 * lifecycle of the cargo and inner queue.
                 * @example
                 *
                 * // create a cargo object with payload 2
                 * var cargo = async.cargo(function(tasks, callback) {
                 *     for (var i=0; i<tasks.length; i++) {
                 *         console.log('hello ' + tasks[i].name);
                 *     }
                 *     callback();
                 * }, 2);
                 *
                 * // add some items
                 * cargo.push({name: 'foo'}, function(err) {
                 *     console.log('finished processing foo');
                 * });
                 * cargo.push({name: 'bar'}, function(err) {
                 *     console.log('finished processing bar');
                 * });
                 * cargo.push({name: 'baz'}, function(err) {
                 *     console.log('finished processing baz');
                 * });
                 */
                function cargo(worker, payload) {
                    return queue(worker, 1, payload);
                }

                /**
                 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs only a single async operation at a time.
                 *
                 * @name eachOfSeries
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.eachOf]{@link module:Collections.eachOf}
                 * @alias forEachOfSeries
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {AsyncFunction} iteratee - An async function to apply to each item in
                 * `coll`.
                 * Invoked with (item, key, callback).
                 * @param {Function} [callback] - A callback which is called when all `iteratee`
                 * functions have finished, or an error occurs. Invoked with (err).
                 */
                var eachOfSeries = doLimit(eachOfLimit, 1);

                /**
                 * Reduces `coll` into a single value using an async `iteratee` to return each
                 * successive step. `memo` is the initial state of the reduction. This function
                 * only operates in series.
                 *
                 * For performance reasons, it may make sense to split a call to this function
                 * into a parallel map, and then use the normal `Array.prototype.reduce` on the
                 * results. This function is for situations where each step in the reduction
                 * needs to be async; if you can get the data before reducing it, then it's
                 * probably a good idea to do so.
                 *
                 * @name reduce
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @alias inject
                 * @alias foldl
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {*} memo - The initial state of the reduction.
                 * @param {AsyncFunction} iteratee - A function applied to each item in the
                 * array to produce the next step in the reduction.
                 * The `iteratee` should complete with the next state of the reduction.
                 * If the iteratee complete with an error, the reduction is stopped and the
                 * main `callback` is immediately called with the error.
                 * Invoked with (memo, item, callback).
                 * @param {Function} [callback] - A callback which is called after all the
                 * `iteratee` functions have finished. Result is the reduced value. Invoked with
                 * (err, result).
                 * @example
                 *
                 * async.reduce([1,2,3], 0, function(memo, item, callback) {
                 *     // pointless async:
                 *     process.nextTick(function() {
                 *         callback(null, memo + item)
                 *     });
                 * }, function(err, result) {
                 *     // result is now equal to the last value of memo, which is 6
                 * });
                 */
                function reduce(coll, memo, iteratee, callback) {
                    callback = once(callback || noop);
                    var _iteratee = wrapAsync(iteratee);
                    eachOfSeries(
                        coll,
                        function (x, i, callback) {
                            _iteratee(memo, x, function (err, v) {
                                memo = v;
                                callback(err);
                            });
                        },
                        function (err) {
                            callback(err, memo);
                        }
                    );
                }

                /**
                 * Version of the compose function that is more natural to read. Each function
                 * consumes the return value of the previous function. It is the equivalent of
                 * [compose]{@link module:ControlFlow.compose} with the arguments reversed.
                 *
                 * Each function is executed with the `this` binding of the composed function.
                 *
                 * @name seq
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @see [async.compose]{@link module:ControlFlow.compose}
                 * @category Control Flow
                 * @param {...AsyncFunction} functions - the asynchronous functions to compose
                 * @returns {Function} a function that composes the `functions` in order
                 * @example
                 *
                 * // Requires lodash (or underscore), express3 and dresende's orm2.
                 * // Part of an app, that fetches cats of the logged user.
                 * // This example uses `seq` function to avoid overnesting and error
                 * // handling clutter.
                 * app.get('/cats', function(request, response) {
                 *     var User = request.models.User;
                 *     async.seq(
                 *         _.bind(User.get, User),  // 'User.get' has signature (id, callback(err, data))
                 *         function(user, fn) {
                 *             user.getCats(fn);      // 'getCats' has signature (callback(err, data))
                 *         }
                 *     )(req.session.user_id, function (err, cats) {
                 *         if (err) {
                 *             console.error(err);
                 *             response.json({ status: 'error', message: err.message });
                 *         } else {
                 *             response.json({ status: 'ok', message: 'Cats found', data: cats });
                 *         }
                 *     });
                 * });
                 */
                function seq(/*...functions*/) {
                    var _functions = arrayMap(arguments, wrapAsync);
                    return function (/*...args*/) {
                        var args = slice(arguments);
                        var that = this;

                        var cb = args[args.length - 1];
                        if (typeof cb == "function") {
                            args.pop();
                        } else {
                            cb = noop;
                        }

                        reduce(
                            _functions,
                            args,
                            function (newargs, fn, cb) {
                                fn.apply(
                                    that,
                                    newargs.concat(function (
                                        err /*, ...nextargs*/
                                    ) {
                                        var nextargs = slice(arguments, 1);
                                        cb(err, nextargs);
                                    })
                                );
                            },
                            function (err, results) {
                                cb.apply(that, [err].concat(results));
                            }
                        );
                    };
                }

                /**
                 * Creates a function which is a composition of the passed asynchronous
                 * functions. Each function consumes the return value of the function that
                 * follows. Composing functions `f()`, `g()`, and `h()` would produce the result
                 * of `f(g(h()))`, only this version uses callbacks to obtain the return values.
                 *
                 * Each function is executed with the `this` binding of the composed function.
                 *
                 * @name compose
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @category Control Flow
                 * @param {...AsyncFunction} functions - the asynchronous functions to compose
                 * @returns {Function} an asynchronous function that is the composed
                 * asynchronous `functions`
                 * @example
                 *
                 * function add1(n, callback) {
                 *     setTimeout(function () {
                 *         callback(null, n + 1);
                 *     }, 10);
                 * }
                 *
                 * function mul3(n, callback) {
                 *     setTimeout(function () {
                 *         callback(null, n * 3);
                 *     }, 10);
                 * }
                 *
                 * var add1mul3 = async.compose(mul3, add1);
                 * add1mul3(4, function (err, result) {
                 *     // result now equals 15
                 * });
                 */
                var compose = function (/*...args*/) {
                    return seq.apply(null, slice(arguments).reverse());
                };

                var _concat = Array.prototype.concat;

                /**
                 * The same as [`concat`]{@link module:Collections.concat} but runs a maximum of `limit` async operations at a time.
                 *
                 * @name concatLimit
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.concat]{@link module:Collections.concat}
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {number} limit - The maximum number of async operations at a time.
                 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`,
                 * which should use an array as its result. Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called after all the
                 * `iteratee` functions have finished, or an error occurs. Results is an array
                 * containing the concatenated results of the `iteratee` function. Invoked with
                 * (err, results).
                 */
                var concatLimit = function (coll, limit, iteratee, callback) {
                    callback = callback || noop;
                    var _iteratee = wrapAsync(iteratee);
                    mapLimit(
                        coll,
                        limit,
                        function (val, callback) {
                            _iteratee(val, function (err /*, ...args*/) {
                                if (err) return callback(err);
                                return callback(null, slice(arguments, 1));
                            });
                        },
                        function (err, mapResults) {
                            var result = [];
                            for (var i = 0; i < mapResults.length; i++) {
                                if (mapResults[i]) {
                                    result = _concat.apply(
                                        result,
                                        mapResults[i]
                                    );
                                }
                            }

                            return callback(err, result);
                        }
                    );
                };

                /**
                 * Applies `iteratee` to each item in `coll`, concatenating the results. Returns
                 * the concatenated list. The `iteratee`s are called in parallel, and the
                 * results are concatenated as they return. There is no guarantee that the
                 * results array will be returned in the original order of `coll` passed to the
                 * `iteratee` function.
                 *
                 * @name concat
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`,
                 * which should use an array as its result. Invoked with (item, callback).
                 * @param {Function} [callback(err)] - A callback which is called after all the
                 * `iteratee` functions have finished, or an error occurs. Results is an array
                 * containing the concatenated results of the `iteratee` function. Invoked with
                 * (err, results).
                 * @example
                 *
                 * async.concat(['dir1','dir2','dir3'], fs.readdir, function(err, files) {
                 *     // files is now a list of filenames that exist in the 3 directories
                 * });
                 */
                var concat = doLimit(concatLimit, Infinity);

                /**
                 * The same as [`concat`]{@link module:Collections.concat} but runs only a single async operation at a time.
                 *
                 * @name concatSeries
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.concat]{@link module:Collections.concat}
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`.
                 * The iteratee should complete with an array an array of results.
                 * Invoked with (item, callback).
                 * @param {Function} [callback(err)] - A callback which is called after all the
                 * `iteratee` functions have finished, or an error occurs. Results is an array
                 * containing the concatenated results of the `iteratee` function. Invoked with
                 * (err, results).
                 */
                var concatSeries = doLimit(concatLimit, 1);

                /**
                 * Returns a function that when called, calls-back with the values provided.
                 * Useful as the first function in a [`waterfall`]{@link module:ControlFlow.waterfall}, or for plugging values in to
                 * [`auto`]{@link module:ControlFlow.auto}.
                 *
                 * @name constant
                 * @static
                 * @memberOf module:Utils
                 * @method
                 * @category Util
                 * @param {...*} arguments... - Any number of arguments to automatically invoke
                 * callback with.
                 * @returns {AsyncFunction} Returns a function that when invoked, automatically
                 * invokes the callback with the previous given arguments.
                 * @example
                 *
                 * async.waterfall([
                 *     async.constant(42),
                 *     function (value, next) {
                 *         // value === 42
                 *     },
                 *     //...
                 * ], callback);
                 *
                 * async.waterfall([
                 *     async.constant(filename, "utf8"),
                 *     fs.readFile,
                 *     function (fileData, next) {
                 *         //...
                 *     }
                 *     //...
                 * ], callback);
                 *
                 * async.auto({
                 *     hostname: async.constant("https://server.net/"),
                 *     port: findFreePort,
                 *     launchServer: ["hostname", "port", function (options, cb) {
                 *         startServer(options, cb);
                 *     }],
                 *     //...
                 * }, callback);
                 */
                var constant = function (/*...values*/) {
                    var values = slice(arguments);
                    var args = [null].concat(values);
                    return function (/*...ignoredArgs, callback*/) {
                        var callback = arguments[arguments.length - 1];
                        return callback.apply(this, args);
                    };
                };

                /**
                 * This method returns the first argument it receives.
                 *
                 * @static
                 * @since 0.1.0
                 * @memberOf _
                 * @category Util
                 * @param {*} value Any value.
                 * @returns {*} Returns `value`.
                 * @example
                 *
                 * var object = { 'a': 1 };
                 *
                 * console.log(_.identity(object) === object);
                 * // => true
                 */
                function identity(value) {
                    return value;
                }

                function _createTester(check, getResult) {
                    return function (eachfn, arr, iteratee, cb) {
                        cb = cb || noop;
                        var testPassed = false;
                        var testResult;
                        eachfn(
                            arr,
                            function (value, _, callback) {
                                iteratee(value, function (err, result) {
                                    if (err) {
                                        callback(err);
                                    } else if (check(result) && !testResult) {
                                        testPassed = true;
                                        testResult = getResult(true, value);
                                        callback(null, breakLoop);
                                    } else {
                                        callback();
                                    }
                                });
                            },
                            function (err) {
                                if (err) {
                                    cb(err);
                                } else {
                                    cb(
                                        null,
                                        testPassed
                                            ? testResult
                                            : getResult(false)
                                    );
                                }
                            }
                        );
                    };
                }

                function _findGetResult(v, x) {
                    return x;
                }

                /**
 * Returns the first value in `coll` that passes an async truth test. The
 * `iteratee` is applied in parallel, meaning the first iteratee to return
 * `true` will fire the detect `callback` with that result. That means the
 * result might not be the first item in the original `coll` (in terms of order)
 * that passes the test.

 * If order within the original `coll` is important, then look at
 * [`detectSeries`]{@link module:Collections.detectSeries}.
 *
 * @name detect
 * @static
 * @memberOf module:Collections
 * @method
 * @alias find
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 * @example
 *
 * async.detect(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // result now equals the first file in the list that exists
 * });
 */
                var detect = doParallel(
                    _createTester(identity, _findGetResult)
                );

                /**
                 * The same as [`detect`]{@link module:Collections.detect} but runs a maximum of `limit` async operations at a
                 * time.
                 *
                 * @name detectLimit
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.detect]{@link module:Collections.detect}
                 * @alias findLimit
                 * @category Collections
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {number} limit - The maximum number of async operations at a time.
                 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
                 * The iteratee must complete with a boolean value as its result.
                 * Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called as soon as any
                 * iteratee returns `true`, or after all the `iteratee` functions have finished.
                 * Result will be the first item in the array that passes the truth test
                 * (iteratee) or the value `undefined` if none passed. Invoked with
                 * (err, result).
                 */
                var detectLimit = doParallelLimit(
                    _createTester(identity, _findGetResult)
                );

                /**
                 * The same as [`detect`]{@link module:Collections.detect} but runs only a single async operation at a time.
                 *
                 * @name detectSeries
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.detect]{@link module:Collections.detect}
                 * @alias findSeries
                 * @category Collections
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
                 * The iteratee must complete with a boolean value as its result.
                 * Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called as soon as any
                 * iteratee returns `true`, or after all the `iteratee` functions have finished.
                 * Result will be the first item in the array that passes the truth test
                 * (iteratee) or the value `undefined` if none passed. Invoked with
                 * (err, result).
                 */
                var detectSeries = doLimit(detectLimit, 1);

                function consoleFunc(name) {
                    return function (fn /*, ...args*/) {
                        var args = slice(arguments, 1);
                        args.push(function (err /*, ...args*/) {
                            var args = slice(arguments, 1);
                            if (typeof console === "object") {
                                if (err) {
                                    if (console.error) {
                                        console.error(err);
                                    }
                                } else if (console[name]) {
                                    arrayEach(args, function (x) {
                                        console[name](x);
                                    });
                                }
                            }
                        });
                        wrapAsync(fn).apply(null, args);
                    };
                }

                /**
                 * Logs the result of an [`async` function]{@link AsyncFunction} to the
                 * `console` using `console.dir` to display the properties of the resulting object.
                 * Only works in Node.js or in browsers that support `console.dir` and
                 * `console.error` (such as FF and Chrome).
                 * If multiple arguments are returned from the async function,
                 * `console.dir` is called on each argument in order.
                 *
                 * @name dir
                 * @static
                 * @memberOf module:Utils
                 * @method
                 * @category Util
                 * @param {AsyncFunction} function - The function you want to eventually apply
                 * all arguments to.
                 * @param {...*} arguments... - Any number of arguments to apply to the function.
                 * @example
                 *
                 * // in a module
                 * var hello = function(name, callback) {
                 *     setTimeout(function() {
                 *         callback(null, {hello: name});
                 *     }, 1000);
                 * };
                 *
                 * // in the node repl
                 * node> async.dir(hello, 'world');
                 * {hello: 'world'}
                 */
                var dir = consoleFunc("dir");

                /**
                 * The post-check version of [`during`]{@link module:ControlFlow.during}. To reflect the difference in
                 * the order of operations, the arguments `test` and `fn` are switched.
                 *
                 * Also a version of [`doWhilst`]{@link module:ControlFlow.doWhilst} with asynchronous `test` function.
                 * @name doDuring
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @see [async.during]{@link module:ControlFlow.during}
                 * @category Control Flow
                 * @param {AsyncFunction} fn - An async function which is called each time
                 * `test` passes. Invoked with (callback).
                 * @param {AsyncFunction} test - asynchronous truth test to perform before each
                 * execution of `fn`. Invoked with (...args, callback), where `...args` are the
                 * non-error args from the previous callback of `fn`.
                 * @param {Function} [callback] - A callback which is called after the test
                 * function has failed and repeated execution of `fn` has stopped. `callback`
                 * will be passed an error if one occurred, otherwise `null`.
                 */
                function doDuring(fn, test, callback) {
                    callback = onlyOnce(callback || noop);
                    var _fn = wrapAsync(fn);
                    var _test = wrapAsync(test);

                    function next(err /*, ...args*/) {
                        if (err) return callback(err);
                        var args = slice(arguments, 1);
                        args.push(check);
                        _test.apply(this, args);
                    }

                    function check(err, truth) {
                        if (err) return callback(err);
                        if (!truth) return callback(null);
                        _fn(next);
                    }

                    check(null, true);
                }

                /**
                 * The post-check version of [`whilst`]{@link module:ControlFlow.whilst}. To reflect the difference in
                 * the order of operations, the arguments `test` and `iteratee` are switched.
                 *
                 * `doWhilst` is to `whilst` as `do while` is to `while` in plain JavaScript.
                 *
                 * @name doWhilst
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @see [async.whilst]{@link module:ControlFlow.whilst}
                 * @category Control Flow
                 * @param {AsyncFunction} iteratee - A function which is called each time `test`
                 * passes. Invoked with (callback).
                 * @param {Function} test - synchronous truth test to perform after each
                 * execution of `iteratee`. Invoked with any non-error callback results of
                 * `iteratee`.
                 * @param {Function} [callback] - A callback which is called after the test
                 * function has failed and repeated execution of `iteratee` has stopped.
                 * `callback` will be passed an error and any arguments passed to the final
                 * `iteratee`'s callback. Invoked with (err, [results]);
                 */
                function doWhilst(iteratee, test, callback) {
                    callback = onlyOnce(callback || noop);
                    var _iteratee = wrapAsync(iteratee);
                    var next = function (err /*, ...args*/) {
                        if (err) return callback(err);
                        var args = slice(arguments, 1);
                        if (test.apply(this, args)) return _iteratee(next);
                        callback.apply(null, [null].concat(args));
                    };
                    _iteratee(next);
                }

                /**
                 * Like ['doWhilst']{@link module:ControlFlow.doWhilst}, except the `test` is inverted. Note the
                 * argument ordering differs from `until`.
                 *
                 * @name doUntil
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @see [async.doWhilst]{@link module:ControlFlow.doWhilst}
                 * @category Control Flow
                 * @param {AsyncFunction} iteratee - An async function which is called each time
                 * `test` fails. Invoked with (callback).
                 * @param {Function} test - synchronous truth test to perform after each
                 * execution of `iteratee`. Invoked with any non-error callback results of
                 * `iteratee`.
                 * @param {Function} [callback] - A callback which is called after the test
                 * function has passed and repeated execution of `iteratee` has stopped. `callback`
                 * will be passed an error and any arguments passed to the final `iteratee`'s
                 * callback. Invoked with (err, [results]);
                 */
                function doUntil(iteratee, test, callback) {
                    doWhilst(
                        iteratee,
                        function () {
                            return !test.apply(this, arguments);
                        },
                        callback
                    );
                }

                /**
                 * Like [`whilst`]{@link module:ControlFlow.whilst}, except the `test` is an asynchronous function that
                 * is passed a callback in the form of `function (err, truth)`. If error is
                 * passed to `test` or `fn`, the main callback is immediately called with the
                 * value of the error.
                 *
                 * @name during
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @see [async.whilst]{@link module:ControlFlow.whilst}
                 * @category Control Flow
                 * @param {AsyncFunction} test - asynchronous truth test to perform before each
                 * execution of `fn`. Invoked with (callback).
                 * @param {AsyncFunction} fn - An async function which is called each time
                 * `test` passes. Invoked with (callback).
                 * @param {Function} [callback] - A callback which is called after the test
                 * function has failed and repeated execution of `fn` has stopped. `callback`
                 * will be passed an error, if one occurred, otherwise `null`.
                 * @example
                 *
                 * var count = 0;
                 *
                 * async.during(
                 *     function (callback) {
                 *         return callback(null, count < 5);
                 *     },
                 *     function (callback) {
                 *         count++;
                 *         setTimeout(callback, 1000);
                 *     },
                 *     function (err) {
                 *         // 5 seconds have passed
                 *     }
                 * );
                 */
                function during(test, fn, callback) {
                    callback = onlyOnce(callback || noop);
                    var _fn = wrapAsync(fn);
                    var _test = wrapAsync(test);

                    function next(err) {
                        if (err) return callback(err);
                        _test(check);
                    }

                    function check(err, truth) {
                        if (err) return callback(err);
                        if (!truth) return callback(null);
                        _fn(next);
                    }

                    _test(check);
                }

                function _withoutIndex(iteratee) {
                    return function (value, index, callback) {
                        return iteratee(value, callback);
                    };
                }

                /**
                 * Applies the function `iteratee` to each item in `coll`, in parallel.
                 * The `iteratee` is called with an item from the list, and a callback for when
                 * it has finished. If the `iteratee` passes an error to its `callback`, the
                 * main `callback` (for the `each` function) is immediately called with the
                 * error.
                 *
                 * Note, that since this function applies `iteratee` to each item in parallel,
                 * there is no guarantee that the iteratee functions will complete in order.
                 *
                 * @name each
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @alias forEach
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {AsyncFunction} iteratee - An async function to apply to
                 * each item in `coll`. Invoked with (item, callback).
                 * The array index is not passed to the iteratee.
                 * If you need the index, use `eachOf`.
                 * @param {Function} [callback] - A callback which is called when all
                 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
                 * @example
                 *
                 * // assuming openFiles is an array of file names and saveFile is a function
                 * // to save the modified contents of that file:
                 *
                 * async.each(openFiles, saveFile, function(err){
                 *   // if any of the saves produced an error, err would equal that error
                 * });
                 *
                 * // assuming openFiles is an array of file names
                 * async.each(openFiles, function(file, callback) {
                 *
                 *     // Perform operation on file here.
                 *     console.log('Processing file ' + file);
                 *
                 *     if( file.length > 32 ) {
                 *       console.log('This file name is too long');
                 *       callback('File name too long');
                 *     } else {
                 *       // Do work to process file here
                 *       console.log('File processed');
                 *       callback();
                 *     }
                 * }, function(err) {
                 *     // if any of the file processing produced an error, err would equal that error
                 *     if( err ) {
                 *       // One of the iterations produced an error.
                 *       // All processing will now stop.
                 *       console.log('A file failed to process');
                 *     } else {
                 *       console.log('All files have been processed successfully');
                 *     }
                 * });
                 */
                function eachLimit(coll, iteratee, callback) {
                    eachOf(coll, _withoutIndex(wrapAsync(iteratee)), callback);
                }

                /**
                 * The same as [`each`]{@link module:Collections.each} but runs a maximum of `limit` async operations at a time.
                 *
                 * @name eachLimit
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.each]{@link module:Collections.each}
                 * @alias forEachLimit
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {number} limit - The maximum number of async operations at a time.
                 * @param {AsyncFunction} iteratee - An async function to apply to each item in
                 * `coll`.
                 * The array index is not passed to the iteratee.
                 * If you need the index, use `eachOfLimit`.
                 * Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called when all
                 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
                 */
                function eachLimit$1(coll, limit, iteratee, callback) {
                    _eachOfLimit(limit)(
                        coll,
                        _withoutIndex(wrapAsync(iteratee)),
                        callback
                    );
                }

                /**
                 * The same as [`each`]{@link module:Collections.each} but runs only a single async operation at a time.
                 *
                 * @name eachSeries
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.each]{@link module:Collections.each}
                 * @alias forEachSeries
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {AsyncFunction} iteratee - An async function to apply to each
                 * item in `coll`.
                 * The array index is not passed to the iteratee.
                 * If you need the index, use `eachOfSeries`.
                 * Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called when all
                 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
                 */
                var eachSeries = doLimit(eachLimit$1, 1);

                /**
                 * Wrap an async function and ensure it calls its callback on a later tick of
                 * the event loop.  If the function already calls its callback on a next tick,
                 * no extra deferral is added. This is useful for preventing stack overflows
                 * (`RangeError: Maximum call stack size exceeded`) and generally keeping
                 * [Zalgo](http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony)
                 * contained. ES2017 `async` functions are returned as-is -- they are immune
                 * to Zalgo's corrupting influences, as they always resolve on a later tick.
                 *
                 * @name ensureAsync
                 * @static
                 * @memberOf module:Utils
                 * @method
                 * @category Util
                 * @param {AsyncFunction} fn - an async function, one that expects a node-style
                 * callback as its last argument.
                 * @returns {AsyncFunction} Returns a wrapped function with the exact same call
                 * signature as the function passed in.
                 * @example
                 *
                 * function sometimesAsync(arg, callback) {
                 *     if (cache[arg]) {
                 *         return callback(null, cache[arg]); // this would be synchronous!!
                 *     } else {
                 *         doSomeIO(arg, callback); // this IO would be asynchronous
                 *     }
                 * }
                 *
                 * // this has a risk of stack overflows if many results are cached in a row
                 * async.mapSeries(args, sometimesAsync, done);
                 *
                 * // this will defer sometimesAsync's callback if necessary,
                 * // preventing stack overflows
                 * async.mapSeries(args, async.ensureAsync(sometimesAsync), done);
                 */
                function ensureAsync(fn) {
                    if (isAsync(fn)) return fn;
                    return initialParams(function (args, callback) {
                        var sync = true;
                        args.push(function () {
                            var innerArgs = arguments;
                            if (sync) {
                                setImmediate$1(function () {
                                    callback.apply(null, innerArgs);
                                });
                            } else {
                                callback.apply(null, innerArgs);
                            }
                        });
                        fn.apply(this, args);
                        sync = false;
                    });
                }

                function notId(v) {
                    return !v;
                }

                /**
                 * Returns `true` if every element in `coll` satisfies an async test. If any
                 * iteratee call returns `false`, the main `callback` is immediately called.
                 *
                 * @name every
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @alias all
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
                 * in the collection in parallel.
                 * The iteratee must complete with a boolean result value.
                 * Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called after all the
                 * `iteratee` functions have finished. Result will be either `true` or `false`
                 * depending on the values of the async tests. Invoked with (err, result).
                 * @example
                 *
                 * async.every(['file1','file2','file3'], function(filePath, callback) {
                 *     fs.access(filePath, function(err) {
                 *         callback(null, !err)
                 *     });
                 * }, function(err, result) {
                 *     // if result is true then every file exists
                 * });
                 */
                var every = doParallel(_createTester(notId, notId));

                /**
                 * The same as [`every`]{@link module:Collections.every} but runs a maximum of `limit` async operations at a time.
                 *
                 * @name everyLimit
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.every]{@link module:Collections.every}
                 * @alias allLimit
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {number} limit - The maximum number of async operations at a time.
                 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
                 * in the collection in parallel.
                 * The iteratee must complete with a boolean result value.
                 * Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called after all the
                 * `iteratee` functions have finished. Result will be either `true` or `false`
                 * depending on the values of the async tests. Invoked with (err, result).
                 */
                var everyLimit = doParallelLimit(_createTester(notId, notId));

                /**
                 * The same as [`every`]{@link module:Collections.every} but runs only a single async operation at a time.
                 *
                 * @name everySeries
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.every]{@link module:Collections.every}
                 * @alias allSeries
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
                 * in the collection in series.
                 * The iteratee must complete with a boolean result value.
                 * Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called after all the
                 * `iteratee` functions have finished. Result will be either `true` or `false`
                 * depending on the values of the async tests. Invoked with (err, result).
                 */
                var everySeries = doLimit(everyLimit, 1);

                /**
                 * The base implementation of `_.property` without support for deep paths.
                 *
                 * @private
                 * @param {string} key The key of the property to get.
                 * @returns {Function} Returns the new accessor function.
                 */
                function baseProperty(key) {
                    return function (object) {
                        return object == null ? undefined : object[key];
                    };
                }

                function filterArray(eachfn, arr, iteratee, callback) {
                    var truthValues = new Array(arr.length);
                    eachfn(
                        arr,
                        function (x, index, callback) {
                            iteratee(x, function (err, v) {
                                truthValues[index] = !!v;
                                callback(err);
                            });
                        },
                        function (err) {
                            if (err) return callback(err);
                            var results = [];
                            for (var i = 0; i < arr.length; i++) {
                                if (truthValues[i]) results.push(arr[i]);
                            }
                            callback(null, results);
                        }
                    );
                }

                function filterGeneric(eachfn, coll, iteratee, callback) {
                    var results = [];
                    eachfn(
                        coll,
                        function (x, index, callback) {
                            iteratee(x, function (err, v) {
                                if (err) {
                                    callback(err);
                                } else {
                                    if (v) {
                                        results.push({
                                            index: index,
                                            value: x,
                                        });
                                    }
                                    callback();
                                }
                            });
                        },
                        function (err) {
                            if (err) {
                                callback(err);
                            } else {
                                callback(
                                    null,
                                    arrayMap(
                                        results.sort(function (a, b) {
                                            return a.index - b.index;
                                        }),
                                        baseProperty("value")
                                    )
                                );
                            }
                        }
                    );
                }

                function _filter(eachfn, coll, iteratee, callback) {
                    var filter = isArrayLike(coll)
                        ? filterArray
                        : filterGeneric;
                    filter(eachfn, coll, wrapAsync(iteratee), callback || noop);
                }

                /**
                 * Returns a new array of all the values in `coll` which pass an async truth
                 * test. This operation is performed in parallel, but the results array will be
                 * in the same order as the original.
                 *
                 * @name filter
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @alias select
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
                 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
                 * with a boolean argument once it has completed. Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called after all the
                 * `iteratee` functions have finished. Invoked with (err, results).
                 * @example
                 *
                 * async.filter(['file1','file2','file3'], function(filePath, callback) {
                 *     fs.access(filePath, function(err) {
                 *         callback(null, !err)
                 *     });
                 * }, function(err, results) {
                 *     // results now equals an array of the existing files
                 * });
                 */
                var filter = doParallel(_filter);

                /**
                 * The same as [`filter`]{@link module:Collections.filter} but runs a maximum of `limit` async operations at a
                 * time.
                 *
                 * @name filterLimit
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.filter]{@link module:Collections.filter}
                 * @alias selectLimit
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {number} limit - The maximum number of async operations at a time.
                 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
                 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
                 * with a boolean argument once it has completed. Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called after all the
                 * `iteratee` functions have finished. Invoked with (err, results).
                 */
                var filterLimit = doParallelLimit(_filter);

                /**
                 * The same as [`filter`]{@link module:Collections.filter} but runs only a single async operation at a time.
                 *
                 * @name filterSeries
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.filter]{@link module:Collections.filter}
                 * @alias selectSeries
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
                 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
                 * with a boolean argument once it has completed. Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called after all the
                 * `iteratee` functions have finished. Invoked with (err, results)
                 */
                var filterSeries = doLimit(filterLimit, 1);

                /**
 * Calls the asynchronous function `fn` with a callback parameter that allows it
 * to call itself again, in series, indefinitely.

 * If an error is passed to the callback then `errback` is called with the
 * error, and execution stops, otherwise it will never be called.
 *
 * @name forever
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {AsyncFunction} fn - an async function to call repeatedly.
 * Invoked with (next).
 * @param {Function} [errback] - when `fn` passes an error to it's callback,
 * this function will be called, and execution stops. Invoked with (err).
 * @example
 *
 * async.forever(
 *     function(next) {
 *         // next is suitable for passing to things that need a callback(err [, whatever]);
 *         // it will result in this function being called again.
 *     },
 *     function(err) {
 *         // if next is called with a value in its first parameter, it will appear
 *         // in here as 'err', and execution will stop.
 *     }
 * );
 */
                function forever(fn, errback) {
                    var done = onlyOnce(errback || noop);
                    var task = wrapAsync(ensureAsync(fn));

                    function next(err) {
                        if (err) return done(err);
                        task(next);
                    }
                    next();
                }

                /**
                 * The same as [`groupBy`]{@link module:Collections.groupBy} but runs a maximum of `limit` async operations at a time.
                 *
                 * @name groupByLimit
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.groupBy]{@link module:Collections.groupBy}
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {number} limit - The maximum number of async operations at a time.
                 * @param {AsyncFunction} iteratee - An async function to apply to each item in
                 * `coll`.
                 * The iteratee should complete with a `key` to group the value under.
                 * Invoked with (value, callback).
                 * @param {Function} [callback] - A callback which is called when all `iteratee`
                 * functions have finished, or an error occurs. Result is an `Object` whoses
                 * properties are arrays of values which returned the corresponding key.
                 */
                var groupByLimit = function (coll, limit, iteratee, callback) {
                    callback = callback || noop;
                    var _iteratee = wrapAsync(iteratee);
                    mapLimit(
                        coll,
                        limit,
                        function (val, callback) {
                            _iteratee(val, function (err, key) {
                                if (err) return callback(err);
                                return callback(null, { key: key, val: val });
                            });
                        },
                        function (err, mapResults) {
                            var result = {};
                            // from MDN, handle object having an `hasOwnProperty` prop
                            var hasOwnProperty =
                                Object.prototype.hasOwnProperty;

                            for (var i = 0; i < mapResults.length; i++) {
                                if (mapResults[i]) {
                                    var key = mapResults[i].key;
                                    var val = mapResults[i].val;

                                    if (hasOwnProperty.call(result, key)) {
                                        result[key].push(val);
                                    } else {
                                        result[key] = [val];
                                    }
                                }
                            }

                            return callback(err, result);
                        }
                    );
                };

                /**
                 * Returns a new object, where each value corresponds to an array of items, from
                 * `coll`, that returned the corresponding key. That is, the keys of the object
                 * correspond to the values passed to the `iteratee` callback.
                 *
                 * Note: Since this function applies the `iteratee` to each item in parallel,
                 * there is no guarantee that the `iteratee` functions will complete in order.
                 * However, the values for each key in the `result` will be in the same order as
                 * the original `coll`. For Objects, the values will roughly be in the order of
                 * the original Objects' keys (but this can vary across JavaScript engines).
                 *
                 * @name groupBy
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {AsyncFunction} iteratee - An async function to apply to each item in
                 * `coll`.
                 * The iteratee should complete with a `key` to group the value under.
                 * Invoked with (value, callback).
                 * @param {Function} [callback] - A callback which is called when all `iteratee`
                 * functions have finished, or an error occurs. Result is an `Object` whoses
                 * properties are arrays of values which returned the corresponding key.
                 * @example
                 *
                 * async.groupBy(['userId1', 'userId2', 'userId3'], function(userId, callback) {
                 *     db.findById(userId, function(err, user) {
                 *         if (err) return callback(err);
                 *         return callback(null, user.age);
                 *     });
                 * }, function(err, result) {
                 *     // result is object containing the userIds grouped by age
                 *     // e.g. { 30: ['userId1', 'userId3'], 42: ['userId2']};
                 * });
                 */
                var groupBy = doLimit(groupByLimit, Infinity);

                /**
                 * The same as [`groupBy`]{@link module:Collections.groupBy} but runs only a single async operation at a time.
                 *
                 * @name groupBySeries
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.groupBy]{@link module:Collections.groupBy}
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {number} limit - The maximum number of async operations at a time.
                 * @param {AsyncFunction} iteratee - An async function to apply to each item in
                 * `coll`.
                 * The iteratee should complete with a `key` to group the value under.
                 * Invoked with (value, callback).
                 * @param {Function} [callback] - A callback which is called when all `iteratee`
                 * functions have finished, or an error occurs. Result is an `Object` whoses
                 * properties are arrays of values which returned the corresponding key.
                 */
                var groupBySeries = doLimit(groupByLimit, 1);

                /**
                 * Logs the result of an `async` function to the `console`. Only works in
                 * Node.js or in browsers that support `console.log` and `console.error` (such
                 * as FF and Chrome). If multiple arguments are returned from the async
                 * function, `console.log` is called on each argument in order.
                 *
                 * @name log
                 * @static
                 * @memberOf module:Utils
                 * @method
                 * @category Util
                 * @param {AsyncFunction} function - The function you want to eventually apply
                 * all arguments to.
                 * @param {...*} arguments... - Any number of arguments to apply to the function.
                 * @example
                 *
                 * // in a module
                 * var hello = function(name, callback) {
                 *     setTimeout(function() {
                 *         callback(null, 'hello ' + name);
                 *     }, 1000);
                 * };
                 *
                 * // in the node repl
                 * node> async.log(hello, 'world');
                 * 'hello world'
                 */
                var log = consoleFunc("log");

                /**
                 * The same as [`mapValues`]{@link module:Collections.mapValues} but runs a maximum of `limit` async operations at a
                 * time.
                 *
                 * @name mapValuesLimit
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.mapValues]{@link module:Collections.mapValues}
                 * @category Collection
                 * @param {Object} obj - A collection to iterate over.
                 * @param {number} limit - The maximum number of async operations at a time.
                 * @param {AsyncFunction} iteratee - A function to apply to each value and key
                 * in `coll`.
                 * The iteratee should complete with the transformed value as its result.
                 * Invoked with (value, key, callback).
                 * @param {Function} [callback] - A callback which is called when all `iteratee`
                 * functions have finished, or an error occurs. `result` is a new object consisting
                 * of each key from `obj`, with each transformed value on the right-hand side.
                 * Invoked with (err, result).
                 */
                function mapValuesLimit(obj, limit, iteratee, callback) {
                    callback = once(callback || noop);
                    var newObj = {};
                    var _iteratee = wrapAsync(iteratee);
                    eachOfLimit(
                        obj,
                        limit,
                        function (val, key, next) {
                            _iteratee(val, key, function (err, result) {
                                if (err) return next(err);
                                newObj[key] = result;
                                next();
                            });
                        },
                        function (err) {
                            callback(err, newObj);
                        }
                    );
                }

                /**
                 * A relative of [`map`]{@link module:Collections.map}, designed for use with objects.
                 *
                 * Produces a new Object by mapping each value of `obj` through the `iteratee`
                 * function. The `iteratee` is called each `value` and `key` from `obj` and a
                 * callback for when it has finished processing. Each of these callbacks takes
                 * two arguments: an `error`, and the transformed item from `obj`. If `iteratee`
                 * passes an error to its callback, the main `callback` (for the `mapValues`
                 * function) is immediately called with the error.
                 *
                 * Note, the order of the keys in the result is not guaranteed.  The keys will
                 * be roughly in the order they complete, (but this is very engine-specific)
                 *
                 * @name mapValues
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @category Collection
                 * @param {Object} obj - A collection to iterate over.
                 * @param {AsyncFunction} iteratee - A function to apply to each value and key
                 * in `coll`.
                 * The iteratee should complete with the transformed value as its result.
                 * Invoked with (value, key, callback).
                 * @param {Function} [callback] - A callback which is called when all `iteratee`
                 * functions have finished, or an error occurs. `result` is a new object consisting
                 * of each key from `obj`, with each transformed value on the right-hand side.
                 * Invoked with (err, result).
                 * @example
                 *
                 * async.mapValues({
                 *     f1: 'file1',
                 *     f2: 'file2',
                 *     f3: 'file3'
                 * }, function (file, key, callback) {
                 *   fs.stat(file, callback);
                 * }, function(err, result) {
                 *     // result is now a map of stats for each file, e.g.
                 *     // {
                 *     //     f1: [stats for file1],
                 *     //     f2: [stats for file2],
                 *     //     f3: [stats for file3]
                 *     // }
                 * });
                 */

                var mapValues = doLimit(mapValuesLimit, Infinity);

                /**
                 * The same as [`mapValues`]{@link module:Collections.mapValues} but runs only a single async operation at a time.
                 *
                 * @name mapValuesSeries
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.mapValues]{@link module:Collections.mapValues}
                 * @category Collection
                 * @param {Object} obj - A collection to iterate over.
                 * @param {AsyncFunction} iteratee - A function to apply to each value and key
                 * in `coll`.
                 * The iteratee should complete with the transformed value as its result.
                 * Invoked with (value, key, callback).
                 * @param {Function} [callback] - A callback which is called when all `iteratee`
                 * functions have finished, or an error occurs. `result` is a new object consisting
                 * of each key from `obj`, with each transformed value on the right-hand side.
                 * Invoked with (err, result).
                 */
                var mapValuesSeries = doLimit(mapValuesLimit, 1);

                function has(obj, key) {
                    return key in obj;
                }

                /**
                 * Caches the results of an async function. When creating a hash to store
                 * function results against, the callback is omitted from the hash and an
                 * optional hash function can be used.
                 *
                 * If no hash function is specified, the first argument is used as a hash key,
                 * which may work reasonably if it is a string or a data type that converts to a
                 * distinct string. Note that objects and arrays will not behave reasonably.
                 * Neither will cases where the other arguments are significant. In such cases,
                 * specify your own hash function.
                 *
                 * The cache of results is exposed as the `memo` property of the function
                 * returned by `memoize`.
                 *
                 * @name memoize
                 * @static
                 * @memberOf module:Utils
                 * @method
                 * @category Util
                 * @param {AsyncFunction} fn - The async function to proxy and cache results from.
                 * @param {Function} hasher - An optional function for generating a custom hash
                 * for storing results. It has all the arguments applied to it apart from the
                 * callback, and must be synchronous.
                 * @returns {AsyncFunction} a memoized version of `fn`
                 * @example
                 *
                 * var slow_fn = function(name, callback) {
                 *     // do something
                 *     callback(null, result);
                 * };
                 * var fn = async.memoize(slow_fn);
                 *
                 * // fn can now be used as if it were slow_fn
                 * fn('some name', function() {
                 *     // callback
                 * });
                 */
                function memoize(fn, hasher) {
                    var memo = Object.create(null);
                    var queues = Object.create(null);
                    hasher = hasher || identity;
                    var _fn = wrapAsync(fn);
                    var memoized = initialParams(function memoized(
                        args,
                        callback
                    ) {
                        var key = hasher.apply(null, args);
                        if (has(memo, key)) {
                            setImmediate$1(function () {
                                callback.apply(null, memo[key]);
                            });
                        } else if (has(queues, key)) {
                            queues[key].push(callback);
                        } else {
                            queues[key] = [callback];
                            _fn.apply(
                                null,
                                args.concat(function (/*args*/) {
                                    var args = slice(arguments);
                                    memo[key] = args;
                                    var q = queues[key];
                                    delete queues[key];
                                    for (var i = 0, l = q.length; i < l; i++) {
                                        q[i].apply(null, args);
                                    }
                                })
                            );
                        }
                    });
                    memoized.memo = memo;
                    memoized.unmemoized = fn;
                    return memoized;
                }

                /**
                 * Calls `callback` on a later loop around the event loop. In Node.js this just
                 * calls `process.nextTick`.  In the browser it will use `setImmediate` if
                 * available, otherwise `setTimeout(callback, 0)`, which means other higher
                 * priority events may precede the execution of `callback`.
                 *
                 * This is used internally for browser-compatibility purposes.
                 *
                 * @name nextTick
                 * @static
                 * @memberOf module:Utils
                 * @method
                 * @see [async.setImmediate]{@link module:Utils.setImmediate}
                 * @category Util
                 * @param {Function} callback - The function to call on a later loop around
                 * the event loop. Invoked with (args...).
                 * @param {...*} args... - any number of additional arguments to pass to the
                 * callback on the next tick.
                 * @example
                 *
                 * var call_order = [];
                 * async.nextTick(function() {
                 *     call_order.push('two');
                 *     // call_order now equals ['one','two']
                 * });
                 * call_order.push('one');
                 *
                 * async.setImmediate(function (a, b, c) {
                 *     // a, b, and c equal 1, 2, and 3
                 * }, 1, 2, 3);
                 */
                var _defer$1;

                if (hasNextTick) {
                    _defer$1 = process.nextTick;
                } else if (hasSetImmediate) {
                    _defer$1 = setImmediate;
                } else {
                    _defer$1 = fallback;
                }

                var nextTick = wrap(_defer$1);

                function _parallel(eachfn, tasks, callback) {
                    callback = callback || noop;
                    var results = isArrayLike(tasks) ? [] : {};

                    eachfn(
                        tasks,
                        function (task, key, callback) {
                            wrapAsync(task)(function (err, result) {
                                if (arguments.length > 2) {
                                    result = slice(arguments, 1);
                                }
                                results[key] = result;
                                callback(err);
                            });
                        },
                        function (err) {
                            callback(err, results);
                        }
                    );
                }

                /**
                 * Run the `tasks` collection of functions in parallel, without waiting until
                 * the previous function has completed. If any of the functions pass an error to
                 * its callback, the main `callback` is immediately called with the value of the
                 * error. Once the `tasks` have completed, the results are passed to the final
                 * `callback` as an array.
                 *
                 * **Note:** `parallel` is about kicking-off I/O tasks in parallel, not about
                 * parallel execution of code.  If your tasks do not use any timers or perform
                 * any I/O, they will actually be executed in series.  Any synchronous setup
                 * sections for each task will happen one after the other.  JavaScript remains
                 * single-threaded.
                 *
                 * **Hint:** Use [`reflect`]{@link module:Utils.reflect} to continue the
                 * execution of other tasks when a task fails.
                 *
                 * It is also possible to use an object instead of an array. Each property will
                 * be run as a function and the results will be passed to the final `callback`
                 * as an object instead of an array. This can be a more readable way of handling
                 * results from {@link async.parallel}.
                 *
                 * @name parallel
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @category Control Flow
                 * @param {Array|Iterable|Object} tasks - A collection of
                 * [async functions]{@link AsyncFunction} to run.
                 * Each async function can complete with any number of optional `result` values.
                 * @param {Function} [callback] - An optional callback to run once all the
                 * functions have completed successfully. This function gets a results array
                 * (or object) containing all the result arguments passed to the task callbacks.
                 * Invoked with (err, results).
                 *
                 * @example
                 * async.parallel([
                 *     function(callback) {
                 *         setTimeout(function() {
                 *             callback(null, 'one');
                 *         }, 200);
                 *     },
                 *     function(callback) {
                 *         setTimeout(function() {
                 *             callback(null, 'two');
                 *         }, 100);
                 *     }
                 * ],
                 * // optional callback
                 * function(err, results) {
                 *     // the results array will equal ['one','two'] even though
                 *     // the second function had a shorter timeout.
                 * });
                 *
                 * // an example using an object instead of an array
                 * async.parallel({
                 *     one: function(callback) {
                 *         setTimeout(function() {
                 *             callback(null, 1);
                 *         }, 200);
                 *     },
                 *     two: function(callback) {
                 *         setTimeout(function() {
                 *             callback(null, 2);
                 *         }, 100);
                 *     }
                 * }, function(err, results) {
                 *     // results is now equals to: {one: 1, two: 2}
                 * });
                 */
                function parallelLimit(tasks, callback) {
                    _parallel(eachOf, tasks, callback);
                }

                /**
                 * The same as [`parallel`]{@link module:ControlFlow.parallel} but runs a maximum of `limit` async operations at a
                 * time.
                 *
                 * @name parallelLimit
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @see [async.parallel]{@link module:ControlFlow.parallel}
                 * @category Control Flow
                 * @param {Array|Iterable|Object} tasks - A collection of
                 * [async functions]{@link AsyncFunction} to run.
                 * Each async function can complete with any number of optional `result` values.
                 * @param {number} limit - The maximum number of async operations at a time.
                 * @param {Function} [callback] - An optional callback to run once all the
                 * functions have completed successfully. This function gets a results array
                 * (or object) containing all the result arguments passed to the task callbacks.
                 * Invoked with (err, results).
                 */
                function parallelLimit$1(tasks, limit, callback) {
                    _parallel(_eachOfLimit(limit), tasks, callback);
                }

                /**
                 * A queue of tasks for the worker function to complete.
                 * @typedef {Object} QueueObject
                 * @memberOf module:ControlFlow
                 * @property {Function} length - a function returning the number of items
                 * waiting to be processed. Invoke with `queue.length()`.
                 * @property {boolean} started - a boolean indicating whether or not any
                 * items have been pushed and processed by the queue.
                 * @property {Function} running - a function returning the number of items
                 * currently being processed. Invoke with `queue.running()`.
                 * @property {Function} workersList - a function returning the array of items
                 * currently being processed. Invoke with `queue.workersList()`.
                 * @property {Function} idle - a function returning false if there are items
                 * waiting or being processed, or true if not. Invoke with `queue.idle()`.
                 * @property {number} concurrency - an integer for determining how many `worker`
                 * functions should be run in parallel. This property can be changed after a
                 * `queue` is created to alter the concurrency on-the-fly.
                 * @property {Function} push - add a new task to the `queue`. Calls `callback`
                 * once the `worker` has finished processing the task. Instead of a single task,
                 * a `tasks` array can be submitted. The respective callback is used for every
                 * task in the list. Invoke with `queue.push(task, [callback])`,
                 * @property {Function} unshift - add a new task to the front of the `queue`.
                 * Invoke with `queue.unshift(task, [callback])`.
                 * @property {Function} remove - remove items from the queue that match a test
                 * function.  The test function will be passed an object with a `data` property,
                 * and a `priority` property, if this is a
                 * [priorityQueue]{@link module:ControlFlow.priorityQueue} object.
                 * Invoked with `queue.remove(testFn)`, where `testFn` is of the form
                 * `function ({data, priority}) {}` and returns a Boolean.
                 * @property {Function} saturated - a callback that is called when the number of
                 * running workers hits the `concurrency` limit, and further tasks will be
                 * queued.
                 * @property {Function} unsaturated - a callback that is called when the number
                 * of running workers is less than the `concurrency` & `buffer` limits, and
                 * further tasks will not be queued.
                 * @property {number} buffer - A minimum threshold buffer in order to say that
                 * the `queue` is `unsaturated`.
                 * @property {Function} empty - a callback that is called when the last item
                 * from the `queue` is given to a `worker`.
                 * @property {Function} drain - a callback that is called when the last item
                 * from the `queue` has returned from the `worker`.
                 * @property {Function} error - a callback that is called when a task errors.
                 * Has the signature `function(error, task)`.
                 * @property {boolean} paused - a boolean for determining whether the queue is
                 * in a paused state.
                 * @property {Function} pause - a function that pauses the processing of tasks
                 * until `resume()` is called. Invoke with `queue.pause()`.
                 * @property {Function} resume - a function that resumes the processing of
                 * queued tasks when the queue is paused. Invoke with `queue.resume()`.
                 * @property {Function} kill - a function that removes the `drain` callback and
                 * empties remaining tasks from the queue forcing it to go idle. No more tasks
                 * should be pushed to the queue after calling this function. Invoke with `queue.kill()`.
                 */

                /**
                 * Creates a `queue` object with the specified `concurrency`. Tasks added to the
                 * `queue` are processed in parallel (up to the `concurrency` limit). If all
                 * `worker`s are in progress, the task is queued until one becomes available.
                 * Once a `worker` completes a `task`, that `task`'s callback is called.
                 *
                 * @name queue
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @category Control Flow
                 * @param {AsyncFunction} worker - An async function for processing a queued task.
                 * If you want to handle errors from an individual task, pass a callback to
                 * `q.push()`. Invoked with (task, callback).
                 * @param {number} [concurrency=1] - An `integer` for determining how many
                 * `worker` functions should be run in parallel.  If omitted, the concurrency
                 * defaults to `1`.  If the concurrency is `0`, an error is thrown.
                 * @returns {module:ControlFlow.QueueObject} A queue object to manage the tasks. Callbacks can
                 * attached as certain properties to listen for specific events during the
                 * lifecycle of the queue.
                 * @example
                 *
                 * // create a queue object with concurrency 2
                 * var q = async.queue(function(task, callback) {
                 *     console.log('hello ' + task.name);
                 *     callback();
                 * }, 2);
                 *
                 * // assign a callback
                 * q.drain = function() {
                 *     console.log('all items have been processed');
                 * };
                 *
                 * // add some items to the queue
                 * q.push({name: 'foo'}, function(err) {
                 *     console.log('finished processing foo');
                 * });
                 * q.push({name: 'bar'}, function (err) {
                 *     console.log('finished processing bar');
                 * });
                 *
                 * // add some items to the queue (batch-wise)
                 * q.push([{name: 'baz'},{name: 'bay'},{name: 'bax'}], function(err) {
                 *     console.log('finished processing item');
                 * });
                 *
                 * // add some items to the front of the queue
                 * q.unshift({name: 'bar'}, function (err) {
                 *     console.log('finished processing bar');
                 * });
                 */
                var queue$1 = function (worker, concurrency) {
                    var _worker = wrapAsync(worker);
                    return queue(
                        function (items, cb) {
                            _worker(items[0], cb);
                        },
                        concurrency,
                        1
                    );
                };

                /**
                 * The same as [async.queue]{@link module:ControlFlow.queue} only tasks are assigned a priority and
                 * completed in ascending priority order.
                 *
                 * @name priorityQueue
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @see [async.queue]{@link module:ControlFlow.queue}
                 * @category Control Flow
                 * @param {AsyncFunction} worker - An async function for processing a queued task.
                 * If you want to handle errors from an individual task, pass a callback to
                 * `q.push()`.
                 * Invoked with (task, callback).
                 * @param {number} concurrency - An `integer` for determining how many `worker`
                 * functions should be run in parallel.  If omitted, the concurrency defaults to
                 * `1`.  If the concurrency is `0`, an error is thrown.
                 * @returns {module:ControlFlow.QueueObject} A priorityQueue object to manage the tasks. There are two
                 * differences between `queue` and `priorityQueue` objects:
                 * * `push(task, priority, [callback])` - `priority` should be a number. If an
                 *   array of `tasks` is given, all tasks will be assigned the same priority.
                 * * The `unshift` method was removed.
                 */
                var priorityQueue = function (worker, concurrency) {
                    // Start with a normal queue
                    var q = queue$1(worker, concurrency);

                    // Override push to accept second parameter representing priority
                    q.push = function (data, priority, callback) {
                        if (callback == null) callback = noop;
                        if (typeof callback !== "function") {
                            throw new Error("task callback must be a function");
                        }
                        q.started = true;
                        if (!isArray(data)) {
                            data = [data];
                        }
                        if (data.length === 0) {
                            // call drain immediately if there are no tasks
                            return setImmediate$1(function () {
                                q.drain();
                            });
                        }

                        priority = priority || 0;
                        var nextNode = q._tasks.head;
                        while (nextNode && priority >= nextNode.priority) {
                            nextNode = nextNode.next;
                        }

                        for (var i = 0, l = data.length; i < l; i++) {
                            var item = {
                                data: data[i],
                                priority: priority,
                                callback: callback,
                            };

                            if (nextNode) {
                                q._tasks.insertBefore(nextNode, item);
                            } else {
                                q._tasks.push(item);
                            }
                        }
                        setImmediate$1(q.process);
                    };

                    // Remove unshift function
                    delete q.unshift;

                    return q;
                };

                /**
                 * Runs the `tasks` array of functions in parallel, without waiting until the
                 * previous function has completed. Once any of the `tasks` complete or pass an
                 * error to its callback, the main `callback` is immediately called. It's
                 * equivalent to `Promise.race()`.
                 *
                 * @name race
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @category Control Flow
                 * @param {Array} tasks - An array containing [async functions]{@link AsyncFunction}
                 * to run. Each function can complete with an optional `result` value.
                 * @param {Function} callback - A callback to run once any of the functions have
                 * completed. This function gets an error or result from the first function that
                 * completed. Invoked with (err, result).
                 * @returns undefined
                 * @example
                 *
                 * async.race([
                 *     function(callback) {
                 *         setTimeout(function() {
                 *             callback(null, 'one');
                 *         }, 200);
                 *     },
                 *     function(callback) {
                 *         setTimeout(function() {
                 *             callback(null, 'two');
                 *         }, 100);
                 *     }
                 * ],
                 * // main callback
                 * function(err, result) {
                 *     // the result will be equal to 'two' as it finishes earlier
                 * });
                 */
                function race(tasks, callback) {
                    callback = once(callback || noop);
                    if (!isArray(tasks))
                        return callback(
                            new TypeError(
                                "First argument to race must be an array of functions"
                            )
                        );
                    if (!tasks.length) return callback();
                    for (var i = 0, l = tasks.length; i < l; i++) {
                        wrapAsync(tasks[i])(callback);
                    }
                }

                /**
                 * Same as [`reduce`]{@link module:Collections.reduce}, only operates on `array` in reverse order.
                 *
                 * @name reduceRight
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.reduce]{@link module:Collections.reduce}
                 * @alias foldr
                 * @category Collection
                 * @param {Array} array - A collection to iterate over.
                 * @param {*} memo - The initial state of the reduction.
                 * @param {AsyncFunction} iteratee - A function applied to each item in the
                 * array to produce the next step in the reduction.
                 * The `iteratee` should complete with the next state of the reduction.
                 * If the iteratee complete with an error, the reduction is stopped and the
                 * main `callback` is immediately called with the error.
                 * Invoked with (memo, item, callback).
                 * @param {Function} [callback] - A callback which is called after all the
                 * `iteratee` functions have finished. Result is the reduced value. Invoked with
                 * (err, result).
                 */
                function reduceRight(array, memo, iteratee, callback) {
                    var reversed = slice(array).reverse();
                    reduce(reversed, memo, iteratee, callback);
                }

                /**
                 * Wraps the async function in another function that always completes with a
                 * result object, even when it errors.
                 *
                 * The result object has either the property `error` or `value`.
                 *
                 * @name reflect
                 * @static
                 * @memberOf module:Utils
                 * @method
                 * @category Util
                 * @param {AsyncFunction} fn - The async function you want to wrap
                 * @returns {Function} - A function that always passes null to it's callback as
                 * the error. The second argument to the callback will be an `object` with
                 * either an `error` or a `value` property.
                 * @example
                 *
                 * async.parallel([
                 *     async.reflect(function(callback) {
                 *         // do some stuff ...
                 *         callback(null, 'one');
                 *     }),
                 *     async.reflect(function(callback) {
                 *         // do some more stuff but error ...
                 *         callback('bad stuff happened');
                 *     }),
                 *     async.reflect(function(callback) {
                 *         // do some more stuff ...
                 *         callback(null, 'two');
                 *     })
                 * ],
                 * // optional callback
                 * function(err, results) {
                 *     // values
                 *     // results[0].value = 'one'
                 *     // results[1].error = 'bad stuff happened'
                 *     // results[2].value = 'two'
                 * });
                 */
                function reflect(fn) {
                    var _fn = wrapAsync(fn);
                    return initialParams(function reflectOn(
                        args,
                        reflectCallback
                    ) {
                        args.push(function callback(error, cbArg) {
                            if (error) {
                                reflectCallback(null, { error: error });
                            } else {
                                var value;
                                if (arguments.length <= 2) {
                                    value = cbArg;
                                } else {
                                    value = slice(arguments, 1);
                                }
                                reflectCallback(null, { value: value });
                            }
                        });

                        return _fn.apply(this, args);
                    });
                }

                /**
                 * A helper function that wraps an array or an object of functions with `reflect`.
                 *
                 * @name reflectAll
                 * @static
                 * @memberOf module:Utils
                 * @method
                 * @see [async.reflect]{@link module:Utils.reflect}
                 * @category Util
                 * @param {Array|Object|Iterable} tasks - The collection of
                 * [async functions]{@link AsyncFunction} to wrap in `async.reflect`.
                 * @returns {Array} Returns an array of async functions, each wrapped in
                 * `async.reflect`
                 * @example
                 *
                 * let tasks = [
                 *     function(callback) {
                 *         setTimeout(function() {
                 *             callback(null, 'one');
                 *         }, 200);
                 *     },
                 *     function(callback) {
                 *         // do some more stuff but error ...
                 *         callback(new Error('bad stuff happened'));
                 *     },
                 *     function(callback) {
                 *         setTimeout(function() {
                 *             callback(null, 'two');
                 *         }, 100);
                 *     }
                 * ];
                 *
                 * async.parallel(async.reflectAll(tasks),
                 * // optional callback
                 * function(err, results) {
                 *     // values
                 *     // results[0].value = 'one'
                 *     // results[1].error = Error('bad stuff happened')
                 *     // results[2].value = 'two'
                 * });
                 *
                 * // an example using an object instead of an array
                 * let tasks = {
                 *     one: function(callback) {
                 *         setTimeout(function() {
                 *             callback(null, 'one');
                 *         }, 200);
                 *     },
                 *     two: function(callback) {
                 *         callback('two');
                 *     },
                 *     three: function(callback) {
                 *         setTimeout(function() {
                 *             callback(null, 'three');
                 *         }, 100);
                 *     }
                 * };
                 *
                 * async.parallel(async.reflectAll(tasks),
                 * // optional callback
                 * function(err, results) {
                 *     // values
                 *     // results.one.value = 'one'
                 *     // results.two.error = 'two'
                 *     // results.three.value = 'three'
                 * });
                 */
                function reflectAll(tasks) {
                    var results;
                    if (isArray(tasks)) {
                        results = arrayMap(tasks, reflect);
                    } else {
                        results = {};
                        baseForOwn(tasks, function (task, key) {
                            results[key] = reflect.call(this, task);
                        });
                    }
                    return results;
                }

                function reject$1(eachfn, arr, iteratee, callback) {
                    _filter(
                        eachfn,
                        arr,
                        function (value, cb) {
                            iteratee(value, function (err, v) {
                                cb(err, !v);
                            });
                        },
                        callback
                    );
                }

                /**
                 * The opposite of [`filter`]{@link module:Collections.filter}. Removes values that pass an `async` truth test.
                 *
                 * @name reject
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.filter]{@link module:Collections.filter}
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {Function} iteratee - An async truth test to apply to each item in
                 * `coll`.
                 * The should complete with a boolean value as its `result`.
                 * Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called after all the
                 * `iteratee` functions have finished. Invoked with (err, results).
                 * @example
                 *
                 * async.reject(['file1','file2','file3'], function(filePath, callback) {
                 *     fs.access(filePath, function(err) {
                 *         callback(null, !err)
                 *     });
                 * }, function(err, results) {
                 *     // results now equals an array of missing files
                 *     createFiles(results);
                 * });
                 */
                var reject = doParallel(reject$1);

                /**
                 * The same as [`reject`]{@link module:Collections.reject} but runs a maximum of `limit` async operations at a
                 * time.
                 *
                 * @name rejectLimit
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.reject]{@link module:Collections.reject}
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {number} limit - The maximum number of async operations at a time.
                 * @param {Function} iteratee - An async truth test to apply to each item in
                 * `coll`.
                 * The should complete with a boolean value as its `result`.
                 * Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called after all the
                 * `iteratee` functions have finished. Invoked with (err, results).
                 */
                var rejectLimit = doParallelLimit(reject$1);

                /**
                 * The same as [`reject`]{@link module:Collections.reject} but runs only a single async operation at a time.
                 *
                 * @name rejectSeries
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.reject]{@link module:Collections.reject}
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {Function} iteratee - An async truth test to apply to each item in
                 * `coll`.
                 * The should complete with a boolean value as its `result`.
                 * Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called after all the
                 * `iteratee` functions have finished. Invoked with (err, results).
                 */
                var rejectSeries = doLimit(rejectLimit, 1);

                /**
                 * Creates a function that returns `value`.
                 *
                 * @static
                 * @memberOf _
                 * @since 2.4.0
                 * @category Util
                 * @param {*} value The value to return from the new function.
                 * @returns {Function} Returns the new constant function.
                 * @example
                 *
                 * var objects = _.times(2, _.constant({ 'a': 1 }));
                 *
                 * console.log(objects);
                 * // => [{ 'a': 1 }, { 'a': 1 }]
                 *
                 * console.log(objects[0] === objects[1]);
                 * // => true
                 */
                function constant$1(value) {
                    return function () {
                        return value;
                    };
                }

                /**
                 * Attempts to get a successful response from `task` no more than `times` times
                 * before returning an error. If the task is successful, the `callback` will be
                 * passed the result of the successful task. If all attempts fail, the callback
                 * will be passed the error and result (if any) of the final attempt.
                 *
                 * @name retry
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @category Control Flow
                 * @see [async.retryable]{@link module:ControlFlow.retryable}
                 * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - Can be either an
                 * object with `times` and `interval` or a number.
                 * * `times` - The number of attempts to make before giving up.  The default
                 *   is `5`.
                 * * `interval` - The time to wait between retries, in milliseconds.  The
                 *   default is `0`. The interval may also be specified as a function of the
                 *   retry count (see example).
                 * * `errorFilter` - An optional synchronous function that is invoked on
                 *   erroneous result. If it returns `true` the retry attempts will continue;
                 *   if the function returns `false` the retry flow is aborted with the current
                 *   attempt's error and result being returned to the final callback.
                 *   Invoked with (err).
                 * * If `opts` is a number, the number specifies the number of times to retry,
                 *   with the default interval of `0`.
                 * @param {AsyncFunction} task - An async function to retry.
                 * Invoked with (callback).
                 * @param {Function} [callback] - An optional callback which is called when the
                 * task has succeeded, or after the final failed attempt. It receives the `err`
                 * and `result` arguments of the last attempt at completing the `task`. Invoked
                 * with (err, results).
                 *
                 * @example
                 *
                 * // The `retry` function can be used as a stand-alone control flow by passing
                 * // a callback, as shown below:
                 *
                 * // try calling apiMethod 3 times
                 * async.retry(3, apiMethod, function(err, result) {
                 *     // do something with the result
                 * });
                 *
                 * // try calling apiMethod 3 times, waiting 200 ms between each retry
                 * async.retry({times: 3, interval: 200}, apiMethod, function(err, result) {
                 *     // do something with the result
                 * });
                 *
                 * // try calling apiMethod 10 times with exponential backoff
                 * // (i.e. intervals of 100, 200, 400, 800, 1600, ... milliseconds)
                 * async.retry({
                 *   times: 10,
                 *   interval: function(retryCount) {
                 *     return 50 * Math.pow(2, retryCount);
                 *   }
                 * }, apiMethod, function(err, result) {
                 *     // do something with the result
                 * });
                 *
                 * // try calling apiMethod the default 5 times no delay between each retry
                 * async.retry(apiMethod, function(err, result) {
                 *     // do something with the result
                 * });
                 *
                 * // try calling apiMethod only when error condition satisfies, all other
                 * // errors will abort the retry control flow and return to final callback
                 * async.retry({
                 *   errorFilter: function(err) {
                 *     return err.message === 'Temporary error'; // only retry on a specific error
                 *   }
                 * }, apiMethod, function(err, result) {
                 *     // do something with the result
                 * });
                 *
                 * // to retry individual methods that are not as reliable within other
                 * // control flow functions, use the `retryable` wrapper:
                 * async.auto({
                 *     users: api.getUsers.bind(api),
                 *     payments: async.retryable(3, api.getPayments.bind(api))
                 * }, function(err, results) {
                 *     // do something with the results
                 * });
                 *
                 */
                function retry(opts, task, callback) {
                    var DEFAULT_TIMES = 5;
                    var DEFAULT_INTERVAL = 0;

                    var options = {
                        times: DEFAULT_TIMES,
                        intervalFunc: constant$1(DEFAULT_INTERVAL),
                    };

                    function parseTimes(acc, t) {
                        if (typeof t === "object") {
                            acc.times = +t.times || DEFAULT_TIMES;

                            acc.intervalFunc =
                                typeof t.interval === "function"
                                    ? t.interval
                                    : constant$1(
                                          +t.interval || DEFAULT_INTERVAL
                                      );

                            acc.errorFilter = t.errorFilter;
                        } else if (
                            typeof t === "number" ||
                            typeof t === "string"
                        ) {
                            acc.times = +t || DEFAULT_TIMES;
                        } else {
                            throw new Error(
                                "Invalid arguments for async.retry"
                            );
                        }
                    }

                    if (arguments.length < 3 && typeof opts === "function") {
                        callback = task || noop;
                        task = opts;
                    } else {
                        parseTimes(options, opts);
                        callback = callback || noop;
                    }

                    if (typeof task !== "function") {
                        throw new Error("Invalid arguments for async.retry");
                    }

                    var _task = wrapAsync(task);

                    var attempt = 1;
                    function retryAttempt() {
                        _task(function (err) {
                            if (
                                err &&
                                attempt++ < options.times &&
                                (typeof options.errorFilter != "function" ||
                                    options.errorFilter(err))
                            ) {
                                setTimeout(
                                    retryAttempt,
                                    options.intervalFunc(attempt)
                                );
                            } else {
                                callback.apply(null, arguments);
                            }
                        });
                    }

                    retryAttempt();
                }

                /**
                 * A close relative of [`retry`]{@link module:ControlFlow.retry}.  This method
                 * wraps a task and makes it retryable, rather than immediately calling it
                 * with retries.
                 *
                 * @name retryable
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @see [async.retry]{@link module:ControlFlow.retry}
                 * @category Control Flow
                 * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - optional
                 * options, exactly the same as from `retry`
                 * @param {AsyncFunction} task - the asynchronous function to wrap.
                 * This function will be passed any arguments passed to the returned wrapper.
                 * Invoked with (...args, callback).
                 * @returns {AsyncFunction} The wrapped function, which when invoked, will
                 * retry on an error, based on the parameters specified in `opts`.
                 * This function will accept the same parameters as `task`.
                 * @example
                 *
                 * async.auto({
                 *     dep1: async.retryable(3, getFromFlakyService),
                 *     process: ["dep1", async.retryable(3, function (results, cb) {
                 *         maybeProcessData(results.dep1, cb);
                 *     })]
                 * }, callback);
                 */
                var retryable = function (opts, task) {
                    if (!task) {
                        task = opts;
                        opts = null;
                    }
                    var _task = wrapAsync(task);
                    return initialParams(function (args, callback) {
                        function taskFn(cb) {
                            _task.apply(null, args.concat(cb));
                        }

                        if (opts) retry(opts, taskFn, callback);
                        else retry(taskFn, callback);
                    });
                };

                /**
                 * Run the functions in the `tasks` collection in series, each one running once
                 * the previous function has completed. If any functions in the series pass an
                 * error to its callback, no more functions are run, and `callback` is
                 * immediately called with the value of the error. Otherwise, `callback`
                 * receives an array of results when `tasks` have completed.
                 *
                 * It is also possible to use an object instead of an array. Each property will
                 * be run as a function, and the results will be passed to the final `callback`
                 * as an object instead of an array. This can be a more readable way of handling
                 *  results from {@link async.series}.
                 *
                 * **Note** that while many implementations preserve the order of object
                 * properties, the [ECMAScript Language Specification](http://www.ecma-international.org/ecma-262/5.1/#sec-8.6)
                 * explicitly states that
                 *
                 * > The mechanics and order of enumerating the properties is not specified.
                 *
                 * So if you rely on the order in which your series of functions are executed,
                 * and want this to work on all platforms, consider using an array.
                 *
                 * @name series
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @category Control Flow
                 * @param {Array|Iterable|Object} tasks - A collection containing
                 * [async functions]{@link AsyncFunction} to run in series.
                 * Each function can complete with any number of optional `result` values.
                 * @param {Function} [callback] - An optional callback to run once all the
                 * functions have completed. This function gets a results array (or object)
                 * containing all the result arguments passed to the `task` callbacks. Invoked
                 * with (err, result).
                 * @example
                 * async.series([
                 *     function(callback) {
                 *         // do some stuff ...
                 *         callback(null, 'one');
                 *     },
                 *     function(callback) {
                 *         // do some more stuff ...
                 *         callback(null, 'two');
                 *     }
                 * ],
                 * // optional callback
                 * function(err, results) {
                 *     // results is now equal to ['one', 'two']
                 * });
                 *
                 * async.series({
                 *     one: function(callback) {
                 *         setTimeout(function() {
                 *             callback(null, 1);
                 *         }, 200);
                 *     },
                 *     two: function(callback){
                 *         setTimeout(function() {
                 *             callback(null, 2);
                 *         }, 100);
                 *     }
                 * }, function(err, results) {
                 *     // results is now equal to: {one: 1, two: 2}
                 * });
                 */
                function series(tasks, callback) {
                    _parallel(eachOfSeries, tasks, callback);
                }

                /**
                 * Returns `true` if at least one element in the `coll` satisfies an async test.
                 * If any iteratee call returns `true`, the main `callback` is immediately
                 * called.
                 *
                 * @name some
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @alias any
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
                 * in the collections in parallel.
                 * The iteratee should complete with a boolean `result` value.
                 * Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called as soon as any
                 * iteratee returns `true`, or after all the iteratee functions have finished.
                 * Result will be either `true` or `false` depending on the values of the async
                 * tests. Invoked with (err, result).
                 * @example
                 *
                 * async.some(['file1','file2','file3'], function(filePath, callback) {
                 *     fs.access(filePath, function(err) {
                 *         callback(null, !err)
                 *     });
                 * }, function(err, result) {
                 *     // if result is true then at least one of the files exists
                 * });
                 */
                var some = doParallel(_createTester(Boolean, identity));

                /**
                 * The same as [`some`]{@link module:Collections.some} but runs a maximum of `limit` async operations at a time.
                 *
                 * @name someLimit
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.some]{@link module:Collections.some}
                 * @alias anyLimit
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {number} limit - The maximum number of async operations at a time.
                 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
                 * in the collections in parallel.
                 * The iteratee should complete with a boolean `result` value.
                 * Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called as soon as any
                 * iteratee returns `true`, or after all the iteratee functions have finished.
                 * Result will be either `true` or `false` depending on the values of the async
                 * tests. Invoked with (err, result).
                 */
                var someLimit = doParallelLimit(
                    _createTester(Boolean, identity)
                );

                /**
                 * The same as [`some`]{@link module:Collections.some} but runs only a single async operation at a time.
                 *
                 * @name someSeries
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @see [async.some]{@link module:Collections.some}
                 * @alias anySeries
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
                 * in the collections in series.
                 * The iteratee should complete with a boolean `result` value.
                 * Invoked with (item, callback).
                 * @param {Function} [callback] - A callback which is called as soon as any
                 * iteratee returns `true`, or after all the iteratee functions have finished.
                 * Result will be either `true` or `false` depending on the values of the async
                 * tests. Invoked with (err, result).
                 */
                var someSeries = doLimit(someLimit, 1);

                /**
                 * Sorts a list by the results of running each `coll` value through an async
                 * `iteratee`.
                 *
                 * @name sortBy
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {AsyncFunction} iteratee - An async function to apply to each item in
                 * `coll`.
                 * The iteratee should complete with a value to use as the sort criteria as
                 * its `result`.
                 * Invoked with (item, callback).
                 * @param {Function} callback - A callback which is called after all the
                 * `iteratee` functions have finished, or an error occurs. Results is the items
                 * from the original `coll` sorted by the values returned by the `iteratee`
                 * calls. Invoked with (err, results).
                 * @example
                 *
                 * async.sortBy(['file1','file2','file3'], function(file, callback) {
                 *     fs.stat(file, function(err, stats) {
                 *         callback(err, stats.mtime);
                 *     });
                 * }, function(err, results) {
                 *     // results is now the original array of files sorted by
                 *     // modified date
                 * });
                 *
                 * // By modifying the callback parameter the
                 * // sorting order can be influenced:
                 *
                 * // ascending order
                 * async.sortBy([1,9,3,5], function(x, callback) {
                 *     callback(null, x);
                 * }, function(err,result) {
                 *     // result callback
                 * });
                 *
                 * // descending order
                 * async.sortBy([1,9,3,5], function(x, callback) {
                 *     callback(null, x*-1);    //<- x*-1 instead of x, turns the order around
                 * }, function(err,result) {
                 *     // result callback
                 * });
                 */
                function sortBy(coll, iteratee, callback) {
                    var _iteratee = wrapAsync(iteratee);
                    map(
                        coll,
                        function (x, callback) {
                            _iteratee(x, function (err, criteria) {
                                if (err) return callback(err);
                                callback(null, {
                                    value: x,
                                    criteria: criteria,
                                });
                            });
                        },
                        function (err, results) {
                            if (err) return callback(err);
                            callback(
                                null,
                                arrayMap(
                                    results.sort(comparator),
                                    baseProperty("value")
                                )
                            );
                        }
                    );

                    function comparator(left, right) {
                        var a = left.criteria,
                            b = right.criteria;
                        return a < b ? -1 : a > b ? 1 : 0;
                    }
                }

                /**
                 * Sets a time limit on an asynchronous function. If the function does not call
                 * its callback within the specified milliseconds, it will be called with a
                 * timeout error. The code property for the error object will be `'ETIMEDOUT'`.
                 *
                 * @name timeout
                 * @static
                 * @memberOf module:Utils
                 * @method
                 * @category Util
                 * @param {AsyncFunction} asyncFn - The async function to limit in time.
                 * @param {number} milliseconds - The specified time limit.
                 * @param {*} [info] - Any variable you want attached (`string`, `object`, etc)
                 * to timeout Error for more information..
                 * @returns {AsyncFunction} Returns a wrapped function that can be used with any
                 * of the control flow functions.
                 * Invoke this function with the same parameters as you would `asyncFunc`.
                 * @example
                 *
                 * function myFunction(foo, callback) {
                 *     doAsyncTask(foo, function(err, data) {
                 *         // handle errors
                 *         if (err) return callback(err);
                 *
                 *         // do some stuff ...
                 *
                 *         // return processed data
                 *         return callback(null, data);
                 *     });
                 * }
                 *
                 * var wrapped = async.timeout(myFunction, 1000);
                 *
                 * // call `wrapped` as you would `myFunction`
                 * wrapped({ bar: 'bar' }, function(err, data) {
                 *     // if `myFunction` takes < 1000 ms to execute, `err`
                 *     // and `data` will have their expected values
                 *
                 *     // else `err` will be an Error with the code 'ETIMEDOUT'
                 * });
                 */
                function timeout(asyncFn, milliseconds, info) {
                    var fn = wrapAsync(asyncFn);

                    return initialParams(function (args, callback) {
                        var timedOut = false;
                        var timer;

                        function timeoutCallback() {
                            var name = asyncFn.name || "anonymous";
                            var error = new Error(
                                'Callback function "' + name + '" timed out.'
                            );
                            error.code = "ETIMEDOUT";
                            if (info) {
                                error.info = info;
                            }
                            timedOut = true;
                            callback(error);
                        }

                        args.push(function () {
                            if (!timedOut) {
                                callback.apply(null, arguments);
                                clearTimeout(timer);
                            }
                        });

                        // setup timer and call original function
                        timer = setTimeout(timeoutCallback, milliseconds);
                        fn.apply(null, args);
                    });
                }

                /* Built-in method references for those with the same name as other `lodash` methods. */
                var nativeCeil = Math.ceil;
                var nativeMax = Math.max;

                /**
                 * The base implementation of `_.range` and `_.rangeRight` which doesn't
                 * coerce arguments.
                 *
                 * @private
                 * @param {number} start The start of the range.
                 * @param {number} end The end of the range.
                 * @param {number} step The value to increment or decrement by.
                 * @param {boolean} [fromRight] Specify iterating from right to left.
                 * @returns {Array} Returns the range of numbers.
                 */
                function baseRange(start, end, step, fromRight) {
                    var index = -1,
                        length = nativeMax(
                            nativeCeil((end - start) / (step || 1)),
                            0
                        ),
                        result = Array(length);

                    while (length--) {
                        result[fromRight ? length : ++index] = start;
                        start += step;
                    }
                    return result;
                }

                /**
                 * The same as [times]{@link module:ControlFlow.times} but runs a maximum of `limit` async operations at a
                 * time.
                 *
                 * @name timesLimit
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @see [async.times]{@link module:ControlFlow.times}
                 * @category Control Flow
                 * @param {number} count - The number of times to run the function.
                 * @param {number} limit - The maximum number of async operations at a time.
                 * @param {AsyncFunction} iteratee - The async function to call `n` times.
                 * Invoked with the iteration index and a callback: (n, next).
                 * @param {Function} callback - see [async.map]{@link module:Collections.map}.
                 */
                function timeLimit(count, limit, iteratee, callback) {
                    var _iteratee = wrapAsync(iteratee);
                    mapLimit(
                        baseRange(0, count, 1),
                        limit,
                        _iteratee,
                        callback
                    );
                }

                /**
                 * Calls the `iteratee` function `n` times, and accumulates results in the same
                 * manner you would use with [map]{@link module:Collections.map}.
                 *
                 * @name times
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @see [async.map]{@link module:Collections.map}
                 * @category Control Flow
                 * @param {number} n - The number of times to run the function.
                 * @param {AsyncFunction} iteratee - The async function to call `n` times.
                 * Invoked with the iteration index and a callback: (n, next).
                 * @param {Function} callback - see {@link module:Collections.map}.
                 * @example
                 *
                 * // Pretend this is some complicated async factory
                 * var createUser = function(id, callback) {
                 *     callback(null, {
                 *         id: 'user' + id
                 *     });
                 * };
                 *
                 * // generate 5 users
                 * async.times(5, function(n, next) {
                 *     createUser(n, function(err, user) {
                 *         next(err, user);
                 *     });
                 * }, function(err, users) {
                 *     // we should now have 5 users
                 * });
                 */
                var times = doLimit(timeLimit, Infinity);

                /**
                 * The same as [times]{@link module:ControlFlow.times} but runs only a single async operation at a time.
                 *
                 * @name timesSeries
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @see [async.times]{@link module:ControlFlow.times}
                 * @category Control Flow
                 * @param {number} n - The number of times to run the function.
                 * @param {AsyncFunction} iteratee - The async function to call `n` times.
                 * Invoked with the iteration index and a callback: (n, next).
                 * @param {Function} callback - see {@link module:Collections.map}.
                 */
                var timesSeries = doLimit(timeLimit, 1);

                /**
                 * A relative of `reduce`.  Takes an Object or Array, and iterates over each
                 * element in series, each step potentially mutating an `accumulator` value.
                 * The type of the accumulator defaults to the type of collection passed in.
                 *
                 * @name transform
                 * @static
                 * @memberOf module:Collections
                 * @method
                 * @category Collection
                 * @param {Array|Iterable|Object} coll - A collection to iterate over.
                 * @param {*} [accumulator] - The initial state of the transform.  If omitted,
                 * it will default to an empty Object or Array, depending on the type of `coll`
                 * @param {AsyncFunction} iteratee - A function applied to each item in the
                 * collection that potentially modifies the accumulator.
                 * Invoked with (accumulator, item, key, callback).
                 * @param {Function} [callback] - A callback which is called after all the
                 * `iteratee` functions have finished. Result is the transformed accumulator.
                 * Invoked with (err, result).
                 * @example
                 *
                 * async.transform([1,2,3], function(acc, item, index, callback) {
                 *     // pointless async:
                 *     process.nextTick(function() {
                 *         acc.push(item * 2)
                 *         callback(null)
                 *     });
                 * }, function(err, result) {
                 *     // result is now equal to [2, 4, 6]
                 * });
                 *
                 * @example
                 *
                 * async.transform({a: 1, b: 2, c: 3}, function (obj, val, key, callback) {
                 *     setImmediate(function () {
                 *         obj[key] = val * 2;
                 *         callback();
                 *     })
                 * }, function (err, result) {
                 *     // result is equal to {a: 2, b: 4, c: 6}
                 * })
                 */
                function transform(coll, accumulator, iteratee, callback) {
                    if (arguments.length <= 3) {
                        callback = iteratee;
                        iteratee = accumulator;
                        accumulator = isArray(coll) ? [] : {};
                    }
                    callback = once(callback || noop);
                    var _iteratee = wrapAsync(iteratee);

                    eachOf(
                        coll,
                        function (v, k, cb) {
                            _iteratee(accumulator, v, k, cb);
                        },
                        function (err) {
                            callback(err, accumulator);
                        }
                    );
                }

                /**
                 * It runs each task in series but stops whenever any of the functions were
                 * successful. If one of the tasks were successful, the `callback` will be
                 * passed the result of the successful task. If all tasks fail, the callback
                 * will be passed the error and result (if any) of the final attempt.
                 *
                 * @name tryEach
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @category Control Flow
                 * @param {Array|Iterable|Object} tasks - A collection containing functions to
                 * run, each function is passed a `callback(err, result)` it must call on
                 * completion with an error `err` (which can be `null`) and an optional `result`
                 * value.
                 * @param {Function} [callback] - An optional callback which is called when one
                 * of the tasks has succeeded, or all have failed. It receives the `err` and
                 * `result` arguments of the last attempt at completing the `task`. Invoked with
                 * (err, results).
                 * @example
                 * async.tryEach([
                 *     function getDataFromFirstWebsite(callback) {
                 *         // Try getting the data from the first website
                 *         callback(err, data);
                 *     },
                 *     function getDataFromSecondWebsite(callback) {
                 *         // First website failed,
                 *         // Try getting the data from the backup website
                 *         callback(err, data);
                 *     }
                 * ],
                 * // optional callback
                 * function(err, results) {
                 *     Now do something with the data.
                 * });
                 *
                 */
                function tryEach(tasks, callback) {
                    var error = null;
                    var result;
                    callback = callback || noop;
                    eachSeries(
                        tasks,
                        function (task, callback) {
                            wrapAsync(task)(function (err, res /*, ...args*/) {
                                if (arguments.length > 2) {
                                    result = slice(arguments, 1);
                                } else {
                                    result = res;
                                }
                                error = err;
                                callback(!err);
                            });
                        },
                        function () {
                            callback(error, result);
                        }
                    );
                }

                /**
                 * Undoes a [memoize]{@link module:Utils.memoize}d function, reverting it to the original,
                 * unmemoized form. Handy for testing.
                 *
                 * @name unmemoize
                 * @static
                 * @memberOf module:Utils
                 * @method
                 * @see [async.memoize]{@link module:Utils.memoize}
                 * @category Util
                 * @param {AsyncFunction} fn - the memoized function
                 * @returns {AsyncFunction} a function that calls the original unmemoized function
                 */
                function unmemoize(fn) {
                    return function () {
                        return (fn.unmemoized || fn).apply(null, arguments);
                    };
                }

                /**
                 * Repeatedly call `iteratee`, while `test` returns `true`. Calls `callback` when
                 * stopped, or an error occurs.
                 *
                 * @name whilst
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @category Control Flow
                 * @param {Function} test - synchronous truth test to perform before each
                 * execution of `iteratee`. Invoked with ().
                 * @param {AsyncFunction} iteratee - An async function which is called each time
                 * `test` passes. Invoked with (callback).
                 * @param {Function} [callback] - A callback which is called after the test
                 * function has failed and repeated execution of `iteratee` has stopped. `callback`
                 * will be passed an error and any arguments passed to the final `iteratee`'s
                 * callback. Invoked with (err, [results]);
                 * @returns undefined
                 * @example
                 *
                 * var count = 0;
                 * async.whilst(
                 *     function() { return count < 5; },
                 *     function(callback) {
                 *         count++;
                 *         setTimeout(function() {
                 *             callback(null, count);
                 *         }, 1000);
                 *     },
                 *     function (err, n) {
                 *         // 5 seconds have passed, n = 5
                 *     }
                 * );
                 */
                function whilst(test, iteratee, callback) {
                    callback = onlyOnce(callback || noop);
                    var _iteratee = wrapAsync(iteratee);
                    if (!test()) return callback(null);
                    var next = function (err /*, ...args*/) {
                        if (err) return callback(err);
                        if (test()) return _iteratee(next);
                        var args = slice(arguments, 1);
                        callback.apply(null, [null].concat(args));
                    };
                    _iteratee(next);
                }

                /**
                 * Repeatedly call `iteratee` until `test` returns `true`. Calls `callback` when
                 * stopped, or an error occurs. `callback` will be passed an error and any
                 * arguments passed to the final `iteratee`'s callback.
                 *
                 * The inverse of [whilst]{@link module:ControlFlow.whilst}.
                 *
                 * @name until
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @see [async.whilst]{@link module:ControlFlow.whilst}
                 * @category Control Flow
                 * @param {Function} test - synchronous truth test to perform before each
                 * execution of `iteratee`. Invoked with ().
                 * @param {AsyncFunction} iteratee - An async function which is called each time
                 * `test` fails. Invoked with (callback).
                 * @param {Function} [callback] - A callback which is called after the test
                 * function has passed and repeated execution of `iteratee` has stopped. `callback`
                 * will be passed an error and any arguments passed to the final `iteratee`'s
                 * callback. Invoked with (err, [results]);
                 */
                function until(test, iteratee, callback) {
                    whilst(
                        function () {
                            return !test.apply(this, arguments);
                        },
                        iteratee,
                        callback
                    );
                }

                /**
                 * Runs the `tasks` array of functions in series, each passing their results to
                 * the next in the array. However, if any of the `tasks` pass an error to their
                 * own callback, the next function is not executed, and the main `callback` is
                 * immediately called with the error.
                 *
                 * @name waterfall
                 * @static
                 * @memberOf module:ControlFlow
                 * @method
                 * @category Control Flow
                 * @param {Array} tasks - An array of [async functions]{@link AsyncFunction}
                 * to run.
                 * Each function should complete with any number of `result` values.
                 * The `result` values will be passed as arguments, in order, to the next task.
                 * @param {Function} [callback] - An optional callback to run once all the
                 * functions have completed. This will be passed the results of the last task's
                 * callback. Invoked with (err, [results]).
                 * @returns undefined
                 * @example
                 *
                 * async.waterfall([
                 *     function(callback) {
                 *         callback(null, 'one', 'two');
                 *     },
                 *     function(arg1, arg2, callback) {
                 *         // arg1 now equals 'one' and arg2 now equals 'two'
                 *         callback(null, 'three');
                 *     },
                 *     function(arg1, callback) {
                 *         // arg1 now equals 'three'
                 *         callback(null, 'done');
                 *     }
                 * ], function (err, result) {
                 *     // result now equals 'done'
                 * });
                 *
                 * // Or, with named functions:
                 * async.waterfall([
                 *     myFirstFunction,
                 *     mySecondFunction,
                 *     myLastFunction,
                 * ], function (err, result) {
                 *     // result now equals 'done'
                 * });
                 * function myFirstFunction(callback) {
                 *     callback(null, 'one', 'two');
                 * }
                 * function mySecondFunction(arg1, arg2, callback) {
                 *     // arg1 now equals 'one' and arg2 now equals 'two'
                 *     callback(null, 'three');
                 * }
                 * function myLastFunction(arg1, callback) {
                 *     // arg1 now equals 'three'
                 *     callback(null, 'done');
                 * }
                 */
                var waterfall = function (tasks, callback) {
                    callback = once(callback || noop);
                    if (!isArray(tasks))
                        return callback(
                            new Error(
                                "First argument to waterfall must be an array of functions"
                            )
                        );
                    if (!tasks.length) return callback();
                    var taskIndex = 0;

                    function nextTask(args) {
                        var task = wrapAsync(tasks[taskIndex++]);
                        args.push(onlyOnce(next));
                        task.apply(null, args);
                    }

                    function next(err /*, ...args*/) {
                        if (err || taskIndex === tasks.length) {
                            return callback.apply(null, arguments);
                        }
                        nextTask(slice(arguments, 1));
                    }

                    nextTask([]);
                };

                /**
                 * An "async function" in the context of Async is an asynchronous function with
                 * a variable number of parameters, with the final parameter being a callback.
                 * (`function (arg1, arg2, ..., callback) {}`)
                 * The final callback is of the form `callback(err, results...)`, which must be
                 * called once the function is completed.  The callback should be called with a
                 * Error as its first argument to signal that an error occurred.
                 * Otherwise, if no error occurred, it should be called with `null` as the first
                 * argument, and any additional `result` arguments that may apply, to signal
                 * successful completion.
                 * The callback must be called exactly once, ideally on a later tick of the
                 * JavaScript event loop.
                 *
                 * This type of function is also referred to as a "Node-style async function",
                 * or a "continuation passing-style function" (CPS). Most of the methods of this
                 * library are themselves CPS/Node-style async functions, or functions that
                 * return CPS/Node-style async functions.
                 *
                 * Wherever we accept a Node-style async function, we also directly accept an
                 * [ES2017 `async` function]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function}.
                 * In this case, the `async` function will not be passed a final callback
                 * argument, and any thrown error will be used as the `err` argument of the
                 * implicit callback, and the return value will be used as the `result` value.
                 * (i.e. a `rejected` of the returned Promise becomes the `err` callback
                 * argument, and a `resolved` value becomes the `result`.)
                 *
                 * Note, due to JavaScript limitations, we can only detect native `async`
                 * functions and not transpilied implementations.
                 * Your environment must have `async`/`await` support for this to work.
                 * (e.g. Node > v7.6, or a recent version of a modern browser).
                 * If you are using `async` functions through a transpiler (e.g. Babel), you
                 * must still wrap the function with [asyncify]{@link module:Utils.asyncify},
                 * because the `async function` will be compiled to an ordinary function that
                 * returns a promise.
                 *
                 * @typedef {Function} AsyncFunction
                 * @static
                 */

                /**
                 * Async is a utility module which provides straight-forward, powerful functions
                 * for working with asynchronous JavaScript. Although originally designed for
                 * use with [Node.js](http://nodejs.org) and installable via
                 * `npm install --save async`, it can also be used directly in the browser.
                 * @module async
                 * @see AsyncFunction
                 */

                /**
                 * A collection of `async` functions for manipulating collections, such as
                 * arrays and objects.
                 * @module Collections
                 */

                /**
                 * A collection of `async` functions for controlling the flow through a script.
                 * @module ControlFlow
                 */

                /**
                 * A collection of `async` utility functions.
                 * @module Utils
                 */

                var index = {
                    apply: apply,
                    applyEach: applyEach,
                    applyEachSeries: applyEachSeries,
                    asyncify: asyncify,
                    auto: auto,
                    autoInject: autoInject,
                    cargo: cargo,
                    compose: compose,
                    concat: concat,
                    concatLimit: concatLimit,
                    concatSeries: concatSeries,
                    constant: constant,
                    detect: detect,
                    detectLimit: detectLimit,
                    detectSeries: detectSeries,
                    dir: dir,
                    doDuring: doDuring,
                    doUntil: doUntil,
                    doWhilst: doWhilst,
                    during: during,
                    each: eachLimit,
                    eachLimit: eachLimit$1,
                    eachOf: eachOf,
                    eachOfLimit: eachOfLimit,
                    eachOfSeries: eachOfSeries,
                    eachSeries: eachSeries,
                    ensureAsync: ensureAsync,
                    every: every,
                    everyLimit: everyLimit,
                    everySeries: everySeries,
                    filter: filter,
                    filterLimit: filterLimit,
                    filterSeries: filterSeries,
                    forever: forever,
                    groupBy: groupBy,
                    groupByLimit: groupByLimit,
                    groupBySeries: groupBySeries,
                    log: log,
                    map: map,
                    mapLimit: mapLimit,
                    mapSeries: mapSeries,
                    mapValues: mapValues,
                    mapValuesLimit: mapValuesLimit,
                    mapValuesSeries: mapValuesSeries,
                    memoize: memoize,
                    nextTick: nextTick,
                    parallel: parallelLimit,
                    parallelLimit: parallelLimit$1,
                    priorityQueue: priorityQueue,
                    queue: queue$1,
                    race: race,
                    reduce: reduce,
                    reduceRight: reduceRight,
                    reflect: reflect,
                    reflectAll: reflectAll,
                    reject: reject,
                    rejectLimit: rejectLimit,
                    rejectSeries: rejectSeries,
                    retry: retry,
                    retryable: retryable,
                    seq: seq,
                    series: series,
                    setImmediate: setImmediate$1,
                    some: some,
                    someLimit: someLimit,
                    someSeries: someSeries,
                    sortBy: sortBy,
                    timeout: timeout,
                    times: times,
                    timesLimit: timeLimit,
                    timesSeries: timesSeries,
                    transform: transform,
                    tryEach: tryEach,
                    unmemoize: unmemoize,
                    until: until,
                    waterfall: waterfall,
                    whilst: whilst,

                    // aliases
                    all: every,
                    allLimit: everyLimit,
                    allSeries: everySeries,
                    any: some,
                    anyLimit: someLimit,
                    anySeries: someSeries,
                    find: detect,
                    findLimit: detectLimit,
                    findSeries: detectSeries,
                    forEach: eachLimit,
                    forEachSeries: eachSeries,
                    forEachLimit: eachLimit$1,
                    forEachOf: eachOf,
                    forEachOfSeries: eachOfSeries,
                    forEachOfLimit: eachOfLimit,
                    inject: reduce,
                    foldl: reduce,
                    foldr: reduceRight,
                    select: filter,
                    selectLimit: filterLimit,
                    selectSeries: filterSeries,
                    wrapSync: asyncify,
                };

                exports["default"] = index;
                exports.apply = apply;
                exports.applyEach = applyEach;
                exports.applyEachSeries = applyEachSeries;
                exports.asyncify = asyncify;
                exports.auto = auto;
                exports.autoInject = autoInject;
                exports.cargo = cargo;
                exports.compose = compose;
                exports.concat = concat;
                exports.concatLimit = concatLimit;
                exports.concatSeries = concatSeries;
                exports.constant = constant;
                exports.detect = detect;
                exports.detectLimit = detectLimit;
                exports.detectSeries = detectSeries;
                exports.dir = dir;
                exports.doDuring = doDuring;
                exports.doUntil = doUntil;
                exports.doWhilst = doWhilst;
                exports.during = during;
                exports.each = eachLimit;
                exports.eachLimit = eachLimit$1;
                exports.eachOf = eachOf;
                exports.eachOfLimit = eachOfLimit;
                exports.eachOfSeries = eachOfSeries;
                exports.eachSeries = eachSeries;
                exports.ensureAsync = ensureAsync;
                exports.every = every;
                exports.everyLimit = everyLimit;
                exports.everySeries = everySeries;
                exports.filter = filter;
                exports.filterLimit = filterLimit;
                exports.filterSeries = filterSeries;
                exports.forever = forever;
                exports.groupBy = groupBy;
                exports.groupByLimit = groupByLimit;
                exports.groupBySeries = groupBySeries;
                exports.log = log;
                exports.map = map;
                exports.mapLimit = mapLimit;
                exports.mapSeries = mapSeries;
                exports.mapValues = mapValues;
                exports.mapValuesLimit = mapValuesLimit;
                exports.mapValuesSeries = mapValuesSeries;
                exports.memoize = memoize;
                exports.nextTick = nextTick;
                exports.parallel = parallelLimit;
                exports.parallelLimit = parallelLimit$1;
                exports.priorityQueue = priorityQueue;
                exports.queue = queue$1;
                exports.race = race;
                exports.reduce = reduce;
                exports.reduceRight = reduceRight;
                exports.reflect = reflect;
                exports.reflectAll = reflectAll;
                exports.reject = reject;
                exports.rejectLimit = rejectLimit;
                exports.rejectSeries = rejectSeries;
                exports.retry = retry;
                exports.retryable = retryable;
                exports.seq = seq;
                exports.series = series;
                exports.setImmediate = setImmediate$1;
                exports.some = some;
                exports.someLimit = someLimit;
                exports.someSeries = someSeries;
                exports.sortBy = sortBy;
                exports.timeout = timeout;
                exports.times = times;
                exports.timesLimit = timeLimit;
                exports.timesSeries = timesSeries;
                exports.transform = transform;
                exports.tryEach = tryEach;
                exports.unmemoize = unmemoize;
                exports.until = until;
                exports.waterfall = waterfall;
                exports.whilst = whilst;
                exports.all = every;
                exports.allLimit = everyLimit;
                exports.allSeries = everySeries;
                exports.any = some;
                exports.anyLimit = someLimit;
                exports.anySeries = someSeries;
                exports.find = detect;
                exports.findLimit = detectLimit;
                exports.findSeries = detectSeries;
                exports.forEach = eachLimit;
                exports.forEachSeries = eachSeries;
                exports.forEachLimit = eachLimit$1;
                exports.forEachOf = eachOf;
                exports.forEachOfSeries = eachOfSeries;
                exports.forEachOfLimit = eachOfLimit;
                exports.inject = reduce;
                exports.foldl = reduce;
                exports.foldr = reduceRight;
                exports.select = filter;
                exports.selectLimit = filterLimit;
                exports.selectSeries = filterSeries;
                exports.wrapSync = asyncify;

                Object.defineProperty(exports, "__esModule", { value: true });
            });

            /***/
        },
        /* 9 */
        /***/ (module) => {
            // shim for using process in browser
            var process = (module.exports = {});

            // cached from whatever global is present so that test runners that stub it
            // don't break things.  But we need to wrap it in a try catch in case it is
            // wrapped in strict mode code which doesn't define any globals.  It's inside a
            // function because try/catches deoptimize in certain engines.

            var cachedSetTimeout;
            var cachedClearTimeout;

            function defaultSetTimout() {
                throw new Error("setTimeout has not been defined");
            }
            function defaultClearTimeout() {
                throw new Error("clearTimeout has not been defined");
            }
            (function () {
                try {
                    if (typeof setTimeout === "function") {
                        cachedSetTimeout = setTimeout;
                    } else {
                        cachedSetTimeout = defaultSetTimout;
                    }
                } catch (e) {
                    cachedSetTimeout = defaultSetTimout;
                }
                try {
                    if (typeof clearTimeout === "function") {
                        cachedClearTimeout = clearTimeout;
                    } else {
                        cachedClearTimeout = defaultClearTimeout;
                    }
                } catch (e) {
                    cachedClearTimeout = defaultClearTimeout;
                }
            })();
            function runTimeout(fun) {
                if (cachedSetTimeout === setTimeout) {
                    //normal enviroments in sane situations
                    return setTimeout(fun, 0);
                }
                // if setTimeout wasn't available but was latter defined
                if (
                    (cachedSetTimeout === defaultSetTimout ||
                        !cachedSetTimeout) &&
                    setTimeout
                ) {
                    cachedSetTimeout = setTimeout;
                    return setTimeout(fun, 0);
                }
                try {
                    // when when somebody has screwed with setTimeout but no I.E. maddness
                    return cachedSetTimeout(fun, 0);
                } catch (e) {
                    try {
                        // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                        return cachedSetTimeout.call(null, fun, 0);
                    } catch (e) {
                        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                        return cachedSetTimeout.call(this, fun, 0);
                    }
                }
            }
            function runClearTimeout(marker) {
                if (cachedClearTimeout === clearTimeout) {
                    //normal enviroments in sane situations
                    return clearTimeout(marker);
                }
                // if clearTimeout wasn't available but was latter defined
                if (
                    (cachedClearTimeout === defaultClearTimeout ||
                        !cachedClearTimeout) &&
                    clearTimeout
                ) {
                    cachedClearTimeout = clearTimeout;
                    return clearTimeout(marker);
                }
                try {
                    // when when somebody has screwed with setTimeout but no I.E. maddness
                    return cachedClearTimeout(marker);
                } catch (e) {
                    try {
                        // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                        return cachedClearTimeout.call(null, marker);
                    } catch (e) {
                        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                        // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                        return cachedClearTimeout.call(this, marker);
                    }
                }
            }
            var queue = [];
            var draining = false;
            var currentQueue;
            var queueIndex = -1;

            function cleanUpNextTick() {
                if (!draining || !currentQueue) {
                    return;
                }
                draining = false;
                if (currentQueue.length) {
                    queue = currentQueue.concat(queue);
                } else {
                    queueIndex = -1;
                }
                if (queue.length) {
                    drainQueue();
                }
            }

            function drainQueue() {
                if (draining) {
                    return;
                }
                var timeout = runTimeout(cleanUpNextTick);
                draining = true;

                var len = queue.length;
                while (len) {
                    currentQueue = queue;
                    queue = [];
                    while (++queueIndex < len) {
                        if (currentQueue) {
                            currentQueue[queueIndex].run();
                        }
                    }
                    queueIndex = -1;
                    len = queue.length;
                }
                currentQueue = null;
                draining = false;
                runClearTimeout(timeout);
            }

            process.nextTick = function (fun) {
                var args = new Array(arguments.length - 1);
                if (arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                        args[i - 1] = arguments[i];
                    }
                }
                queue.push(new Item(fun, args));
                if (queue.length === 1 && !draining) {
                    runTimeout(drainQueue);
                }
            };

            // v8 likes predictible objects
            function Item(fun, array) {
                this.fun = fun;
                this.array = array;
            }
            Item.prototype.run = function () {
                this.fun.apply(null, this.array);
            };
            process.title = "browser";
            process.browser = true;
            process.env = {};
            process.argv = [];
            process.version = ""; // empty string to avoid regexp issues
            process.versions = {};

            function noop() {}

            process.on = noop;
            process.addListener = noop;
            process.once = noop;
            process.off = noop;
            process.removeListener = noop;
            process.removeAllListeners = noop;
            process.emit = noop;
            process.prependListener = noop;
            process.prependOnceListener = noop;

            process.listeners = function (name) {
                return [];
            };

            process.binding = function (name) {
                throw new Error("process.binding is not supported");
            };

            process.cwd = function () {
                return "/";
            };
            process.chdir = function (dir) {
                throw new Error("process.chdir is not supported");
            };
            process.umask = function () {
                return 0;
            };

            /***/
        },
        /* 10 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            /**
             * @author github.com/tintinweb
             * @license MIT
             *
             * */
            const vscode = __webpack_require__(2);

            const { Client } = __webpack_require__(11);

            const analyze = {
                mythXjs: function (
                    ethAddress,
                    password,
                    bytecode,
                    deployedBytecode
                ) {
                    return new Promise(async (resolve, reject) => {
                        //returns a promise!
                        const client = new Client(
                            ethAddress,
                            password,
                            "vscode-vyper-" +
                                vscode.extensions.getExtension(
                                    "tintinweb.vscode-vyper"
                                ).packageJSON.version
                        );

                        await client.login();
                        const result = await client.analyze({
                            bytecode: bytecode,
                            deployedBytecode: deployedBytecode,
                        });

                        const { uuid } = result;
                        const analysisResult = await client.getDetectedIssues(
                            uuid
                        );
                        resolve(analysisResult);
                    });
                },
            };

            const mythXSeverityToVSCodeSeverity = {
                High: vscode.DiagnosticSeverity.Error,
                Medium: vscode.DiagnosticSeverity.Warning,
                Low: vscode.DiagnosticSeverity.Information,
            };

            module.exports = {
                analyze: analyze,
                mythXSeverityToVSCodeSeverity: mythXSeverityToVSCodeSeverity,
            };

            /***/
        },
        /* 11 */
        /***/ (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";

            Object.defineProperty(exports, "__esModule", { value: true });
            var ClientService_1 = __webpack_require__(12);
            exports.Client = ClientService_1.ClientService;

            /***/
        },
        /* 12 */
        /***/ function (__unused_webpack_module, exports, __webpack_require__) {
            "use strict";

            var __awaiter =
                (this && this.__awaiter) ||
                function (thisArg, _arguments, P, generator) {
                    return new (P || (P = Promise))(function (resolve, reject) {
                        function fulfilled(value) {
                            try {
                                step(generator.next(value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function rejected(value) {
                            try {
                                step(generator["throw"](value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function step(result) {
                            result.done
                                ? resolve(result.value)
                                : new P(function (resolve) {
                                      resolve(result.value);
                                  }).then(fulfilled, rejected);
                        }
                        step(
                            (generator = generator.apply(
                                thisArg,
                                _arguments || []
                            )).next()
                        );
                    });
                };
            var __generator =
                (this && this.__generator) ||
                function (thisArg, body) {
                    var _ = {
                            label: 0,
                            sent: function () {
                                if (t[0] & 1) throw t[1];
                                return t[1];
                            },
                            trys: [],
                            ops: [],
                        },
                        f,
                        y,
                        t,
                        g;
                    return (
                        (g = {
                            next: verb(0),
                            throw: verb(1),
                            return: verb(2),
                        }),
                        typeof Symbol === "function" &&
                            (g[Symbol.iterator] = function () {
                                return this;
                            }),
                        g
                    );
                    function verb(n) {
                        return function (v) {
                            return step([n, v]);
                        };
                    }
                    function step(op) {
                        if (f)
                            throw new TypeError(
                                "Generator is already executing."
                            );
                        while (_)
                            try {
                                if (
                                    ((f = 1),
                                    y &&
                                        (t =
                                            op[0] & 2
                                                ? y["return"]
                                                : op[0]
                                                ? y["throw"] ||
                                                  ((t = y["return"]) &&
                                                      t.call(y),
                                                  0)
                                                : y.next) &&
                                        !(t = t.call(y, op[1])).done)
                                )
                                    return t;
                                if (((y = 0), t)) op = [op[0] & 2, t.value];
                                switch (op[0]) {
                                    case 0:
                                    case 1:
                                        t = op;
                                        break;
                                    case 4:
                                        _.label++;
                                        return { value: op[1], done: false };
                                    case 5:
                                        _.label++;
                                        y = op[1];
                                        op = [0];
                                        continue;
                                    case 7:
                                        op = _.ops.pop();
                                        _.trys.pop();
                                        continue;
                                    default:
                                        if (
                                            !((t = _.trys),
                                            (t =
                                                t.length > 0 &&
                                                t[t.length - 1])) &&
                                            (op[0] === 6 || op[0] === 2)
                                        ) {
                                            _ = 0;
                                            continue;
                                        }
                                        if (
                                            op[0] === 3 &&
                                            (!t ||
                                                (op[1] > t[0] && op[1] < t[3]))
                                        ) {
                                            _.label = op[1];
                                            break;
                                        }
                                        if (op[0] === 6 && _.label < t[1]) {
                                            _.label = t[1];
                                            t = op;
                                            break;
                                        }
                                        if (t && _.label < t[2]) {
                                            _.label = t[2];
                                            _.ops.push(op);
                                            break;
                                        }
                                        if (t[2]) _.ops.pop();
                                        _.trys.pop();
                                        continue;
                                }
                                op = body.call(thisArg, _);
                            } catch (e) {
                                op = [6, e];
                                y = 0;
                            } finally {
                                f = t = 0;
                            }
                        if (op[0] & 5) throw op[1];
                        return { value: op[0] ? op[1] : void 0, done: true };
                    }
                };
            Object.defineProperty(exports, "__esModule", { value: true });
            var AnalysesService_1 = __webpack_require__(13);
            var AuthService_1 = __webpack_require__(76);
            /**
             * Main service exposed to outside.
             * Needs to be instantiated with username, password, toolName (optional) and environment (optional) fields. If no environment specified it will default to prod.
             * Please note that this is exported as `Client`.
             * @example
             * `import { Client } from 'mythxjs'`.
             *
             * `const mythx = new Client('0x0000000000000000000000000000000000000000', 'trial', 'testTool', 'https://staging.api.mythx.io/v1/');`
             */
            var ClientService = /** @class */ (function () {
                function ClientService(clientConfig) {
                    if (
                        String(clientConfig) === "[object Object]" &&
                        clientConfig.username &&
                        clientConfig.apiKey
                    ) {
                        this.ethAddress = clientConfig.username;
                        ClientService.MYTHX_API_ENVIRONMENT =
                            clientConfig.environment ||
                            "https://api.mythx.io/v1";
                        this.authService = new AuthService_1.AuthService(
                            this.ethAddress
                        );
                        this.toolName = clientConfig.toolName || "MythXJS";
                        ClientService.jwtTokens.access = clientConfig.apiKey;
                        this.analysesService =
                            new AnalysesService_1.AnalysesService(
                                ClientService.jwtTokens,
                                this.toolName
                            );
                    } else {
                        var ethAddress = arguments[0],
                            password = arguments[1],
                            _a = arguments[2],
                            toolName = _a === void 0 ? "MythXJS" : _a,
                            _b = arguments[3],
                            environment =
                                _b === void 0 ? "https://api.mythx.io/v1" : _b,
                            accessToken = arguments[4];
                        this.ethAddress = ethAddress;
                        this.password = password;
                        ClientService.MYTHX_API_ENVIRONMENT = environment;
                        this.authService = new AuthService_1.AuthService(
                            ethAddress,
                            password
                        );
                        this.toolName = toolName;
                        ClientService.jwtTokens.access = accessToken;
                        if (accessToken) {
                            this.analysesService =
                                new AnalysesService_1.AnalysesService(
                                    ClientService.jwtTokens,
                                    this.toolName
                                );
                        }
                    }
                }
                /**
                 *  Login to the API using ethAddress and password specified in the library constructor.
                 * @param ethAddress Ethereum address for Mythx account
                 * @param password  Password for Ethereum address
                 * @return {Promise<JwtTokensInterface>}  Returns an object containing two tokens (access+refresh) that can be saved in storage.
                 */
                ClientService.prototype.login = function (
                    ethAddress,
                    password
                ) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (ethAddress && password) {
                                        this.ethAddress = ethAddress;
                                        this.password = password;
                                    }
                                    _a = ClientService;
                                    return [
                                        4 /*yield*/,
                                        this.authService.login(
                                            this.ethAddress,
                                            this.password
                                        ),
                                    ];
                                case 1:
                                    _a.jwtTokens = _b.sent();
                                    this.analysesService =
                                        new AnalysesService_1.AnalysesService(
                                            ClientService.jwtTokens,
                                            this.toolName
                                        );
                                    return [
                                        2 /*return*/,
                                        ClientService.jwtTokens,
                                    ];
                            }
                        });
                    });
                };
                /**
                 *  Login to the API using metamask challenge result message.
                 *  In order to get the object containing the message use `getChallenge` and handle Metamask login in the frontend.
                 * @param signature Signature passed by provider. In case of metamask this will be returned after signing challenge.
                 * @param provider pass a provider value for the HTTP headers. If nothing is passed defaults to MetaMask
                 * @return {Promise<JwtTokensInterface>}  Returns an object containing two tokens (access+refresh) that can be saved in storage.
                 */
                ClientService.prototype.loginWithSignature = function (
                    signature,
                    provider
                ) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    return [
                                        4 /*yield*/,
                                        this.authService.loginWithSignature(
                                            signature,
                                            provider
                                        ),
                                    ];
                                case 1:
                                    return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                /**
                 *  Generates authentication challenge (Metamask only for now).
                 *  The Metamask flow needs to be handled on the front end since MythXJS does not have Web3 dependencies.
                 * @param ethAddress Ethereum address for Mythx account
                 * @returns Resolves with API response or throw error
                 */
                ClientService.prototype.getChallenge = function (ethAddress) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    return [
                                        4 /*yield*/,
                                        this.authService.getChallenge(
                                            ethAddress
                                        ),
                                    ];
                                case 1:
                                    return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                /**
                 *  Logout from the API.
                 * @returns Resolves with API response or throw error
                 */
                ClientService.prototype.logout = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    return [
                                        4 /*yield*/,
                                        this.authService.logout(),
                                    ];
                                case 1:
                                    return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                /**
                 *   Returns API current version.
                 *   Does not require login.
                 *   @returns Resolves with API response or throw error
                 */
                ClientService.prototype.getVersion = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    return [
                                        4 /*yield*/,
                                        this.authService.getVersion(),
                                    ];
                                case 1:
                                    return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                /**
                 *   Returns API stats.
                 *   Internal only, needs admin credentials to be accessed.
                 *   @returns {Promise<StatsResponse>} Resolves with API response or throw error
                 */
                ClientService.prototype.getStats = function (queryString) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    return [
                                        4 /*yield*/,
                                        this.authService.getStats(queryString),
                                    ];
                                case 1:
                                    return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                /**
                 * Retrieve list of registred API users or just caller user object if no required permission.
                 * @param queryString Query string for detailed list (query parameters: offset, orderBy, email, ethAddress)
                 * @returns {Promise<UsersResponse>} Resolves with API response or throw error
                 */
                ClientService.prototype.getUsers = function (queryString) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    return [
                                        4 /*yield*/,
                                        this.authService.getUsers(queryString),
                                    ];
                                case 1:
                                    return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                ClientService.prototype.getAnalysesList = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    return [
                                        4 /*yield*/,
                                        this.analysesService.getAnalysesList(),
                                    ];
                                case 1:
                                    return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                /**
                 * Get status for analysis on given UUID.
                 * @param uuid - unique identifier of analysis job
                 * @return {Promise<AnalysisStatusResponse>} Resolves with API response, or throws error
                 */
                ClientService.prototype.getAnalysisStatus = function (uuid) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    return [
                                        4 /*yield*/,
                                        this.analysesService.getAnalysisStatus(
                                            uuid
                                        ),
                                    ];
                                case 1:
                                    return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                /**
                 * Gets the array of issues from the API.
                 *
                 * @param {String} uuid - unique identifier of analysis job
                 * @returns {Promise} Resolves with API response, or throws error
                 */
                ClientService.prototype.getDetectedIssues = function (uuid) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    return [
                                        4 /*yield*/,
                                        this.analysesService.getDetectedIssues(
                                            uuid
                                        ),
                                    ];
                                case 1:
                                    return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                /**
                 * Submit a smart contract using bytecode only.
                 * This will likely be deprecated in future.
                 *
                 * @param {String} bytecode - Compiled bytecode of a smart contract for example "0xfe".
                 * @return {Promise} Resolves with API response, or throws error
                 */
                ClientService.prototype.submitBytecode = function (bytecode) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    return [
                                        4 /*yield*/,
                                        this.analysesService.submitBytecode(
                                            bytecode
                                        ),
                                    ];
                                case 1:
                                    return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                /**
                 * Submit a smart contract using sourcecode only.
                 * This will likely be deprecated in future.
                 *
                 * @param {String} sourceCode - String containing smart contract sourcecode.
                 * @param {String} contractName - Name of the contract to submit for analysis.
                 * @param {Boolean} propertyChecking - Only Assertion Violations Check enabling flag
                 * @return {Promise} Resolves with API response, or throws errors
                 */
                ClientService.prototype.submitSourceCode = function (
                    sourceCode,
                    contractName,
                    propertyChecking
                ) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    return [
                                        4 /*yield*/,
                                        this.analysesService.submitSourceCode(
                                            sourceCode,
                                            contractName,
                                            propertyChecking
                                        ),
                                    ];
                                case 1:
                                    return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                /**
                 * Submit a smart contract using custom parameters.
                 *
                 * @param {Object} options - Object containing options to submit to API
                 * @param {Boolean} propertyChecking - Only Assertion Violations Check enabling flag
                 * @return {Promise} Resolves with API response, or throws error
                 */
                ClientService.prototype.analyze = function (
                    options,
                    propertyChecking
                ) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    return [
                                        4 /*yield*/,
                                        this.analysesService.analyze(
                                            options,
                                            propertyChecking
                                        ),
                                    ];
                                case 1:
                                    return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                /**
                 * Get API generated PDF.
                 *
                 * @param {String} uuid - Unique identifier of analysis job
                 * @return {Promise} Resolves with API response, or throws error
                 */
                ClientService.prototype.getPdf = function (uuid) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    return [
                                        4 /*yield*/,
                                        this.analysesService.getPdf(uuid),
                                    ];
                                case 1:
                                    return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                /**
                 * Get list of analyses groups.
                 *
                 * @param {String} queryString - Query string for detailed list of groups (query parameters: offset, createdBy, groupName, dateFrom, dateTo)
                 * @return {Promise} Resolves with API response, or throws error
                 */
                ClientService.prototype.listGroups = function (queryString) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    return [
                                        4 /*yield*/,
                                        this.analysesService.listGroups(
                                            queryString
                                        ),
                                    ];
                                case 1:
                                    return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                /**
                 * Create an analysis submission group.
                 *
                 * @param {String} groupName (optional) - String that defines a group name
                 * @return {Promise} Resolves with API response, or throws error
                 */
                ClientService.prototype.createGroup = function (groupName) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    return [
                                        4 /*yield*/,
                                        this.analysesService.createGroup(
                                            groupName
                                        ),
                                    ];
                                case 1:
                                    return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                /**
                 * Perform operations on specific group.
                 *
                 * @param {String} groupId - String that defines a unique group ID
                 * @param {String} operationType (optional) - Type of operation to be performed in the group (e.g. "seal_group")
                 * @return {Promise} Resolves with API response, or throws error
                 */
                ClientService.prototype.groupOperation = function (
                    groupId,
                    operationType
                ) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    return [
                                        4 /*yield*/,
                                        this.analysesService.groupOperation(
                                            groupId,
                                            operationType
                                        ),
                                    ];
                                case 1:
                                    return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                /**
                 * Get a single analyses group by ID.
                 *
                 * @param {String} groupId (required) - String that defines a unique group ID
                 * @return {Promise} Resolves with API response, or throws error
                 */
                ClientService.prototype.getGroupById = function (groupId) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    return [
                                        4 /*yield*/,
                                        this.analysesService.getGroupById(
                                            groupId
                                        ),
                                    ];
                                case 1:
                                    return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                ClientService.jwtTokens = {
                    access: "",
                    refresh: "",
                };
                return ClientService;
            })();
            exports.ClientService = ClientService;

            /***/
        },
        /* 13 */
        /***/ function (__unused_webpack_module, exports, __webpack_require__) {
            "use strict";

            var __awaiter =
                (this && this.__awaiter) ||
                function (thisArg, _arguments, P, generator) {
                    return new (P || (P = Promise))(function (resolve, reject) {
                        function fulfilled(value) {
                            try {
                                step(generator.next(value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function rejected(value) {
                            try {
                                step(generator["throw"](value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function step(result) {
                            result.done
                                ? resolve(result.value)
                                : new P(function (resolve) {
                                      resolve(result.value);
                                  }).then(fulfilled, rejected);
                        }
                        step(
                            (generator = generator.apply(
                                thisArg,
                                _arguments || []
                            )).next()
                        );
                    });
                };
            var __generator =
                (this && this.__generator) ||
                function (thisArg, body) {
                    var _ = {
                            label: 0,
                            sent: function () {
                                if (t[0] & 1) throw t[1];
                                return t[1];
                            },
                            trys: [],
                            ops: [],
                        },
                        f,
                        y,
                        t,
                        g;
                    return (
                        (g = {
                            next: verb(0),
                            throw: verb(1),
                            return: verb(2),
                        }),
                        typeof Symbol === "function" &&
                            (g[Symbol.iterator] = function () {
                                return this;
                            }),
                        g
                    );
                    function verb(n) {
                        return function (v) {
                            return step([n, v]);
                        };
                    }
                    function step(op) {
                        if (f)
                            throw new TypeError(
                                "Generator is already executing."
                            );
                        while (_)
                            try {
                                if (
                                    ((f = 1),
                                    y &&
                                        (t =
                                            op[0] & 2
                                                ? y["return"]
                                                : op[0]
                                                ? y["throw"] ||
                                                  ((t = y["return"]) &&
                                                      t.call(y),
                                                  0)
                                                : y.next) &&
                                        !(t = t.call(y, op[1])).done)
                                )
                                    return t;
                                if (((y = 0), t)) op = [op[0] & 2, t.value];
                                switch (op[0]) {
                                    case 0:
                                    case 1:
                                        t = op;
                                        break;
                                    case 4:
                                        _.label++;
                                        return { value: op[1], done: false };
                                    case 5:
                                        _.label++;
                                        y = op[1];
                                        op = [0];
                                        continue;
                                    case 7:
                                        op = _.ops.pop();
                                        _.trys.pop();
                                        continue;
                                    default:
                                        if (
                                            !((t = _.trys),
                                            (t =
                                                t.length > 0 &&
                                                t[t.length - 1])) &&
                                            (op[0] === 6 || op[0] === 2)
                                        ) {
                                            _ = 0;
                                            continue;
                                        }
                                        if (
                                            op[0] === 3 &&
                                            (!t ||
                                                (op[1] > t[0] && op[1] < t[3]))
                                        ) {
                                            _.label = op[1];
                                            break;
                                        }
                                        if (op[0] === 6 && _.label < t[1]) {
                                            _.label = t[1];
                                            t = op;
                                            break;
                                        }
                                        if (t && _.label < t[2]) {
                                            _.label = t[2];
                                            _.ops.push(op);
                                            break;
                                        }
                                        if (t[2]) _.ops.pop();
                                        _.trys.pop();
                                        continue;
                                }
                                op = body.call(thisArg, _);
                            } catch (e) {
                                op = [6, e];
                                y = 0;
                            } finally {
                                f = t = 0;
                            }
                        if (op[0] & 5) throw op[1];
                        return { value: op[0] ? op[1] : void 0, done: true };
                    }
                };
            Object.defineProperty(exports, "__esModule", { value: true });
            var generateContractsRequests_1 = __webpack_require__(14);
            var http_1 = __webpack_require__(15);
            var ClientService_1 = __webpack_require__(12);
            var errorHandler_1 = __webpack_require__(44);
            var getHeaders_1 = __webpack_require__(45);
            var validateToken_1 = __webpack_require__(46);
            var AnalysesService = /** @class */ (function () {
                function AnalysesService(jwtTokens, toolName) {
                    if (toolName === void 0) {
                        toolName = "MythXJS";
                    }
                    this.API_URL =
                        ClientService_1.ClientService.MYTHX_API_ENVIRONMENT;
                    if (validateToken_1.isTokenValid(jwtTokens.access)) {
                        ClientService_1.ClientService.jwtTokens = jwtTokens;
                    } else {
                        throw new Error(
                            "Access token has expired or is invalid! Please login again."
                        );
                    }
                    this.toolName = toolName;
                }
                AnalysesService.prototype.getAnalysesList = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, headers, tokens, result, analysisList, err_1;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 3, , 4]);
                                    return [
                                        4 /*yield*/,
                                        getHeaders_1.getHeaders(
                                            ClientService_1.ClientService
                                                .jwtTokens
                                        ),
                                    ];
                                case 1:
                                    (_a = _b.sent()),
                                        (headers = _a.headers),
                                        (tokens = _a.tokens);
                                    this.setCredentials(tokens);
                                    return [
                                        4 /*yield*/,
                                        http_1.getRequest(
                                            this.API_URL + "/analyses",
                                            headers
                                        ),
                                    ];
                                case 2:
                                    result = _b.sent();
                                    analysisList = result.data;
                                    return [2 /*return*/, analysisList];
                                case 3:
                                    err_1 = _b.sent();
                                    errorHandler_1.errorHandler(err_1);
                                    throw err_1;
                                case 4:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                AnalysesService.prototype.getAnalysisStatus = function (uuid) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, headers, tokens, result, analysisRes, err_2;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 3, , 4]);
                                    return [
                                        4 /*yield*/,
                                        getHeaders_1.getHeaders(
                                            ClientService_1.ClientService
                                                .jwtTokens
                                        ),
                                    ];
                                case 1:
                                    (_a = _b.sent()),
                                        (headers = _a.headers),
                                        (tokens = _a.tokens);
                                    this.setCredentials(tokens);
                                    return [
                                        4 /*yield*/,
                                        http_1.getRequest(
                                            this.API_URL + "/analyses/" + uuid,
                                            headers
                                        ),
                                    ];
                                case 2:
                                    result = _b.sent();
                                    analysisRes = result.data;
                                    return [2 /*return*/, analysisRes];
                                case 3:
                                    err_2 = _b.sent();
                                    errorHandler_1.errorHandler(err_2);
                                    throw err_2;
                                case 4:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                AnalysesService.prototype.getDetectedIssues = function (uuid) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a,
                            headers,
                            tokens,
                            getStatus,
                            result,
                            detectedIssues,
                            err_3;
                        var _this = this;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 6, , 7]);
                                    return [
                                        4 /*yield*/,
                                        getHeaders_1.getHeaders(
                                            ClientService_1.ClientService
                                                .jwtTokens
                                        ),
                                    ];
                                case 1:
                                    (_a = _b.sent()),
                                        (headers = _a.headers),
                                        (tokens = _a.tokens);
                                    this.setCredentials(tokens);
                                    return [
                                        4 /*yield*/,
                                        this.getAnalysisStatus(uuid),
                                    ];
                                case 2:
                                    getStatus = _b.sent();
                                    if (
                                        !(
                                            getStatus.status === "Queued" ||
                                            getStatus.status === "In progress"
                                        )
                                    )
                                        return [3 /*break*/, 4];
                                    return [
                                        4 /*yield*/,
                                        new Promise(function (resolve) {
                                            var timer = setInterval(
                                                function () {
                                                    return __awaiter(
                                                        _this,
                                                        void 0,
                                                        void 0,
                                                        function () {
                                                            var analysisReq;
                                                            return __generator(
                                                                this,
                                                                function (_a) {
                                                                    switch (
                                                                        _a.label
                                                                    ) {
                                                                        case 0:
                                                                            return [
                                                                                4 /*yield*/,
                                                                                this.getAnalysisStatus(
                                                                                    uuid
                                                                                ),
                                                                            ];
                                                                        case 1:
                                                                            analysisReq =
                                                                                _a.sent();
                                                                            if (
                                                                                analysisReq.status ===
                                                                                    "Finished" ||
                                                                                analysisReq.status ===
                                                                                    "Error"
                                                                            ) {
                                                                                clearInterval(
                                                                                    timer
                                                                                );
                                                                                resolve(
                                                                                    "done"
                                                                                );
                                                                            }
                                                                            return [
                                                                                2 /*return*/,
                                                                            ];
                                                                    }
                                                                }
                                                            );
                                                        }
                                                    );
                                                },
                                                5000
                                            );
                                        }),
                                    ];
                                case 3:
                                    _b.sent();
                                    _b.label = 4;
                                case 4:
                                    return [
                                        4 /*yield*/,
                                        http_1.getRequest(
                                            this.API_URL +
                                                "/analyses/" +
                                                uuid +
                                                "/issues",
                                            headers
                                        ),
                                    ];
                                case 5:
                                    result = _b.sent();
                                    detectedIssues = result.data;
                                    return [2 /*return*/, detectedIssues];
                                case 6:
                                    err_3 = _b.sent();
                                    errorHandler_1.errorHandler(err_3);
                                    throw err_3;
                                case 7:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                AnalysesService.prototype.submitBytecode = function (bytecode) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a,
                            headers,
                            tokens,
                            request,
                            result,
                            analysisRes,
                            err_4;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 3, , 4]);
                                    return [
                                        4 /*yield*/,
                                        getHeaders_1.getHeaders(
                                            ClientService_1.ClientService
                                                .jwtTokens
                                        ),
                                    ];
                                case 1:
                                    (_a = _b.sent()),
                                        (headers = _a.headers),
                                        (tokens = _a.tokens);
                                    this.setCredentials(tokens);
                                    request =
                                        generateContractsRequests_1.generateBytecodeRequest(
                                            bytecode,
                                            this.toolName
                                        );
                                    return [
                                        4 /*yield*/,
                                        http_1.postRequest(
                                            this.API_URL + "/analyses",
                                            request,
                                            headers
                                        ),
                                    ];
                                case 2:
                                    result = _b.sent();
                                    analysisRes = result.data;
                                    return [2 /*return*/, analysisRes];
                                case 3:
                                    err_4 = _b.sent();
                                    errorHandler_1.errorHandler(err_4);
                                    throw err_4;
                                case 4:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                AnalysesService.prototype.submitSourceCode = function (
                    sourceCode,
                    contractName,
                    propertyChecking
                ) {
                    if (propertyChecking === void 0) {
                        propertyChecking = false;
                    }
                    return __awaiter(this, void 0, void 0, function () {
                        var _a,
                            headers,
                            tokens,
                            request,
                            result,
                            analysisRes,
                            err_5;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 3, , 4]);
                                    return [
                                        4 /*yield*/,
                                        getHeaders_1.getHeaders(
                                            ClientService_1.ClientService
                                                .jwtTokens
                                        ),
                                    ];
                                case 1:
                                    (_a = _b.sent()),
                                        (headers = _a.headers),
                                        (tokens = _a.tokens);
                                    this.setCredentials(tokens);
                                    request =
                                        generateContractsRequests_1.generateSourceCodeRequest(
                                            sourceCode,
                                            contractName,
                                            this.toolName,
                                            propertyChecking
                                        );
                                    return [
                                        4 /*yield*/,
                                        http_1.postRequest(
                                            this.API_URL + "/analyses",
                                            request,
                                            headers
                                        ),
                                    ];
                                case 2:
                                    result = _b.sent();
                                    analysisRes = result.data;
                                    return [2 /*return*/, analysisRes];
                                case 3:
                                    err_5 = _b.sent();
                                    errorHandler_1.errorHandler(err_5);
                                    throw err_5;
                                case 4:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                AnalysesService.prototype.analyze = function (
                    options,
                    propertyChecking
                ) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a,
                            headers,
                            tokens,
                            request,
                            result,
                            analysisRes,
                            err_6;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 3, , 4]);
                                    return [
                                        4 /*yield*/,
                                        getHeaders_1.getHeaders(
                                            ClientService_1.ClientService
                                                .jwtTokens
                                        ),
                                    ];
                                case 1:
                                    (_a = _b.sent()),
                                        (headers = _a.headers),
                                        (tokens = _a.tokens);
                                    this.setCredentials(tokens);
                                    request =
                                        generateContractsRequests_1.generateAnalysisRequest(
                                            options,
                                            this.toolName,
                                            propertyChecking
                                        );
                                    return [
                                        4 /*yield*/,
                                        http_1.postRequest(
                                            this.API_URL + "/analyses",
                                            request,
                                            headers
                                        ),
                                    ];
                                case 2:
                                    result = _b.sent();
                                    analysisRes = result.data;
                                    return [2 /*return*/, analysisRes];
                                case 3:
                                    err_6 = _b.sent();
                                    errorHandler_1.errorHandler(err_6);
                                    throw err_6;
                                case 4:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                AnalysesService.prototype.getPdf = function (uuid) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, headers, tokens, result, pdfRes, err_7;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 3, , 4]);
                                    return [
                                        4 /*yield*/,
                                        getHeaders_1.getHeaders(
                                            ClientService_1.ClientService
                                                .jwtTokens
                                        ),
                                    ];
                                case 1:
                                    (_a = _b.sent()),
                                        (headers = _a.headers),
                                        (tokens = _a.tokens);
                                    this.setCredentials(tokens);
                                    return [
                                        4 /*yield*/,
                                        http_1.getRequest(
                                            this.API_URL +
                                                "/analyses/" +
                                                uuid +
                                                "/pdf-report",
                                            headers
                                        ),
                                    ];
                                case 2:
                                    result = _b.sent();
                                    pdfRes = result.data;
                                    return [2 /*return*/, pdfRes];
                                case 3:
                                    err_7 = _b.sent();
                                    errorHandler_1.errorHandler(err_7);
                                    throw err_7;
                                case 4:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                AnalysesService.prototype.listGroups = function (queryString) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, headers, tokens, result, groupsRes, err_8;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 3, , 4]);
                                    return [
                                        4 /*yield*/,
                                        getHeaders_1.getHeaders(
                                            ClientService_1.ClientService
                                                .jwtTokens
                                        ),
                                    ];
                                case 1:
                                    (_a = _b.sent()),
                                        (headers = _a.headers),
                                        (tokens = _a.tokens);
                                    this.setCredentials(tokens);
                                    return [
                                        4 /*yield*/,
                                        http_1.getRequest(
                                            this.API_URL +
                                                "/analysis-groups?" +
                                                queryString,
                                            headers
                                        ),
                                    ];
                                case 2:
                                    result = _b.sent();
                                    groupsRes = result.data;
                                    return [2 /*return*/, groupsRes];
                                case 3:
                                    err_8 = _b.sent();
                                    errorHandler_1.errorHandler(err_8);
                                    throw err_8;
                                case 4:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                AnalysesService.prototype.getGroupById = function (groupId) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, headers, tokens, result, groupRes, err_9;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 3, , 4]);
                                    if (!groupId) {
                                        throw new Error(
                                            "MythXJS: Group ID is required to perform this operation"
                                        );
                                    }
                                    return [
                                        4 /*yield*/,
                                        getHeaders_1.getHeaders(
                                            ClientService_1.ClientService
                                                .jwtTokens
                                        ),
                                    ];
                                case 1:
                                    (_a = _b.sent()),
                                        (headers = _a.headers),
                                        (tokens = _a.tokens);
                                    this.setCredentials(tokens);
                                    return [
                                        4 /*yield*/,
                                        http_1.getRequest(
                                            this.API_URL +
                                                "/analysis-groups/" +
                                                groupId,
                                            headers
                                        ),
                                    ];
                                case 2:
                                    result = _b.sent();
                                    groupRes = result.data;
                                    return [2 /*return*/, groupRes];
                                case 3:
                                    err_9 = _b.sent();
                                    errorHandler_1.errorHandler(err_9);
                                    throw err_9;
                                case 4:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                AnalysesService.prototype.createGroup = function (groupName) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, headers, tokens, body, result, groupRes, err_10;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 3, , 4]);
                                    return [
                                        4 /*yield*/,
                                        getHeaders_1.getHeaders(
                                            ClientService_1.ClientService
                                                .jwtTokens
                                        ),
                                    ];
                                case 1:
                                    (_a = _b.sent()),
                                        (headers = _a.headers),
                                        (tokens = _a.tokens);
                                    this.setCredentials(tokens);
                                    body = groupName
                                        ? { groupName: groupName }
                                        : null;
                                    return [
                                        4 /*yield*/,
                                        http_1.postRequest(
                                            this.API_URL + "/analysis-groups",
                                            body,
                                            headers
                                        ),
                                    ];
                                case 2:
                                    result = _b.sent();
                                    groupRes = result.data;
                                    return [2 /*return*/, groupRes];
                                case 3:
                                    err_10 = _b.sent();
                                    errorHandler_1.errorHandler(err_10);
                                    throw err_10;
                                case 4:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                AnalysesService.prototype.groupOperation = function (
                    groupId,
                    operationType
                ) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, headers, tokens, body, result, groupRes, err_11;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 3, , 4]);
                                    if (!groupId) {
                                        throw new Error(
                                            "MythXJS: Group ID is required to perform this operation"
                                        );
                                    }
                                    return [
                                        4 /*yield*/,
                                        getHeaders_1.getHeaders(
                                            ClientService_1.ClientService
                                                .jwtTokens
                                        ),
                                    ];
                                case 1:
                                    (_a = _b.sent()),
                                        (headers = _a.headers),
                                        (tokens = _a.tokens);
                                    this.setCredentials(tokens);
                                    body = operationType
                                        ? { type: operationType }
                                        : "seal_group";
                                    return [
                                        4 /*yield*/,
                                        http_1.postRequest(
                                            this.API_URL +
                                                "/analysis-groups/" +
                                                groupId,
                                            body,
                                            headers
                                        ),
                                    ];
                                case 2:
                                    result = _b.sent();
                                    groupRes = result.data;
                                    return [2 /*return*/, groupRes];
                                case 3:
                                    err_11 = _b.sent();
                                    errorHandler_1.errorHandler(err_11);
                                    throw err_11;
                                case 4:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                AnalysesService.prototype.setCredentials = function (tokens) {
                    ClientService_1.ClientService.jwtTokens.access =
                        tokens.access;
                    ClientService_1.ClientService.jwtTokens.refresh =
                        tokens.refresh;
                };
                return AnalysesService;
            })();
            exports.AnalysesService = AnalysesService;

            /***/
        },
        /* 14 */
        /***/ (__unused_webpack_module, exports) => {
            "use strict";

            Object.defineProperty(exports, "__esModule", { value: true });
            function generateBytecodeRequest(bytecode, toolName) {
                if (toolName === void 0) {
                    toolName = "MythxJS";
                }
                return {
                    clientToolName: toolName,
                    data: {
                        bytecode: "" + bytecode,
                    },
                };
            }
            exports.generateBytecodeRequest = generateBytecodeRequest;
            function generateSourceCodeRequest(
                sourceCode,
                contractName,
                toolName,
                propertyChecking
            ) {
                var _a;
                if (toolName === void 0) {
                    toolName = "MythxJS";
                }
                if (propertyChecking === void 0) {
                    propertyChecking = false;
                }
                return {
                    clientToolName: toolName,
                    propertyChecking: propertyChecking,
                    data: {
                        contractName: contractName,
                        sources:
                            ((_a = {}),
                            (_a[contractName + ".sol"] = {
                                source: sourceCode,
                            }),
                            _a),
                        mainSource: contractName + ".sol",
                    },
                };
            }
            exports.generateSourceCodeRequest = generateSourceCodeRequest;
            function generateAnalysisRequest(
                options,
                toolName,
                propertyChecking
            ) {
                if (toolName === void 0) {
                    toolName = "MythXJS";
                }
                if (propertyChecking === void 0) {
                    propertyChecking = false;
                }
                if (options.toolName) {
                    toolName = options.toolName;
                }
                var result = {
                    clientToolName: toolName,
                    noCacheLookup:
                        options.noCacheLookup === undefined
                            ? false
                            : options.noCacheLookup,
                    propertyChecking: propertyChecking,
                    data: {},
                };
                if (typeof options.contractName !== "undefined")
                    result.data["contractName"] = options.contractName;
                if (typeof options.bytecode !== "undefined")
                    result.data["bytecode"] = options.bytecode;
                if (typeof options.sourceMap !== "undefined")
                    result.data["sourceMap"] = options.sourceMap;
                if (typeof options.deployedBytecode !== "undefined")
                    result.data["deployedBytecode"] = options.deployedBytecode;
                if (typeof options.deployedSourceMap !== "undefined")
                    result.data["deployedSourceMap"] =
                        options.deployedSourceMap;
                if (typeof options.mainSource !== "undefined")
                    result.data["mainSource"] = options.mainSource;
                if (typeof options.sources !== "undefined")
                    result.data["sources"] = options.sources;
                if (typeof options.sourceList !== "undefined")
                    result.data["sourceList"] = options.sourceList;
                if (typeof options.solcVersion !== "undefined")
                    result.data["version"] = options.solcVersion;
                if (typeof options.analysisMode !== "undefined")
                    result.data["analysisMode"] = options.analysisMode;
                if (typeof options.groupId !== "undefined")
                    result["groupId"] = options.groupId;
                return result;
            }
            exports.generateAnalysisRequest = generateAnalysisRequest;

            /***/
        },
        /* 15 */
        /***/ (__unused_webpack_module, exports, __webpack_require__) => {
            "use strict";

            Object.defineProperty(exports, "__esModule", { value: true });
            var postRequest_1 = __webpack_require__(16);
            exports.postRequest = postRequest_1.default;
            var getRequest_1 = __webpack_require__(43);
            exports.getRequest = getRequest_1.default;

            /***/
        },
        /* 16 */
        /***/ function (__unused_webpack_module, exports, __webpack_require__) {
            "use strict";

            var __awaiter =
                (this && this.__awaiter) ||
                function (thisArg, _arguments, P, generator) {
                    return new (P || (P = Promise))(function (resolve, reject) {
                        function fulfilled(value) {
                            try {
                                step(generator.next(value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function rejected(value) {
                            try {
                                step(generator["throw"](value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function step(result) {
                            result.done
                                ? resolve(result.value)
                                : new P(function (resolve) {
                                      resolve(result.value);
                                  }).then(fulfilled, rejected);
                        }
                        step(
                            (generator = generator.apply(
                                thisArg,
                                _arguments || []
                            )).next()
                        );
                    });
                };
            var __generator =
                (this && this.__generator) ||
                function (thisArg, body) {
                    var _ = {
                            label: 0,
                            sent: function () {
                                if (t[0] & 1) throw t[1];
                                return t[1];
                            },
                            trys: [],
                            ops: [],
                        },
                        f,
                        y,
                        t,
                        g;
                    return (
                        (g = {
                            next: verb(0),
                            throw: verb(1),
                            return: verb(2),
                        }),
                        typeof Symbol === "function" &&
                            (g[Symbol.iterator] = function () {
                                return this;
                            }),
                        g
                    );
                    function verb(n) {
                        return function (v) {
                            return step([n, v]);
                        };
                    }
                    function step(op) {
                        if (f)
                            throw new TypeError(
                                "Generator is already executing."
                            );
                        while (_)
                            try {
                                if (
                                    ((f = 1),
                                    y &&
                                        (t =
                                            op[0] & 2
                                                ? y["return"]
                                                : op[0]
                                                ? y["throw"] ||
                                                  ((t = y["return"]) &&
                                                      t.call(y),
                                                  0)
                                                : y.next) &&
                                        !(t = t.call(y, op[1])).done)
                                )
                                    return t;
                                if (((y = 0), t)) op = [op[0] & 2, t.value];
                                switch (op[0]) {
                                    case 0:
                                    case 1:
                                        t = op;
                                        break;
                                    case 4:
                                        _.label++;
                                        return { value: op[1], done: false };
                                    case 5:
                                        _.label++;
                                        y = op[1];
                                        op = [0];
                                        continue;
                                    case 7:
                                        op = _.ops.pop();
                                        _.trys.pop();
                                        continue;
                                    default:
                                        if (
                                            !((t = _.trys),
                                            (t =
                                                t.length > 0 &&
                                                t[t.length - 1])) &&
                                            (op[0] === 6 || op[0] === 2)
                                        ) {
                                            _ = 0;
                                            continue;
                                        }
                                        if (
                                            op[0] === 3 &&
                                            (!t ||
                                                (op[1] > t[0] && op[1] < t[3]))
                                        ) {
                                            _.label = op[1];
                                            break;
                                        }
                                        if (op[0] === 6 && _.label < t[1]) {
                                            _.label = t[1];
                                            t = op;
                                            break;
                                        }
                                        if (t && _.label < t[2]) {
                                            _.label = t[2];
                                            _.ops.push(op);
                                            break;
                                        }
                                        if (t[2]) _.ops.pop();
                                        _.trys.pop();
                                        continue;
                                }
                                op = body.call(thisArg, _);
                            } catch (e) {
                                op = [6, e];
                                y = 0;
                            } finally {
                                f = t = 0;
                            }
                        if (op[0] & 5) throw op[1];
                        return { value: op[0] ? op[1] : void 0, done: true };
                    }
                };
            Object.defineProperty(exports, "__esModule", { value: true });
            var axios_1 = __webpack_require__(17);
            function postRequest(url, body, headers) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [
                            2 /*return*/,
                            axios_1.default.post(url, body, {
                                headers: headers,
                                timeout: 10000,
                            }),
                        ];
                    });
                });
            }
            exports["default"] = postRequest;

            /***/
        },
        /* 17 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            module.exports = __webpack_require__(18);

            /***/
        },
        /* 18 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            var utils = __webpack_require__(19);
            var bind = __webpack_require__(20);
            var Axios = __webpack_require__(21);
            var mergeConfig = __webpack_require__(39);
            var defaults = __webpack_require__(27);

            /**
             * Create an instance of Axios
             *
             * @param {Object} defaultConfig The default config for the instance
             * @return {Axios} A new instance of Axios
             */
            function createInstance(defaultConfig) {
                var context = new Axios(defaultConfig);
                var instance = bind(Axios.prototype.request, context);

                // Copy axios.prototype to instance
                utils.extend(instance, Axios.prototype, context);

                // Copy context to instance
                utils.extend(instance, context);

                return instance;
            }

            // Create the default instance to be exported
            var axios = createInstance(defaults);

            // Expose Axios class to allow class inheritance
            axios.Axios = Axios;

            // Factory for creating new instances
            axios.create = function create(instanceConfig) {
                return createInstance(
                    mergeConfig(axios.defaults, instanceConfig)
                );
            };

            // Expose Cancel & CancelToken
            axios.Cancel = __webpack_require__(40);
            axios.CancelToken = __webpack_require__(41);
            axios.isCancel = __webpack_require__(26);

            // Expose all/spread
            axios.all = function all(promises) {
                return Promise.all(promises);
            };
            axios.spread = __webpack_require__(42);

            module.exports = axios;

            // Allow use of default import syntax in TypeScript
            module.exports["default"] = axios;

            /***/
        },
        /* 19 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            var bind = __webpack_require__(20);

            /*global toString:true*/

            // utils is a library of generic helper functions non-specific to axios

            var toString = Object.prototype.toString;

            /**
             * Determine if a value is an Array
             *
             * @param {Object} val The value to test
             * @returns {boolean} True if value is an Array, otherwise false
             */
            function isArray(val) {
                return toString.call(val) === "[object Array]";
            }

            /**
             * Determine if a value is undefined
             *
             * @param {Object} val The value to test
             * @returns {boolean} True if the value is undefined, otherwise false
             */
            function isUndefined(val) {
                return typeof val === "undefined";
            }

            /**
             * Determine if a value is a Buffer
             *
             * @param {Object} val The value to test
             * @returns {boolean} True if value is a Buffer, otherwise false
             */
            function isBuffer(val) {
                return (
                    val !== null &&
                    !isUndefined(val) &&
                    val.constructor !== null &&
                    !isUndefined(val.constructor) &&
                    typeof val.constructor.isBuffer === "function" &&
                    val.constructor.isBuffer(val)
                );
            }

            /**
             * Determine if a value is an ArrayBuffer
             *
             * @param {Object} val The value to test
             * @returns {boolean} True if value is an ArrayBuffer, otherwise false
             */
            function isArrayBuffer(val) {
                return toString.call(val) === "[object ArrayBuffer]";
            }

            /**
             * Determine if a value is a FormData
             *
             * @param {Object} val The value to test
             * @returns {boolean} True if value is an FormData, otherwise false
             */
            function isFormData(val) {
                return (
                    typeof FormData !== "undefined" && val instanceof FormData
                );
            }

            /**
             * Determine if a value is a view on an ArrayBuffer
             *
             * @param {Object} val The value to test
             * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
             */
            function isArrayBufferView(val) {
                var result;
                if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
                    result = ArrayBuffer.isView(val);
                } else {
                    result =
                        val && val.buffer && val.buffer instanceof ArrayBuffer;
                }
                return result;
            }

            /**
             * Determine if a value is a String
             *
             * @param {Object} val The value to test
             * @returns {boolean} True if value is a String, otherwise false
             */
            function isString(val) {
                return typeof val === "string";
            }

            /**
             * Determine if a value is a Number
             *
             * @param {Object} val The value to test
             * @returns {boolean} True if value is a Number, otherwise false
             */
            function isNumber(val) {
                return typeof val === "number";
            }

            /**
             * Determine if a value is an Object
             *
             * @param {Object} val The value to test
             * @returns {boolean} True if value is an Object, otherwise false
             */
            function isObject(val) {
                return val !== null && typeof val === "object";
            }

            /**
             * Determine if a value is a Date
             *
             * @param {Object} val The value to test
             * @returns {boolean} True if value is a Date, otherwise false
             */
            function isDate(val) {
                return toString.call(val) === "[object Date]";
            }

            /**
             * Determine if a value is a File
             *
             * @param {Object} val The value to test
             * @returns {boolean} True if value is a File, otherwise false
             */
            function isFile(val) {
                return toString.call(val) === "[object File]";
            }

            /**
             * Determine if a value is a Blob
             *
             * @param {Object} val The value to test
             * @returns {boolean} True if value is a Blob, otherwise false
             */
            function isBlob(val) {
                return toString.call(val) === "[object Blob]";
            }

            /**
             * Determine if a value is a Function
             *
             * @param {Object} val The value to test
             * @returns {boolean} True if value is a Function, otherwise false
             */
            function isFunction(val) {
                return toString.call(val) === "[object Function]";
            }

            /**
             * Determine if a value is a Stream
             *
             * @param {Object} val The value to test
             * @returns {boolean} True if value is a Stream, otherwise false
             */
            function isStream(val) {
                return isObject(val) && isFunction(val.pipe);
            }

            /**
             * Determine if a value is a URLSearchParams object
             *
             * @param {Object} val The value to test
             * @returns {boolean} True if value is a URLSearchParams object, otherwise false
             */
            function isURLSearchParams(val) {
                return (
                    typeof URLSearchParams !== "undefined" &&
                    val instanceof URLSearchParams
                );
            }

            /**
             * Trim excess whitespace off the beginning and end of a string
             *
             * @param {String} str The String to trim
             * @returns {String} The String freed of excess whitespace
             */
            function trim(str) {
                return str.replace(/^\s*/, "").replace(/\s*$/, "");
            }

            /**
             * Determine if we're running in a standard browser environment
             *
             * This allows axios to run in a web worker, and react-native.
             * Both environments support XMLHttpRequest, but not fully standard globals.
             *
             * web workers:
             *  typeof window -> undefined
             *  typeof document -> undefined
             *
             * react-native:
             *  navigator.product -> 'ReactNative'
             * nativescript
             *  navigator.product -> 'NativeScript' or 'NS'
             */
            function isStandardBrowserEnv() {
                if (
                    typeof navigator !== "undefined" &&
                    (navigator.product === "ReactNative" ||
                        navigator.product === "NativeScript" ||
                        navigator.product === "NS")
                ) {
                    return false;
                }
                return (
                    typeof window !== "undefined" &&
                    typeof document !== "undefined"
                );
            }

            /**
             * Iterate over an Array or an Object invoking a function for each item.
             *
             * If `obj` is an Array callback will be called passing
             * the value, index, and complete array for each item.
             *
             * If 'obj' is an Object callback will be called passing
             * the value, key, and complete object for each property.
             *
             * @param {Object|Array} obj The object to iterate
             * @param {Function} fn The callback to invoke for each item
             */
            function forEach(obj, fn) {
                // Don't bother if no value provided
                if (obj === null || typeof obj === "undefined") {
                    return;
                }

                // Force an array if not already something iterable
                if (typeof obj !== "object") {
                    /*eslint no-param-reassign:0*/
                    obj = [obj];
                }

                if (isArray(obj)) {
                    // Iterate over array values
                    for (var i = 0, l = obj.length; i < l; i++) {
                        fn.call(null, obj[i], i, obj);
                    }
                } else {
                    // Iterate over object keys
                    for (var key in obj) {
                        if (Object.prototype.hasOwnProperty.call(obj, key)) {
                            fn.call(null, obj[key], key, obj);
                        }
                    }
                }
            }

            /**
             * Accepts varargs expecting each argument to be an object, then
             * immutably merges the properties of each object and returns result.
             *
             * When multiple objects contain the same key the later object in
             * the arguments list will take precedence.
             *
             * Example:
             *
             * ```js
             * var result = merge({foo: 123}, {foo: 456});
             * console.log(result.foo); // outputs 456
             * ```
             *
             * @param {Object} obj1 Object to merge
             * @returns {Object} Result of all merge properties
             */
            function merge(/* obj1, obj2, obj3, ... */) {
                var result = {};
                function assignValue(val, key) {
                    if (
                        typeof result[key] === "object" &&
                        typeof val === "object"
                    ) {
                        result[key] = merge(result[key], val);
                    } else {
                        result[key] = val;
                    }
                }

                for (var i = 0, l = arguments.length; i < l; i++) {
                    forEach(arguments[i], assignValue);
                }
                return result;
            }

            /**
             * Function equal to merge with the difference being that no reference
             * to original objects is kept.
             *
             * @see merge
             * @param {Object} obj1 Object to merge
             * @returns {Object} Result of all merge properties
             */
            function deepMerge(/* obj1, obj2, obj3, ... */) {
                var result = {};
                function assignValue(val, key) {
                    if (
                        typeof result[key] === "object" &&
                        typeof val === "object"
                    ) {
                        result[key] = deepMerge(result[key], val);
                    } else if (typeof val === "object") {
                        result[key] = deepMerge({}, val);
                    } else {
                        result[key] = val;
                    }
                }

                for (var i = 0, l = arguments.length; i < l; i++) {
                    forEach(arguments[i], assignValue);
                }
                return result;
            }

            /**
             * Extends object a by mutably adding to it the properties of object b.
             *
             * @param {Object} a The object to be extended
             * @param {Object} b The object to copy properties from
             * @param {Object} thisArg The object to bind function to
             * @return {Object} The resulting value of object a
             */
            function extend(a, b, thisArg) {
                forEach(b, function assignValue(val, key) {
                    if (thisArg && typeof val === "function") {
                        a[key] = bind(val, thisArg);
                    } else {
                        a[key] = val;
                    }
                });
                return a;
            }

            module.exports = {
                isArray: isArray,
                isArrayBuffer: isArrayBuffer,
                isBuffer: isBuffer,
                isFormData: isFormData,
                isArrayBufferView: isArrayBufferView,
                isString: isString,
                isNumber: isNumber,
                isObject: isObject,
                isUndefined: isUndefined,
                isDate: isDate,
                isFile: isFile,
                isBlob: isBlob,
                isFunction: isFunction,
                isStream: isStream,
                isURLSearchParams: isURLSearchParams,
                isStandardBrowserEnv: isStandardBrowserEnv,
                forEach: forEach,
                merge: merge,
                deepMerge: deepMerge,
                extend: extend,
                trim: trim,
            };

            /***/
        },
        /* 20 */
        /***/ (module) => {
            "use strict";

            module.exports = function bind(fn, thisArg) {
                return function wrap() {
                    var args = new Array(arguments.length);
                    for (var i = 0; i < args.length; i++) {
                        args[i] = arguments[i];
                    }
                    return fn.apply(thisArg, args);
                };
            };

            /***/
        },
        /* 21 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            var utils = __webpack_require__(19);
            var buildURL = __webpack_require__(22);
            var InterceptorManager = __webpack_require__(23);
            var dispatchRequest = __webpack_require__(24);
            var mergeConfig = __webpack_require__(39);

            /**
             * Create a new instance of Axios
             *
             * @param {Object} instanceConfig The default config for the instance
             */
            function Axios(instanceConfig) {
                this.defaults = instanceConfig;
                this.interceptors = {
                    request: new InterceptorManager(),
                    response: new InterceptorManager(),
                };
            }

            /**
             * Dispatch a request
             *
             * @param {Object} config The config specific for this request (merged with this.defaults)
             */
            Axios.prototype.request = function request(config) {
                /*eslint no-param-reassign:0*/
                // Allow for axios('example/url'[, config]) a la fetch API
                if (typeof config === "string") {
                    config = arguments[1] || {};
                    config.url = arguments[0];
                } else {
                    config = config || {};
                }

                config = mergeConfig(this.defaults, config);

                // Set config.method
                if (config.method) {
                    config.method = config.method.toLowerCase();
                } else if (this.defaults.method) {
                    config.method = this.defaults.method.toLowerCase();
                } else {
                    config.method = "get";
                }

                // Hook up interceptors middleware
                var chain = [dispatchRequest, undefined];
                var promise = Promise.resolve(config);

                this.interceptors.request.forEach(
                    function unshiftRequestInterceptors(interceptor) {
                        chain.unshift(
                            interceptor.fulfilled,
                            interceptor.rejected
                        );
                    }
                );

                this.interceptors.response.forEach(
                    function pushResponseInterceptors(interceptor) {
                        chain.push(interceptor.fulfilled, interceptor.rejected);
                    }
                );

                while (chain.length) {
                    promise = promise.then(chain.shift(), chain.shift());
                }

                return promise;
            };

            Axios.prototype.getUri = function getUri(config) {
                config = mergeConfig(this.defaults, config);
                return buildURL(
                    config.url,
                    config.params,
                    config.paramsSerializer
                ).replace(/^\?/, "");
            };

            // Provide aliases for supported request methods
            utils.forEach(
                ["delete", "get", "head", "options"],
                function forEachMethodNoData(method) {
                    /*eslint func-names:0*/
                    Axios.prototype[method] = function (url, config) {
                        return this.request(
                            utils.merge(config || {}, {
                                method: method,
                                url: url,
                            })
                        );
                    };
                }
            );

            utils.forEach(
                ["post", "put", "patch"],
                function forEachMethodWithData(method) {
                    /*eslint func-names:0*/
                    Axios.prototype[method] = function (url, data, config) {
                        return this.request(
                            utils.merge(config || {}, {
                                method: method,
                                url: url,
                                data: data,
                            })
                        );
                    };
                }
            );

            module.exports = Axios;

            /***/
        },
        /* 22 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            var utils = __webpack_require__(19);

            function encode(val) {
                return encodeURIComponent(val)
                    .replace(/%40/gi, "@")
                    .replace(/%3A/gi, ":")
                    .replace(/%24/g, "$")
                    .replace(/%2C/gi, ",")
                    .replace(/%20/g, "+")
                    .replace(/%5B/gi, "[")
                    .replace(/%5D/gi, "]");
            }

            /**
             * Build a URL by appending params to the end
             *
             * @param {string} url The base of the url (e.g., http://www.google.com)
             * @param {object} [params] The params to be appended
             * @returns {string} The formatted url
             */
            module.exports = function buildURL(url, params, paramsSerializer) {
                /*eslint no-param-reassign:0*/
                if (!params) {
                    return url;
                }

                var serializedParams;
                if (paramsSerializer) {
                    serializedParams = paramsSerializer(params);
                } else if (utils.isURLSearchParams(params)) {
                    serializedParams = params.toString();
                } else {
                    var parts = [];

                    utils.forEach(params, function serialize(val, key) {
                        if (val === null || typeof val === "undefined") {
                            return;
                        }

                        if (utils.isArray(val)) {
                            key = key + "[]";
                        } else {
                            val = [val];
                        }

                        utils.forEach(val, function parseValue(v) {
                            if (utils.isDate(v)) {
                                v = v.toISOString();
                            } else if (utils.isObject(v)) {
                                v = JSON.stringify(v);
                            }
                            parts.push(encode(key) + "=" + encode(v));
                        });
                    });

                    serializedParams = parts.join("&");
                }

                if (serializedParams) {
                    var hashmarkIndex = url.indexOf("#");
                    if (hashmarkIndex !== -1) {
                        url = url.slice(0, hashmarkIndex);
                    }

                    url +=
                        (url.indexOf("?") === -1 ? "?" : "&") +
                        serializedParams;
                }

                return url;
            };

            /***/
        },
        /* 23 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            var utils = __webpack_require__(19);

            function InterceptorManager() {
                this.handlers = [];
            }

            /**
             * Add a new interceptor to the stack
             *
             * @param {Function} fulfilled The function to handle `then` for a `Promise`
             * @param {Function} rejected The function to handle `reject` for a `Promise`
             *
             * @return {Number} An ID used to remove interceptor later
             */
            InterceptorManager.prototype.use = function use(
                fulfilled,
                rejected
            ) {
                this.handlers.push({
                    fulfilled: fulfilled,
                    rejected: rejected,
                });
                return this.handlers.length - 1;
            };

            /**
             * Remove an interceptor from the stack
             *
             * @param {Number} id The ID that was returned by `use`
             */
            InterceptorManager.prototype.eject = function eject(id) {
                if (this.handlers[id]) {
                    this.handlers[id] = null;
                }
            };

            /**
             * Iterate over all the registered interceptors
             *
             * This method is particularly useful for skipping over any
             * interceptors that may have become `null` calling `eject`.
             *
             * @param {Function} fn The function to call for each interceptor
             */
            InterceptorManager.prototype.forEach = function forEach(fn) {
                utils.forEach(this.handlers, function forEachHandler(h) {
                    if (h !== null) {
                        fn(h);
                    }
                });
            };

            module.exports = InterceptorManager;

            /***/
        },
        /* 24 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            var utils = __webpack_require__(19);
            var transformData = __webpack_require__(25);
            var isCancel = __webpack_require__(26);
            var defaults = __webpack_require__(27);

            /**
             * Throws a `Cancel` if cancellation has been requested.
             */
            function throwIfCancellationRequested(config) {
                if (config.cancelToken) {
                    config.cancelToken.throwIfRequested();
                }
            }

            /**
             * Dispatch a request to the server using the configured adapter.
             *
             * @param {object} config The config that is to be used for the request
             * @returns {Promise} The Promise to be fulfilled
             */
            module.exports = function dispatchRequest(config) {
                throwIfCancellationRequested(config);

                // Ensure headers exist
                config.headers = config.headers || {};

                // Transform request data
                config.data = transformData(
                    config.data,
                    config.headers,
                    config.transformRequest
                );

                // Flatten headers
                config.headers = utils.merge(
                    config.headers.common || {},
                    config.headers[config.method] || {},
                    config.headers
                );

                utils.forEach(
                    ["delete", "get", "head", "post", "put", "patch", "common"],
                    function cleanHeaderConfig(method) {
                        delete config.headers[method];
                    }
                );

                var adapter = config.adapter || defaults.adapter;

                return adapter(config).then(
                    function onAdapterResolution(response) {
                        throwIfCancellationRequested(config);

                        // Transform response data
                        response.data = transformData(
                            response.data,
                            response.headers,
                            config.transformResponse
                        );

                        return response;
                    },
                    function onAdapterRejection(reason) {
                        if (!isCancel(reason)) {
                            throwIfCancellationRequested(config);

                            // Transform response data
                            if (reason && reason.response) {
                                reason.response.data = transformData(
                                    reason.response.data,
                                    reason.response.headers,
                                    config.transformResponse
                                );
                            }
                        }

                        return Promise.reject(reason);
                    }
                );
            };

            /***/
        },
        /* 25 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            var utils = __webpack_require__(19);

            /**
             * Transform the data for a request or a response
             *
             * @param {Object|String} data The data to be transformed
             * @param {Array} headers The headers for the request or response
             * @param {Array|Function} fns A single function or Array of functions
             * @returns {*} The resulting transformed data
             */
            module.exports = function transformData(data, headers, fns) {
                /*eslint no-param-reassign:0*/
                utils.forEach(fns, function transform(fn) {
                    data = fn(data, headers);
                });

                return data;
            };

            /***/
        },
        /* 26 */
        /***/ (module) => {
            "use strict";

            module.exports = function isCancel(value) {
                return !!(value && value.__CANCEL__);
            };

            /***/
        },
        /* 27 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";
            /* provided dependency */ var process = __webpack_require__(9);

            var utils = __webpack_require__(19);
            var normalizeHeaderName = __webpack_require__(28);

            var DEFAULT_CONTENT_TYPE = {
                "Content-Type": "application/x-www-form-urlencoded",
            };

            function setContentTypeIfUnset(headers, value) {
                if (
                    !utils.isUndefined(headers) &&
                    utils.isUndefined(headers["Content-Type"])
                ) {
                    headers["Content-Type"] = value;
                }
            }

            function getDefaultAdapter() {
                var adapter;
                if (typeof XMLHttpRequest !== "undefined") {
                    // For browsers use XHR adapter
                    adapter = __webpack_require__(29);
                } else if (
                    typeof process !== "undefined" &&
                    Object.prototype.toString.call(process) ===
                        "[object process]"
                ) {
                    // For node use HTTP adapter
                    adapter = __webpack_require__(29);
                }
                return adapter;
            }

            var defaults = {
                adapter: getDefaultAdapter(),

                transformRequest: [
                    function transformRequest(data, headers) {
                        normalizeHeaderName(headers, "Accept");
                        normalizeHeaderName(headers, "Content-Type");
                        if (
                            utils.isFormData(data) ||
                            utils.isArrayBuffer(data) ||
                            utils.isBuffer(data) ||
                            utils.isStream(data) ||
                            utils.isFile(data) ||
                            utils.isBlob(data)
                        ) {
                            return data;
                        }
                        if (utils.isArrayBufferView(data)) {
                            return data.buffer;
                        }
                        if (utils.isURLSearchParams(data)) {
                            setContentTypeIfUnset(
                                headers,
                                "application/x-www-form-urlencoded;charset=utf-8"
                            );
                            return data.toString();
                        }
                        if (utils.isObject(data)) {
                            setContentTypeIfUnset(
                                headers,
                                "application/json;charset=utf-8"
                            );
                            return JSON.stringify(data);
                        }
                        return data;
                    },
                ],

                transformResponse: [
                    function transformResponse(data) {
                        /*eslint no-param-reassign:0*/
                        if (typeof data === "string") {
                            try {
                                data = JSON.parse(data);
                            } catch (e) {
                                /* Ignore */
                            }
                        }
                        return data;
                    },
                ],

                /**
                 * A timeout in milliseconds to abort a request. If set to 0 (default) a
                 * timeout is not created.
                 */
                timeout: 0,

                xsrfCookieName: "XSRF-TOKEN",
                xsrfHeaderName: "X-XSRF-TOKEN",

                maxContentLength: -1,

                validateStatus: function validateStatus(status) {
                    return status >= 200 && status < 300;
                },
            };

            defaults.headers = {
                common: {
                    Accept: "application/json, text/plain, */*",
                },
            };

            utils.forEach(
                ["delete", "get", "head"],
                function forEachMethodNoData(method) {
                    defaults.headers[method] = {};
                }
            );

            utils.forEach(
                ["post", "put", "patch"],
                function forEachMethodWithData(method) {
                    defaults.headers[method] =
                        utils.merge(DEFAULT_CONTENT_TYPE);
                }
            );

            module.exports = defaults;

            /***/
        },
        /* 28 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            var utils = __webpack_require__(19);

            module.exports = function normalizeHeaderName(
                headers,
                normalizedName
            ) {
                utils.forEach(headers, function processHeader(value, name) {
                    if (
                        name !== normalizedName &&
                        name.toUpperCase() === normalizedName.toUpperCase()
                    ) {
                        headers[normalizedName] = value;
                        delete headers[name];
                    }
                });
            };

            /***/
        },
        /* 29 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            var utils = __webpack_require__(19);
            var settle = __webpack_require__(30);
            var buildURL = __webpack_require__(22);
            var buildFullPath = __webpack_require__(33);
            var parseHeaders = __webpack_require__(36);
            var isURLSameOrigin = __webpack_require__(37);
            var createError = __webpack_require__(31);

            module.exports = function xhrAdapter(config) {
                return new Promise(function dispatchXhrRequest(
                    resolve,
                    reject
                ) {
                    var requestData = config.data;
                    var requestHeaders = config.headers;

                    if (utils.isFormData(requestData)) {
                        delete requestHeaders["Content-Type"]; // Let the browser set it
                    }

                    var request = new XMLHttpRequest();

                    // HTTP basic authentication
                    if (config.auth) {
                        var username = config.auth.username || "";
                        var password = config.auth.password || "";
                        requestHeaders.Authorization =
                            "Basic " + btoa(username + ":" + password);
                    }

                    var fullPath = buildFullPath(config.baseURL, config.url);
                    request.open(
                        config.method.toUpperCase(),
                        buildURL(
                            fullPath,
                            config.params,
                            config.paramsSerializer
                        ),
                        true
                    );

                    // Set the request timeout in MS
                    request.timeout = config.timeout;

                    // Listen for ready state
                    request.onreadystatechange = function handleLoad() {
                        if (!request || request.readyState !== 4) {
                            return;
                        }

                        // The request errored out and we didn't get a response, this will be
                        // handled by onerror instead
                        // With one exception: request that using file: protocol, most browsers
                        // will return status as 0 even though it's a successful request
                        if (
                            request.status === 0 &&
                            !(
                                request.responseURL &&
                                request.responseURL.indexOf("file:") === 0
                            )
                        ) {
                            return;
                        }

                        // Prepare the response
                        var responseHeaders =
                            "getAllResponseHeaders" in request
                                ? parseHeaders(request.getAllResponseHeaders())
                                : null;
                        var responseData =
                            !config.responseType ||
                            config.responseType === "text"
                                ? request.responseText
                                : request.response;
                        var response = {
                            data: responseData,
                            status: request.status,
                            statusText: request.statusText,
                            headers: responseHeaders,
                            config: config,
                            request: request,
                        };

                        settle(resolve, reject, response);

                        // Clean up request
                        request = null;
                    };

                    // Handle browser request cancellation (as opposed to a manual cancellation)
                    request.onabort = function handleAbort() {
                        if (!request) {
                            return;
                        }

                        reject(
                            createError(
                                "Request aborted",
                                config,
                                "ECONNABORTED",
                                request
                            )
                        );

                        // Clean up request
                        request = null;
                    };

                    // Handle low level network errors
                    request.onerror = function handleError() {
                        // Real errors are hidden from us by the browser
                        // onerror should only fire if it's a network error
                        reject(
                            createError("Network Error", config, null, request)
                        );

                        // Clean up request
                        request = null;
                    };

                    // Handle timeout
                    request.ontimeout = function handleTimeout() {
                        var timeoutErrorMessage =
                            "timeout of " + config.timeout + "ms exceeded";
                        if (config.timeoutErrorMessage) {
                            timeoutErrorMessage = config.timeoutErrorMessage;
                        }
                        reject(
                            createError(
                                timeoutErrorMessage,
                                config,
                                "ECONNABORTED",
                                request
                            )
                        );

                        // Clean up request
                        request = null;
                    };

                    // Add xsrf header
                    // This is only done if running in a standard browser environment.
                    // Specifically not if we're in a web worker, or react-native.
                    if (utils.isStandardBrowserEnv()) {
                        var cookies = __webpack_require__(38);

                        // Add xsrf header
                        var xsrfValue =
                            (config.withCredentials ||
                                isURLSameOrigin(fullPath)) &&
                            config.xsrfCookieName
                                ? cookies.read(config.xsrfCookieName)
                                : undefined;

                        if (xsrfValue) {
                            requestHeaders[config.xsrfHeaderName] = xsrfValue;
                        }
                    }

                    // Add headers to the request
                    if ("setRequestHeader" in request) {
                        utils.forEach(
                            requestHeaders,
                            function setRequestHeader(val, key) {
                                if (
                                    typeof requestData === "undefined" &&
                                    key.toLowerCase() === "content-type"
                                ) {
                                    // Remove Content-Type if data is undefined
                                    delete requestHeaders[key];
                                } else {
                                    // Otherwise add header to the request
                                    request.setRequestHeader(key, val);
                                }
                            }
                        );
                    }

                    // Add withCredentials to request if needed
                    if (!utils.isUndefined(config.withCredentials)) {
                        request.withCredentials = !!config.withCredentials;
                    }

                    // Add responseType to request if needed
                    if (config.responseType) {
                        try {
                            request.responseType = config.responseType;
                        } catch (e) {
                            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
                            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
                            if (config.responseType !== "json") {
                                throw e;
                            }
                        }
                    }

                    // Handle progress if needed
                    if (typeof config.onDownloadProgress === "function") {
                        request.addEventListener(
                            "progress",
                            config.onDownloadProgress
                        );
                    }

                    // Not all browsers support upload events
                    if (
                        typeof config.onUploadProgress === "function" &&
                        request.upload
                    ) {
                        request.upload.addEventListener(
                            "progress",
                            config.onUploadProgress
                        );
                    }

                    if (config.cancelToken) {
                        // Handle cancellation
                        config.cancelToken.promise.then(function onCanceled(
                            cancel
                        ) {
                            if (!request) {
                                return;
                            }

                            request.abort();
                            reject(cancel);
                            // Clean up request
                            request = null;
                        });
                    }

                    if (requestData === undefined) {
                        requestData = null;
                    }

                    // Send the request
                    request.send(requestData);
                });
            };

            /***/
        },
        /* 30 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            var createError = __webpack_require__(31);

            /**
             * Resolve or reject a Promise based on response status.
             *
             * @param {Function} resolve A function that resolves the promise.
             * @param {Function} reject A function that rejects the promise.
             * @param {object} response The response.
             */
            module.exports = function settle(resolve, reject, response) {
                var validateStatus = response.config.validateStatus;
                if (!validateStatus || validateStatus(response.status)) {
                    resolve(response);
                } else {
                    reject(
                        createError(
                            "Request failed with status code " +
                                response.status,
                            response.config,
                            null,
                            response.request,
                            response
                        )
                    );
                }
            };

            /***/
        },
        /* 31 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            var enhanceError = __webpack_require__(32);

            /**
             * Create an Error with the specified message, config, error code, request and response.
             *
             * @param {string} message The error message.
             * @param {Object} config The config.
             * @param {string} [code] The error code (for example, 'ECONNABORTED').
             * @param {Object} [request] The request.
             * @param {Object} [response] The response.
             * @returns {Error} The created error.
             */
            module.exports = function createError(
                message,
                config,
                code,
                request,
                response
            ) {
                var error = new Error(message);
                return enhanceError(error, config, code, request, response);
            };

            /***/
        },
        /* 32 */
        /***/ (module) => {
            "use strict";

            /**
             * Update an Error with the specified config, error code, and response.
             *
             * @param {Error} error The error to update.
             * @param {Object} config The config.
             * @param {string} [code] The error code (for example, 'ECONNABORTED').
             * @param {Object} [request] The request.
             * @param {Object} [response] The response.
             * @returns {Error} The error.
             */
            module.exports = function enhanceError(
                error,
                config,
                code,
                request,
                response
            ) {
                error.config = config;
                if (code) {
                    error.code = code;
                }

                error.request = request;
                error.response = response;
                error.isAxiosError = true;

                error.toJSON = function () {
                    return {
                        // Standard
                        message: this.message,
                        name: this.name,
                        // Microsoft
                        description: this.description,
                        number: this.number,
                        // Mozilla
                        fileName: this.fileName,
                        lineNumber: this.lineNumber,
                        columnNumber: this.columnNumber,
                        stack: this.stack,
                        // Axios
                        config: this.config,
                        code: this.code,
                    };
                };
                return error;
            };

            /***/
        },
        /* 33 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            var isAbsoluteURL = __webpack_require__(34);
            var combineURLs = __webpack_require__(35);

            /**
             * Creates a new URL by combining the baseURL with the requestedURL,
             * only when the requestedURL is not already an absolute URL.
             * If the requestURL is absolute, this function returns the requestedURL untouched.
             *
             * @param {string} baseURL The base URL
             * @param {string} requestedURL Absolute or relative URL to combine
             * @returns {string} The combined full path
             */
            module.exports = function buildFullPath(baseURL, requestedURL) {
                if (baseURL && !isAbsoluteURL(requestedURL)) {
                    return combineURLs(baseURL, requestedURL);
                }
                return requestedURL;
            };

            /***/
        },
        /* 34 */
        /***/ (module) => {
            "use strict";

            /**
             * Determines whether the specified URL is absolute
             *
             * @param {string} url The URL to test
             * @returns {boolean} True if the specified URL is absolute, otherwise false
             */
            module.exports = function isAbsoluteURL(url) {
                // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
                // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
                // by any combination of letters, digits, plus, period, or hyphen.
                return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
            };

            /***/
        },
        /* 35 */
        /***/ (module) => {
            "use strict";

            /**
             * Creates a new URL by combining the specified URLs
             *
             * @param {string} baseURL The base URL
             * @param {string} relativeURL The relative URL
             * @returns {string} The combined URL
             */
            module.exports = function combineURLs(baseURL, relativeURL) {
                return relativeURL
                    ? baseURL.replace(/\/+$/, "") +
                          "/" +
                          relativeURL.replace(/^\/+/, "")
                    : baseURL;
            };

            /***/
        },
        /* 36 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            var utils = __webpack_require__(19);

            // Headers whose duplicates are ignored by node
            // c.f. https://nodejs.org/api/http.html#http_message_headers
            var ignoreDuplicateOf = [
                "age",
                "authorization",
                "content-length",
                "content-type",
                "etag",
                "expires",
                "from",
                "host",
                "if-modified-since",
                "if-unmodified-since",
                "last-modified",
                "location",
                "max-forwards",
                "proxy-authorization",
                "referer",
                "retry-after",
                "user-agent",
            ];

            /**
             * Parse headers into an object
             *
             * ```
             * Date: Wed, 27 Aug 2014 08:58:49 GMT
             * Content-Type: application/json
             * Connection: keep-alive
             * Transfer-Encoding: chunked
             * ```
             *
             * @param {String} headers Headers needing to be parsed
             * @returns {Object} Headers parsed into an object
             */
            module.exports = function parseHeaders(headers) {
                var parsed = {};
                var key;
                var val;
                var i;

                if (!headers) {
                    return parsed;
                }

                utils.forEach(headers.split("\n"), function parser(line) {
                    i = line.indexOf(":");
                    key = utils.trim(line.substr(0, i)).toLowerCase();
                    val = utils.trim(line.substr(i + 1));

                    if (key) {
                        if (
                            parsed[key] &&
                            ignoreDuplicateOf.indexOf(key) >= 0
                        ) {
                            return;
                        }
                        if (key === "set-cookie") {
                            parsed[key] = (
                                parsed[key] ? parsed[key] : []
                            ).concat([val]);
                        } else {
                            parsed[key] = parsed[key]
                                ? parsed[key] + ", " + val
                                : val;
                        }
                    }
                });

                return parsed;
            };

            /***/
        },
        /* 37 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            var utils = __webpack_require__(19);

            module.exports = utils.isStandardBrowserEnv()
                ? // Standard browser envs have full support of the APIs needed to test
                  // whether the request URL is of the same origin as current location.
                  (function standardBrowserEnv() {
                      var msie = /(msie|trident)/i.test(navigator.userAgent);
                      var urlParsingNode = document.createElement("a");
                      var originURL;

                      /**
                       * Parse a URL to discover it's components
                       *
                       * @param {String} url The URL to be parsed
                       * @returns {Object}
                       */
                      function resolveURL(url) {
                          var href = url;

                          if (msie) {
                              // IE needs attribute set twice to normalize properties
                              urlParsingNode.setAttribute("href", href);
                              href = urlParsingNode.href;
                          }

                          urlParsingNode.setAttribute("href", href);

                          // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
                          return {
                              href: urlParsingNode.href,
                              protocol: urlParsingNode.protocol
                                  ? urlParsingNode.protocol.replace(/:$/, "")
                                  : "",
                              host: urlParsingNode.host,
                              search: urlParsingNode.search
                                  ? urlParsingNode.search.replace(/^\?/, "")
                                  : "",
                              hash: urlParsingNode.hash
                                  ? urlParsingNode.hash.replace(/^#/, "")
                                  : "",
                              hostname: urlParsingNode.hostname,
                              port: urlParsingNode.port,
                              pathname:
                                  urlParsingNode.pathname.charAt(0) === "/"
                                      ? urlParsingNode.pathname
                                      : "/" + urlParsingNode.pathname,
                          };
                      }

                      originURL = resolveURL(window.location.href);

                      /**
                       * Determine if a URL shares the same origin as the current location
                       *
                       * @param {String} requestURL The URL to test
                       * @returns {boolean} True if URL shares the same origin, otherwise false
                       */
                      return function isURLSameOrigin(requestURL) {
                          var parsed = utils.isString(requestURL)
                              ? resolveURL(requestURL)
                              : requestURL;
                          return (
                              parsed.protocol === originURL.protocol &&
                              parsed.host === originURL.host
                          );
                      };
                  })()
                : // Non standard browser envs (web workers, react-native) lack needed support.
                  (function nonStandardBrowserEnv() {
                      return function isURLSameOrigin() {
                          return true;
                      };
                  })();

            /***/
        },
        /* 38 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            var utils = __webpack_require__(19);

            module.exports = utils.isStandardBrowserEnv()
                ? // Standard browser envs support document.cookie
                  (function standardBrowserEnv() {
                      return {
                          write: function write(
                              name,
                              value,
                              expires,
                              path,
                              domain,
                              secure
                          ) {
                              var cookie = [];
                              cookie.push(
                                  name + "=" + encodeURIComponent(value)
                              );

                              if (utils.isNumber(expires)) {
                                  cookie.push(
                                      "expires=" +
                                          new Date(expires).toGMTString()
                                  );
                              }

                              if (utils.isString(path)) {
                                  cookie.push("path=" + path);
                              }

                              if (utils.isString(domain)) {
                                  cookie.push("domain=" + domain);
                              }

                              if (secure === true) {
                                  cookie.push("secure");
                              }

                              document.cookie = cookie.join("; ");
                          },

                          read: function read(name) {
                              var match = document.cookie.match(
                                  new RegExp("(^|;\\s*)(" + name + ")=([^;]*)")
                              );
                              return match
                                  ? decodeURIComponent(match[3])
                                  : null;
                          },

                          remove: function remove(name) {
                              this.write(name, "", Date.now() - 86400000);
                          },
                      };
                  })()
                : // Non standard browser env (web workers, react-native) lack needed support.
                  (function nonStandardBrowserEnv() {
                      return {
                          write: function write() {},
                          read: function read() {
                              return null;
                          },
                          remove: function remove() {},
                      };
                  })();

            /***/
        },
        /* 39 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            var utils = __webpack_require__(19);

            /**
             * Config-specific merge-function which creates a new config-object
             * by merging two configuration objects together.
             *
             * @param {Object} config1
             * @param {Object} config2
             * @returns {Object} New object resulting from merging config2 to config1
             */
            module.exports = function mergeConfig(config1, config2) {
                // eslint-disable-next-line no-param-reassign
                config2 = config2 || {};
                var config = {};

                var valueFromConfig2Keys = ["url", "method", "params", "data"];
                var mergeDeepPropertiesKeys = ["headers", "auth", "proxy"];
                var defaultToConfig2Keys = [
                    "baseURL",
                    "url",
                    "transformRequest",
                    "transformResponse",
                    "paramsSerializer",
                    "timeout",
                    "withCredentials",
                    "adapter",
                    "responseType",
                    "xsrfCookieName",
                    "xsrfHeaderName",
                    "onUploadProgress",
                    "onDownloadProgress",
                    "maxContentLength",
                    "validateStatus",
                    "maxRedirects",
                    "httpAgent",
                    "httpsAgent",
                    "cancelToken",
                    "socketPath",
                ];

                utils.forEach(
                    valueFromConfig2Keys,
                    function valueFromConfig2(prop) {
                        if (typeof config2[prop] !== "undefined") {
                            config[prop] = config2[prop];
                        }
                    }
                );

                utils.forEach(
                    mergeDeepPropertiesKeys,
                    function mergeDeepProperties(prop) {
                        if (utils.isObject(config2[prop])) {
                            config[prop] = utils.deepMerge(
                                config1[prop],
                                config2[prop]
                            );
                        } else if (typeof config2[prop] !== "undefined") {
                            config[prop] = config2[prop];
                        } else if (utils.isObject(config1[prop])) {
                            config[prop] = utils.deepMerge(config1[prop]);
                        } else if (typeof config1[prop] !== "undefined") {
                            config[prop] = config1[prop];
                        }
                    }
                );

                utils.forEach(
                    defaultToConfig2Keys,
                    function defaultToConfig2(prop) {
                        if (typeof config2[prop] !== "undefined") {
                            config[prop] = config2[prop];
                        } else if (typeof config1[prop] !== "undefined") {
                            config[prop] = config1[prop];
                        }
                    }
                );

                var axiosKeys = valueFromConfig2Keys
                    .concat(mergeDeepPropertiesKeys)
                    .concat(defaultToConfig2Keys);

                var otherKeys = Object.keys(config2).filter(
                    function filterAxiosKeys(key) {
                        return axiosKeys.indexOf(key) === -1;
                    }
                );

                utils.forEach(
                    otherKeys,
                    function otherKeysDefaultToConfig2(prop) {
                        if (typeof config2[prop] !== "undefined") {
                            config[prop] = config2[prop];
                        } else if (typeof config1[prop] !== "undefined") {
                            config[prop] = config1[prop];
                        }
                    }
                );

                return config;
            };

            /***/
        },
        /* 40 */
        /***/ (module) => {
            "use strict";

            /**
             * A `Cancel` is an object that is thrown when an operation is canceled.
             *
             * @class
             * @param {string=} message The message.
             */
            function Cancel(message) {
                this.message = message;
            }

            Cancel.prototype.toString = function toString() {
                return "Cancel" + (this.message ? ": " + this.message : "");
            };

            Cancel.prototype.__CANCEL__ = true;

            module.exports = Cancel;

            /***/
        },
        /* 41 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            var Cancel = __webpack_require__(40);

            /**
             * A `CancelToken` is an object that can be used to request cancellation of an operation.
             *
             * @class
             * @param {Function} executor The executor function.
             */
            function CancelToken(executor) {
                if (typeof executor !== "function") {
                    throw new TypeError("executor must be a function.");
                }

                var resolvePromise;
                this.promise = new Promise(function promiseExecutor(resolve) {
                    resolvePromise = resolve;
                });

                var token = this;
                executor(function cancel(message) {
                    if (token.reason) {
                        // Cancellation has already been requested
                        return;
                    }

                    token.reason = new Cancel(message);
                    resolvePromise(token.reason);
                });
            }

            /**
             * Throws a `Cancel` if cancellation has been requested.
             */
            CancelToken.prototype.throwIfRequested =
                function throwIfRequested() {
                    if (this.reason) {
                        throw this.reason;
                    }
                };

            /**
             * Returns an object that contains a new `CancelToken` and a function that, when called,
             * cancels the `CancelToken`.
             */
            CancelToken.source = function source() {
                var cancel;
                var token = new CancelToken(function executor(c) {
                    cancel = c;
                });
                return {
                    token: token,
                    cancel: cancel,
                };
            };

            module.exports = CancelToken;

            /***/
        },
        /* 42 */
        /***/ (module) => {
            "use strict";

            /**
             * Syntactic sugar for invoking a function and expanding an array for arguments.
             *
             * Common use case would be to use `Function.prototype.apply`.
             *
             *  ```js
             *  function f(x, y, z) {}
             *  var args = [1, 2, 3];
             *  f.apply(null, args);
             *  ```
             *
             * With `spread` this example can be re-written.
             *
             *  ```js
             *  spread(function(x, y, z) {})([1, 2, 3]);
             *  ```
             *
             * @param {Function} callback
             * @returns {Function}
             */
            module.exports = function spread(callback) {
                return function wrap(arr) {
                    return callback.apply(null, arr);
                };
            };

            /***/
        },
        /* 43 */
        /***/ function (__unused_webpack_module, exports, __webpack_require__) {
            "use strict";

            var __awaiter =
                (this && this.__awaiter) ||
                function (thisArg, _arguments, P, generator) {
                    return new (P || (P = Promise))(function (resolve, reject) {
                        function fulfilled(value) {
                            try {
                                step(generator.next(value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function rejected(value) {
                            try {
                                step(generator["throw"](value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function step(result) {
                            result.done
                                ? resolve(result.value)
                                : new P(function (resolve) {
                                      resolve(result.value);
                                  }).then(fulfilled, rejected);
                        }
                        step(
                            (generator = generator.apply(
                                thisArg,
                                _arguments || []
                            )).next()
                        );
                    });
                };
            var __generator =
                (this && this.__generator) ||
                function (thisArg, body) {
                    var _ = {
                            label: 0,
                            sent: function () {
                                if (t[0] & 1) throw t[1];
                                return t[1];
                            },
                            trys: [],
                            ops: [],
                        },
                        f,
                        y,
                        t,
                        g;
                    return (
                        (g = {
                            next: verb(0),
                            throw: verb(1),
                            return: verb(2),
                        }),
                        typeof Symbol === "function" &&
                            (g[Symbol.iterator] = function () {
                                return this;
                            }),
                        g
                    );
                    function verb(n) {
                        return function (v) {
                            return step([n, v]);
                        };
                    }
                    function step(op) {
                        if (f)
                            throw new TypeError(
                                "Generator is already executing."
                            );
                        while (_)
                            try {
                                if (
                                    ((f = 1),
                                    y &&
                                        (t =
                                            op[0] & 2
                                                ? y["return"]
                                                : op[0]
                                                ? y["throw"] ||
                                                  ((t = y["return"]) &&
                                                      t.call(y),
                                                  0)
                                                : y.next) &&
                                        !(t = t.call(y, op[1])).done)
                                )
                                    return t;
                                if (((y = 0), t)) op = [op[0] & 2, t.value];
                                switch (op[0]) {
                                    case 0:
                                    case 1:
                                        t = op;
                                        break;
                                    case 4:
                                        _.label++;
                                        return { value: op[1], done: false };
                                    case 5:
                                        _.label++;
                                        y = op[1];
                                        op = [0];
                                        continue;
                                    case 7:
                                        op = _.ops.pop();
                                        _.trys.pop();
                                        continue;
                                    default:
                                        if (
                                            !((t = _.trys),
                                            (t =
                                                t.length > 0 &&
                                                t[t.length - 1])) &&
                                            (op[0] === 6 || op[0] === 2)
                                        ) {
                                            _ = 0;
                                            continue;
                                        }
                                        if (
                                            op[0] === 3 &&
                                            (!t ||
                                                (op[1] > t[0] && op[1] < t[3]))
                                        ) {
                                            _.label = op[1];
                                            break;
                                        }
                                        if (op[0] === 6 && _.label < t[1]) {
                                            _.label = t[1];
                                            t = op;
                                            break;
                                        }
                                        if (t && _.label < t[2]) {
                                            _.label = t[2];
                                            _.ops.push(op);
                                            break;
                                        }
                                        if (t[2]) _.ops.pop();
                                        _.trys.pop();
                                        continue;
                                }
                                op = body.call(thisArg, _);
                            } catch (e) {
                                op = [6, e];
                                y = 0;
                            } finally {
                                f = t = 0;
                            }
                        if (op[0] & 5) throw op[1];
                        return { value: op[0] ? op[1] : void 0, done: true };
                    }
                };
            Object.defineProperty(exports, "__esModule", { value: true });
            var axios_1 = __webpack_require__(17);
            function getRequest(url, headers) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [
                            2 /*return*/,
                            axios_1.default.get(url, { headers: headers }),
                        ];
                    });
                });
            }
            exports["default"] = getRequest;

            /***/
        },
        /* 44 */
        /***/ (__unused_webpack_module, exports) => {
            "use strict";

            Object.defineProperty(exports, "__esModule", { value: true });
            function errorHandler(err) {
                var status;
                var error;
                if (err.response && err.response.data) {
                    status = err.response.data.status;
                    error = err.response.data.error;
                }
                if (status && error) {
                    throw new Error(status + " " + error);
                } else {
                    throw new Error("MythxJS. Error with your request. " + err);
                }
            }
            exports.errorHandler = errorHandler;

            /***/
        },
        /* 45 */
        /***/ function (__unused_webpack_module, exports, __webpack_require__) {
            "use strict";

            var __awaiter =
                (this && this.__awaiter) ||
                function (thisArg, _arguments, P, generator) {
                    return new (P || (P = Promise))(function (resolve, reject) {
                        function fulfilled(value) {
                            try {
                                step(generator.next(value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function rejected(value) {
                            try {
                                step(generator["throw"](value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function step(result) {
                            result.done
                                ? resolve(result.value)
                                : new P(function (resolve) {
                                      resolve(result.value);
                                  }).then(fulfilled, rejected);
                        }
                        step(
                            (generator = generator.apply(
                                thisArg,
                                _arguments || []
                            )).next()
                        );
                    });
                };
            var __generator =
                (this && this.__generator) ||
                function (thisArg, body) {
                    var _ = {
                            label: 0,
                            sent: function () {
                                if (t[0] & 1) throw t[1];
                                return t[1];
                            },
                            trys: [],
                            ops: [],
                        },
                        f,
                        y,
                        t,
                        g;
                    return (
                        (g = {
                            next: verb(0),
                            throw: verb(1),
                            return: verb(2),
                        }),
                        typeof Symbol === "function" &&
                            (g[Symbol.iterator] = function () {
                                return this;
                            }),
                        g
                    );
                    function verb(n) {
                        return function (v) {
                            return step([n, v]);
                        };
                    }
                    function step(op) {
                        if (f)
                            throw new TypeError(
                                "Generator is already executing."
                            );
                        while (_)
                            try {
                                if (
                                    ((f = 1),
                                    y &&
                                        (t =
                                            op[0] & 2
                                                ? y["return"]
                                                : op[0]
                                                ? y["throw"] ||
                                                  ((t = y["return"]) &&
                                                      t.call(y),
                                                  0)
                                                : y.next) &&
                                        !(t = t.call(y, op[1])).done)
                                )
                                    return t;
                                if (((y = 0), t)) op = [op[0] & 2, t.value];
                                switch (op[0]) {
                                    case 0:
                                    case 1:
                                        t = op;
                                        break;
                                    case 4:
                                        _.label++;
                                        return { value: op[1], done: false };
                                    case 5:
                                        _.label++;
                                        y = op[1];
                                        op = [0];
                                        continue;
                                    case 7:
                                        op = _.ops.pop();
                                        _.trys.pop();
                                        continue;
                                    default:
                                        if (
                                            !((t = _.trys),
                                            (t =
                                                t.length > 0 &&
                                                t[t.length - 1])) &&
                                            (op[0] === 6 || op[0] === 2)
                                        ) {
                                            _ = 0;
                                            continue;
                                        }
                                        if (
                                            op[0] === 3 &&
                                            (!t ||
                                                (op[1] > t[0] && op[1] < t[3]))
                                        ) {
                                            _.label = op[1];
                                            break;
                                        }
                                        if (op[0] === 6 && _.label < t[1]) {
                                            _.label = t[1];
                                            t = op;
                                            break;
                                        }
                                        if (t && _.label < t[2]) {
                                            _.label = t[2];
                                            _.ops.push(op);
                                            break;
                                        }
                                        if (t[2]) _.ops.pop();
                                        _.trys.pop();
                                        continue;
                                }
                                op = body.call(thisArg, _);
                            } catch (e) {
                                op = [6, e];
                                y = 0;
                            } finally {
                                f = t = 0;
                            }
                        if (op[0] & 5) throw op[1];
                        return { value: op[0] ? op[1] : void 0, done: true };
                    }
                };
            Object.defineProperty(exports, "__esModule", { value: true });
            var validateToken_1 = __webpack_require__(46);
            function getHeaders(jwtTokens) {
                return __awaiter(this, void 0, void 0, function () {
                    var tokens, headers;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                return [
                                    4 /*yield*/,
                                    validateToken_1.validateToken(jwtTokens),
                                ];
                            case 1:
                                tokens = _a.sent();
                                headers = {
                                    Authorization: "Bearer " + tokens.access,
                                    "Content-Type": "application/json",
                                };
                                return [
                                    2 /*return*/,
                                    { tokens: tokens, headers: headers },
                                ];
                        }
                    });
                });
            }
            exports.getHeaders = getHeaders;

            /***/
        },
        /* 46 */
        /***/ function (__unused_webpack_module, exports, __webpack_require__) {
            "use strict";

            var __awaiter =
                (this && this.__awaiter) ||
                function (thisArg, _arguments, P, generator) {
                    return new (P || (P = Promise))(function (resolve, reject) {
                        function fulfilled(value) {
                            try {
                                step(generator.next(value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function rejected(value) {
                            try {
                                step(generator["throw"](value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function step(result) {
                            result.done
                                ? resolve(result.value)
                                : new P(function (resolve) {
                                      resolve(result.value);
                                  }).then(fulfilled, rejected);
                        }
                        step(
                            (generator = generator.apply(
                                thisArg,
                                _arguments || []
                            )).next()
                        );
                    });
                };
            var __generator =
                (this && this.__generator) ||
                function (thisArg, body) {
                    var _ = {
                            label: 0,
                            sent: function () {
                                if (t[0] & 1) throw t[1];
                                return t[1];
                            },
                            trys: [],
                            ops: [],
                        },
                        f,
                        y,
                        t,
                        g;
                    return (
                        (g = {
                            next: verb(0),
                            throw: verb(1),
                            return: verb(2),
                        }),
                        typeof Symbol === "function" &&
                            (g[Symbol.iterator] = function () {
                                return this;
                            }),
                        g
                    );
                    function verb(n) {
                        return function (v) {
                            return step([n, v]);
                        };
                    }
                    function step(op) {
                        if (f)
                            throw new TypeError(
                                "Generator is already executing."
                            );
                        while (_)
                            try {
                                if (
                                    ((f = 1),
                                    y &&
                                        (t =
                                            op[0] & 2
                                                ? y["return"]
                                                : op[0]
                                                ? y["throw"] ||
                                                  ((t = y["return"]) &&
                                                      t.call(y),
                                                  0)
                                                : y.next) &&
                                        !(t = t.call(y, op[1])).done)
                                )
                                    return t;
                                if (((y = 0), t)) op = [op[0] & 2, t.value];
                                switch (op[0]) {
                                    case 0:
                                    case 1:
                                        t = op;
                                        break;
                                    case 4:
                                        _.label++;
                                        return { value: op[1], done: false };
                                    case 5:
                                        _.label++;
                                        y = op[1];
                                        op = [0];
                                        continue;
                                    case 7:
                                        op = _.ops.pop();
                                        _.trys.pop();
                                        continue;
                                    default:
                                        if (
                                            !((t = _.trys),
                                            (t =
                                                t.length > 0 &&
                                                t[t.length - 1])) &&
                                            (op[0] === 6 || op[0] === 2)
                                        ) {
                                            _ = 0;
                                            continue;
                                        }
                                        if (
                                            op[0] === 3 &&
                                            (!t ||
                                                (op[1] > t[0] && op[1] < t[3]))
                                        ) {
                                            _.label = op[1];
                                            break;
                                        }
                                        if (op[0] === 6 && _.label < t[1]) {
                                            _.label = t[1];
                                            t = op;
                                            break;
                                        }
                                        if (t && _.label < t[2]) {
                                            _.label = t[2];
                                            _.ops.push(op);
                                            break;
                                        }
                                        if (t[2]) _.ops.pop();
                                        _.trys.pop();
                                        continue;
                                }
                                op = body.call(thisArg, _);
                            } catch (e) {
                                op = [6, e];
                                y = 0;
                            } finally {
                                f = t = 0;
                            }
                        if (op[0] & 5) throw op[1];
                        return { value: op[0] ? op[1] : void 0, done: true };
                    }
                };
            Object.defineProperty(exports, "__esModule", { value: true });
            var jwt = __webpack_require__(47);
            var refreshToken_1 = __webpack_require__(75);
            function validateToken(tokens) {
                return __awaiter(this, void 0, void 0, function () {
                    var returnT;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!isTokenValid(tokens.access))
                                    return [3 /*break*/, 1];
                                return [2 /*return*/, tokens];
                            case 1:
                                return [
                                    4 /*yield*/,
                                    refreshToken_1.refreshToken(tokens),
                                ];
                            case 2:
                                returnT = _a.sent();
                                return [2 /*return*/, returnT];
                        }
                    });
                });
            }
            exports.validateToken = validateToken;
            // Returns a boolean on whatever the token has expired or not
            function isTokenValid(token) {
                try {
                    // decode token
                    var tokenDecoded = jwt.decode(token);
                    var exp = tokenDecoded.exp;
                    // returns true if token is still valid
                    var now = new Date();
                    return now.getTime() < exp * 1000;
                } catch (err) {
                    throw new Error(
                        "Error with checking if token is still valid. " + err
                    );
                }
            }
            exports.isTokenValid = isTokenValid;

            /***/
        },
        /* 47 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            module.exports = {
                decode: __webpack_require__(48),
                verify: __webpack_require__(59),
                sign: __webpack_require__(67),
                JsonWebTokenError: __webpack_require__(60),
                NotBeforeError: __webpack_require__(61),
                TokenExpiredError: __webpack_require__(62),
            };

            /***/
        },
        /* 48 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var jws = __webpack_require__(49);

            module.exports = function (jwt, options) {
                options = options || {};
                var decoded = jws.decode(jwt, options);
                if (!decoded) {
                    return null;
                }
                var payload = decoded.payload;

                //try parse the payload
                if (typeof payload === "string") {
                    try {
                        var obj = JSON.parse(payload);
                        if (obj !== null && typeof obj === "object") {
                            payload = obj;
                        }
                    } catch (e) {}
                }

                //return header if `complete` option is enabled.  header includes claims
                //such as `kid` and `alg` used to select the key within a JWKS needed to
                //verify the signature
                if (options.complete === true) {
                    return {
                        header: decoded.header,
                        payload: payload,
                        signature: decoded.signature,
                    };
                }
                return payload;
            };

            /***/
        },
        /* 49 */
        /***/ (__unused_webpack_module, exports, __webpack_require__) => {
            /*global exports*/
            var SignStream = __webpack_require__(50);
            var VerifyStream = __webpack_require__(58);

            var ALGORITHMS = [
                "HS256",
                "HS384",
                "HS512",
                "RS256",
                "RS384",
                "RS512",
                "PS256",
                "PS384",
                "PS512",
                "ES256",
                "ES384",
                "ES512",
            ];

            exports.ALGORITHMS = ALGORITHMS;
            exports.sign = SignStream.sign;
            exports.verify = VerifyStream.verify;
            exports.decode = VerifyStream.decode;
            exports.isValid = VerifyStream.isValid;
            exports.createSign = function createSign(opts) {
                return new SignStream(opts);
            };
            exports.createVerify = function createVerify(opts) {
                return new VerifyStream(opts);
            };

            /***/
        },
        /* 50 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            /*global module*/
            var Buffer = __webpack_require__(51).Buffer;
            var DataStream = __webpack_require__(52);
            var jwa = __webpack_require__(53);
            var Stream = __webpack_require__(
                Object(
                    (function webpackMissingModule() {
                        var e = new Error("Cannot find module 'stream'");
                        e.code = "MODULE_NOT_FOUND";
                        throw e;
                    })()
                )
            );
            var toString = __webpack_require__(57);
            var util = __webpack_require__(
                Object(
                    (function webpackMissingModule() {
                        var e = new Error("Cannot find module 'util'");
                        e.code = "MODULE_NOT_FOUND";
                        throw e;
                    })()
                )
            );

            function base64url(string, encoding) {
                return Buffer.from(string, encoding)
                    .toString("base64")
                    .replace(/=/g, "")
                    .replace(/\+/g, "-")
                    .replace(/\//g, "_");
            }

            function jwsSecuredInput(header, payload, encoding) {
                encoding = encoding || "utf8";
                var encodedHeader = base64url(toString(header), "binary");
                var encodedPayload = base64url(toString(payload), encoding);
                return util.format("%s.%s", encodedHeader, encodedPayload);
            }

            function jwsSign(opts) {
                var header = opts.header;
                var payload = opts.payload;
                var secretOrKey = opts.secret || opts.privateKey;
                var encoding = opts.encoding;
                var algo = jwa(header.alg);
                var securedInput = jwsSecuredInput(header, payload, encoding);
                var signature = algo.sign(securedInput, secretOrKey);
                return util.format("%s.%s", securedInput, signature);
            }

            function SignStream(opts) {
                var secret = opts.secret || opts.privateKey || opts.key;
                var secretStream = new DataStream(secret);
                this.readable = true;
                this.header = opts.header;
                this.encoding = opts.encoding;
                this.secret = this.privateKey = this.key = secretStream;
                this.payload = new DataStream(opts.payload);
                this.secret.once(
                    "close",
                    function () {
                        if (!this.payload.writable && this.readable)
                            this.sign();
                    }.bind(this)
                );

                this.payload.once(
                    "close",
                    function () {
                        if (!this.secret.writable && this.readable) this.sign();
                    }.bind(this)
                );
            }
            util.inherits(SignStream, Stream);

            SignStream.prototype.sign = function sign() {
                try {
                    var signature = jwsSign({
                        header: this.header,
                        payload: this.payload.buffer,
                        secret: this.secret.buffer,
                        encoding: this.encoding,
                    });
                    this.emit("done", signature);
                    this.emit("data", signature);
                    this.emit("end");
                    this.readable = false;
                    return signature;
                } catch (e) {
                    this.readable = false;
                    this.emit("error", e);
                    this.emit("close");
                }
            };

            SignStream.sign = jwsSign;

            module.exports = SignStream;

            /***/
        },
        /* 51 */
        /***/ (module, exports, __webpack_require__) => {
            /*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
            /* eslint-disable node/no-deprecated-api */
            var buffer = __webpack_require__(
                Object(
                    (function webpackMissingModule() {
                        var e = new Error("Cannot find module 'buffer'");
                        e.code = "MODULE_NOT_FOUND";
                        throw e;
                    })()
                )
            );
            var Buffer = buffer.Buffer;

            // alternative to using Object.keys for old browsers
            function copyProps(src, dst) {
                for (var key in src) {
                    dst[key] = src[key];
                }
            }
            if (
                Buffer.from &&
                Buffer.alloc &&
                Buffer.allocUnsafe &&
                Buffer.allocUnsafeSlow
            ) {
                module.exports = buffer;
            } else {
                // Copy properties from require('buffer')
                copyProps(buffer, exports);
                exports.Buffer = SafeBuffer;
            }

            function SafeBuffer(arg, encodingOrOffset, length) {
                return Buffer(arg, encodingOrOffset, length);
            }

            SafeBuffer.prototype = Object.create(Buffer.prototype);

            // Copy static methods from Buffer
            copyProps(Buffer, SafeBuffer);

            SafeBuffer.from = function (arg, encodingOrOffset, length) {
                if (typeof arg === "number") {
                    throw new TypeError("Argument must not be a number");
                }
                return Buffer(arg, encodingOrOffset, length);
            };

            SafeBuffer.alloc = function (size, fill, encoding) {
                if (typeof size !== "number") {
                    throw new TypeError("Argument must be a number");
                }
                var buf = Buffer(size);
                if (fill !== undefined) {
                    if (typeof encoding === "string") {
                        buf.fill(fill, encoding);
                    } else {
                        buf.fill(fill);
                    }
                } else {
                    buf.fill(0);
                }
                return buf;
            };

            SafeBuffer.allocUnsafe = function (size) {
                if (typeof size !== "number") {
                    throw new TypeError("Argument must be a number");
                }
                return Buffer(size);
            };

            SafeBuffer.allocUnsafeSlow = function (size) {
                if (typeof size !== "number") {
                    throw new TypeError("Argument must be a number");
                }
                return buffer.SlowBuffer(size);
            };

            /***/
        },
        /* 52 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            /* provided dependency */ var process = __webpack_require__(9);
            /*global module, process*/
            var Buffer = __webpack_require__(51).Buffer;
            var Stream = __webpack_require__(
                Object(
                    (function webpackMissingModule() {
                        var e = new Error("Cannot find module 'stream'");
                        e.code = "MODULE_NOT_FOUND";
                        throw e;
                    })()
                )
            );
            var util = __webpack_require__(
                Object(
                    (function webpackMissingModule() {
                        var e = new Error("Cannot find module 'util'");
                        e.code = "MODULE_NOT_FOUND";
                        throw e;
                    })()
                )
            );

            function DataStream(data) {
                this.buffer = null;
                this.writable = true;
                this.readable = true;

                // No input
                if (!data) {
                    this.buffer = Buffer.alloc(0);
                    return this;
                }

                // Stream
                if (typeof data.pipe === "function") {
                    this.buffer = Buffer.alloc(0);
                    data.pipe(this);
                    return this;
                }

                // Buffer or String
                // or Object (assumedly a passworded key)
                if (data.length || typeof data === "object") {
                    this.buffer = data;
                    this.writable = false;
                    process.nextTick(
                        function () {
                            this.emit("end", data);
                            this.readable = false;
                            this.emit("close");
                        }.bind(this)
                    );
                    return this;
                }

                throw new TypeError(
                    "Unexpected data type (" + typeof data + ")"
                );
            }
            util.inherits(DataStream, Stream);

            DataStream.prototype.write = function write(data) {
                this.buffer = Buffer.concat([this.buffer, Buffer.from(data)]);
                this.emit("data", data);
            };

            DataStream.prototype.end = function end(data) {
                if (data) this.write(data);
                this.emit("end", data);
                this.emit("close");
                this.writable = false;
                this.readable = false;
            };

            module.exports = DataStream;

            /***/
        },
        /* 53 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var bufferEqual = __webpack_require__(54);
            var Buffer = __webpack_require__(51).Buffer;
            var crypto = __webpack_require__(
                Object(
                    (function webpackMissingModule() {
                        var e = new Error("Cannot find module 'crypto'");
                        e.code = "MODULE_NOT_FOUND";
                        throw e;
                    })()
                )
            );
            var formatEcdsa = __webpack_require__(55);
            var util = __webpack_require__(
                Object(
                    (function webpackMissingModule() {
                        var e = new Error("Cannot find module 'util'");
                        e.code = "MODULE_NOT_FOUND";
                        throw e;
                    })()
                )
            );

            var MSG_INVALID_ALGORITHM =
                '"%s" is not a valid algorithm.\n  Supported algorithms are:\n  "HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512" and "none".';
            var MSG_INVALID_SECRET = "secret must be a string or buffer";
            var MSG_INVALID_VERIFIER_KEY = "key must be a string or a buffer";
            var MSG_INVALID_SIGNER_KEY =
                "key must be a string, a buffer or an object";

            var supportsKeyObjects =
                typeof crypto.createPublicKey === "function";
            if (supportsKeyObjects) {
                MSG_INVALID_VERIFIER_KEY += " or a KeyObject";
                MSG_INVALID_SECRET += "or a KeyObject";
            }

            function checkIsPublicKey(key) {
                if (Buffer.isBuffer(key)) {
                    return;
                }

                if (typeof key === "string") {
                    return;
                }

                if (!supportsKeyObjects) {
                    throw typeError(MSG_INVALID_VERIFIER_KEY);
                }

                if (typeof key !== "object") {
                    throw typeError(MSG_INVALID_VERIFIER_KEY);
                }

                if (typeof key.type !== "string") {
                    throw typeError(MSG_INVALID_VERIFIER_KEY);
                }

                if (typeof key.asymmetricKeyType !== "string") {
                    throw typeError(MSG_INVALID_VERIFIER_KEY);
                }

                if (typeof key.export !== "function") {
                    throw typeError(MSG_INVALID_VERIFIER_KEY);
                }
            }

            function checkIsPrivateKey(key) {
                if (Buffer.isBuffer(key)) {
                    return;
                }

                if (typeof key === "string") {
                    return;
                }

                if (typeof key === "object") {
                    return;
                }

                throw typeError(MSG_INVALID_SIGNER_KEY);
            }

            function checkIsSecretKey(key) {
                if (Buffer.isBuffer(key)) {
                    return;
                }

                if (typeof key === "string") {
                    return key;
                }

                if (!supportsKeyObjects) {
                    throw typeError(MSG_INVALID_SECRET);
                }

                if (typeof key !== "object") {
                    throw typeError(MSG_INVALID_SECRET);
                }

                if (key.type !== "secret") {
                    throw typeError(MSG_INVALID_SECRET);
                }

                if (typeof key.export !== "function") {
                    throw typeError(MSG_INVALID_SECRET);
                }
            }

            function fromBase64(base64) {
                return base64
                    .replace(/=/g, "")
                    .replace(/\+/g, "-")
                    .replace(/\//g, "_");
            }

            function toBase64(base64url) {
                base64url = base64url.toString();

                var padding = 4 - (base64url.length % 4);
                if (padding !== 4) {
                    for (var i = 0; i < padding; ++i) {
                        base64url += "=";
                    }
                }

                return base64url.replace(/\-/g, "+").replace(/_/g, "/");
            }

            function typeError(template) {
                var args = [].slice.call(arguments, 1);
                var errMsg = util.format.bind(util, template).apply(null, args);
                return new TypeError(errMsg);
            }

            function bufferOrString(obj) {
                return Buffer.isBuffer(obj) || typeof obj === "string";
            }

            function normalizeInput(thing) {
                if (!bufferOrString(thing)) thing = JSON.stringify(thing);
                return thing;
            }

            function createHmacSigner(bits) {
                return function sign(thing, secret) {
                    checkIsSecretKey(secret);
                    thing = normalizeInput(thing);
                    var hmac = crypto.createHmac("sha" + bits, secret);
                    var sig = (hmac.update(thing), hmac.digest("base64"));
                    return fromBase64(sig);
                };
            }

            function createHmacVerifier(bits) {
                return function verify(thing, signature, secret) {
                    var computedSig = createHmacSigner(bits)(thing, secret);
                    return bufferEqual(
                        Buffer.from(signature),
                        Buffer.from(computedSig)
                    );
                };
            }

            function createKeySigner(bits) {
                return function sign(thing, privateKey) {
                    checkIsPrivateKey(privateKey);
                    thing = normalizeInput(thing);
                    // Even though we are specifying "RSA" here, this works with ECDSA
                    // keys as well.
                    var signer = crypto.createSign("RSA-SHA" + bits);
                    var sig =
                        (signer.update(thing),
                        signer.sign(privateKey, "base64"));
                    return fromBase64(sig);
                };
            }

            function createKeyVerifier(bits) {
                return function verify(thing, signature, publicKey) {
                    checkIsPublicKey(publicKey);
                    thing = normalizeInput(thing);
                    signature = toBase64(signature);
                    var verifier = crypto.createVerify("RSA-SHA" + bits);
                    verifier.update(thing);
                    return verifier.verify(publicKey, signature, "base64");
                };
            }

            function createPSSKeySigner(bits) {
                return function sign(thing, privateKey) {
                    checkIsPrivateKey(privateKey);
                    thing = normalizeInput(thing);
                    var signer = crypto.createSign("RSA-SHA" + bits);
                    var sig =
                        (signer.update(thing),
                        signer.sign(
                            {
                                key: privateKey,
                                padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                                saltLength:
                                    crypto.constants.RSA_PSS_SALTLEN_DIGEST,
                            },
                            "base64"
                        ));
                    return fromBase64(sig);
                };
            }

            function createPSSKeyVerifier(bits) {
                return function verify(thing, signature, publicKey) {
                    checkIsPublicKey(publicKey);
                    thing = normalizeInput(thing);
                    signature = toBase64(signature);
                    var verifier = crypto.createVerify("RSA-SHA" + bits);
                    verifier.update(thing);
                    return verifier.verify(
                        {
                            key: publicKey,
                            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                            saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
                        },
                        signature,
                        "base64"
                    );
                };
            }

            function createECDSASigner(bits) {
                var inner = createKeySigner(bits);
                return function sign() {
                    var signature = inner.apply(null, arguments);
                    signature = formatEcdsa.derToJose(signature, "ES" + bits);
                    return signature;
                };
            }

            function createECDSAVerifer(bits) {
                var inner = createKeyVerifier(bits);
                return function verify(thing, signature, publicKey) {
                    signature = formatEcdsa
                        .joseToDer(signature, "ES" + bits)
                        .toString("base64");
                    var result = inner(thing, signature, publicKey);
                    return result;
                };
            }

            function createNoneSigner() {
                return function sign() {
                    return "";
                };
            }

            function createNoneVerifier() {
                return function verify(thing, signature) {
                    return signature === "";
                };
            }

            module.exports = function jwa(algorithm) {
                var signerFactories = {
                    hs: createHmacSigner,
                    rs: createKeySigner,
                    ps: createPSSKeySigner,
                    es: createECDSASigner,
                    none: createNoneSigner,
                };
                var verifierFactories = {
                    hs: createHmacVerifier,
                    rs: createKeyVerifier,
                    ps: createPSSKeyVerifier,
                    es: createECDSAVerifer,
                    none: createNoneVerifier,
                };
                var match = algorithm.match(
                    /^(RS|PS|ES|HS)(256|384|512)$|^(none)$/i
                );
                if (!match) throw typeError(MSG_INVALID_ALGORITHM, algorithm);
                var algo = (match[1] || match[3]).toLowerCase();
                var bits = match[2];

                return {
                    sign: signerFactories[algo](bits),
                    verify: verifierFactories[algo](bits),
                };
            };

            /***/
        },
        /* 54 */
        /***/ (module) => {
            "use strict";
            /*jshint node:true */

            var Buffer = Object(
                (function webpackMissingModule() {
                    var e = new Error("Cannot find module 'buffer'");
                    e.code = "MODULE_NOT_FOUND";
                    throw e;
                })()
            ); // browserify
            var SlowBuffer = Object(
                (function webpackMissingModule() {
                    var e = new Error("Cannot find module 'buffer'");
                    e.code = "MODULE_NOT_FOUND";
                    throw e;
                })()
            );

            module.exports = bufferEq;

            function bufferEq(a, b) {
                // shortcutting on type is necessary for correctness
                if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
                    return false;
                }

                // buffer sizes should be well-known information, so despite this
                // shortcutting, it doesn't leak any information about the *contents* of the
                // buffers.
                if (a.length !== b.length) {
                    return false;
                }

                var c = 0;
                for (var i = 0; i < a.length; i++) {
                    /*jshint bitwise:false */
                    c |= a[i] ^ b[i]; // XOR
                }
                return c === 0;
            }

            bufferEq.install = function () {
                Buffer.prototype.equal = SlowBuffer.prototype.equal =
                    function equal(that) {
                        return bufferEq(this, that);
                    };
            };

            var origBufEqual = Buffer.prototype.equal;
            var origSlowBufEqual = SlowBuffer.prototype.equal;
            bufferEq.restore = function () {
                Buffer.prototype.equal = origBufEqual;
                SlowBuffer.prototype.equal = origSlowBufEqual;
            };

            /***/
        },
        /* 55 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            "use strict";

            var Buffer = __webpack_require__(51).Buffer;

            var getParamBytesForAlg = __webpack_require__(56);

            var MAX_OCTET = 0x80,
                CLASS_UNIVERSAL = 0,
                PRIMITIVE_BIT = 0x20,
                TAG_SEQ = 0x10,
                TAG_INT = 0x02,
                ENCODED_TAG_SEQ =
                    TAG_SEQ | PRIMITIVE_BIT | (CLASS_UNIVERSAL << 6),
                ENCODED_TAG_INT = TAG_INT | (CLASS_UNIVERSAL << 6);

            function base64Url(base64) {
                return base64
                    .replace(/=/g, "")
                    .replace(/\+/g, "-")
                    .replace(/\//g, "_");
            }

            function signatureAsBuffer(signature) {
                if (Buffer.isBuffer(signature)) {
                    return signature;
                } else if ("string" === typeof signature) {
                    return Buffer.from(signature, "base64");
                }

                throw new TypeError(
                    "ECDSA signature must be a Base64 string or a Buffer"
                );
            }

            function derToJose(signature, alg) {
                signature = signatureAsBuffer(signature);
                var paramBytes = getParamBytesForAlg(alg);

                // the DER encoded param should at most be the param size, plus a padding
                // zero, since due to being a signed integer
                var maxEncodedParamLength = paramBytes + 1;

                var inputLength = signature.length;

                var offset = 0;
                if (signature[offset++] !== ENCODED_TAG_SEQ) {
                    throw new Error('Could not find expected "seq"');
                }

                var seqLength = signature[offset++];
                if (seqLength === (MAX_OCTET | 1)) {
                    seqLength = signature[offset++];
                }

                if (inputLength - offset < seqLength) {
                    throw new Error(
                        '"seq" specified length of "' +
                            seqLength +
                            '", only "' +
                            (inputLength - offset) +
                            '" remaining'
                    );
                }

                if (signature[offset++] !== ENCODED_TAG_INT) {
                    throw new Error('Could not find expected "int" for "r"');
                }

                var rLength = signature[offset++];

                if (inputLength - offset - 2 < rLength) {
                    throw new Error(
                        '"r" specified length of "' +
                            rLength +
                            '", only "' +
                            (inputLength - offset - 2) +
                            '" available'
                    );
                }

                if (maxEncodedParamLength < rLength) {
                    throw new Error(
                        '"r" specified length of "' +
                            rLength +
                            '", max of "' +
                            maxEncodedParamLength +
                            '" is acceptable'
                    );
                }

                var rOffset = offset;
                offset += rLength;

                if (signature[offset++] !== ENCODED_TAG_INT) {
                    throw new Error('Could not find expected "int" for "s"');
                }

                var sLength = signature[offset++];

                if (inputLength - offset !== sLength) {
                    throw new Error(
                        '"s" specified length of "' +
                            sLength +
                            '", expected "' +
                            (inputLength - offset) +
                            '"'
                    );
                }

                if (maxEncodedParamLength < sLength) {
                    throw new Error(
                        '"s" specified length of "' +
                            sLength +
                            '", max of "' +
                            maxEncodedParamLength +
                            '" is acceptable'
                    );
                }

                var sOffset = offset;
                offset += sLength;

                if (offset !== inputLength) {
                    throw new Error(
                        'Expected to consume entire buffer, but "' +
                            (inputLength - offset) +
                            '" bytes remain'
                    );
                }

                var rPadding = paramBytes - rLength,
                    sPadding = paramBytes - sLength;

                var dst = Buffer.allocUnsafe(
                    rPadding + rLength + sPadding + sLength
                );

                for (offset = 0; offset < rPadding; ++offset) {
                    dst[offset] = 0;
                }
                signature.copy(
                    dst,
                    offset,
                    rOffset + Math.max(-rPadding, 0),
                    rOffset + rLength
                );

                offset = paramBytes;

                for (var o = offset; offset < o + sPadding; ++offset) {
                    dst[offset] = 0;
                }
                signature.copy(
                    dst,
                    offset,
                    sOffset + Math.max(-sPadding, 0),
                    sOffset + sLength
                );

                dst = dst.toString("base64");
                dst = base64Url(dst);

                return dst;
            }

            function countPadding(buf, start, stop) {
                var padding = 0;
                while (start + padding < stop && buf[start + padding] === 0) {
                    ++padding;
                }

                var needsSign = buf[start + padding] >= MAX_OCTET;
                if (needsSign) {
                    --padding;
                }

                return padding;
            }

            function joseToDer(signature, alg) {
                signature = signatureAsBuffer(signature);
                var paramBytes = getParamBytesForAlg(alg);

                var signatureBytes = signature.length;
                if (signatureBytes !== paramBytes * 2) {
                    throw new TypeError(
                        '"' +
                            alg +
                            '" signatures must be "' +
                            paramBytes * 2 +
                            '" bytes, saw "' +
                            signatureBytes +
                            '"'
                    );
                }

                var rPadding = countPadding(signature, 0, paramBytes);
                var sPadding = countPadding(
                    signature,
                    paramBytes,
                    signature.length
                );
                var rLength = paramBytes - rPadding;
                var sLength = paramBytes - sPadding;

                var rsBytes = 1 + 1 + rLength + 1 + 1 + sLength;

                var shortLength = rsBytes < MAX_OCTET;

                var dst = Buffer.allocUnsafe((shortLength ? 2 : 3) + rsBytes);

                var offset = 0;
                dst[offset++] = ENCODED_TAG_SEQ;
                if (shortLength) {
                    // Bit 8 has value "0"
                    // bits 7-1 give the length.
                    dst[offset++] = rsBytes;
                } else {
                    // Bit 8 of first octet has value "1"
                    // bits 7-1 give the number of additional length octets.
                    dst[offset++] = MAX_OCTET | 1;
                    // length, base 256
                    dst[offset++] = rsBytes & 0xff;
                }
                dst[offset++] = ENCODED_TAG_INT;
                dst[offset++] = rLength;
                if (rPadding < 0) {
                    dst[offset++] = 0;
                    offset += signature.copy(dst, offset, 0, paramBytes);
                } else {
                    offset += signature.copy(dst, offset, rPadding, paramBytes);
                }
                dst[offset++] = ENCODED_TAG_INT;
                dst[offset++] = sLength;
                if (sPadding < 0) {
                    dst[offset++] = 0;
                    signature.copy(dst, offset, paramBytes);
                } else {
                    signature.copy(dst, offset, paramBytes + sPadding);
                }

                return dst;
            }

            module.exports = {
                derToJose: derToJose,
                joseToDer: joseToDer,
            };

            /***/
        },
        /* 56 */
        /***/ (module) => {
            "use strict";

            function getParamSize(keySize) {
                var result = ((keySize / 8) | 0) + (keySize % 8 === 0 ? 0 : 1);
                return result;
            }

            var paramBytesForAlg = {
                ES256: getParamSize(256),
                ES384: getParamSize(384),
                ES512: getParamSize(521),
            };

            function getParamBytesForAlg(alg) {
                var paramBytes = paramBytesForAlg[alg];
                if (paramBytes) {
                    return paramBytes;
                }

                throw new Error('Unknown algorithm "' + alg + '"');
            }

            module.exports = getParamBytesForAlg;

            /***/
        },
        /* 57 */
        /***/ (module) => {
            /*global module*/
            var Buffer = Object(
                (function webpackMissingModule() {
                    var e = new Error("Cannot find module 'buffer'");
                    e.code = "MODULE_NOT_FOUND";
                    throw e;
                })()
            );

            module.exports = function toString(obj) {
                if (typeof obj === "string") return obj;
                if (typeof obj === "number" || Buffer.isBuffer(obj))
                    return obj.toString();
                return JSON.stringify(obj);
            };

            /***/
        },
        /* 58 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            /*global module*/
            var Buffer = __webpack_require__(51).Buffer;
            var DataStream = __webpack_require__(52);
            var jwa = __webpack_require__(53);
            var Stream = __webpack_require__(
                Object(
                    (function webpackMissingModule() {
                        var e = new Error("Cannot find module 'stream'");
                        e.code = "MODULE_NOT_FOUND";
                        throw e;
                    })()
                )
            );
            var toString = __webpack_require__(57);
            var util = __webpack_require__(
                Object(
                    (function webpackMissingModule() {
                        var e = new Error("Cannot find module 'util'");
                        e.code = "MODULE_NOT_FOUND";
                        throw e;
                    })()
                )
            );
            var JWS_REGEX =
                /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;

            function isObject(thing) {
                return (
                    Object.prototype.toString.call(thing) === "[object Object]"
                );
            }

            function safeJsonParse(thing) {
                if (isObject(thing)) return thing;
                try {
                    return JSON.parse(thing);
                } catch (e) {
                    return undefined;
                }
            }

            function headerFromJWS(jwsSig) {
                var encodedHeader = jwsSig.split(".", 1)[0];
                return safeJsonParse(
                    Buffer.from(encodedHeader, "base64").toString("binary")
                );
            }

            function securedInputFromJWS(jwsSig) {
                return jwsSig.split(".", 2).join(".");
            }

            function signatureFromJWS(jwsSig) {
                return jwsSig.split(".")[2];
            }

            function payloadFromJWS(jwsSig, encoding) {
                encoding = encoding || "utf8";
                var payload = jwsSig.split(".")[1];
                return Buffer.from(payload, "base64").toString(encoding);
            }

            function isValidJws(string) {
                return JWS_REGEX.test(string) && !!headerFromJWS(string);
            }

            function jwsVerify(jwsSig, algorithm, secretOrKey) {
                if (!algorithm) {
                    var err = new Error(
                        "Missing algorithm parameter for jws.verify"
                    );
                    err.code = "MISSING_ALGORITHM";
                    throw err;
                }
                jwsSig = toString(jwsSig);
                var signature = signatureFromJWS(jwsSig);
                var securedInput = securedInputFromJWS(jwsSig);
                var algo = jwa(algorithm);
                return algo.verify(securedInput, signature, secretOrKey);
            }

            function jwsDecode(jwsSig, opts) {
                opts = opts || {};
                jwsSig = toString(jwsSig);

                if (!isValidJws(jwsSig)) return null;

                var header = headerFromJWS(jwsSig);

                if (!header) return null;

                var payload = payloadFromJWS(jwsSig);
                if (header.typ === "JWT" || opts.json)
                    payload = JSON.parse(payload, opts.encoding);

                return {
                    header: header,
                    payload: payload,
                    signature: signatureFromJWS(jwsSig),
                };
            }

            function VerifyStream(opts) {
                opts = opts || {};
                var secretOrKey = opts.secret || opts.publicKey || opts.key;
                var secretStream = new DataStream(secretOrKey);
                this.readable = true;
                this.algorithm = opts.algorithm;
                this.encoding = opts.encoding;
                this.secret = this.publicKey = this.key = secretStream;
                this.signature = new DataStream(opts.signature);
                this.secret.once(
                    "close",
                    function () {
                        if (!this.signature.writable && this.readable)
                            this.verify();
                    }.bind(this)
                );

                this.signature.once(
                    "close",
                    function () {
                        if (!this.secret.writable && this.readable)
                            this.verify();
                    }.bind(this)
                );
            }
            util.inherits(VerifyStream, Stream);
            VerifyStream.prototype.verify = function verify() {
                try {
                    var valid = jwsVerify(
                        this.signature.buffer,
                        this.algorithm,
                        this.key.buffer
                    );
                    var obj = jwsDecode(this.signature.buffer, this.encoding);
                    this.emit("done", valid, obj);
                    this.emit("data", valid);
                    this.emit("end");
                    this.readable = false;
                    return valid;
                } catch (e) {
                    this.readable = false;
                    this.emit("error", e);
                    this.emit("close");
                }
            };

            VerifyStream.decode = jwsDecode;
            VerifyStream.isValid = isValidJws;
            VerifyStream.verify = jwsVerify;

            module.exports = VerifyStream;

            /***/
        },
        /* 59 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var JsonWebTokenError = __webpack_require__(60);
            var NotBeforeError = __webpack_require__(61);
            var TokenExpiredError = __webpack_require__(62);
            var decode = __webpack_require__(48);
            var timespan = __webpack_require__(63);
            var PS_SUPPORTED = __webpack_require__(65);
            var jws = __webpack_require__(49);

            var PUB_KEY_ALGS = [
                "RS256",
                "RS384",
                "RS512",
                "ES256",
                "ES384",
                "ES512",
            ];
            var RSA_KEY_ALGS = ["RS256", "RS384", "RS512"];
            var HS_ALGS = ["HS256", "HS384", "HS512"];

            if (PS_SUPPORTED) {
                PUB_KEY_ALGS.splice(3, 0, "PS256", "PS384", "PS512");
                RSA_KEY_ALGS.splice(3, 0, "PS256", "PS384", "PS512");
            }

            module.exports = function (
                jwtString,
                secretOrPublicKey,
                options,
                callback
            ) {
                if (typeof options === "function" && !callback) {
                    callback = options;
                    options = {};
                }

                if (!options) {
                    options = {};
                }

                //clone this object since we are going to mutate it.
                options = Object.assign({}, options);

                var done;

                if (callback) {
                    done = callback;
                } else {
                    done = function (err, data) {
                        if (err) throw err;
                        return data;
                    };
                }

                if (
                    options.clockTimestamp &&
                    typeof options.clockTimestamp !== "number"
                ) {
                    return done(
                        new JsonWebTokenError("clockTimestamp must be a number")
                    );
                }

                if (
                    options.nonce !== undefined &&
                    (typeof options.nonce !== "string" ||
                        options.nonce.trim() === "")
                ) {
                    return done(
                        new JsonWebTokenError(
                            "nonce must be a non-empty string"
                        )
                    );
                }

                var clockTimestamp =
                    options.clockTimestamp || Math.floor(Date.now() / 1000);

                if (!jwtString) {
                    return done(new JsonWebTokenError("jwt must be provided"));
                }

                if (typeof jwtString !== "string") {
                    return done(new JsonWebTokenError("jwt must be a string"));
                }

                var parts = jwtString.split(".");

                if (parts.length !== 3) {
                    return done(new JsonWebTokenError("jwt malformed"));
                }

                var decodedToken;

                try {
                    decodedToken = decode(jwtString, { complete: true });
                } catch (err) {
                    return done(err);
                }

                if (!decodedToken) {
                    return done(new JsonWebTokenError("invalid token"));
                }

                var header = decodedToken.header;
                var getSecret;

                if (typeof secretOrPublicKey === "function") {
                    if (!callback) {
                        return done(
                            new JsonWebTokenError(
                                "verify must be called asynchronous if secret or public key is provided as a callback"
                            )
                        );
                    }

                    getSecret = secretOrPublicKey;
                } else {
                    getSecret = function (header, secretCallback) {
                        return secretCallback(null, secretOrPublicKey);
                    };
                }

                return getSecret(header, function (err, secretOrPublicKey) {
                    if (err) {
                        return done(
                            new JsonWebTokenError(
                                "error in secret or public key callback: " +
                                    err.message
                            )
                        );
                    }

                    var hasSignature = parts[2].trim() !== "";

                    if (!hasSignature && secretOrPublicKey) {
                        return done(
                            new JsonWebTokenError("jwt signature is required")
                        );
                    }

                    if (hasSignature && !secretOrPublicKey) {
                        return done(
                            new JsonWebTokenError(
                                "secret or public key must be provided"
                            )
                        );
                    }

                    if (!hasSignature && !options.algorithms) {
                        options.algorithms = ["none"];
                    }

                    if (!options.algorithms) {
                        options.algorithms =
                            ~secretOrPublicKey
                                .toString()
                                .indexOf("BEGIN CERTIFICATE") ||
                            ~secretOrPublicKey
                                .toString()
                                .indexOf("BEGIN PUBLIC KEY")
                                ? PUB_KEY_ALGS
                                : ~secretOrPublicKey
                                      .toString()
                                      .indexOf("BEGIN RSA PUBLIC KEY")
                                ? RSA_KEY_ALGS
                                : HS_ALGS;
                    }

                    if (!~options.algorithms.indexOf(decodedToken.header.alg)) {
                        return done(new JsonWebTokenError("invalid algorithm"));
                    }

                    var valid;

                    try {
                        valid = jws.verify(
                            jwtString,
                            decodedToken.header.alg,
                            secretOrPublicKey
                        );
                    } catch (e) {
                        return done(e);
                    }

                    if (!valid) {
                        return done(new JsonWebTokenError("invalid signature"));
                    }

                    var payload = decodedToken.payload;

                    if (
                        typeof payload.nbf !== "undefined" &&
                        !options.ignoreNotBefore
                    ) {
                        if (typeof payload.nbf !== "number") {
                            return done(
                                new JsonWebTokenError("invalid nbf value")
                            );
                        }
                        if (
                            payload.nbf >
                            clockTimestamp + (options.clockTolerance || 0)
                        ) {
                            return done(
                                new NotBeforeError(
                                    "jwt not active",
                                    new Date(payload.nbf * 1000)
                                )
                            );
                        }
                    }

                    if (
                        typeof payload.exp !== "undefined" &&
                        !options.ignoreExpiration
                    ) {
                        if (typeof payload.exp !== "number") {
                            return done(
                                new JsonWebTokenError("invalid exp value")
                            );
                        }
                        if (
                            clockTimestamp >=
                            payload.exp + (options.clockTolerance || 0)
                        ) {
                            return done(
                                new TokenExpiredError(
                                    "jwt expired",
                                    new Date(payload.exp * 1000)
                                )
                            );
                        }
                    }

                    if (options.audience) {
                        var audiences = Array.isArray(options.audience)
                            ? options.audience
                            : [options.audience];
                        var target = Array.isArray(payload.aud)
                            ? payload.aud
                            : [payload.aud];

                        var match = target.some(function (targetAudience) {
                            return audiences.some(function (audience) {
                                return audience instanceof RegExp
                                    ? audience.test(targetAudience)
                                    : audience === targetAudience;
                            });
                        });

                        if (!match) {
                            return done(
                                new JsonWebTokenError(
                                    "jwt audience invalid. expected: " +
                                        audiences.join(" or ")
                                )
                            );
                        }
                    }

                    if (options.issuer) {
                        var invalid_issuer =
                            (typeof options.issuer === "string" &&
                                payload.iss !== options.issuer) ||
                            (Array.isArray(options.issuer) &&
                                options.issuer.indexOf(payload.iss) === -1);

                        if (invalid_issuer) {
                            return done(
                                new JsonWebTokenError(
                                    "jwt issuer invalid. expected: " +
                                        options.issuer
                                )
                            );
                        }
                    }

                    if (options.subject) {
                        if (payload.sub !== options.subject) {
                            return done(
                                new JsonWebTokenError(
                                    "jwt subject invalid. expected: " +
                                        options.subject
                                )
                            );
                        }
                    }

                    if (options.jwtid) {
                        if (payload.jti !== options.jwtid) {
                            return done(
                                new JsonWebTokenError(
                                    "jwt jwtid invalid. expected: " +
                                        options.jwtid
                                )
                            );
                        }
                    }

                    if (options.nonce) {
                        if (payload.nonce !== options.nonce) {
                            return done(
                                new JsonWebTokenError(
                                    "jwt nonce invalid. expected: " +
                                        options.nonce
                                )
                            );
                        }
                    }

                    if (options.maxAge) {
                        if (typeof payload.iat !== "number") {
                            return done(
                                new JsonWebTokenError(
                                    "iat required when maxAge is specified"
                                )
                            );
                        }

                        var maxAgeTimestamp = timespan(
                            options.maxAge,
                            payload.iat
                        );
                        if (typeof maxAgeTimestamp === "undefined") {
                            return done(
                                new JsonWebTokenError(
                                    '"maxAge" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'
                                )
                            );
                        }
                        if (
                            clockTimestamp >=
                            maxAgeTimestamp + (options.clockTolerance || 0)
                        ) {
                            return done(
                                new TokenExpiredError(
                                    "maxAge exceeded",
                                    new Date(maxAgeTimestamp * 1000)
                                )
                            );
                        }
                    }

                    if (options.complete === true) {
                        var signature = decodedToken.signature;

                        return done(null, {
                            header: header,
                            payload: payload,
                            signature: signature,
                        });
                    }

                    return done(null, payload);
                });
            };

            /***/
        },
        /* 60 */
        /***/ (module) => {
            var JsonWebTokenError = function (message, error) {
                Error.call(this, message);
                if (Error.captureStackTrace) {
                    Error.captureStackTrace(this, this.constructor);
                }
                this.name = "JsonWebTokenError";
                this.message = message;
                if (error) this.inner = error;
            };

            JsonWebTokenError.prototype = Object.create(Error.prototype);
            JsonWebTokenError.prototype.constructor = JsonWebTokenError;

            module.exports = JsonWebTokenError;

            /***/
        },
        /* 61 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var JsonWebTokenError = __webpack_require__(60);

            var NotBeforeError = function (message, date) {
                JsonWebTokenError.call(this, message);
                this.name = "NotBeforeError";
                this.date = date;
            };

            NotBeforeError.prototype = Object.create(
                JsonWebTokenError.prototype
            );

            NotBeforeError.prototype.constructor = NotBeforeError;

            module.exports = NotBeforeError;

            /***/
        },
        /* 62 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var JsonWebTokenError = __webpack_require__(60);

            var TokenExpiredError = function (message, expiredAt) {
                JsonWebTokenError.call(this, message);
                this.name = "TokenExpiredError";
                this.expiredAt = expiredAt;
            };

            TokenExpiredError.prototype = Object.create(
                JsonWebTokenError.prototype
            );

            TokenExpiredError.prototype.constructor = TokenExpiredError;

            module.exports = TokenExpiredError;

            /***/
        },
        /* 63 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var ms = __webpack_require__(64);

            module.exports = function (time, iat) {
                var timestamp = iat || Math.floor(Date.now() / 1000);

                if (typeof time === "string") {
                    var milliseconds = ms(time);
                    if (typeof milliseconds === "undefined") {
                        return;
                    }
                    return Math.floor(timestamp + milliseconds / 1000);
                } else if (typeof time === "number") {
                    return timestamp + time;
                } else {
                    return;
                }
            };

            /***/
        },
        /* 64 */
        /***/ (module) => {
            /**
             * Helpers.
             */

            var s = 1000;
            var m = s * 60;
            var h = m * 60;
            var d = h * 24;
            var w = d * 7;
            var y = d * 365.25;

            /**
             * Parse or format the given `val`.
             *
             * Options:
             *
             *  - `long` verbose formatting [false]
             *
             * @param {String|Number} val
             * @param {Object} [options]
             * @throws {Error} throw an error if val is not a non-empty string or a number
             * @return {String|Number}
             * @api public
             */

            module.exports = function (val, options) {
                options = options || {};
                var type = typeof val;
                if (type === "string" && val.length > 0) {
                    return parse(val);
                } else if (type === "number" && isFinite(val)) {
                    return options.long ? fmtLong(val) : fmtShort(val);
                }
                throw new Error(
                    "val is not a non-empty string or a valid number. val=" +
                        JSON.stringify(val)
                );
            };

            /**
             * Parse the given `str` and return milliseconds.
             *
             * @param {String} str
             * @return {Number}
             * @api private
             */

            function parse(str) {
                str = String(str);
                if (str.length > 100) {
                    return;
                }
                var match =
                    /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
                        str
                    );
                if (!match) {
                    return;
                }
                var n = parseFloat(match[1]);
                var type = (match[2] || "ms").toLowerCase();
                switch (type) {
                    case "years":
                    case "year":
                    case "yrs":
                    case "yr":
                    case "y":
                        return n * y;
                    case "weeks":
                    case "week":
                    case "w":
                        return n * w;
                    case "days":
                    case "day":
                    case "d":
                        return n * d;
                    case "hours":
                    case "hour":
                    case "hrs":
                    case "hr":
                    case "h":
                        return n * h;
                    case "minutes":
                    case "minute":
                    case "mins":
                    case "min":
                    case "m":
                        return n * m;
                    case "seconds":
                    case "second":
                    case "secs":
                    case "sec":
                    case "s":
                        return n * s;
                    case "milliseconds":
                    case "millisecond":
                    case "msecs":
                    case "msec":
                    case "ms":
                        return n;
                    default:
                        return undefined;
                }
            }

            /**
             * Short format for `ms`.
             *
             * @param {Number} ms
             * @return {String}
             * @api private
             */

            function fmtShort(ms) {
                var msAbs = Math.abs(ms);
                if (msAbs >= d) {
                    return Math.round(ms / d) + "d";
                }
                if (msAbs >= h) {
                    return Math.round(ms / h) + "h";
                }
                if (msAbs >= m) {
                    return Math.round(ms / m) + "m";
                }
                if (msAbs >= s) {
                    return Math.round(ms / s) + "s";
                }
                return ms + "ms";
            }

            /**
             * Long format for `ms`.
             *
             * @param {Number} ms
             * @return {String}
             * @api private
             */

            function fmtLong(ms) {
                var msAbs = Math.abs(ms);
                if (msAbs >= d) {
                    return plural(ms, msAbs, d, "day");
                }
                if (msAbs >= h) {
                    return plural(ms, msAbs, h, "hour");
                }
                if (msAbs >= m) {
                    return plural(ms, msAbs, m, "minute");
                }
                if (msAbs >= s) {
                    return plural(ms, msAbs, s, "second");
                }
                return ms + " ms";
            }

            /**
             * Pluralization helper.
             */

            function plural(ms, msAbs, n, name) {
                var isPlural = msAbs >= n * 1.5;
                return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
            }

            /***/
        },
        /* 65 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            /* provided dependency */ var process = __webpack_require__(9);
            var semver = __webpack_require__(66);

            module.exports = semver.satisfies(
                process.version,
                "^6.12.0 || >=8.0.0"
            );

            /***/
        },
        /* 66 */
        /***/ (module, exports, __webpack_require__) => {
            /* provided dependency */ var process = __webpack_require__(9);
            exports = module.exports = SemVer;

            var debug;
            /* istanbul ignore next */
            if (
                typeof process === "object" &&
                process.env &&
                process.env.NODE_DEBUG &&
                /\bsemver\b/i.test(process.env.NODE_DEBUG)
            ) {
                debug = function () {
                    var args = Array.prototype.slice.call(arguments, 0);
                    args.unshift("SEMVER");
                    console.log.apply(console, args);
                };
            } else {
                debug = function () {};
            }

            // Note: this is the semver.org version of the spec that it implements
            // Not necessarily the package version of this code.
            exports.SEMVER_SPEC_VERSION = "2.0.0";

            var MAX_LENGTH = 256;
            var MAX_SAFE_INTEGER =
                Number.MAX_SAFE_INTEGER ||
                /* istanbul ignore next */ 9007199254740991;

            // Max safe segment length for coercion.
            var MAX_SAFE_COMPONENT_LENGTH = 16;

            // The actual regexps go on exports.re
            var re = (exports.re = []);
            var src = (exports.src = []);
            var R = 0;

            // The following Regular Expressions can be used for tokenizing,
            // validating, and parsing SemVer version strings.

            // ## Numeric Identifier
            // A single `0`, or a non-zero digit followed by zero or more digits.

            var NUMERICIDENTIFIER = R++;
            src[NUMERICIDENTIFIER] = "0|[1-9]\\d*";
            var NUMERICIDENTIFIERLOOSE = R++;
            src[NUMERICIDENTIFIERLOOSE] = "[0-9]+";

            // ## Non-numeric Identifier
            // Zero or more digits, followed by a letter or hyphen, and then zero or
            // more letters, digits, or hyphens.

            var NONNUMERICIDENTIFIER = R++;
            src[NONNUMERICIDENTIFIER] = "\\d*[a-zA-Z-][a-zA-Z0-9-]*";

            // ## Main Version
            // Three dot-separated numeric identifiers.

            var MAINVERSION = R++;
            src[MAINVERSION] =
                "(" +
                src[NUMERICIDENTIFIER] +
                ")\\." +
                "(" +
                src[NUMERICIDENTIFIER] +
                ")\\." +
                "(" +
                src[NUMERICIDENTIFIER] +
                ")";

            var MAINVERSIONLOOSE = R++;
            src[MAINVERSIONLOOSE] =
                "(" +
                src[NUMERICIDENTIFIERLOOSE] +
                ")\\." +
                "(" +
                src[NUMERICIDENTIFIERLOOSE] +
                ")\\." +
                "(" +
                src[NUMERICIDENTIFIERLOOSE] +
                ")";

            // ## Pre-release Version Identifier
            // A numeric identifier, or a non-numeric identifier.

            var PRERELEASEIDENTIFIER = R++;
            src[PRERELEASEIDENTIFIER] =
                "(?:" +
                src[NUMERICIDENTIFIER] +
                "|" +
                src[NONNUMERICIDENTIFIER] +
                ")";

            var PRERELEASEIDENTIFIERLOOSE = R++;
            src[PRERELEASEIDENTIFIERLOOSE] =
                "(?:" +
                src[NUMERICIDENTIFIERLOOSE] +
                "|" +
                src[NONNUMERICIDENTIFIER] +
                ")";

            // ## Pre-release Version
            // Hyphen, followed by one or more dot-separated pre-release version
            // identifiers.

            var PRERELEASE = R++;
            src[PRERELEASE] =
                "(?:-(" +
                src[PRERELEASEIDENTIFIER] +
                "(?:\\." +
                src[PRERELEASEIDENTIFIER] +
                ")*))";

            var PRERELEASELOOSE = R++;
            src[PRERELEASELOOSE] =
                "(?:-?(" +
                src[PRERELEASEIDENTIFIERLOOSE] +
                "(?:\\." +
                src[PRERELEASEIDENTIFIERLOOSE] +
                ")*))";

            // ## Build Metadata Identifier
            // Any combination of digits, letters, or hyphens.

            var BUILDIDENTIFIER = R++;
            src[BUILDIDENTIFIER] = "[0-9A-Za-z-]+";

            // ## Build Metadata
            // Plus sign, followed by one or more period-separated build metadata
            // identifiers.

            var BUILD = R++;
            src[BUILD] =
                "(?:\\+(" +
                src[BUILDIDENTIFIER] +
                "(?:\\." +
                src[BUILDIDENTIFIER] +
                ")*))";

            // ## Full Version String
            // A main version, followed optionally by a pre-release version and
            // build metadata.

            // Note that the only major, minor, patch, and pre-release sections of
            // the version string are capturing groups.  The build metadata is not a
            // capturing group, because it should not ever be used in version
            // comparison.

            var FULL = R++;
            var FULLPLAIN =
                "v?" +
                src[MAINVERSION] +
                src[PRERELEASE] +
                "?" +
                src[BUILD] +
                "?";

            src[FULL] = "^" + FULLPLAIN + "$";

            // like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
            // also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
            // common in the npm registry.
            var LOOSEPLAIN =
                "[v=\\s]*" +
                src[MAINVERSIONLOOSE] +
                src[PRERELEASELOOSE] +
                "?" +
                src[BUILD] +
                "?";

            var LOOSE = R++;
            src[LOOSE] = "^" + LOOSEPLAIN + "$";

            var GTLT = R++;
            src[GTLT] = "((?:<|>)?=?)";

            // Something like "2.*" or "1.2.x".
            // Note that "x.x" is a valid xRange identifer, meaning "any version"
            // Only the first item is strictly required.
            var XRANGEIDENTIFIERLOOSE = R++;
            src[XRANGEIDENTIFIERLOOSE] =
                src[NUMERICIDENTIFIERLOOSE] + "|x|X|\\*";
            var XRANGEIDENTIFIER = R++;
            src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + "|x|X|\\*";

            var XRANGEPLAIN = R++;
            src[XRANGEPLAIN] =
                "[v=\\s]*(" +
                src[XRANGEIDENTIFIER] +
                ")" +
                "(?:\\.(" +
                src[XRANGEIDENTIFIER] +
                ")" +
                "(?:\\.(" +
                src[XRANGEIDENTIFIER] +
                ")" +
                "(?:" +
                src[PRERELEASE] +
                ")?" +
                src[BUILD] +
                "?" +
                ")?)?";

            var XRANGEPLAINLOOSE = R++;
            src[XRANGEPLAINLOOSE] =
                "[v=\\s]*(" +
                src[XRANGEIDENTIFIERLOOSE] +
                ")" +
                "(?:\\.(" +
                src[XRANGEIDENTIFIERLOOSE] +
                ")" +
                "(?:\\.(" +
                src[XRANGEIDENTIFIERLOOSE] +
                ")" +
                "(?:" +
                src[PRERELEASELOOSE] +
                ")?" +
                src[BUILD] +
                "?" +
                ")?)?";

            var XRANGE = R++;
            src[XRANGE] = "^" + src[GTLT] + "\\s*" + src[XRANGEPLAIN] + "$";
            var XRANGELOOSE = R++;
            src[XRANGELOOSE] =
                "^" + src[GTLT] + "\\s*" + src[XRANGEPLAINLOOSE] + "$";

            // Coercion.
            // Extract anything that could conceivably be a part of a valid semver
            var COERCE = R++;
            src[COERCE] =
                "(?:^|[^\\d])" +
                "(\\d{1," +
                MAX_SAFE_COMPONENT_LENGTH +
                "})" +
                "(?:\\.(\\d{1," +
                MAX_SAFE_COMPONENT_LENGTH +
                "}))?" +
                "(?:\\.(\\d{1," +
                MAX_SAFE_COMPONENT_LENGTH +
                "}))?" +
                "(?:$|[^\\d])";

            // Tilde ranges.
            // Meaning is "reasonably at or greater than"
            var LONETILDE = R++;
            src[LONETILDE] = "(?:~>?)";

            var TILDETRIM = R++;
            src[TILDETRIM] = "(\\s*)" + src[LONETILDE] + "\\s+";
            re[TILDETRIM] = new RegExp(src[TILDETRIM], "g");
            var tildeTrimReplace = "$1~";

            var TILDE = R++;
            src[TILDE] = "^" + src[LONETILDE] + src[XRANGEPLAIN] + "$";
            var TILDELOOSE = R++;
            src[TILDELOOSE] =
                "^" + src[LONETILDE] + src[XRANGEPLAINLOOSE] + "$";

            // Caret ranges.
            // Meaning is "at least and backwards compatible with"
            var LONECARET = R++;
            src[LONECARET] = "(?:\\^)";

            var CARETTRIM = R++;
            src[CARETTRIM] = "(\\s*)" + src[LONECARET] + "\\s+";
            re[CARETTRIM] = new RegExp(src[CARETTRIM], "g");
            var caretTrimReplace = "$1^";

            var CARET = R++;
            src[CARET] = "^" + src[LONECARET] + src[XRANGEPLAIN] + "$";
            var CARETLOOSE = R++;
            src[CARETLOOSE] =
                "^" + src[LONECARET] + src[XRANGEPLAINLOOSE] + "$";

            // A simple gt/lt/eq thing, or just "" to indicate "any version"
            var COMPARATORLOOSE = R++;
            src[COMPARATORLOOSE] =
                "^" + src[GTLT] + "\\s*(" + LOOSEPLAIN + ")$|^$";
            var COMPARATOR = R++;
            src[COMPARATOR] = "^" + src[GTLT] + "\\s*(" + FULLPLAIN + ")$|^$";

            // An expression to strip any whitespace between the gtlt and the thing
            // it modifies, so that `> 1.2.3` ==> `>1.2.3`
            var COMPARATORTRIM = R++;
            src[COMPARATORTRIM] =
                "(\\s*)" +
                src[GTLT] +
                "\\s*(" +
                LOOSEPLAIN +
                "|" +
                src[XRANGEPLAIN] +
                ")";

            // this one has to use the /g flag
            re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], "g");
            var comparatorTrimReplace = "$1$2$3";

            // Something like `1.2.3 - 1.2.4`
            // Note that these all use the loose form, because they'll be
            // checked against either the strict or loose comparator form
            // later.
            var HYPHENRANGE = R++;
            src[HYPHENRANGE] =
                "^\\s*(" +
                src[XRANGEPLAIN] +
                ")" +
                "\\s+-\\s+" +
                "(" +
                src[XRANGEPLAIN] +
                ")" +
                "\\s*$";

            var HYPHENRANGELOOSE = R++;
            src[HYPHENRANGELOOSE] =
                "^\\s*(" +
                src[XRANGEPLAINLOOSE] +
                ")" +
                "\\s+-\\s+" +
                "(" +
                src[XRANGEPLAINLOOSE] +
                ")" +
                "\\s*$";

            // Star ranges basically just allow anything at all.
            var STAR = R++;
            src[STAR] = "(<|>)?=?\\s*\\*";

            // Compile to actual regexp objects.
            // All are flag-free, unless they were created above with a flag.
            for (var i = 0; i < R; i++) {
                debug(i, src[i]);
                if (!re[i]) {
                    re[i] = new RegExp(src[i]);
                }
            }

            exports.parse = parse;
            function parse(version, options) {
                if (!options || typeof options !== "object") {
                    options = {
                        loose: !!options,
                        includePrerelease: false,
                    };
                }

                if (version instanceof SemVer) {
                    return version;
                }

                if (typeof version !== "string") {
                    return null;
                }

                if (version.length > MAX_LENGTH) {
                    return null;
                }

                var r = options.loose ? re[LOOSE] : re[FULL];
                if (!r.test(version)) {
                    return null;
                }

                try {
                    return new SemVer(version, options);
                } catch (er) {
                    return null;
                }
            }

            exports.valid = valid;
            function valid(version, options) {
                var v = parse(version, options);
                return v ? v.version : null;
            }

            exports.clean = clean;
            function clean(version, options) {
                var s = parse(version.trim().replace(/^[=v]+/, ""), options);
                return s ? s.version : null;
            }

            exports.SemVer = SemVer;

            function SemVer(version, options) {
                if (!options || typeof options !== "object") {
                    options = {
                        loose: !!options,
                        includePrerelease: false,
                    };
                }
                if (version instanceof SemVer) {
                    if (version.loose === options.loose) {
                        return version;
                    } else {
                        version = version.version;
                    }
                } else if (typeof version !== "string") {
                    throw new TypeError("Invalid Version: " + version);
                }

                if (version.length > MAX_LENGTH) {
                    throw new TypeError(
                        "version is longer than " + MAX_LENGTH + " characters"
                    );
                }

                if (!(this instanceof SemVer)) {
                    return new SemVer(version, options);
                }

                debug("SemVer", version, options);
                this.options = options;
                this.loose = !!options.loose;

                var m = version
                    .trim()
                    .match(options.loose ? re[LOOSE] : re[FULL]);

                if (!m) {
                    throw new TypeError("Invalid Version: " + version);
                }

                this.raw = version;

                // these are actually numbers
                this.major = +m[1];
                this.minor = +m[2];
                this.patch = +m[3];

                if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
                    throw new TypeError("Invalid major version");
                }

                if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
                    throw new TypeError("Invalid minor version");
                }

                if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
                    throw new TypeError("Invalid patch version");
                }

                // numberify any prerelease numeric ids
                if (!m[4]) {
                    this.prerelease = [];
                } else {
                    this.prerelease = m[4].split(".").map(function (id) {
                        if (/^[0-9]+$/.test(id)) {
                            var num = +id;
                            if (num >= 0 && num < MAX_SAFE_INTEGER) {
                                return num;
                            }
                        }
                        return id;
                    });
                }

                this.build = m[5] ? m[5].split(".") : [];
                this.format();
            }

            SemVer.prototype.format = function () {
                this.version = this.major + "." + this.minor + "." + this.patch;
                if (this.prerelease.length) {
                    this.version += "-" + this.prerelease.join(".");
                }
                return this.version;
            };

            SemVer.prototype.toString = function () {
                return this.version;
            };

            SemVer.prototype.compare = function (other) {
                debug("SemVer.compare", this.version, this.options, other);
                if (!(other instanceof SemVer)) {
                    other = new SemVer(other, this.options);
                }

                return this.compareMain(other) || this.comparePre(other);
            };

            SemVer.prototype.compareMain = function (other) {
                if (!(other instanceof SemVer)) {
                    other = new SemVer(other, this.options);
                }

                return (
                    compareIdentifiers(this.major, other.major) ||
                    compareIdentifiers(this.minor, other.minor) ||
                    compareIdentifiers(this.patch, other.patch)
                );
            };

            SemVer.prototype.comparePre = function (other) {
                if (!(other instanceof SemVer)) {
                    other = new SemVer(other, this.options);
                }

                // NOT having a prerelease is > having one
                if (this.prerelease.length && !other.prerelease.length) {
                    return -1;
                } else if (!this.prerelease.length && other.prerelease.length) {
                    return 1;
                } else if (
                    !this.prerelease.length &&
                    !other.prerelease.length
                ) {
                    return 0;
                }

                var i = 0;
                do {
                    var a = this.prerelease[i];
                    var b = other.prerelease[i];
                    debug("prerelease compare", i, a, b);
                    if (a === undefined && b === undefined) {
                        return 0;
                    } else if (b === undefined) {
                        return 1;
                    } else if (a === undefined) {
                        return -1;
                    } else if (a === b) {
                        continue;
                    } else {
                        return compareIdentifiers(a, b);
                    }
                } while (++i);
            };

            // preminor will bump the version up to the next minor release, and immediately
            // down to pre-release. premajor and prepatch work the same way.
            SemVer.prototype.inc = function (release, identifier) {
                switch (release) {
                    case "premajor":
                        this.prerelease.length = 0;
                        this.patch = 0;
                        this.minor = 0;
                        this.major++;
                        this.inc("pre", identifier);
                        break;
                    case "preminor":
                        this.prerelease.length = 0;
                        this.patch = 0;
                        this.minor++;
                        this.inc("pre", identifier);
                        break;
                    case "prepatch":
                        // If this is already a prerelease, it will bump to the next version
                        // drop any prereleases that might already exist, since they are not
                        // relevant at this point.
                        this.prerelease.length = 0;
                        this.inc("patch", identifier);
                        this.inc("pre", identifier);
                        break;
                    // If the input is a non-prerelease version, this acts the same as
                    // prepatch.
                    case "prerelease":
                        if (this.prerelease.length === 0) {
                            this.inc("patch", identifier);
                        }
                        this.inc("pre", identifier);
                        break;

                    case "major":
                        // If this is a pre-major version, bump up to the same major version.
                        // Otherwise increment major.
                        // 1.0.0-5 bumps to 1.0.0
                        // 1.1.0 bumps to 2.0.0
                        if (
                            this.minor !== 0 ||
                            this.patch !== 0 ||
                            this.prerelease.length === 0
                        ) {
                            this.major++;
                        }
                        this.minor = 0;
                        this.patch = 0;
                        this.prerelease = [];
                        break;
                    case "minor":
                        // If this is a pre-minor version, bump up to the same minor version.
                        // Otherwise increment minor.
                        // 1.2.0-5 bumps to 1.2.0
                        // 1.2.1 bumps to 1.3.0
                        if (this.patch !== 0 || this.prerelease.length === 0) {
                            this.minor++;
                        }
                        this.patch = 0;
                        this.prerelease = [];
                        break;
                    case "patch":
                        // If this is not a pre-release version, it will increment the patch.
                        // If it is a pre-release it will bump up to the same patch version.
                        // 1.2.0-5 patches to 1.2.0
                        // 1.2.0 patches to 1.2.1
                        if (this.prerelease.length === 0) {
                            this.patch++;
                        }
                        this.prerelease = [];
                        break;
                    // This probably shouldn't be used publicly.
                    // 1.0.0 "pre" would become 1.0.0-0 which is the wrong direction.
                    case "pre":
                        if (this.prerelease.length === 0) {
                            this.prerelease = [0];
                        } else {
                            var i = this.prerelease.length;
                            while (--i >= 0) {
                                if (typeof this.prerelease[i] === "number") {
                                    this.prerelease[i]++;
                                    i = -2;
                                }
                            }
                            if (i === -1) {
                                // didn't increment anything
                                this.prerelease.push(0);
                            }
                        }
                        if (identifier) {
                            // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
                            // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
                            if (this.prerelease[0] === identifier) {
                                if (isNaN(this.prerelease[1])) {
                                    this.prerelease = [identifier, 0];
                                }
                            } else {
                                this.prerelease = [identifier, 0];
                            }
                        }
                        break;

                    default:
                        throw new Error(
                            "invalid increment argument: " + release
                        );
                }
                this.format();
                this.raw = this.version;
                return this;
            };

            exports.inc = inc;
            function inc(version, release, loose, identifier) {
                if (typeof loose === "string") {
                    identifier = loose;
                    loose = undefined;
                }

                try {
                    return new SemVer(version, loose).inc(release, identifier)
                        .version;
                } catch (er) {
                    return null;
                }
            }

            exports.diff = diff;
            function diff(version1, version2) {
                if (eq(version1, version2)) {
                    return null;
                } else {
                    var v1 = parse(version1);
                    var v2 = parse(version2);
                    var prefix = "";
                    if (v1.prerelease.length || v2.prerelease.length) {
                        prefix = "pre";
                        var defaultResult = "prerelease";
                    }
                    for (var key in v1) {
                        if (
                            key === "major" ||
                            key === "minor" ||
                            key === "patch"
                        ) {
                            if (v1[key] !== v2[key]) {
                                return prefix + key;
                            }
                        }
                    }
                    return defaultResult; // may be undefined
                }
            }

            exports.compareIdentifiers = compareIdentifiers;

            var numeric = /^[0-9]+$/;
            function compareIdentifiers(a, b) {
                var anum = numeric.test(a);
                var bnum = numeric.test(b);

                if (anum && bnum) {
                    a = +a;
                    b = +b;
                }

                return a === b
                    ? 0
                    : anum && !bnum
                    ? -1
                    : bnum && !anum
                    ? 1
                    : a < b
                    ? -1
                    : 1;
            }

            exports.rcompareIdentifiers = rcompareIdentifiers;
            function rcompareIdentifiers(a, b) {
                return compareIdentifiers(b, a);
            }

            exports.major = major;
            function major(a, loose) {
                return new SemVer(a, loose).major;
            }

            exports.minor = minor;
            function minor(a, loose) {
                return new SemVer(a, loose).minor;
            }

            exports.patch = patch;
            function patch(a, loose) {
                return new SemVer(a, loose).patch;
            }

            exports.compare = compare;
            function compare(a, b, loose) {
                return new SemVer(a, loose).compare(new SemVer(b, loose));
            }

            exports.compareLoose = compareLoose;
            function compareLoose(a, b) {
                return compare(a, b, true);
            }

            exports.rcompare = rcompare;
            function rcompare(a, b, loose) {
                return compare(b, a, loose);
            }

            exports.sort = sort;
            function sort(list, loose) {
                return list.sort(function (a, b) {
                    return exports.compare(a, b, loose);
                });
            }

            exports.rsort = rsort;
            function rsort(list, loose) {
                return list.sort(function (a, b) {
                    return exports.rcompare(a, b, loose);
                });
            }

            exports.gt = gt;
            function gt(a, b, loose) {
                return compare(a, b, loose) > 0;
            }

            exports.lt = lt;
            function lt(a, b, loose) {
                return compare(a, b, loose) < 0;
            }

            exports.eq = eq;
            function eq(a, b, loose) {
                return compare(a, b, loose) === 0;
            }

            exports.neq = neq;
            function neq(a, b, loose) {
                return compare(a, b, loose) !== 0;
            }

            exports.gte = gte;
            function gte(a, b, loose) {
                return compare(a, b, loose) >= 0;
            }

            exports.lte = lte;
            function lte(a, b, loose) {
                return compare(a, b, loose) <= 0;
            }

            exports.cmp = cmp;
            function cmp(a, op, b, loose) {
                switch (op) {
                    case "===":
                        if (typeof a === "object") a = a.version;
                        if (typeof b === "object") b = b.version;
                        return a === b;

                    case "!==":
                        if (typeof a === "object") a = a.version;
                        if (typeof b === "object") b = b.version;
                        return a !== b;

                    case "":
                    case "=":
                    case "==":
                        return eq(a, b, loose);

                    case "!=":
                        return neq(a, b, loose);

                    case ">":
                        return gt(a, b, loose);

                    case ">=":
                        return gte(a, b, loose);

                    case "<":
                        return lt(a, b, loose);

                    case "<=":
                        return lte(a, b, loose);

                    default:
                        throw new TypeError("Invalid operator: " + op);
                }
            }

            exports.Comparator = Comparator;
            function Comparator(comp, options) {
                if (!options || typeof options !== "object") {
                    options = {
                        loose: !!options,
                        includePrerelease: false,
                    };
                }

                if (comp instanceof Comparator) {
                    if (comp.loose === !!options.loose) {
                        return comp;
                    } else {
                        comp = comp.value;
                    }
                }

                if (!(this instanceof Comparator)) {
                    return new Comparator(comp, options);
                }

                debug("comparator", comp, options);
                this.options = options;
                this.loose = !!options.loose;
                this.parse(comp);

                if (this.semver === ANY) {
                    this.value = "";
                } else {
                    this.value = this.operator + this.semver.version;
                }

                debug("comp", this);
            }

            var ANY = {};
            Comparator.prototype.parse = function (comp) {
                var r = this.options.loose
                    ? re[COMPARATORLOOSE]
                    : re[COMPARATOR];
                var m = comp.match(r);

                if (!m) {
                    throw new TypeError("Invalid comparator: " + comp);
                }

                this.operator = m[1];
                if (this.operator === "=") {
                    this.operator = "";
                }

                // if it literally is just '>' or '' then allow anything.
                if (!m[2]) {
                    this.semver = ANY;
                } else {
                    this.semver = new SemVer(m[2], this.options.loose);
                }
            };

            Comparator.prototype.toString = function () {
                return this.value;
            };

            Comparator.prototype.test = function (version) {
                debug("Comparator.test", version, this.options.loose);

                if (this.semver === ANY) {
                    return true;
                }

                if (typeof version === "string") {
                    version = new SemVer(version, this.options);
                }

                return cmp(version, this.operator, this.semver, this.options);
            };

            Comparator.prototype.intersects = function (comp, options) {
                if (!(comp instanceof Comparator)) {
                    throw new TypeError("a Comparator is required");
                }

                if (!options || typeof options !== "object") {
                    options = {
                        loose: !!options,
                        includePrerelease: false,
                    };
                }

                var rangeTmp;

                if (this.operator === "") {
                    rangeTmp = new Range(comp.value, options);
                    return satisfies(this.value, rangeTmp, options);
                } else if (comp.operator === "") {
                    rangeTmp = new Range(this.value, options);
                    return satisfies(comp.semver, rangeTmp, options);
                }

                var sameDirectionIncreasing =
                    (this.operator === ">=" || this.operator === ">") &&
                    (comp.operator === ">=" || comp.operator === ">");
                var sameDirectionDecreasing =
                    (this.operator === "<=" || this.operator === "<") &&
                    (comp.operator === "<=" || comp.operator === "<");
                var sameSemVer = this.semver.version === comp.semver.version;
                var differentDirectionsInclusive =
                    (this.operator === ">=" || this.operator === "<=") &&
                    (comp.operator === ">=" || comp.operator === "<=");
                var oppositeDirectionsLessThan =
                    cmp(this.semver, "<", comp.semver, options) &&
                    (this.operator === ">=" || this.operator === ">") &&
                    (comp.operator === "<=" || comp.operator === "<");
                var oppositeDirectionsGreaterThan =
                    cmp(this.semver, ">", comp.semver, options) &&
                    (this.operator === "<=" || this.operator === "<") &&
                    (comp.operator === ">=" || comp.operator === ">");

                return (
                    sameDirectionIncreasing ||
                    sameDirectionDecreasing ||
                    (sameSemVer && differentDirectionsInclusive) ||
                    oppositeDirectionsLessThan ||
                    oppositeDirectionsGreaterThan
                );
            };

            exports.Range = Range;
            function Range(range, options) {
                if (!options || typeof options !== "object") {
                    options = {
                        loose: !!options,
                        includePrerelease: false,
                    };
                }

                if (range instanceof Range) {
                    if (
                        range.loose === !!options.loose &&
                        range.includePrerelease === !!options.includePrerelease
                    ) {
                        return range;
                    } else {
                        return new Range(range.raw, options);
                    }
                }

                if (range instanceof Comparator) {
                    return new Range(range.value, options);
                }

                if (!(this instanceof Range)) {
                    return new Range(range, options);
                }

                this.options = options;
                this.loose = !!options.loose;
                this.includePrerelease = !!options.includePrerelease;

                // First, split based on boolean or ||
                this.raw = range;
                this.set = range
                    .split(/\s*\|\|\s*/)
                    .map(function (range) {
                        return this.parseRange(range.trim());
                    }, this)
                    .filter(function (c) {
                        // throw out any that are not relevant for whatever reason
                        return c.length;
                    });

                if (!this.set.length) {
                    throw new TypeError("Invalid SemVer Range: " + range);
                }

                this.format();
            }

            Range.prototype.format = function () {
                this.range = this.set
                    .map(function (comps) {
                        return comps.join(" ").trim();
                    })
                    .join("||")
                    .trim();
                return this.range;
            };

            Range.prototype.toString = function () {
                return this.range;
            };

            Range.prototype.parseRange = function (range) {
                var loose = this.options.loose;
                range = range.trim();
                // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
                var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
                range = range.replace(hr, hyphenReplace);
                debug("hyphen replace", range);
                // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
                range = range.replace(
                    re[COMPARATORTRIM],
                    comparatorTrimReplace
                );
                debug("comparator trim", range, re[COMPARATORTRIM]);

                // `~ 1.2.3` => `~1.2.3`
                range = range.replace(re[TILDETRIM], tildeTrimReplace);

                // `^ 1.2.3` => `^1.2.3`
                range = range.replace(re[CARETTRIM], caretTrimReplace);

                // normalize spaces
                range = range.split(/\s+/).join(" ");

                // At this point, the range is completely trimmed and
                // ready to be split into comparators.

                var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
                var set = range
                    .split(" ")
                    .map(function (comp) {
                        return parseComparator(comp, this.options);
                    }, this)
                    .join(" ")
                    .split(/\s+/);
                if (this.options.loose) {
                    // in loose mode, throw out any that are not valid comparators
                    set = set.filter(function (comp) {
                        return !!comp.match(compRe);
                    });
                }
                set = set.map(function (comp) {
                    return new Comparator(comp, this.options);
                }, this);

                return set;
            };

            Range.prototype.intersects = function (range, options) {
                if (!(range instanceof Range)) {
                    throw new TypeError("a Range is required");
                }

                return this.set.some(function (thisComparators) {
                    return thisComparators.every(function (thisComparator) {
                        return range.set.some(function (rangeComparators) {
                            return rangeComparators.every(function (
                                rangeComparator
                            ) {
                                return thisComparator.intersects(
                                    rangeComparator,
                                    options
                                );
                            });
                        });
                    });
                });
            };

            // Mostly just for testing and legacy API reasons
            exports.toComparators = toComparators;
            function toComparators(range, options) {
                return new Range(range, options).set.map(function (comp) {
                    return comp
                        .map(function (c) {
                            return c.value;
                        })
                        .join(" ")
                        .trim()
                        .split(" ");
                });
            }

            // comprised of xranges, tildes, stars, and gtlt's at this point.
            // already replaced the hyphen ranges
            // turn into a set of JUST comparators.
            function parseComparator(comp, options) {
                debug("comp", comp, options);
                comp = replaceCarets(comp, options);
                debug("caret", comp);
                comp = replaceTildes(comp, options);
                debug("tildes", comp);
                comp = replaceXRanges(comp, options);
                debug("xrange", comp);
                comp = replaceStars(comp, options);
                debug("stars", comp);
                return comp;
            }

            function isX(id) {
                return !id || id.toLowerCase() === "x" || id === "*";
            }

            // ~, ~> --> * (any, kinda silly)
            // ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
            // ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
            // ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
            // ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
            // ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
            function replaceTildes(comp, options) {
                return comp
                    .trim()
                    .split(/\s+/)
                    .map(function (comp) {
                        return replaceTilde(comp, options);
                    })
                    .join(" ");
            }

            function replaceTilde(comp, options) {
                var r = options.loose ? re[TILDELOOSE] : re[TILDE];
                return comp.replace(r, function (_, M, m, p, pr) {
                    debug("tilde", comp, _, M, m, p, pr);
                    var ret;

                    if (isX(M)) {
                        ret = "";
                    } else if (isX(m)) {
                        ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0";
                    } else if (isX(p)) {
                        // ~1.2 == >=1.2.0 <1.3.0
                        ret =
                            ">=" +
                            M +
                            "." +
                            m +
                            ".0 <" +
                            M +
                            "." +
                            (+m + 1) +
                            ".0";
                    } else if (pr) {
                        debug("replaceTilde pr", pr);
                        ret =
                            ">=" +
                            M +
                            "." +
                            m +
                            "." +
                            p +
                            "-" +
                            pr +
                            " <" +
                            M +
                            "." +
                            (+m + 1) +
                            ".0";
                    } else {
                        // ~1.2.3 == >=1.2.3 <1.3.0
                        ret =
                            ">=" +
                            M +
                            "." +
                            m +
                            "." +
                            p +
                            " <" +
                            M +
                            "." +
                            (+m + 1) +
                            ".0";
                    }

                    debug("tilde return", ret);
                    return ret;
                });
            }

            // ^ --> * (any, kinda silly)
            // ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
            // ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
            // ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
            // ^1.2.3 --> >=1.2.3 <2.0.0
            // ^1.2.0 --> >=1.2.0 <2.0.0
            function replaceCarets(comp, options) {
                return comp
                    .trim()
                    .split(/\s+/)
                    .map(function (comp) {
                        return replaceCaret(comp, options);
                    })
                    .join(" ");
            }

            function replaceCaret(comp, options) {
                debug("caret", comp, options);
                var r = options.loose ? re[CARETLOOSE] : re[CARET];
                return comp.replace(r, function (_, M, m, p, pr) {
                    debug("caret", comp, _, M, m, p, pr);
                    var ret;

                    if (isX(M)) {
                        ret = "";
                    } else if (isX(m)) {
                        ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0";
                    } else if (isX(p)) {
                        if (M === "0") {
                            ret =
                                ">=" +
                                M +
                                "." +
                                m +
                                ".0 <" +
                                M +
                                "." +
                                (+m + 1) +
                                ".0";
                        } else {
                            ret =
                                ">=" + M + "." + m + ".0 <" + (+M + 1) + ".0.0";
                        }
                    } else if (pr) {
                        debug("replaceCaret pr", pr);
                        if (M === "0") {
                            if (m === "0") {
                                ret =
                                    ">=" +
                                    M +
                                    "." +
                                    m +
                                    "." +
                                    p +
                                    "-" +
                                    pr +
                                    " <" +
                                    M +
                                    "." +
                                    m +
                                    "." +
                                    (+p + 1);
                            } else {
                                ret =
                                    ">=" +
                                    M +
                                    "." +
                                    m +
                                    "." +
                                    p +
                                    "-" +
                                    pr +
                                    " <" +
                                    M +
                                    "." +
                                    (+m + 1) +
                                    ".0";
                            }
                        } else {
                            ret =
                                ">=" +
                                M +
                                "." +
                                m +
                                "." +
                                p +
                                "-" +
                                pr +
                                " <" +
                                (+M + 1) +
                                ".0.0";
                        }
                    } else {
                        debug("no pr");
                        if (M === "0") {
                            if (m === "0") {
                                ret =
                                    ">=" +
                                    M +
                                    "." +
                                    m +
                                    "." +
                                    p +
                                    " <" +
                                    M +
                                    "." +
                                    m +
                                    "." +
                                    (+p + 1);
                            } else {
                                ret =
                                    ">=" +
                                    M +
                                    "." +
                                    m +
                                    "." +
                                    p +
                                    " <" +
                                    M +
                                    "." +
                                    (+m + 1) +
                                    ".0";
                            }
                        } else {
                            ret =
                                ">=" +
                                M +
                                "." +
                                m +
                                "." +
                                p +
                                " <" +
                                (+M + 1) +
                                ".0.0";
                        }
                    }

                    debug("caret return", ret);
                    return ret;
                });
            }

            function replaceXRanges(comp, options) {
                debug("replaceXRanges", comp, options);
                return comp
                    .split(/\s+/)
                    .map(function (comp) {
                        return replaceXRange(comp, options);
                    })
                    .join(" ");
            }

            function replaceXRange(comp, options) {
                comp = comp.trim();
                var r = options.loose ? re[XRANGELOOSE] : re[XRANGE];
                return comp.replace(r, function (ret, gtlt, M, m, p, pr) {
                    debug("xRange", comp, ret, gtlt, M, m, p, pr);
                    var xM = isX(M);
                    var xm = xM || isX(m);
                    var xp = xm || isX(p);
                    var anyX = xp;

                    if (gtlt === "=" && anyX) {
                        gtlt = "";
                    }

                    if (xM) {
                        if (gtlt === ">" || gtlt === "<") {
                            // nothing is allowed
                            ret = "<0.0.0";
                        } else {
                            // nothing is forbidden
                            ret = "*";
                        }
                    } else if (gtlt && anyX) {
                        // we know patch is an x, because we have any x at all.
                        // replace X with 0
                        if (xm) {
                            m = 0;
                        }
                        p = 0;

                        if (gtlt === ">") {
                            // >1 => >=2.0.0
                            // >1.2 => >=1.3.0
                            // >1.2.3 => >= 1.2.4
                            gtlt = ">=";
                            if (xm) {
                                M = +M + 1;
                                m = 0;
                                p = 0;
                            } else {
                                m = +m + 1;
                                p = 0;
                            }
                        } else if (gtlt === "<=") {
                            // <=0.7.x is actually <0.8.0, since any 0.7.x should
                            // pass.  Similarly, <=7.x is actually <8.0.0, etc.
                            gtlt = "<";
                            if (xm) {
                                M = +M + 1;
                            } else {
                                m = +m + 1;
                            }
                        }

                        ret = gtlt + M + "." + m + "." + p;
                    } else if (xm) {
                        ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0";
                    } else if (xp) {
                        ret =
                            ">=" +
                            M +
                            "." +
                            m +
                            ".0 <" +
                            M +
                            "." +
                            (+m + 1) +
                            ".0";
                    }

                    debug("xRange return", ret);

                    return ret;
                });
            }

            // Because * is AND-ed with everything else in the comparator,
            // and '' means "any version", just remove the *s entirely.
            function replaceStars(comp, options) {
                debug("replaceStars", comp, options);
                // Looseness is ignored here.  star is always as loose as it gets!
                return comp.trim().replace(re[STAR], "");
            }

            // This function is passed to string.replace(re[HYPHENRANGE])
            // M, m, patch, prerelease, build
            // 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
            // 1.2.3 - 3.4 => >=1.2.0 <3.5.0 Any 3.4.x will do
            // 1.2 - 3.4 => >=1.2.0 <3.5.0
            function hyphenReplace(
                $0,
                from,
                fM,
                fm,
                fp,
                fpr,
                fb,
                to,
                tM,
                tm,
                tp,
                tpr,
                tb
            ) {
                if (isX(fM)) {
                    from = "";
                } else if (isX(fm)) {
                    from = ">=" + fM + ".0.0";
                } else if (isX(fp)) {
                    from = ">=" + fM + "." + fm + ".0";
                } else {
                    from = ">=" + from;
                }

                if (isX(tM)) {
                    to = "";
                } else if (isX(tm)) {
                    to = "<" + (+tM + 1) + ".0.0";
                } else if (isX(tp)) {
                    to = "<" + tM + "." + (+tm + 1) + ".0";
                } else if (tpr) {
                    to = "<=" + tM + "." + tm + "." + tp + "-" + tpr;
                } else {
                    to = "<=" + to;
                }

                return (from + " " + to).trim();
            }

            // if ANY of the sets match ALL of its comparators, then pass
            Range.prototype.test = function (version) {
                if (!version) {
                    return false;
                }

                if (typeof version === "string") {
                    version = new SemVer(version, this.options);
                }

                for (var i = 0; i < this.set.length; i++) {
                    if (testSet(this.set[i], version, this.options)) {
                        return true;
                    }
                }
                return false;
            };

            function testSet(set, version, options) {
                for (var i = 0; i < set.length; i++) {
                    if (!set[i].test(version)) {
                        return false;
                    }
                }

                if (version.prerelease.length && !options.includePrerelease) {
                    // Find the set of versions that are allowed to have prereleases
                    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
                    // That should allow `1.2.3-pr.2` to pass.
                    // However, `1.2.4-alpha.notready` should NOT be allowed,
                    // even though it's within the range set by the comparators.
                    for (i = 0; i < set.length; i++) {
                        debug(set[i].semver);
                        if (set[i].semver === ANY) {
                            continue;
                        }

                        if (set[i].semver.prerelease.length > 0) {
                            var allowed = set[i].semver;
                            if (
                                allowed.major === version.major &&
                                allowed.minor === version.minor &&
                                allowed.patch === version.patch
                            ) {
                                return true;
                            }
                        }
                    }

                    // Version has a -pre, but it's not one of the ones we like.
                    return false;
                }

                return true;
            }

            exports.satisfies = satisfies;
            function satisfies(version, range, options) {
                try {
                    range = new Range(range, options);
                } catch (er) {
                    return false;
                }
                return range.test(version);
            }

            exports.maxSatisfying = maxSatisfying;
            function maxSatisfying(versions, range, options) {
                var max = null;
                var maxSV = null;
                try {
                    var rangeObj = new Range(range, options);
                } catch (er) {
                    return null;
                }
                versions.forEach(function (v) {
                    if (rangeObj.test(v)) {
                        // satisfies(v, range, options)
                        if (!max || maxSV.compare(v) === -1) {
                            // compare(max, v, true)
                            max = v;
                            maxSV = new SemVer(max, options);
                        }
                    }
                });
                return max;
            }

            exports.minSatisfying = minSatisfying;
            function minSatisfying(versions, range, options) {
                var min = null;
                var minSV = null;
                try {
                    var rangeObj = new Range(range, options);
                } catch (er) {
                    return null;
                }
                versions.forEach(function (v) {
                    if (rangeObj.test(v)) {
                        // satisfies(v, range, options)
                        if (!min || minSV.compare(v) === 1) {
                            // compare(min, v, true)
                            min = v;
                            minSV = new SemVer(min, options);
                        }
                    }
                });
                return min;
            }

            exports.minVersion = minVersion;
            function minVersion(range, loose) {
                range = new Range(range, loose);

                var minver = new SemVer("0.0.0");
                if (range.test(minver)) {
                    return minver;
                }

                minver = new SemVer("0.0.0-0");
                if (range.test(minver)) {
                    return minver;
                }

                minver = null;
                for (var i = 0; i < range.set.length; ++i) {
                    var comparators = range.set[i];

                    comparators.forEach(function (comparator) {
                        // Clone to avoid manipulating the comparator's semver object.
                        var compver = new SemVer(comparator.semver.version);
                        switch (comparator.operator) {
                            case ">":
                                if (compver.prerelease.length === 0) {
                                    compver.patch++;
                                } else {
                                    compver.prerelease.push(0);
                                }
                                compver.raw = compver.format();
                            /* fallthrough */
                            case "":
                            case ">=":
                                if (!minver || gt(minver, compver)) {
                                    minver = compver;
                                }
                                break;
                            case "<":
                            case "<=":
                                /* Ignore maximum versions */
                                break;
                            /* istanbul ignore next */
                            default:
                                throw new Error(
                                    "Unexpected operation: " +
                                        comparator.operator
                                );
                        }
                    });
                }

                if (minver && range.test(minver)) {
                    return minver;
                }

                return null;
            }

            exports.validRange = validRange;
            function validRange(range, options) {
                try {
                    // Return '*' instead of '' so that truthiness works.
                    // This will throw if it's invalid anyway
                    return new Range(range, options).range || "*";
                } catch (er) {
                    return null;
                }
            }

            // Determine if version is less than all the versions possible in the range
            exports.ltr = ltr;
            function ltr(version, range, options) {
                return outside(version, range, "<", options);
            }

            // Determine if version is greater than all the versions possible in the range.
            exports.gtr = gtr;
            function gtr(version, range, options) {
                return outside(version, range, ">", options);
            }

            exports.outside = outside;
            function outside(version, range, hilo, options) {
                version = new SemVer(version, options);
                range = new Range(range, options);

                var gtfn, ltefn, ltfn, comp, ecomp;
                switch (hilo) {
                    case ">":
                        gtfn = gt;
                        ltefn = lte;
                        ltfn = lt;
                        comp = ">";
                        ecomp = ">=";
                        break;
                    case "<":
                        gtfn = lt;
                        ltefn = gte;
                        ltfn = gt;
                        comp = "<";
                        ecomp = "<=";
                        break;
                    default:
                        throw new TypeError(
                            'Must provide a hilo val of "<" or ">"'
                        );
                }

                // If it satisifes the range it is not outside
                if (satisfies(version, range, options)) {
                    return false;
                }

                // From now on, variable terms are as if we're in "gtr" mode.
                // but note that everything is flipped for the "ltr" function.

                for (var i = 0; i < range.set.length; ++i) {
                    var comparators = range.set[i];

                    var high = null;
                    var low = null;

                    comparators.forEach(function (comparator) {
                        if (comparator.semver === ANY) {
                            comparator = new Comparator(">=0.0.0");
                        }
                        high = high || comparator;
                        low = low || comparator;
                        if (gtfn(comparator.semver, high.semver, options)) {
                            high = comparator;
                        } else if (
                            ltfn(comparator.semver, low.semver, options)
                        ) {
                            low = comparator;
                        }
                    });

                    // If the edge version comparator has a operator then our version
                    // isn't outside it
                    if (high.operator === comp || high.operator === ecomp) {
                        return false;
                    }

                    // If the lowest version comparator has an operator and our version
                    // is less than it then it isn't higher than the range
                    if (
                        (!low.operator || low.operator === comp) &&
                        ltefn(version, low.semver)
                    ) {
                        return false;
                    } else if (
                        low.operator === ecomp &&
                        ltfn(version, low.semver)
                    ) {
                        return false;
                    }
                }
                return true;
            }

            exports.prerelease = prerelease;
            function prerelease(version, options) {
                var parsed = parse(version, options);
                return parsed && parsed.prerelease.length
                    ? parsed.prerelease
                    : null;
            }

            exports.intersects = intersects;
            function intersects(r1, r2, options) {
                r1 = new Range(r1, options);
                r2 = new Range(r2, options);
                return r1.intersects(r2);
            }

            exports.coerce = coerce;
            function coerce(version) {
                if (version instanceof SemVer) {
                    return version;
                }

                if (typeof version !== "string") {
                    return null;
                }

                var match = version.match(re[COERCE]);

                if (match == null) {
                    return null;
                }

                return parse(
                    match[1] + "." + (match[2] || "0") + "." + (match[3] || "0")
                );
            }

            /***/
        },
        /* 67 */
        /***/ (module, __unused_webpack_exports, __webpack_require__) => {
            var timespan = __webpack_require__(63);
            var PS_SUPPORTED = __webpack_require__(65);
            var jws = __webpack_require__(49);
            var includes = __webpack_require__(68);
            var isBoolean = __webpack_require__(69);
            var isInteger = __webpack_require__(70);
            var isNumber = __webpack_require__(71);
            var isPlainObject = __webpack_require__(72);
            var isString = __webpack_require__(73);
            var once = __webpack_require__(74);

            var SUPPORTED_ALGS = [
                "RS256",
                "RS384",
                "RS512",
                "ES256",
                "ES384",
                "ES512",
                "HS256",
                "HS384",
                "HS512",
                "none",
            ];
            if (PS_SUPPORTED) {
                SUPPORTED_ALGS.splice(3, 0, "PS256", "PS384", "PS512");
            }

            var sign_options_schema = {
                expiresIn: {
                    isValid: function (value) {
                        return isInteger(value) || (isString(value) && value);
                    },
                    message:
                        '"expiresIn" should be a number of seconds or string representing a timespan',
                },
                notBefore: {
                    isValid: function (value) {
                        return isInteger(value) || (isString(value) && value);
                    },
                    message:
                        '"notBefore" should be a number of seconds or string representing a timespan',
                },
                audience: {
                    isValid: function (value) {
                        return isString(value) || Array.isArray(value);
                    },
                    message: '"audience" must be a string or array',
                },
                algorithm: {
                    isValid: includes.bind(null, SUPPORTED_ALGS),
                    message: '"algorithm" must be a valid string enum value',
                },
                header: {
                    isValid: isPlainObject,
                    message: '"header" must be an object',
                },
                encoding: {
                    isValid: isString,
                    message: '"encoding" must be a string',
                },
                issuer: {
                    isValid: isString,
                    message: '"issuer" must be a string',
                },
                subject: {
                    isValid: isString,
                    message: '"subject" must be a string',
                },
                jwtid: {
                    isValid: isString,
                    message: '"jwtid" must be a string',
                },
                noTimestamp: {
                    isValid: isBoolean,
                    message: '"noTimestamp" must be a boolean',
                },
                keyid: {
                    isValid: isString,
                    message: '"keyid" must be a string',
                },
                mutatePayload: {
                    isValid: isBoolean,
                    message: '"mutatePayload" must be a boolean',
                },
            };

            var registered_claims_schema = {
                iat: {
                    isValid: isNumber,
                    message: '"iat" should be a number of seconds',
                },
                exp: {
                    isValid: isNumber,
                    message: '"exp" should be a number of seconds',
                },
                nbf: {
                    isValid: isNumber,
                    message: '"nbf" should be a number of seconds',
                },
            };

            function validate(schema, allowUnknown, object, parameterName) {
                if (!isPlainObject(object)) {
                    throw new Error(
                        'Expected "' + parameterName + '" to be a plain object.'
                    );
                }
                Object.keys(object).forEach(function (key) {
                    var validator = schema[key];
                    if (!validator) {
                        if (!allowUnknown) {
                            throw new Error(
                                '"' +
                                    key +
                                    '" is not allowed in "' +
                                    parameterName +
                                    '"'
                            );
                        }
                        return;
                    }
                    if (!validator.isValid(object[key])) {
                        throw new Error(validator.message);
                    }
                });
            }

            function validateOptions(options) {
                return validate(sign_options_schema, false, options, "options");
            }

            function validatePayload(payload) {
                return validate(
                    registered_claims_schema,
                    true,
                    payload,
                    "payload"
                );
            }

            var options_to_payload = {
                audience: "aud",
                issuer: "iss",
                subject: "sub",
                jwtid: "jti",
            };

            var options_for_objects = [
                "expiresIn",
                "notBefore",
                "noTimestamp",
                "audience",
                "issuer",
                "subject",
                "jwtid",
            ];

            module.exports = function (
                payload,
                secretOrPrivateKey,
                options,
                callback
            ) {
                if (typeof options === "function") {
                    callback = options;
                    options = {};
                } else {
                    options = options || {};
                }

                var isObjectPayload =
                    typeof payload === "object" && !Buffer.isBuffer(payload);

                var header = Object.assign(
                    {
                        alg: options.algorithm || "HS256",
                        typ: isObjectPayload ? "JWT" : undefined,
                        kid: options.keyid,
                    },
                    options.header
                );

                function failure(err) {
                    if (callback) {
                        return callback(err);
                    }
                    throw err;
                }

                if (!secretOrPrivateKey && options.algorithm !== "none") {
                    return failure(
                        new Error("secretOrPrivateKey must have a value")
                    );
                }

                if (typeof payload === "undefined") {
                    return failure(new Error("payload is required"));
                } else if (isObjectPayload) {
                    try {
                        validatePayload(payload);
                    } catch (error) {
                        return failure(error);
                    }
                    if (!options.mutatePayload) {
                        payload = Object.assign({}, payload);
                    }
                } else {
                    var invalid_options = options_for_objects.filter(function (
                        opt
                    ) {
                        return typeof options[opt] !== "undefined";
                    });

                    if (invalid_options.length > 0) {
                        return failure(
                            new Error(
                                "invalid " +
                                    invalid_options.join(",") +
                                    " option for " +
                                    typeof payload +
                                    " payload"
                            )
                        );
                    }
                }

                if (
                    typeof payload.exp !== "undefined" &&
                    typeof options.expiresIn !== "undefined"
                ) {
                    return failure(
                        new Error(
                            'Bad "options.expiresIn" option the payload already has an "exp" property.'
                        )
                    );
                }

                if (
                    typeof payload.nbf !== "undefined" &&
                    typeof options.notBefore !== "undefined"
                ) {
                    return failure(
                        new Error(
                            'Bad "options.notBefore" option the payload already has an "nbf" property.'
                        )
                    );
                }

                try {
                    validateOptions(options);
                } catch (error) {
                    return failure(error);
                }

                var timestamp = payload.iat || Math.floor(Date.now() / 1000);

                if (options.noTimestamp) {
                    delete payload.iat;
                } else if (isObjectPayload) {
                    payload.iat = timestamp;
                }

                if (typeof options.notBefore !== "undefined") {
                    try {
                        payload.nbf = timespan(options.notBefore, timestamp);
                    } catch (err) {
                        return failure(err);
                    }
                    if (typeof payload.nbf === "undefined") {
                        return failure(
                            new Error(
                                '"notBefore" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'
                            )
                        );
                    }
                }

                if (
                    typeof options.expiresIn !== "undefined" &&
                    typeof payload === "object"
                ) {
                    try {
                        payload.exp = timespan(options.expiresIn, timestamp);
                    } catch (err) {
                        return failure(err);
                    }
                    if (typeof payload.exp === "undefined") {
                        return failure(
                            new Error(
                                '"expiresIn" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'
                            )
                        );
                    }
                }

                Object.keys(options_to_payload).forEach(function (key) {
                    var claim = options_to_payload[key];
                    if (typeof options[key] !== "undefined") {
                        if (typeof payload[claim] !== "undefined") {
                            return failure(
                                new Error(
                                    'Bad "options.' +
                                        key +
                                        '" option. The payload already has an "' +
                                        claim +
                                        '" property.'
                                )
                            );
                        }
                        payload[claim] = options[key];
                    }
                });

                var encoding = options.encoding || "utf8";

                if (typeof callback === "function") {
                    callback = callback && once(callback);

                    jws.createSign({
                        header: header,
                        privateKey: secretOrPrivateKey,
                        payload: payload,
                        encoding: encoding,
                    })
                        .once("error", callback)
                        .once("done", function (signature) {
                            callback(null, signature);
                        });
                } else {
                    return jws.sign({
                        header: header,
                        payload: payload,
                        secret: secretOrPrivateKey,
                        encoding: encoding,
                    });
                }
            };

            /***/
        },
        /* 68 */
        /***/ (module) => {
            /**
             * lodash (Custom Build) <https://lodash.com/>
             * Build: `lodash modularize exports="npm" -o ./`
             * Copyright jQuery Foundation and other contributors <https://jquery.org/>
             * Released under MIT license <https://lodash.com/license>
             * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
             * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
             */

            /** Used as references for various `Number` constants. */
            var INFINITY = 1 / 0,
                MAX_SAFE_INTEGER = 9007199254740991,
                MAX_INTEGER = 1.7976931348623157e308,
                NAN = 0 / 0;

            /** `Object#toString` result references. */
            var argsTag = "[object Arguments]",
                funcTag = "[object Function]",
                genTag = "[object GeneratorFunction]",
                stringTag = "[object String]",
                symbolTag = "[object Symbol]";

            /** Used to match leading and trailing whitespace. */
            var reTrim = /^\s+|\s+$/g;

            /** Used to detect bad signed hexadecimal string values. */
            var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

            /** Used to detect binary string values. */
            var reIsBinary = /^0b[01]+$/i;

            /** Used to detect octal string values. */
            var reIsOctal = /^0o[0-7]+$/i;

            /** Used to detect unsigned integer values. */
            var reIsUint = /^(?:0|[1-9]\d*)$/;

            /** Built-in method references without a dependency on `root`. */
            var freeParseInt = parseInt;

            /**
             * A specialized version of `_.map` for arrays without support for iteratee
             * shorthands.
             *
             * @private
             * @param {Array} [array] The array to iterate over.
             * @param {Function} iteratee The function invoked per iteration.
             * @returns {Array} Returns the new mapped array.
             */
            function arrayMap(array, iteratee) {
                var index = -1,
                    length = array ? array.length : 0,
                    result = Array(length);

                while (++index < length) {
                    result[index] = iteratee(array[index], index, array);
                }
                return result;
            }

            /**
             * The base implementation of `_.findIndex` and `_.findLastIndex` without
             * support for iteratee shorthands.
             *
             * @private
             * @param {Array} array The array to inspect.
             * @param {Function} predicate The function invoked per iteration.
             * @param {number} fromIndex The index to search from.
             * @param {boolean} [fromRight] Specify iterating from right to left.
             * @returns {number} Returns the index of the matched value, else `-1`.
             */
            function baseFindIndex(array, predicate, fromIndex, fromRight) {
                var length = array.length,
                    index = fromIndex + (fromRight ? 1 : -1);

                while (fromRight ? index-- : ++index < length) {
                    if (predicate(array[index], index, array)) {
                        return index;
                    }
                }
                return -1;
            }

            /**
             * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
             *
             * @private
             * @param {Array} array The array to inspect.
             * @param {*} value The value to search for.
             * @param {number} fromIndex The index to search from.
             * @returns {number} Returns the index of the matched value, else `-1`.
             */
            function baseIndexOf(array, value, fromIndex) {
                if (value !== value) {
                    return baseFindIndex(array, baseIsNaN, fromIndex);
                }
                var index = fromIndex - 1,
                    length = array.length;

                while (++index < length) {
                    if (array[index] === value) {
                        return index;
                    }
                }
                return -1;
            }

            /**
             * The base implementation of `_.isNaN` without support for number objects.
             *
             * @private
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
             */
            function baseIsNaN(value) {
                return value !== value;
            }

            /**
             * The base implementation of `_.times` without support for iteratee shorthands
             * or max array length checks.
             *
             * @private
             * @param {number} n The number of times to invoke `iteratee`.
             * @param {Function} iteratee The function invoked per iteration.
             * @returns {Array} Returns the array of results.
             */
            function baseTimes(n, iteratee) {
                var index = -1,
                    result = Array(n);

                while (++index < n) {
                    result[index] = iteratee(index);
                }
                return result;
            }

            /**
             * The base implementation of `_.values` and `_.valuesIn` which creates an
             * array of `object` property values corresponding to the property names
             * of `props`.
             *
             * @private
             * @param {Object} object The object to query.
             * @param {Array} props The property names to get values for.
             * @returns {Object} Returns the array of property values.
             */
            function baseValues(object, props) {
                return arrayMap(props, function (key) {
                    return object[key];
                });
            }

            /**
             * Creates a unary function that invokes `func` with its argument transformed.
             *
             * @private
             * @param {Function} func The function to wrap.
             * @param {Function} transform The argument transform.
             * @returns {Function} Returns the new function.
             */
            function overArg(func, transform) {
                return function (arg) {
                    return func(transform(arg));
                };
            }

            /** Used for built-in method references. */
            var objectProto = Object.prototype;

            /** Used to check objects for own properties. */
            var hasOwnProperty = objectProto.hasOwnProperty;

            /**
             * Used to resolve the
             * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
             * of values.
             */
            var objectToString = objectProto.toString;

            /** Built-in value references. */
            var propertyIsEnumerable = objectProto.propertyIsEnumerable;

            /* Built-in method references for those with the same name as other `lodash` methods. */
            var nativeKeys = overArg(Object.keys, Object),
                nativeMax = Math.max;

            /**
             * Creates an array of the enumerable property names of the array-like `value`.
             *
             * @private
             * @param {*} value The value to query.
             * @param {boolean} inherited Specify returning inherited property names.
             * @returns {Array} Returns the array of property names.
             */
            function arrayLikeKeys(value, inherited) {
                // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
                // Safari 9 makes `arguments.length` enumerable in strict mode.
                var result =
                    isArray(value) || isArguments(value)
                        ? baseTimes(value.length, String)
                        : [];

                var length = result.length,
                    skipIndexes = !!length;

                for (var key in value) {
                    if (
                        (inherited || hasOwnProperty.call(value, key)) &&
                        !(
                            skipIndexes &&
                            (key == "length" || isIndex(key, length))
                        )
                    ) {
                        result.push(key);
                    }
                }
                return result;
            }

            /**
             * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
             *
             * @private
             * @param {Object} object The object to query.
             * @returns {Array} Returns the array of property names.
             */
            function baseKeys(object) {
                if (!isPrototype(object)) {
                    return nativeKeys(object);
                }
                var result = [];
                for (var key in Object(object)) {
                    if (
                        hasOwnProperty.call(object, key) &&
                        key != "constructor"
                    ) {
                        result.push(key);
                    }
                }
                return result;
            }

            /**
             * Checks if `value` is a valid array-like index.
             *
             * @private
             * @param {*} value The value to check.
             * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
             * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
             */
            function isIndex(value, length) {
                length = length == null ? MAX_SAFE_INTEGER : length;
                return (
                    !!length &&
                    (typeof value == "number" || reIsUint.test(value)) &&
                    value > -1 &&
                    value % 1 == 0 &&
                    value < length
                );
            }

            /**
             * Checks if `value` is likely a prototype object.
             *
             * @private
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
             */
            function isPrototype(value) {
                var Ctor = value && value.constructor,
                    proto =
                        (typeof Ctor == "function" && Ctor.prototype) ||
                        objectProto;

                return value === proto;
            }

            /**
             * Checks if `value` is in `collection`. If `collection` is a string, it's
             * checked for a substring of `value`, otherwise
             * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
             * is used for equality comparisons. If `fromIndex` is negative, it's used as
             * the offset from the end of `collection`.
             *
             * @static
             * @memberOf _
             * @since 0.1.0
             * @category Collection
             * @param {Array|Object|string} collection The collection to inspect.
             * @param {*} value The value to search for.
             * @param {number} [fromIndex=0] The index to search from.
             * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
             * @returns {boolean} Returns `true` if `value` is found, else `false`.
             * @example
             *
             * _.includes([1, 2, 3], 1);
             * // => true
             *
             * _.includes([1, 2, 3], 1, 2);
             * // => false
             *
             * _.includes({ 'a': 1, 'b': 2 }, 1);
             * // => true
             *
             * _.includes('abcd', 'bc');
             * // => true
             */
            function includes(collection, value, fromIndex, guard) {
                collection = isArrayLike(collection)
                    ? collection
                    : values(collection);
                fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0;

                var length = collection.length;
                if (fromIndex < 0) {
                    fromIndex = nativeMax(length + fromIndex, 0);
                }
                return isString(collection)
                    ? fromIndex <= length &&
                          collection.indexOf(value, fromIndex) > -1
                    : !!length &&
                          baseIndexOf(collection, value, fromIndex) > -1;
            }

            /**
             * Checks if `value` is likely an `arguments` object.
             *
             * @static
             * @memberOf _
             * @since 0.1.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is an `arguments` object,
             *  else `false`.
             * @example
             *
             * _.isArguments(function() { return arguments; }());
             * // => true
             *
             * _.isArguments([1, 2, 3]);
             * // => false
             */
            function isArguments(value) {
                // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
                return (
                    isArrayLikeObject(value) &&
                    hasOwnProperty.call(value, "callee") &&
                    (!propertyIsEnumerable.call(value, "callee") ||
                        objectToString.call(value) == argsTag)
                );
            }

            /**
             * Checks if `value` is classified as an `Array` object.
             *
             * @static
             * @memberOf _
             * @since 0.1.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is an array, else `false`.
             * @example
             *
             * _.isArray([1, 2, 3]);
             * // => true
             *
             * _.isArray(document.body.children);
             * // => false
             *
             * _.isArray('abc');
             * // => false
             *
             * _.isArray(_.noop);
             * // => false
             */
            var isArray = Array.isArray;

            /**
             * Checks if `value` is array-like. A value is considered array-like if it's
             * not a function and has a `value.length` that's an integer greater than or
             * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
             * @example
             *
             * _.isArrayLike([1, 2, 3]);
             * // => true
             *
             * _.isArrayLike(document.body.children);
             * // => true
             *
             * _.isArrayLike('abc');
             * // => true
             *
             * _.isArrayLike(_.noop);
             * // => false
             */
            function isArrayLike(value) {
                return (
                    value != null &&
                    isLength(value.length) &&
                    !isFunction(value)
                );
            }

            /**
             * This method is like `_.isArrayLike` except that it also checks if `value`
             * is an object.
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is an array-like object,
             *  else `false`.
             * @example
             *
             * _.isArrayLikeObject([1, 2, 3]);
             * // => true
             *
             * _.isArrayLikeObject(document.body.children);
             * // => true
             *
             * _.isArrayLikeObject('abc');
             * // => false
             *
             * _.isArrayLikeObject(_.noop);
             * // => false
             */
            function isArrayLikeObject(value) {
                return isObjectLike(value) && isArrayLike(value);
            }

            /**
             * Checks if `value` is classified as a `Function` object.
             *
             * @static
             * @memberOf _
             * @since 0.1.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a function, else `false`.
             * @example
             *
             * _.isFunction(_);
             * // => true
             *
             * _.isFunction(/abc/);
             * // => false
             */
            function isFunction(value) {
                // The use of `Object#toString` avoids issues with the `typeof` operator
                // in Safari 8-9 which returns 'object' for typed array and other constructors.
                var tag = isObject(value) ? objectToString.call(value) : "";
                return tag == funcTag || tag == genTag;
            }

            /**
             * Checks if `value` is a valid array-like length.
             *
             * **Note:** This method is loosely based on
             * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
             * @example
             *
             * _.isLength(3);
             * // => true
             *
             * _.isLength(Number.MIN_VALUE);
             * // => false
             *
             * _.isLength(Infinity);
             * // => false
             *
             * _.isLength('3');
             * // => false
             */
            function isLength(value) {
                return (
                    typeof value == "number" &&
                    value > -1 &&
                    value % 1 == 0 &&
                    value <= MAX_SAFE_INTEGER
                );
            }

            /**
             * Checks if `value` is the
             * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
             * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
             *
             * @static
             * @memberOf _
             * @since 0.1.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is an object, else `false`.
             * @example
             *
             * _.isObject({});
             * // => true
             *
             * _.isObject([1, 2, 3]);
             * // => true
             *
             * _.isObject(_.noop);
             * // => true
             *
             * _.isObject(null);
             * // => false
             */
            function isObject(value) {
                var type = typeof value;
                return !!value && (type == "object" || type == "function");
            }

            /**
             * Checks if `value` is object-like. A value is object-like if it's not `null`
             * and has a `typeof` result of "object".
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
             * @example
             *
             * _.isObjectLike({});
             * // => true
             *
             * _.isObjectLike([1, 2, 3]);
             * // => true
             *
             * _.isObjectLike(_.noop);
             * // => false
             *
             * _.isObjectLike(null);
             * // => false
             */
            function isObjectLike(value) {
                return !!value && typeof value == "object";
            }

            /**
             * Checks if `value` is classified as a `String` primitive or object.
             *
             * @static
             * @since 0.1.0
             * @memberOf _
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a string, else `false`.
             * @example
             *
             * _.isString('abc');
             * // => true
             *
             * _.isString(1);
             * // => false
             */
            function isString(value) {
                return (
                    typeof value == "string" ||
                    (!isArray(value) &&
                        isObjectLike(value) &&
                        objectToString.call(value) == stringTag)
                );
            }

            /**
             * Checks if `value` is classified as a `Symbol` primitive or object.
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
             * @example
             *
             * _.isSymbol(Symbol.iterator);
             * // => true
             *
             * _.isSymbol('abc');
             * // => false
             */
            function isSymbol(value) {
                return (
                    typeof value == "symbol" ||
                    (isObjectLike(value) &&
                        objectToString.call(value) == symbolTag)
                );
            }

            /**
             * Converts `value` to a finite number.
             *
             * @static
             * @memberOf _
             * @since 4.12.0
             * @category Lang
             * @param {*} value The value to convert.
             * @returns {number} Returns the converted number.
             * @example
             *
             * _.toFinite(3.2);
             * // => 3.2
             *
             * _.toFinite(Number.MIN_VALUE);
             * // => 5e-324
             *
             * _.toFinite(Infinity);
             * // => 1.7976931348623157e+308
             *
             * _.toFinite('3.2');
             * // => 3.2
             */
            function toFinite(value) {
                if (!value) {
                    return value === 0 ? value : 0;
                }
                value = toNumber(value);
                if (value === INFINITY || value === -INFINITY) {
                    var sign = value < 0 ? -1 : 1;
                    return sign * MAX_INTEGER;
                }
                return value === value ? value : 0;
            }

            /**
             * Converts `value` to an integer.
             *
             * **Note:** This method is loosely based on
             * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to convert.
             * @returns {number} Returns the converted integer.
             * @example
             *
             * _.toInteger(3.2);
             * // => 3
             *
             * _.toInteger(Number.MIN_VALUE);
             * // => 0
             *
             * _.toInteger(Infinity);
             * // => 1.7976931348623157e+308
             *
             * _.toInteger('3.2');
             * // => 3
             */
            function toInteger(value) {
                var result = toFinite(value),
                    remainder = result % 1;

                return result === result
                    ? remainder
                        ? result - remainder
                        : result
                    : 0;
            }

            /**
             * Converts `value` to a number.
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to process.
             * @returns {number} Returns the number.
             * @example
             *
             * _.toNumber(3.2);
             * // => 3.2
             *
             * _.toNumber(Number.MIN_VALUE);
             * // => 5e-324
             *
             * _.toNumber(Infinity);
             * // => Infinity
             *
             * _.toNumber('3.2');
             * // => 3.2
             */
            function toNumber(value) {
                if (typeof value == "number") {
                    return value;
                }
                if (isSymbol(value)) {
                    return NAN;
                }
                if (isObject(value)) {
                    var other =
                        typeof value.valueOf == "function"
                            ? value.valueOf()
                            : value;
                    value = isObject(other) ? other + "" : other;
                }
                if (typeof value != "string") {
                    return value === 0 ? value : +value;
                }
                value = value.replace(reTrim, "");
                var isBinary = reIsBinary.test(value);
                return isBinary || reIsOctal.test(value)
                    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
                    : reIsBadHex.test(value)
                    ? NAN
                    : +value;
            }

            /**
             * Creates an array of the own enumerable property names of `object`.
             *
             * **Note:** Non-object values are coerced to objects. See the
             * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
             * for more details.
             *
             * @static
             * @since 0.1.0
             * @memberOf _
             * @category Object
             * @param {Object} object The object to query.
             * @returns {Array} Returns the array of property names.
             * @example
             *
             * function Foo() {
             *   this.a = 1;
             *   this.b = 2;
             * }
             *
             * Foo.prototype.c = 3;
             *
             * _.keys(new Foo);
             * // => ['a', 'b'] (iteration order is not guaranteed)
             *
             * _.keys('hi');
             * // => ['0', '1']
             */
            function keys(object) {
                return isArrayLike(object)
                    ? arrayLikeKeys(object)
                    : baseKeys(object);
            }

            /**
             * Creates an array of the own enumerable string keyed property values of `object`.
             *
             * **Note:** Non-object values are coerced to objects.
             *
             * @static
             * @since 0.1.0
             * @memberOf _
             * @category Object
             * @param {Object} object The object to query.
             * @returns {Array} Returns the array of property values.
             * @example
             *
             * function Foo() {
             *   this.a = 1;
             *   this.b = 2;
             * }
             *
             * Foo.prototype.c = 3;
             *
             * _.values(new Foo);
             * // => [1, 2] (iteration order is not guaranteed)
             *
             * _.values('hi');
             * // => ['h', 'i']
             */
            function values(object) {
                return object ? baseValues(object, keys(object)) : [];
            }

            module.exports = includes;

            /***/
        },
        /* 69 */
        /***/ (module) => {
            /**
             * lodash 3.0.3 (Custom Build) <https://lodash.com/>
             * Build: `lodash modularize exports="npm" -o ./`
             * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
             * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
             * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
             * Available under MIT license <https://lodash.com/license>
             */

            /** `Object#toString` result references. */
            var boolTag = "[object Boolean]";

            /** Used for built-in method references. */
            var objectProto = Object.prototype;

            /**
             * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
             * of values.
             */
            var objectToString = objectProto.toString;

            /**
             * Checks if `value` is classified as a boolean primitive or object.
             *
             * @static
             * @memberOf _
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
             * @example
             *
             * _.isBoolean(false);
             * // => true
             *
             * _.isBoolean(null);
             * // => false
             */
            function isBoolean(value) {
                return (
                    value === true ||
                    value === false ||
                    (isObjectLike(value) &&
                        objectToString.call(value) == boolTag)
                );
            }

            /**
             * Checks if `value` is object-like. A value is object-like if it's not `null`
             * and has a `typeof` result of "object".
             *
             * @static
             * @memberOf _
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
             * @example
             *
             * _.isObjectLike({});
             * // => true
             *
             * _.isObjectLike([1, 2, 3]);
             * // => true
             *
             * _.isObjectLike(_.noop);
             * // => false
             *
             * _.isObjectLike(null);
             * // => false
             */
            function isObjectLike(value) {
                return !!value && typeof value == "object";
            }

            module.exports = isBoolean;

            /***/
        },
        /* 70 */
        /***/ (module) => {
            /**
             * lodash (Custom Build) <https://lodash.com/>
             * Build: `lodash modularize exports="npm" -o ./`
             * Copyright jQuery Foundation and other contributors <https://jquery.org/>
             * Released under MIT license <https://lodash.com/license>
             * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
             * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
             */

            /** Used as references for various `Number` constants. */
            var INFINITY = 1 / 0,
                MAX_INTEGER = 1.7976931348623157e308,
                NAN = 0 / 0;

            /** `Object#toString` result references. */
            var symbolTag = "[object Symbol]";

            /** Used to match leading and trailing whitespace. */
            var reTrim = /^\s+|\s+$/g;

            /** Used to detect bad signed hexadecimal string values. */
            var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

            /** Used to detect binary string values. */
            var reIsBinary = /^0b[01]+$/i;

            /** Used to detect octal string values. */
            var reIsOctal = /^0o[0-7]+$/i;

            /** Built-in method references without a dependency on `root`. */
            var freeParseInt = parseInt;

            /** Used for built-in method references. */
            var objectProto = Object.prototype;

            /**
             * Used to resolve the
             * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
             * of values.
             */
            var objectToString = objectProto.toString;

            /**
             * Checks if `value` is an integer.
             *
             * **Note:** This method is based on
             * [`Number.isInteger`](https://mdn.io/Number/isInteger).
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is an integer, else `false`.
             * @example
             *
             * _.isInteger(3);
             * // => true
             *
             * _.isInteger(Number.MIN_VALUE);
             * // => false
             *
             * _.isInteger(Infinity);
             * // => false
             *
             * _.isInteger('3');
             * // => false
             */
            function isInteger(value) {
                return typeof value == "number" && value == toInteger(value);
            }

            /**
             * Checks if `value` is the
             * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
             * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
             *
             * @static
             * @memberOf _
             * @since 0.1.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is an object, else `false`.
             * @example
             *
             * _.isObject({});
             * // => true
             *
             * _.isObject([1, 2, 3]);
             * // => true
             *
             * _.isObject(_.noop);
             * // => true
             *
             * _.isObject(null);
             * // => false
             */
            function isObject(value) {
                var type = typeof value;
                return !!value && (type == "object" || type == "function");
            }

            /**
             * Checks if `value` is object-like. A value is object-like if it's not `null`
             * and has a `typeof` result of "object".
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
             * @example
             *
             * _.isObjectLike({});
             * // => true
             *
             * _.isObjectLike([1, 2, 3]);
             * // => true
             *
             * _.isObjectLike(_.noop);
             * // => false
             *
             * _.isObjectLike(null);
             * // => false
             */
            function isObjectLike(value) {
                return !!value && typeof value == "object";
            }

            /**
             * Checks if `value` is classified as a `Symbol` primitive or object.
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
             * @example
             *
             * _.isSymbol(Symbol.iterator);
             * // => true
             *
             * _.isSymbol('abc');
             * // => false
             */
            function isSymbol(value) {
                return (
                    typeof value == "symbol" ||
                    (isObjectLike(value) &&
                        objectToString.call(value) == symbolTag)
                );
            }

            /**
             * Converts `value` to a finite number.
             *
             * @static
             * @memberOf _
             * @since 4.12.0
             * @category Lang
             * @param {*} value The value to convert.
             * @returns {number} Returns the converted number.
             * @example
             *
             * _.toFinite(3.2);
             * // => 3.2
             *
             * _.toFinite(Number.MIN_VALUE);
             * // => 5e-324
             *
             * _.toFinite(Infinity);
             * // => 1.7976931348623157e+308
             *
             * _.toFinite('3.2');
             * // => 3.2
             */
            function toFinite(value) {
                if (!value) {
                    return value === 0 ? value : 0;
                }
                value = toNumber(value);
                if (value === INFINITY || value === -INFINITY) {
                    var sign = value < 0 ? -1 : 1;
                    return sign * MAX_INTEGER;
                }
                return value === value ? value : 0;
            }

            /**
             * Converts `value` to an integer.
             *
             * **Note:** This method is loosely based on
             * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to convert.
             * @returns {number} Returns the converted integer.
             * @example
             *
             * _.toInteger(3.2);
             * // => 3
             *
             * _.toInteger(Number.MIN_VALUE);
             * // => 0
             *
             * _.toInteger(Infinity);
             * // => 1.7976931348623157e+308
             *
             * _.toInteger('3.2');
             * // => 3
             */
            function toInteger(value) {
                var result = toFinite(value),
                    remainder = result % 1;

                return result === result
                    ? remainder
                        ? result - remainder
                        : result
                    : 0;
            }

            /**
             * Converts `value` to a number.
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to process.
             * @returns {number} Returns the number.
             * @example
             *
             * _.toNumber(3.2);
             * // => 3.2
             *
             * _.toNumber(Number.MIN_VALUE);
             * // => 5e-324
             *
             * _.toNumber(Infinity);
             * // => Infinity
             *
             * _.toNumber('3.2');
             * // => 3.2
             */
            function toNumber(value) {
                if (typeof value == "number") {
                    return value;
                }
                if (isSymbol(value)) {
                    return NAN;
                }
                if (isObject(value)) {
                    var other =
                        typeof value.valueOf == "function"
                            ? value.valueOf()
                            : value;
                    value = isObject(other) ? other + "" : other;
                }
                if (typeof value != "string") {
                    return value === 0 ? value : +value;
                }
                value = value.replace(reTrim, "");
                var isBinary = reIsBinary.test(value);
                return isBinary || reIsOctal.test(value)
                    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
                    : reIsBadHex.test(value)
                    ? NAN
                    : +value;
            }

            module.exports = isInteger;

            /***/
        },
        /* 71 */
        /***/ (module) => {
            /**
             * lodash 3.0.3 (Custom Build) <https://lodash.com/>
             * Build: `lodash modularize exports="npm" -o ./`
             * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
             * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
             * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
             * Available under MIT license <https://lodash.com/license>
             */

            /** `Object#toString` result references. */
            var numberTag = "[object Number]";

            /** Used for built-in method references. */
            var objectProto = Object.prototype;

            /**
             * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
             * of values.
             */
            var objectToString = objectProto.toString;

            /**
             * Checks if `value` is object-like. A value is object-like if it's not `null`
             * and has a `typeof` result of "object".
             *
             * @static
             * @memberOf _
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
             * @example
             *
             * _.isObjectLike({});
             * // => true
             *
             * _.isObjectLike([1, 2, 3]);
             * // => true
             *
             * _.isObjectLike(_.noop);
             * // => false
             *
             * _.isObjectLike(null);
             * // => false
             */
            function isObjectLike(value) {
                return !!value && typeof value == "object";
            }

            /**
             * Checks if `value` is classified as a `Number` primitive or object.
             *
             * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are classified
             * as numbers, use the `_.isFinite` method.
             *
             * @static
             * @memberOf _
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
             * @example
             *
             * _.isNumber(3);
             * // => true
             *
             * _.isNumber(Number.MIN_VALUE);
             * // => true
             *
             * _.isNumber(Infinity);
             * // => true
             *
             * _.isNumber('3');
             * // => false
             */
            function isNumber(value) {
                return (
                    typeof value == "number" ||
                    (isObjectLike(value) &&
                        objectToString.call(value) == numberTag)
                );
            }

            module.exports = isNumber;

            /***/
        },
        /* 72 */
        /***/ (module) => {
            /**
             * lodash (Custom Build) <https://lodash.com/>
             * Build: `lodash modularize exports="npm" -o ./`
             * Copyright jQuery Foundation and other contributors <https://jquery.org/>
             * Released under MIT license <https://lodash.com/license>
             * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
             * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
             */

            /** `Object#toString` result references. */
            var objectTag = "[object Object]";

            /**
             * Checks if `value` is a host object in IE < 9.
             *
             * @private
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
             */
            function isHostObject(value) {
                // Many host objects are `Object` objects that can coerce to strings
                // despite having improperly defined `toString` methods.
                var result = false;
                if (value != null && typeof value.toString != "function") {
                    try {
                        result = !!(value + "");
                    } catch (e) {}
                }
                return result;
            }

            /**
             * Creates a unary function that invokes `func` with its argument transformed.
             *
             * @private
             * @param {Function} func The function to wrap.
             * @param {Function} transform The argument transform.
             * @returns {Function} Returns the new function.
             */
            function overArg(func, transform) {
                return function (arg) {
                    return func(transform(arg));
                };
            }

            /** Used for built-in method references. */
            var funcProto = Function.prototype,
                objectProto = Object.prototype;

            /** Used to resolve the decompiled source of functions. */
            var funcToString = funcProto.toString;

            /** Used to check objects for own properties. */
            var hasOwnProperty = objectProto.hasOwnProperty;

            /** Used to infer the `Object` constructor. */
            var objectCtorString = funcToString.call(Object);

            /**
             * Used to resolve the
             * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
             * of values.
             */
            var objectToString = objectProto.toString;

            /** Built-in value references. */
            var getPrototype = overArg(Object.getPrototypeOf, Object);

            /**
             * Checks if `value` is object-like. A value is object-like if it's not `null`
             * and has a `typeof` result of "object".
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
             * @example
             *
             * _.isObjectLike({});
             * // => true
             *
             * _.isObjectLike([1, 2, 3]);
             * // => true
             *
             * _.isObjectLike(_.noop);
             * // => false
             *
             * _.isObjectLike(null);
             * // => false
             */
            function isObjectLike(value) {
                return !!value && typeof value == "object";
            }

            /**
             * Checks if `value` is a plain object, that is, an object created by the
             * `Object` constructor or one with a `[[Prototype]]` of `null`.
             *
             * @static
             * @memberOf _
             * @since 0.8.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
             * @example
             *
             * function Foo() {
             *   this.a = 1;
             * }
             *
             * _.isPlainObject(new Foo);
             * // => false
             *
             * _.isPlainObject([1, 2, 3]);
             * // => false
             *
             * _.isPlainObject({ 'x': 0, 'y': 0 });
             * // => true
             *
             * _.isPlainObject(Object.create(null));
             * // => true
             */
            function isPlainObject(value) {
                if (
                    !isObjectLike(value) ||
                    objectToString.call(value) != objectTag ||
                    isHostObject(value)
                ) {
                    return false;
                }
                var proto = getPrototype(value);
                if (proto === null) {
                    return true;
                }
                var Ctor =
                    hasOwnProperty.call(proto, "constructor") &&
                    proto.constructor;
                return (
                    typeof Ctor == "function" &&
                    Ctor instanceof Ctor &&
                    funcToString.call(Ctor) == objectCtorString
                );
            }

            module.exports = isPlainObject;

            /***/
        },
        /* 73 */
        /***/ (module) => {
            /**
             * lodash 4.0.1 (Custom Build) <https://lodash.com/>
             * Build: `lodash modularize exports="npm" -o ./`
             * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
             * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
             * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
             * Available under MIT license <https://lodash.com/license>
             */

            /** `Object#toString` result references. */
            var stringTag = "[object String]";

            /** Used for built-in method references. */
            var objectProto = Object.prototype;

            /**
             * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
             * of values.
             */
            var objectToString = objectProto.toString;

            /**
             * Checks if `value` is classified as an `Array` object.
             *
             * @static
             * @memberOf _
             * @type Function
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
             * @example
             *
             * _.isArray([1, 2, 3]);
             * // => true
             *
             * _.isArray(document.body.children);
             * // => false
             *
             * _.isArray('abc');
             * // => false
             *
             * _.isArray(_.noop);
             * // => false
             */
            var isArray = Array.isArray;

            /**
             * Checks if `value` is object-like. A value is object-like if it's not `null`
             * and has a `typeof` result of "object".
             *
             * @static
             * @memberOf _
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
             * @example
             *
             * _.isObjectLike({});
             * // => true
             *
             * _.isObjectLike([1, 2, 3]);
             * // => true
             *
             * _.isObjectLike(_.noop);
             * // => false
             *
             * _.isObjectLike(null);
             * // => false
             */
            function isObjectLike(value) {
                return !!value && typeof value == "object";
            }

            /**
             * Checks if `value` is classified as a `String` primitive or object.
             *
             * @static
             * @memberOf _
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
             * @example
             *
             * _.isString('abc');
             * // => true
             *
             * _.isString(1);
             * // => false
             */
            function isString(value) {
                return (
                    typeof value == "string" ||
                    (!isArray(value) &&
                        isObjectLike(value) &&
                        objectToString.call(value) == stringTag)
                );
            }

            module.exports = isString;

            /***/
        },
        /* 74 */
        /***/ (module) => {
            /**
             * lodash (Custom Build) <https://lodash.com/>
             * Build: `lodash modularize exports="npm" -o ./`
             * Copyright jQuery Foundation and other contributors <https://jquery.org/>
             * Released under MIT license <https://lodash.com/license>
             * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
             * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
             */

            /** Used as the `TypeError` message for "Functions" methods. */
            var FUNC_ERROR_TEXT = "Expected a function";

            /** Used as references for various `Number` constants. */
            var INFINITY = 1 / 0,
                MAX_INTEGER = 1.7976931348623157e308,
                NAN = 0 / 0;

            /** `Object#toString` result references. */
            var symbolTag = "[object Symbol]";

            /** Used to match leading and trailing whitespace. */
            var reTrim = /^\s+|\s+$/g;

            /** Used to detect bad signed hexadecimal string values. */
            var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

            /** Used to detect binary string values. */
            var reIsBinary = /^0b[01]+$/i;

            /** Used to detect octal string values. */
            var reIsOctal = /^0o[0-7]+$/i;

            /** Built-in method references without a dependency on `root`. */
            var freeParseInt = parseInt;

            /** Used for built-in method references. */
            var objectProto = Object.prototype;

            /**
             * Used to resolve the
             * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
             * of values.
             */
            var objectToString = objectProto.toString;

            /**
             * Creates a function that invokes `func`, with the `this` binding and arguments
             * of the created function, while it's called less than `n` times. Subsequent
             * calls to the created function return the result of the last `func` invocation.
             *
             * @static
             * @memberOf _
             * @since 3.0.0
             * @category Function
             * @param {number} n The number of calls at which `func` is no longer invoked.
             * @param {Function} func The function to restrict.
             * @returns {Function} Returns the new restricted function.
             * @example
             *
             * jQuery(element).on('click', _.before(5, addContactToList));
             * // => Allows adding up to 4 contacts to the list.
             */
            function before(n, func) {
                var result;
                if (typeof func != "function") {
                    throw new TypeError(FUNC_ERROR_TEXT);
                }
                n = toInteger(n);
                return function () {
                    if (--n > 0) {
                        result = func.apply(this, arguments);
                    }
                    if (n <= 1) {
                        func = undefined;
                    }
                    return result;
                };
            }

            /**
             * Creates a function that is restricted to invoking `func` once. Repeat calls
             * to the function return the value of the first invocation. The `func` is
             * invoked with the `this` binding and arguments of the created function.
             *
             * @static
             * @memberOf _
             * @since 0.1.0
             * @category Function
             * @param {Function} func The function to restrict.
             * @returns {Function} Returns the new restricted function.
             * @example
             *
             * var initialize = _.once(createApplication);
             * initialize();
             * initialize();
             * // => `createApplication` is invoked once
             */
            function once(func) {
                return before(2, func);
            }

            /**
             * Checks if `value` is the
             * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
             * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
             *
             * @static
             * @memberOf _
             * @since 0.1.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is an object, else `false`.
             * @example
             *
             * _.isObject({});
             * // => true
             *
             * _.isObject([1, 2, 3]);
             * // => true
             *
             * _.isObject(_.noop);
             * // => true
             *
             * _.isObject(null);
             * // => false
             */
            function isObject(value) {
                var type = typeof value;
                return !!value && (type == "object" || type == "function");
            }

            /**
             * Checks if `value` is object-like. A value is object-like if it's not `null`
             * and has a `typeof` result of "object".
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
             * @example
             *
             * _.isObjectLike({});
             * // => true
             *
             * _.isObjectLike([1, 2, 3]);
             * // => true
             *
             * _.isObjectLike(_.noop);
             * // => false
             *
             * _.isObjectLike(null);
             * // => false
             */
            function isObjectLike(value) {
                return !!value && typeof value == "object";
            }

            /**
             * Checks if `value` is classified as a `Symbol` primitive or object.
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
             * @example
             *
             * _.isSymbol(Symbol.iterator);
             * // => true
             *
             * _.isSymbol('abc');
             * // => false
             */
            function isSymbol(value) {
                return (
                    typeof value == "symbol" ||
                    (isObjectLike(value) &&
                        objectToString.call(value) == symbolTag)
                );
            }

            /**
             * Converts `value` to a finite number.
             *
             * @static
             * @memberOf _
             * @since 4.12.0
             * @category Lang
             * @param {*} value The value to convert.
             * @returns {number} Returns the converted number.
             * @example
             *
             * _.toFinite(3.2);
             * // => 3.2
             *
             * _.toFinite(Number.MIN_VALUE);
             * // => 5e-324
             *
             * _.toFinite(Infinity);
             * // => 1.7976931348623157e+308
             *
             * _.toFinite('3.2');
             * // => 3.2
             */
            function toFinite(value) {
                if (!value) {
                    return value === 0 ? value : 0;
                }
                value = toNumber(value);
                if (value === INFINITY || value === -INFINITY) {
                    var sign = value < 0 ? -1 : 1;
                    return sign * MAX_INTEGER;
                }
                return value === value ? value : 0;
            }

            /**
             * Converts `value` to an integer.
             *
             * **Note:** This method is loosely based on
             * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to convert.
             * @returns {number} Returns the converted integer.
             * @example
             *
             * _.toInteger(3.2);
             * // => 3
             *
             * _.toInteger(Number.MIN_VALUE);
             * // => 0
             *
             * _.toInteger(Infinity);
             * // => 1.7976931348623157e+308
             *
             * _.toInteger('3.2');
             * // => 3
             */
            function toInteger(value) {
                var result = toFinite(value),
                    remainder = result % 1;

                return result === result
                    ? remainder
                        ? result - remainder
                        : result
                    : 0;
            }

            /**
             * Converts `value` to a number.
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to process.
             * @returns {number} Returns the number.
             * @example
             *
             * _.toNumber(3.2);
             * // => 3.2
             *
             * _.toNumber(Number.MIN_VALUE);
             * // => 5e-324
             *
             * _.toNumber(Infinity);
             * // => Infinity
             *
             * _.toNumber('3.2');
             * // => 3.2
             */
            function toNumber(value) {
                if (typeof value == "number") {
                    return value;
                }
                if (isSymbol(value)) {
                    return NAN;
                }
                if (isObject(value)) {
                    var other =
                        typeof value.valueOf == "function"
                            ? value.valueOf()
                            : value;
                    value = isObject(other) ? other + "" : other;
                }
                if (typeof value != "string") {
                    return value === 0 ? value : +value;
                }
                value = value.replace(reTrim, "");
                var isBinary = reIsBinary.test(value);
                return isBinary || reIsOctal.test(value)
                    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
                    : reIsBadHex.test(value)
                    ? NAN
                    : +value;
            }

            module.exports = once;

            /***/
        },
        /* 75 */
        /***/ function (__unused_webpack_module, exports, __webpack_require__) {
            "use strict";

            var __awaiter =
                (this && this.__awaiter) ||
                function (thisArg, _arguments, P, generator) {
                    return new (P || (P = Promise))(function (resolve, reject) {
                        function fulfilled(value) {
                            try {
                                step(generator.next(value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function rejected(value) {
                            try {
                                step(generator["throw"](value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function step(result) {
                            result.done
                                ? resolve(result.value)
                                : new P(function (resolve) {
                                      resolve(result.value);
                                  }).then(fulfilled, rejected);
                        }
                        step(
                            (generator = generator.apply(
                                thisArg,
                                _arguments || []
                            )).next()
                        );
                    });
                };
            var __generator =
                (this && this.__generator) ||
                function (thisArg, body) {
                    var _ = {
                            label: 0,
                            sent: function () {
                                if (t[0] & 1) throw t[1];
                                return t[1];
                            },
                            trys: [],
                            ops: [],
                        },
                        f,
                        y,
                        t,
                        g;
                    return (
                        (g = {
                            next: verb(0),
                            throw: verb(1),
                            return: verb(2),
                        }),
                        typeof Symbol === "function" &&
                            (g[Symbol.iterator] = function () {
                                return this;
                            }),
                        g
                    );
                    function verb(n) {
                        return function (v) {
                            return step([n, v]);
                        };
                    }
                    function step(op) {
                        if (f)
                            throw new TypeError(
                                "Generator is already executing."
                            );
                        while (_)
                            try {
                                if (
                                    ((f = 1),
                                    y &&
                                        (t =
                                            op[0] & 2
                                                ? y["return"]
                                                : op[0]
                                                ? y["throw"] ||
                                                  ((t = y["return"]) &&
                                                      t.call(y),
                                                  0)
                                                : y.next) &&
                                        !(t = t.call(y, op[1])).done)
                                )
                                    return t;
                                if (((y = 0), t)) op = [op[0] & 2, t.value];
                                switch (op[0]) {
                                    case 0:
                                    case 1:
                                        t = op;
                                        break;
                                    case 4:
                                        _.label++;
                                        return { value: op[1], done: false };
                                    case 5:
                                        _.label++;
                                        y = op[1];
                                        op = [0];
                                        continue;
                                    case 7:
                                        op = _.ops.pop();
                                        _.trys.pop();
                                        continue;
                                    default:
                                        if (
                                            !((t = _.trys),
                                            (t =
                                                t.length > 0 &&
                                                t[t.length - 1])) &&
                                            (op[0] === 6 || op[0] === 2)
                                        ) {
                                            _ = 0;
                                            continue;
                                        }
                                        if (
                                            op[0] === 3 &&
                                            (!t ||
                                                (op[1] > t[0] && op[1] < t[3]))
                                        ) {
                                            _.label = op[1];
                                            break;
                                        }
                                        if (op[0] === 6 && _.label < t[1]) {
                                            _.label = t[1];
                                            t = op;
                                            break;
                                        }
                                        if (t && _.label < t[2]) {
                                            _.label = t[2];
                                            _.ops.push(op);
                                            break;
                                        }
                                        if (t[2]) _.ops.pop();
                                        _.trys.pop();
                                        continue;
                                }
                                op = body.call(thisArg, _);
                            } catch (e) {
                                op = [6, e];
                                y = 0;
                            } finally {
                                f = t = 0;
                            }
                        if (op[0] & 5) throw op[1];
                        return { value: op[0] ? op[1] : void 0, done: true };
                    }
                };
            Object.defineProperty(exports, "__esModule", { value: true });
            var ClientService_1 = __webpack_require__(12);
            var http_1 = __webpack_require__(15);
            var errorHandler_1 = __webpack_require__(44);
            function refreshToken(jwtTokens) {
                return __awaiter(this, void 0, void 0, function () {
                    var reqBody, result, tokens, err_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                reqBody = {
                                    jwtTokens: jwtTokens,
                                };
                                return [
                                    4 /*yield*/,
                                    http_1.postRequest(
                                        ClientService_1.ClientService
                                            .MYTHX_API_ENVIRONMENT +
                                            "/auth/refresh",
                                        reqBody,
                                        {}
                                    ),
                                ];
                            case 1:
                                result = _a.sent();
                                tokens = result.data.jwtTokens;
                                return [2 /*return*/, tokens];
                            case 2:
                                err_1 = _a.sent();
                                errorHandler_1.errorHandler(err_1);
                                return [3 /*break*/, 3];
                            case 3:
                                return [2 /*return*/];
                        }
                    });
                });
            }
            exports.refreshToken = refreshToken;

            /***/
        },
        /* 76 */
        /***/ function (__unused_webpack_module, exports, __webpack_require__) {
            "use strict";

            var __awaiter =
                (this && this.__awaiter) ||
                function (thisArg, _arguments, P, generator) {
                    return new (P || (P = Promise))(function (resolve, reject) {
                        function fulfilled(value) {
                            try {
                                step(generator.next(value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function rejected(value) {
                            try {
                                step(generator["throw"](value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function step(result) {
                            result.done
                                ? resolve(result.value)
                                : new P(function (resolve) {
                                      resolve(result.value);
                                  }).then(fulfilled, rejected);
                        }
                        step(
                            (generator = generator.apply(
                                thisArg,
                                _arguments || []
                            )).next()
                        );
                    });
                };
            var __generator =
                (this && this.__generator) ||
                function (thisArg, body) {
                    var _ = {
                            label: 0,
                            sent: function () {
                                if (t[0] & 1) throw t[1];
                                return t[1];
                            },
                            trys: [],
                            ops: [],
                        },
                        f,
                        y,
                        t,
                        g;
                    return (
                        (g = {
                            next: verb(0),
                            throw: verb(1),
                            return: verb(2),
                        }),
                        typeof Symbol === "function" &&
                            (g[Symbol.iterator] = function () {
                                return this;
                            }),
                        g
                    );
                    function verb(n) {
                        return function (v) {
                            return step([n, v]);
                        };
                    }
                    function step(op) {
                        if (f)
                            throw new TypeError(
                                "Generator is already executing."
                            );
                        while (_)
                            try {
                                if (
                                    ((f = 1),
                                    y &&
                                        (t =
                                            op[0] & 2
                                                ? y["return"]
                                                : op[0]
                                                ? y["throw"] ||
                                                  ((t = y["return"]) &&
                                                      t.call(y),
                                                  0)
                                                : y.next) &&
                                        !(t = t.call(y, op[1])).done)
                                )
                                    return t;
                                if (((y = 0), t)) op = [op[0] & 2, t.value];
                                switch (op[0]) {
                                    case 0:
                                    case 1:
                                        t = op;
                                        break;
                                    case 4:
                                        _.label++;
                                        return { value: op[1], done: false };
                                    case 5:
                                        _.label++;
                                        y = op[1];
                                        op = [0];
                                        continue;
                                    case 7:
                                        op = _.ops.pop();
                                        _.trys.pop();
                                        continue;
                                    default:
                                        if (
                                            !((t = _.trys),
                                            (t =
                                                t.length > 0 &&
                                                t[t.length - 1])) &&
                                            (op[0] === 6 || op[0] === 2)
                                        ) {
                                            _ = 0;
                                            continue;
                                        }
                                        if (
                                            op[0] === 3 &&
                                            (!t ||
                                                (op[1] > t[0] && op[1] < t[3]))
                                        ) {
                                            _.label = op[1];
                                            break;
                                        }
                                        if (op[0] === 6 && _.label < t[1]) {
                                            _.label = t[1];
                                            t = op;
                                            break;
                                        }
                                        if (t && _.label < t[2]) {
                                            _.label = t[2];
                                            _.ops.push(op);
                                            break;
                                        }
                                        if (t[2]) _.ops.pop();
                                        _.trys.pop();
                                        continue;
                                }
                                op = body.call(thisArg, _);
                            } catch (e) {
                                op = [6, e];
                                y = 0;
                            } finally {
                                f = t = 0;
                            }
                        if (op[0] & 5) throw op[1];
                        return { value: op[0] ? op[1] : void 0, done: true };
                    }
                };
            Object.defineProperty(exports, "__esModule", { value: true });
            var ClientService_1 = __webpack_require__(12);
            var http_1 = __webpack_require__(15);
            var loginUser_1 = __webpack_require__(77);
            var getHeaders_1 = __webpack_require__(45);
            var errorHandler_1 = __webpack_require__(44);
            var AuthService = /** @class */ (function () {
                function AuthService(ethAddress, password) {
                    this.API_URL =
                        ClientService_1.ClientService.MYTHX_API_ENVIRONMENT;
                    this.ethAddress = ethAddress;
                    this.password = password;
                }
                AuthService.prototype.login = function (ethAddress, password) {
                    return __awaiter(this, void 0, void 0, function () {
                        var result, tokens, err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    if (ethAddress && password) {
                                        this.ethAddress = ethAddress;
                                        this.password = password;
                                    }
                                    return [
                                        4 /*yield*/,
                                        loginUser_1.loginUser(
                                            this.ethAddress,
                                            this.password,
                                            this.API_URL + "/auth/login"
                                        ),
                                    ];
                                case 1:
                                    result = _a.sent();
                                    tokens = result.data.jwtTokens;
                                    this.setCredentials(tokens);
                                    return [2 /*return*/, tokens];
                                case 2:
                                    err_1 = _a.sent();
                                    errorHandler_1.errorHandler(err_1);
                                    throw err_1;
                                case 3:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                /**
                 *  Login to the API using metamask challenge result message.
                 *  In order to get the object containing the message, use `getChallenge` and handle Metamask login in the frontend.
                 * @param signature message.value property contained in object returned from `getChallenge`.
                 * @param provider pass a provider value for the HTTP headers. If nothing is passed defaults to MetaMask
                 * @return {Promise<JwtTokensInterface>}  Returns an object containing two tokens (access+refresh) that can be saved in storage.
                 */
                AuthService.prototype.loginWithSignature = function (
                    signature,
                    provider
                ) {
                    if (provider === void 0) {
                        provider = "MetaMask";
                    }
                    return __awaiter(this, void 0, void 0, function () {
                        var headers, result, tokens, err_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    headers = {
                                        Authorization:
                                            provider + " " + signature,
                                    };
                                    return [
                                        4 /*yield*/,
                                        http_1.postRequest(
                                            this.API_URL + "/auth/login",
                                            null,
                                            headers
                                        ),
                                    ];
                                case 1:
                                    result = _a.sent();
                                    tokens = result.data.jwtTokens;
                                    this.setCredentials(tokens);
                                    return [2 /*return*/, tokens];
                                case 2:
                                    err_2 = _a.sent();
                                    errorHandler_1.errorHandler(err_2);
                                    throw err_2;
                                case 3:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                AuthService.prototype.logout = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, headers, tokens, result, err_3;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (!this.isUserLoggedIn())
                                        return [3 /*break*/, 6];
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 4, , 5]);
                                    return [
                                        4 /*yield*/,
                                        getHeaders_1.getHeaders(
                                            ClientService_1.ClientService
                                                .jwtTokens
                                        ),
                                    ];
                                case 2:
                                    (_a = _b.sent()),
                                        (headers = _a.headers),
                                        (tokens = _a.tokens);
                                    this.setCredentials(tokens);
                                    return [
                                        4 /*yield*/,
                                        http_1.postRequest(
                                            this.API_URL + "/auth/logout",
                                            {},
                                            headers
                                        ),
                                    ];
                                case 3:
                                    result = _b.sent();
                                    ClientService_1.ClientService.jwtTokens.access =
                                        ClientService_1.ClientService.jwtTokens.refresh =
                                            "";
                                    return [2 /*return*/, result.data];
                                case 4:
                                    err_3 = _b.sent();
                                    errorHandler_1.errorHandler(err_3);
                                    throw err_3;
                                case 5:
                                    return [3 /*break*/, 7];
                                case 6:
                                    throw new Error(
                                        "MythxJS no valid token found. Please login"
                                    );
                                case 7:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                AuthService.prototype.getVersion = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var result, version, err_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [
                                        4 /*yield*/,
                                        http_1.getRequest(
                                            this.API_URL + "/version",
                                            null
                                        ),
                                    ];
                                case 1:
                                    result = _a.sent();
                                    version = result.data;
                                    return [2 /*return*/, version];
                                case 2:
                                    err_4 = _a.sent();
                                    errorHandler_1.errorHandler(err_4);
                                    throw err_4;
                                case 3:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                AuthService.prototype.getOpenApiHTML = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var result, openApi, err_5;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [
                                        4 /*yield*/,
                                        http_1.getRequest(
                                            this.API_URL + "/openapi",
                                            null
                                        ),
                                    ];
                                case 1:
                                    result = _a.sent();
                                    openApi = result.data;
                                    return [2 /*return*/, openApi];
                                case 2:
                                    err_5 = _a.sent();
                                    errorHandler_1.errorHandler(err_5);
                                    throw err_5;
                                case 3:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                AuthService.prototype.getOpenApiYAML = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var result, err_6;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [
                                        4 /*yield*/,
                                        http_1.getRequest(
                                            this.API_URL + "/openapi.yaml",
                                            null
                                        ),
                                    ];
                                case 1:
                                    result = _a.sent();
                                    return [2 /*return*/, result.data];
                                case 2:
                                    err_6 = _a.sent();
                                    errorHandler_1.errorHandler(err_6);
                                    return [3 /*break*/, 3];
                                case 3:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                AuthService.prototype.getStats = function (queryString) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, headers, tokens, result, stats, err_7;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (!this.isUserLoggedIn())
                                        return [3 /*break*/, 6];
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 4, , 5]);
                                    return [
                                        4 /*yield*/,
                                        getHeaders_1.getHeaders(
                                            ClientService_1.ClientService
                                                .jwtTokens
                                        ),
                                    ];
                                case 2:
                                    (_a = _b.sent()),
                                        (headers = _a.headers),
                                        (tokens = _a.tokens);
                                    this.setCredentials(tokens);
                                    return [
                                        4 /*yield*/,
                                        http_1.getRequest(
                                            this.API_URL +
                                                "/stats/users-analyses?" +
                                                queryString,
                                            headers
                                        ),
                                    ];
                                case 3:
                                    result = _b.sent();
                                    stats = result.data;
                                    return [2 /*return*/, stats];
                                case 4:
                                    err_7 = _b.sent();
                                    errorHandler_1.errorHandler(err_7);
                                    return [3 /*break*/, 5];
                                case 5:
                                    return [3 /*break*/, 7];
                                case 6:
                                    throw new Error(
                                        "MythxJS no valid token found. Please login."
                                    );
                                case 7:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                /**
                 *  Generates authentication challenge (Metamask only for now).
                 *  The Metamask flow needs to be handled on the front end since MythXJS does not have Web3 dependencies.
                 * @param ethAddress Ethereum address for Mythx account
                 * @returns Resolves with API response or throw error
                 */
                AuthService.prototype.getChallenge = function (ethAddress) {
                    return __awaiter(this, void 0, void 0, function () {
                        var address, result, err_8;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    address = ethAddress
                                        ? ethAddress
                                        : this.ethAddress;
                                    return [
                                        4 /*yield*/,
                                        http_1.getRequest(
                                            this.API_URL +
                                                "/auth/challenge?ethAddress=" +
                                                address,
                                            {}
                                        ),
                                    ];
                                case 1:
                                    result = _a.sent();
                                    return [2 /*return*/, result.data];
                                case 2:
                                    err_8 = _a.sent();
                                    errorHandler_1.errorHandler(err_8);
                                    return [3 /*break*/, 3];
                                case 3:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                /**
                 * Retrieve list of registred API users or just caller user object if no required permission.
                 * @param queryString Query string for detailed list (query parameters: offset, orderBy, email, ethAddress)
                 * @returns Resolves with API response or throw error
                 */
                AuthService.prototype.getUsers = function (queryString) {
                    if (queryString === void 0) {
                        queryString = "";
                    }
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, headers, tokens, result, users, err_9;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (!this.isUserLoggedIn())
                                        return [3 /*break*/, 6];
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 4, , 5]);
                                    return [
                                        4 /*yield*/,
                                        getHeaders_1.getHeaders(
                                            ClientService_1.ClientService
                                                .jwtTokens
                                        ),
                                    ];
                                case 2:
                                    (_a = _b.sent()),
                                        (headers = _a.headers),
                                        (tokens = _a.tokens);
                                    this.setCredentials(tokens);
                                    return [
                                        4 /*yield*/,
                                        http_1.getRequest(
                                            this.API_URL +
                                                "/users?" +
                                                queryString,
                                            headers
                                        ),
                                    ];
                                case 3:
                                    result = _b.sent();
                                    users = result.data;
                                    return [2 /*return*/, users];
                                case 4:
                                    err_9 = _b.sent();
                                    errorHandler_1.errorHandler(err_9);
                                    throw err_9;
                                case 5:
                                    return [3 /*break*/, 7];
                                case 6:
                                    throw new Error(
                                        "MythxJS no valid token found. Please login."
                                    );
                                case 7:
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                AuthService.prototype.isUserLoggedIn = function () {
                    return !!ClientService_1.ClientService.jwtTokens.access;
                };
                AuthService.prototype.setCredentials = function (tokens) {
                    ClientService_1.ClientService.jwtTokens.access =
                        tokens.access;
                    ClientService_1.ClientService.jwtTokens.refresh =
                        tokens.refresh;
                };
                return AuthService;
            })();
            exports.AuthService = AuthService;

            /***/
        },
        /* 77 */
        /***/ function (__unused_webpack_module, exports, __webpack_require__) {
            "use strict";

            var __awaiter =
                (this && this.__awaiter) ||
                function (thisArg, _arguments, P, generator) {
                    return new (P || (P = Promise))(function (resolve, reject) {
                        function fulfilled(value) {
                            try {
                                step(generator.next(value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function rejected(value) {
                            try {
                                step(generator["throw"](value));
                            } catch (e) {
                                reject(e);
                            }
                        }
                        function step(result) {
                            result.done
                                ? resolve(result.value)
                                : new P(function (resolve) {
                                      resolve(result.value);
                                  }).then(fulfilled, rejected);
                        }
                        step(
                            (generator = generator.apply(
                                thisArg,
                                _arguments || []
                            )).next()
                        );
                    });
                };
            var __generator =
                (this && this.__generator) ||
                function (thisArg, body) {
                    var _ = {
                            label: 0,
                            sent: function () {
                                if (t[0] & 1) throw t[1];
                                return t[1];
                            },
                            trys: [],
                            ops: [],
                        },
                        f,
                        y,
                        t,
                        g;
                    return (
                        (g = {
                            next: verb(0),
                            throw: verb(1),
                            return: verb(2),
                        }),
                        typeof Symbol === "function" &&
                            (g[Symbol.iterator] = function () {
                                return this;
                            }),
                        g
                    );
                    function verb(n) {
                        return function (v) {
                            return step([n, v]);
                        };
                    }
                    function step(op) {
                        if (f)
                            throw new TypeError(
                                "Generator is already executing."
                            );
                        while (_)
                            try {
                                if (
                                    ((f = 1),
                                    y &&
                                        (t =
                                            op[0] & 2
                                                ? y["return"]
                                                : op[0]
                                                ? y["throw"] ||
                                                  ((t = y["return"]) &&
                                                      t.call(y),
                                                  0)
                                                : y.next) &&
                                        !(t = t.call(y, op[1])).done)
                                )
                                    return t;
                                if (((y = 0), t)) op = [op[0] & 2, t.value];
                                switch (op[0]) {
                                    case 0:
                                    case 1:
                                        t = op;
                                        break;
                                    case 4:
                                        _.label++;
                                        return { value: op[1], done: false };
                                    case 5:
                                        _.label++;
                                        y = op[1];
                                        op = [0];
                                        continue;
                                    case 7:
                                        op = _.ops.pop();
                                        _.trys.pop();
                                        continue;
                                    default:
                                        if (
                                            !((t = _.trys),
                                            (t =
                                                t.length > 0 &&
                                                t[t.length - 1])) &&
                                            (op[0] === 6 || op[0] === 2)
                                        ) {
                                            _ = 0;
                                            continue;
                                        }
                                        if (
                                            op[0] === 3 &&
                                            (!t ||
                                                (op[1] > t[0] && op[1] < t[3]))
                                        ) {
                                            _.label = op[1];
                                            break;
                                        }
                                        if (op[0] === 6 && _.label < t[1]) {
                                            _.label = t[1];
                                            t = op;
                                            break;
                                        }
                                        if (t && _.label < t[2]) {
                                            _.label = t[2];
                                            _.ops.push(op);
                                            break;
                                        }
                                        if (t[2]) _.ops.pop();
                                        _.trys.pop();
                                        continue;
                                }
                                op = body.call(thisArg, _);
                            } catch (e) {
                                op = [6, e];
                                y = 0;
                            } finally {
                                f = t = 0;
                            }
                        if (op[0] & 5) throw op[1];
                        return { value: op[0] ? op[1] : void 0, done: true };
                    }
                };
            Object.defineProperty(exports, "__esModule", { value: true });
            var axios_1 = __webpack_require__(17);
            function loginUser(ethAddress, password, url) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [
                            2 /*return*/,
                            axios_1.default.post(url, {
                                ethAddress: ethAddress,
                                password: password,
                            }),
                        ];
                    });
                });
            }
            exports.loginUser = loginUser;

            /***/
        },
        /* 78 */
        /***/ (module) => {
            module.exports = shellescape;

            // return a shell compatible format
            function shellescape(a) {
                var ret = [];

                a.forEach(function (s) {
                    if (!/^[A-Za-z0-9_\/-]+$/.test(s)) {
                        s = "'" + s.replace(/'/g, "'\\''") + "'";
                        s = s
                            .replace(/^(?:'')+/g, "") // unduplicate single-quote at the beginning
                            .replace(/\\'''/g, "\\'"); // remove non-escaped single-quote if there are enclosed between 2 escaped
                    }
                    ret.push(s);
                });

                return ret.join(" ");
            }

            /***/
        },
        /* 79 */
        /***/ (module) => {
            "use strict";
            module.exports = JSON.parse(
                '{"wei":{"prefix":"wei","description":"1 wei == 10e-XX eth","security":""},"finney":{"prefix":"finney","description":"1 finney == 10e-XX eth","security":""},"szabo":{"prefix":"szabo","description":"1 szabo == 10e-XX eth","security":""},"ether":{"prefix":"ether","description":"1 ether == 10e-XX eth","security":""},"seconds":{"prefix":"seconds","description":"1 seconds == 10e-XX eth","security":""},"minutes":{"prefix":"minutes","description":"1 minutes == 60 seconds","security":"Note - for calendar calculations: does not account for leap seconds!"},"hours":{"prefix":"hours","description":"1 hours == 60 minutes","security":"Note - for calendar calculations: does not account for leap seconds!"},"days":{"prefix":"days","description":"1 days == 24 hours","security":"Note - for calendar calculations: does not account for leap year or leap seconds!"},"weeks":{"prefix":"weeks","description":"1 weeks == 7 days","security":"Note - for calendar calculations: does not account for leap year or leap seconds!"},"years":{"prefix":"years","description":"1 years == 365 days","security":"**deprecated - do not use** Note - for calendar calculations: does not account for leap year or leap seconds!"},"blockhash":{"prefix":"blockhash","description":"blockhash(uint blockNumber) returns (bytes32): hash of the given block - only works for 256 most recent, excluding current, blocks","security":["Do not rely on block.timestamp, now and blockhash as a source of randomness, unless you know what you are doing.","Both the timestamp and the block hash can be influenced by miners to some degree. Bad actors in the mining community can for example run a casino payout function on a chosen hash and just retry a different hash if they did not receive any money.","The current block timestamp must be strictly larger than the timestamp of the last block, but the only guarantee is that it will be somewhere between the timestamps of two consecutive blocks in the canonical chain.","The block hashes are not available for all blocks for scalability reasons. You can only access the hashes of the most recent 256 blocks, all other values will be zero.","The function blockhash was previously known as block.blockhash, which was deprecated in version 0.4.22 and removed in version 0.5.0."]},"_blockhash":{"prefix":"block.blockhash","description":"blockhash(uint blockNumber) returns (bytes32): hash of the given block - only works for 256 most recent, excluding current, blocks","security":["Do not rely on block.timestamp, now and blockhash as a source of randomness, unless you know what you are doing.","Both the timestamp and the block hash can be influenced by miners to some degree. Bad actors in the mining community can for example run a casino payout function on a chosen hash and just retry a different hash if they did not receive any money.","The current block timestamp must be strictly larger than the timestamp of the last block, but the only guarantee is that it will be somewhere between the timestamps of two consecutive blocks in the canonical chain.","The block hashes are not available for all blocks for scalability reasons. You can only access the hashes of the most recent 256 blocks, all other values will be zero.","The function blockhash was previously known as block.blockhash, which was deprecated in version 0.4.22 and removed in version 0.5.0."]},"_coinbase":{"prefix":"block.coinbase","description":"block.coinbase (address payable): current block miner’s address","security":""},"_difficulty":{"prefix":"block.difficulty","description":"block.difficulty (uint): current block difficulty","security":""},"_gaslimit":{"prefix":"block.gaslimit","description":"block.gaslimit (uint): current block gaslimit","security":""},"_number":{"prefix":"block.number","description":"block.number (uint): current block number","security":"Can be manipulated by miner"},"_timestamp":{"prefix":"block.timestamp","description":"block.timestamp (uint): current block timestamp as seconds since unix epoch","security":["Do not rely on block.timestamp, now and blockhash as a source of randomness, unless you know what you are doing.","Both the timestamp and the block hash can be influenced by miners to some degree. Bad actors in the mining community can for example run a casino payout function on a chosen hash and just retry a different hash if they did not receive any money.","The current block timestamp must be strictly larger than the timestamp of the last block, but the only guarantee is that it will be somewhere between the timestamps of two consecutive blocks in the canonical chain."]},"gasleft":{"prefix":"gasleft","description":"gasleft() returns (uint256): remaining gas","security":"The function gasleft was previously known as msg.gas, which was deprecated in version 0.4.21 and removed in version 0.5.0."},"msg":{"prefix":"msg","description":"msg","security":"The values of all members of msg, including msg.sender and msg.value can change for every external function call. This includes calls to library functions."},"_data":{"prefix":"msg.data","description":"msg.data (bytes calldata): complete calldata","security":""},"_sender":{"prefix":"msg.sender","description":"msg.sender (address payable): sender of the message (current call)","security":"The values of all members of msg, including msg.sender and msg.value can change for every external function call. This includes calls to library functions."},"_sig":{"prefix":"msg.sig","description":"msg.sig (bytes4): first four bytes of the calldata (i.e. function identifier)","security":""},"_value":{"prefix":"msg.value","description":"msg.value (uint): number of wei sent with the message","security":"The values of all members of msg, including msg.sender and msg.value can change for every external function call. This includes calls to library functions."},"now":{"prefix":"now","description":"now (uint): current block timestamp (alias for block.timestamp)","security":["Do not rely on block.timestamp, now and blockhash as a source of randomness, unless you know what you are doing.","Both the timestamp and the block hash can be influenced by miners to some degree. Bad actors in the mining community can for example run a casino payout function on a chosen hash and just retry a different hash if they did not receive any money.","The current block timestamp must be strictly larger than the timestamp of the last block, but the only guarantee is that it will be somewhere between the timestamps of two consecutive blocks in the canonical chain."]},"_gasprice":{"prefix":"tx.gasprice","description":"tx.gasprice (uint): gas price of the transaction","security":""},"_origin":{"prefix":"tx.origin","description":"tx.origin (address payable): sender of the transaction (full call chain)","security":"Do not use for authentication"},"abi":{"prefix":"abi","description":"These encoding functions can be used to craft data for external function calls without actually calling an external function. Furthermore, keccak256(abi.encodePacked(a, b)) is a way to compute the hash of structured data (although be aware that it is possible to craft a “hash collision” using different function parameter types).","security":"error prone"},"_decode":{"prefix":"abi.decode","description":"abi.decode(bytes memory encodedData, (...)) returns (...): ABI-decodes the given data, while the types are given in parentheses as second argument. Example: (uint a, uint[2] memory b, bytes memory c) = abi.decode(data, (uint, uint[2], bytes))","security":""},"_encode":{"prefix":"abi.encode","description":"abi.encode(...) returns (bytes memory): ABI-encodes the given arguments","security":""},"encodePacked":{"prefix":"abi.encodePacked","description":"abi.encodePacked(...) returns (bytes memory): Performs packed encoding of the given arguments. Note that packed encoding can be ambiguous!","security":""},"_encodeWithSelector":{"prefix":"abi.encodeWithSelector","description":"abi.encodeWithSelector(bytes4 selector, ...) returns (bytes memory): ABI-encodes the given arguments starting from the second and prepends the given four-byte selector","security":""},"encodeWithSignature":{"prefix":"abi.encodeWithSignature","description":"abi.encodeWithSignature(string memory signature, ...) returns (bytes memory): Equivalent to abi.encodeWithSelector(bytes4(keccak256(bytes(signature))), ...)`","security":""},"assert":{"prefix":"assert","description":"assert(bool condition):\\ncauses an invalid opcode and thus state change reversion if the condition is not met - to be used for internal errors.","security":""},"require":{"prefix":"require","description":["require(bool condition):\\n\\treverts if the condition is not met - to be used for errors in inputs or external components.","require(bool condition, string memory message):\\n\\treverts if the condition is not met - to be used for errors in inputs or external components. Also provides an error message."],"security":""},"revert":{"prefix":"revert","description":["revert():\\n\\tabort execution and revert state changes","revert(string memory reason):\\n\\tabort execution and revert state changes, providing an explanatory string"],"security":""},"addmod":{"prefix":"addmod","description":"addmod(uint x, uint y, uint k) returns (uint):\\n\\tcompute (x + y) % k where the addition is performed with arbitrary precision and does not wrap around at 2**256. Assert that k != 0 starting from version 0.5.0.","security":""},"mulmod":{"prefix":"mulmod","description":"mulmod(uint x, uint y, uint k) returns (uint):\\n\\tcompute (x * y) % k where the multiplication is performed with arbitrary precision and does not wrap around at 2**256. Assert that k != 0 starting from version 0.5.0.","security":""},"keccak256":{"prefix":"keccak256","description":"keccak256(bytes memory) returns (bytes32):\\n\\tcompute the Keccak-256 hash of the input","security":""},"sha256":{"prefix":"sha256","description":"sha256(bytes memory) returns (bytes32):\\n\\tcompute the SHA-256 hash of the input","security":"It might be that you run into Out-of-Gas for sha256, ripemd160 or ecrecover on a private blockchain. The reason for this is that those are implemented as so-called precompiled contracts and these contracts only really exist after they received the first message (although their contract code is hardcoded). Messages to non-existing contracts are more expensive and thus the execution runs into an Out-of-Gas error. A workaround for this problem is to first send e.g. 1 Wei to each of the contracts before you use them in your actual contracts. This is not an issue on the official or test net."},"ripemd160":{"prefix":"ripemd160","description":"ripemd160(bytes memory) returns (bytes20):\\n\\tcompute RIPEMD-160 hash of the input","security":"It might be that you run into Out-of-Gas for sha256, ripemd160 or ecrecover on a private blockchain. The reason for this is that those are implemented as so-called precompiled contracts and these contracts only really exist after they received the first message (although their contract code is hardcoded). Messages to non-existing contracts are more expensive and thus the execution runs into an Out-of-Gas error. A workaround for this problem is to first send e.g. 1 Wei to each of the contracts before you use them in your actual contracts. This is not an issue on the official or test net."},"ecrecover":{"prefix":"ecrecover","description":"ecrecover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) returns (address):\\n\\trecover the address associated with the public key from elliptic curve signature or return zero on error (example usage)","security":["Function ecrecover returns an address, and not an address payable. See address payable for conversion, in case you need to transfer funds to the recovered address.","It might be that you run into Out-of-Gas for sha256, ripemd160 or ecrecover on a private blockchain. The reason for this is that those are implemented as so-called precompiled contracts and these contracts only really exist after they received the first message (although their contract code is hardcoded). Messages to non-existing contracts are more expensive and thus the execution runs into an Out-of-Gas error. A workaround for this problem is to first send e.g. 1 Wei to each of the contracts before you use them in your actual contracts. This is not an issue on the official or test net.","check function signature (v:=uint8)","check if replay protection is needed (nonce, chainid)"]},"sha3":{"prefix":"sha3","description":"sha3() --> keccak256(bytes memory) returns (bytes32):\\n\\tcompute the Keccak-256 hash of the input","security":"There used to be an alias for keccak256 called sha3, which was removed in version 0.5.0."},"_balance":{"prefix":".balance","description":"<address>.balance (uint256):\\n\\tbalance of the Address in Wei","security":"Prior to version 0.5.0, Solidity allowed address members to be accessed by a contract instance, for example this.balance. This is now forbidden and an explicit conversion to address must be done: address(this).balance."},"_transfer":{"prefix":".transfer","description":"<address payable>.transfer(uint256 amount):\\n\\tsend given amount of Wei to Address, reverts on failure, forwards 2300 gas stipend, not adjustable","security":""},"_send":{"prefix":".send","description":"<address payable>.send(uint256 amount) returns (bool):\\n\\tsend given amount of Wei to Address, returns false on failure, forwards 2300 gas stipend, not adjustable","security":"There are some dangers in using send: The transfer fails if the call stack depth is at 1024 (this can always be forced by the caller) and it also fails if the recipient runs out of gas. So in order to make safe Ether transfers, always check the return value of send, use transfer or even better: Use a pattern where the recipient withdraws the money."},"_call":{"prefix":".call","description":"<address>.call(bytes memory) returns (bool, bytes memory):\\n\\tissue low-level CALL with the given payload, returns success condition and return data, forwards all available gas, adjustable","security":["You should avoid using .call() whenever possible when executing another contract function as it bypasses type checking, function existence check, and argument packing.","Prior to version 0.5.0, .call, .delegatecall and .staticcall only returned the success condition and not the return data."]},"_delegatecall":{"prefix":".delegatecall","description":"<address>.delegatecall(bytes memory) returns (bool, bytes memory):\\n\\tissue low-level DELEGATECALL with the given payload, returns success condition and return data, forwards all available gas, adjustable","security":["If state variables are accessed via a low-level delegatecall, the storage layout of the two contracts must align in order for the called contract to correctly access the storage variables of the calling contract by name. This is of course not the case if storage pointers are passed as function arguments as in the case for the high-level libraries.","Prior to version 0.5.0, .call, .delegatecall and .staticcall only returned the success condition and not the return data."]},"_staticcall":{"prefix":".staticcall","description":["<address>.staticcall(bytes memory) returns (bool, bytes memory):\\n\\tissue low-level STATICCALL with the given payload, returns success condition and return data, forwards all available gas, adjustable","Prior to version 0.5.0, .call, .delegatecall and .staticcall only returned the success condition and not the return data."],"security":""},"_callcode":{"prefix":".callcode","description":"<address>.delegatecall(bytes memory) returns (bool, bytes memory):\\n\\tissue low-level DELEGATECALL with the given payload, returns success condition and return data, forwards all available gas, adjustable","security":"Prior to version 0.5.0, there was a member called callcode with similar but slightly different semantics than delegatecall."},"selfdestruct":{"prefix":"selfdestruct","description":"selfdestruct(address payable recipient):\\n\\tdestroy the current contract, sending its funds to the given Address","security":""},"suicide":{"prefix":"suicide","description":"selfdestruct(address payable recipient):\\n\\tdestroy the current contract, sending its funds to the given Address","security":"Prior to version 0.5.0, there was a function called suicide with the same semantics as selfdestruct."},"this":{"prefix":"this","description":"this (current contract’s type):\\n\\tthe current contract, explicitly convertible to Address","security":""},"_creationCode":{"prefix":".creationCode","description":"type(C).creationCode:\\n\\tMemory byte array that contains the creation bytecode of the contract. This can be used in inline assembly to build custom creation routines, especially by using the create2 opcode. This property can not be accessed in the contract itself or any derived contract. It causes the bytecode to be included in the bytecode of the call site and thus circular references like that are not possible.","security":""},"_runtimeCode":{"prefix":".runtimeCode","description":"type(C).runtimeCode:\\n\\tMemory byte array that contains the runtime bytecode of the contract. This is the code that is usually deployed by the constructor of C. If C has a constructor that uses inline assembly, this might be different from the actually deployed bytecode. Also note that libraries modify their runtime bytecode at time of deployment to guard against regular calls. The same restrictions as with .creationCode also apply for this property.","security":""},"memory":{"prefix":"memory","description":"","security":["Array/Structs: check for uninit pointer.","Array/Structs: check that variable is not used before declaration"]},"storage":{"prefix":"storage","description":"","security":["Array/Structs: check for uninit pointer.","Array/Structs: check that variable is not used before declaration"]},"ERC20":{"prefix":"ERC20","description":"","security":"check if contract was modified"},"while":{"prefix":"while","description":"","security":"LOOP - check for OOG conditions (locking ether, DoS, ...)"},"do":{"prefix":"do","description":"","security":"LOOP - check for OOG conditions (locking ether, DoS, ...)"},"for":{"prefix":"for","description":"","security":"LOOP - check for OOG conditions (locking ether, DoS, ...)"},"pragma":{"prefix":"pragma","description":"","security":"avoid using experimental features! avoid specifying version ^"},"is":{"prefix":"is","description":"","security":"check inheritance order"},">>":{"prefix":">>","description":"","security":"The results produced by shift right of negative values of signed integer types is different from those produced by other programming languages. In Solidity, shift right maps to division so the shifted negative values are going to be rounded towards zero (truncated). In other programming languages the shift right of negative values works like division with rounding down (towards negative infinity)."},"byte":{"prefix":"byte","description":"byte is an alias for bytes1","security":""},"bytes":{"prefix":"bytes","description":"Dynamically-sized byte array, see Arrays. Not a value-type!","security":"As a rule of thumb, use bytes for arbitrary-length raw byte data and string for arbitrary-length string (UTF-8) data. If you can limit the length to a certain number of bytes, always use one of bytes1 to bytes32 because they are much cheaper."},"string":{"prefix":"string","description":"Dynamically-sized UTF-8-encoded string, see Arrays. Not a value-type!","security":"As a rule of thumb, use bytes for arbitrary-length raw byte data and string for arbitrary-length string (UTF-8) data. If you can limit the length to a certain number of bytes, always use one of bytes1 to bytes32 because they are much cheaper."},"_length":{"prefix":".length","description":"<byte[]|array>.length yields the fixed length of the byte array (read-only)."},"public":{"prefix":"public","description":"Public functions are part of the contract interface and can be either called internally or via messages. For public state variables, an automatic getter function (see below) is generated.","security":"make sure to authenticate calls to this method as anyone can access it"},"external":{"prefix":"external","description":"External functions are part of the contract interface, which means they can be called from other contracts and via transactions. An external function f cannot be called internally (i.e. f() does not work, but this.f() works). External functions are sometimes more efficient when they receive large arrays of data.","security":"make sure to authenticate calls to this method as anyone can access it"},"internal":{"prefix":"internal","description":"Those functions and state variables can only be accessed internally (i.e. from within the current contract or contracts deriving from it), without using this."},"private":{"prefix":"private","description":"Private functions and state variables are only visible for the contract they are defined in and not in derived contracts.","security":"Everything that is inside a contract is visible to all external observers. Making something private only prevents other contracts from accessing and modifying the information, but it will still be visible to the whole world outside of the blockchain."},"pure":{"prefix":"pure","description":"Functions can be declared pure in which case they promise not to read from or modify the state.","security":["It is not possible to prevent functions from reading the state at the level of the EVM, it is only possible to prevent them from writing to the state (i.e. only view can be enforced at the EVM level, pure can not).","Before version 0.4.17 the compiler didn’t enforce that pure is not reading the state."]},"view":{"prefix":"view","description":"function call CANNOT write state. It is however allowed to read state.","security":["Functions can be declared view in which case they promise not to modify the state.","constant on functions is an alias to view, but this is deprecated and will be dropped in version 0.5.0.","Getter methods are marked view.","The compiler does not enforce yet that a view method is not modifying state. It raises a warning though."]},"extcodehash":{"prefix":"extcodehash","description":"","security":"Note that EXTCODEHASH will be zero during constructor calls. Therefore it is not fit to use it to check if an address is a contract or not as this can be subverted by calling your contract in a constructor."}}'
            );

            /***/
        },
        /******/
    ];
    /************************************************************************/
    /******/ // The module cache
    /******/ var __webpack_module_cache__ = {};
    /******/
    /******/ // The require function
    /******/ function __webpack_require__(moduleId) {
        /******/ // Check if module is in cache
        /******/ var cachedModule = __webpack_module_cache__[moduleId];
        /******/ if (cachedModule !== undefined) {
            /******/ return cachedModule.exports;
            /******/
        }
        /******/ // Create a new module (and put it into the cache)
        /******/ var module = (__webpack_module_cache__[moduleId] = {
            /******/ id: moduleId,
            /******/ loaded: false,
            /******/ exports: {},
            /******/
        });
        /******/
        /******/ // Execute the module function
        /******/ __webpack_modules__[moduleId].call(
            module.exports,
            module,
            module.exports,
            __webpack_require__
        );
        /******/
        /******/ // Flag the module as loaded
        /******/ module.loaded = true;
        /******/
        /******/ // Return the exports of the module
        /******/ return module.exports;
        /******/
    }
    /******/
    /************************************************************************/
    /******/ /* webpack/runtime/global */
    /******/ (() => {
        /******/ __webpack_require__.g = (function () {
            /******/ if (typeof globalThis === "object") return globalThis;
            /******/ try {
                /******/ return this || new Function("return this")();
                /******/
            } catch (e) {
                /******/ if (typeof window === "object") return window;
                /******/
            }
            /******/
        })();
        /******/
    })();
    /******/
    /******/ /* webpack/runtime/node module decorator */
    /******/ (() => {
        /******/ __webpack_require__.nmd = (module) => {
            /******/ module.paths = [];
            /******/ if (!module.children) module.children = [];
            /******/ return module;
            /******/
        };
        /******/
    })();
    /******/
    /************************************************************************/
    var __webpack_exports__ = {};
    // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
    (() => {
        __webpack_require__(1);
    })();

    var __webpack_export_target__ = exports;
    for (var i in __webpack_exports__)
        __webpack_export_target__[i] = __webpack_exports__[i];
    if (__webpack_exports__.__esModule)
        Object.defineProperty(__webpack_export_target__, "__esModule", {
            value: true,
        });
    /******/
})();
//# sourceMappingURL=web-extension.js.map
