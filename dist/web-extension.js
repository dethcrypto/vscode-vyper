/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/**
 * @author github.com/tintinweb
 * @license MIT
 *
 * */
const vscode = __webpack_require__(1);

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
    foreGroundWarning: vscode.window.createTextEditorDecorationType({
        dark: {
            color: "#f56262",
        },
        light: {
            color: "#d65353",
        },
        fontWeight: "bold",
    }),
    foreGroundWarningUnderline: vscode.window.createTextEditorDecorationType({
        dark: {
            color: "#f56262",
        },
        light: {
            color: "#d65353",
        },
        textDecoration: "underline",
    }),
    foreGroundInfoUnderline: vscode.window.createTextEditorDecorationType({
        dark: {
            color: "#ffc570",
        },
        light: {
            color: "#e4a13c",
        },
        textDecoration: "underline",
    }),
    foreGroundNewEmit: vscode.window.createTextEditorDecorationType({
        dark: {
            color: "#fffffff5",
        },
        light: {
            color: "",
        },
        fontWeight: "#c200b2ad",
    }),
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
                var startPos = editor.document.positionAt(match.index);
                var endPos = editor.document.positionAt(
                    match.index + match[rule.captureGroup].trim().length
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


/***/ }),
/* 3 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/**
 * @author github.com/tintinweb
 * @license MIT
 *
 * */
const vscode = __webpack_require__(1);
const settings = __webpack_require__(4);

const builtinsArr = __webpack_require__(5);

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
                return provideHoverHandler(document, position, token, type);
            },
        })
    );
}

module.exports = {
    init: init,
};


/***/ }),
/* 4 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/**
 * @author github.com/tintinweb
 * @license MIT
 *
 *
 * */
/** imports */
const vscode = __webpack_require__(1);

const LANGUAGE_ID = "vyper";

function extensionConfig() {
    return vscode.workspace.getConfiguration(LANGUAGE_ID);
}

module.exports = {
    LANGUAGE_ID: LANGUAGE_ID,
    extensionConfig: extensionConfig,
};


/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = JSON.parse('{"wei":{"prefix":"wei","description":"1 wei == 10e-XX eth","security":""},"finney":{"prefix":"finney","description":"1 finney == 10e-XX eth","security":""},"szabo":{"prefix":"szabo","description":"1 szabo == 10e-XX eth","security":""},"ether":{"prefix":"ether","description":"1 ether == 10e-XX eth","security":""},"seconds":{"prefix":"seconds","description":"1 seconds == 10e-XX eth","security":""},"minutes":{"prefix":"minutes","description":"1 minutes == 60 seconds","security":"Note - for calendar calculations: does not account for leap seconds!"},"hours":{"prefix":"hours","description":"1 hours == 60 minutes","security":"Note - for calendar calculations: does not account for leap seconds!"},"days":{"prefix":"days","description":"1 days == 24 hours","security":"Note - for calendar calculations: does not account for leap year or leap seconds!"},"weeks":{"prefix":"weeks","description":"1 weeks == 7 days","security":"Note - for calendar calculations: does not account for leap year or leap seconds!"},"years":{"prefix":"years","description":"1 years == 365 days","security":"**deprecated - do not use** Note - for calendar calculations: does not account for leap year or leap seconds!"},"blockhash":{"prefix":"blockhash","description":"blockhash(uint blockNumber) returns (bytes32): hash of the given block - only works for 256 most recent, excluding current, blocks","security":["Do not rely on block.timestamp, now and blockhash as a source of randomness, unless you know what you are doing.","Both the timestamp and the block hash can be influenced by miners to some degree. Bad actors in the mining community can for example run a casino payout function on a chosen hash and just retry a different hash if they did not receive any money.","The current block timestamp must be strictly larger than the timestamp of the last block, but the only guarantee is that it will be somewhere between the timestamps of two consecutive blocks in the canonical chain.","The block hashes are not available for all blocks for scalability reasons. You can only access the hashes of the most recent 256 blocks, all other values will be zero.","The function blockhash was previously known as block.blockhash, which was deprecated in version 0.4.22 and removed in version 0.5.0."]},"_blockhash":{"prefix":"block.blockhash","description":"blockhash(uint blockNumber) returns (bytes32): hash of the given block - only works for 256 most recent, excluding current, blocks","security":["Do not rely on block.timestamp, now and blockhash as a source of randomness, unless you know what you are doing.","Both the timestamp and the block hash can be influenced by miners to some degree. Bad actors in the mining community can for example run a casino payout function on a chosen hash and just retry a different hash if they did not receive any money.","The current block timestamp must be strictly larger than the timestamp of the last block, but the only guarantee is that it will be somewhere between the timestamps of two consecutive blocks in the canonical chain.","The block hashes are not available for all blocks for scalability reasons. You can only access the hashes of the most recent 256 blocks, all other values will be zero.","The function blockhash was previously known as block.blockhash, which was deprecated in version 0.4.22 and removed in version 0.5.0."]},"_coinbase":{"prefix":"block.coinbase","description":"block.coinbase (address payable): current block miner’s address","security":""},"_difficulty":{"prefix":"block.difficulty","description":"block.difficulty (uint): current block difficulty","security":""},"_gaslimit":{"prefix":"block.gaslimit","description":"block.gaslimit (uint): current block gaslimit","security":""},"_number":{"prefix":"block.number","description":"block.number (uint): current block number","security":"Can be manipulated by miner"},"_timestamp":{"prefix":"block.timestamp","description":"block.timestamp (uint): current block timestamp as seconds since unix epoch","security":["Do not rely on block.timestamp, now and blockhash as a source of randomness, unless you know what you are doing.","Both the timestamp and the block hash can be influenced by miners to some degree. Bad actors in the mining community can for example run a casino payout function on a chosen hash and just retry a different hash if they did not receive any money.","The current block timestamp must be strictly larger than the timestamp of the last block, but the only guarantee is that it will be somewhere between the timestamps of two consecutive blocks in the canonical chain."]},"gasleft":{"prefix":"gasleft","description":"gasleft() returns (uint256): remaining gas","security":"The function gasleft was previously known as msg.gas, which was deprecated in version 0.4.21 and removed in version 0.5.0."},"msg":{"prefix":"msg","description":"msg","security":"The values of all members of msg, including msg.sender and msg.value can change for every external function call. This includes calls to library functions."},"_data":{"prefix":"msg.data","description":"msg.data (bytes calldata): complete calldata","security":""},"_sender":{"prefix":"msg.sender","description":"msg.sender (address payable): sender of the message (current call)","security":"The values of all members of msg, including msg.sender and msg.value can change for every external function call. This includes calls to library functions."},"_sig":{"prefix":"msg.sig","description":"msg.sig (bytes4): first four bytes of the calldata (i.e. function identifier)","security":""},"_value":{"prefix":"msg.value","description":"msg.value (uint): number of wei sent with the message","security":"The values of all members of msg, including msg.sender and msg.value can change for every external function call. This includes calls to library functions."},"now":{"prefix":"now","description":"now (uint): current block timestamp (alias for block.timestamp)","security":["Do not rely on block.timestamp, now and blockhash as a source of randomness, unless you know what you are doing.","Both the timestamp and the block hash can be influenced by miners to some degree. Bad actors in the mining community can for example run a casino payout function on a chosen hash and just retry a different hash if they did not receive any money.","The current block timestamp must be strictly larger than the timestamp of the last block, but the only guarantee is that it will be somewhere between the timestamps of two consecutive blocks in the canonical chain."]},"_gasprice":{"prefix":"tx.gasprice","description":"tx.gasprice (uint): gas price of the transaction","security":""},"_origin":{"prefix":"tx.origin","description":"tx.origin (address payable): sender of the transaction (full call chain)","security":"Do not use for authentication"},"abi":{"prefix":"abi","description":"These encoding functions can be used to craft data for external function calls without actually calling an external function. Furthermore, keccak256(abi.encodePacked(a, b)) is a way to compute the hash of structured data (although be aware that it is possible to craft a “hash collision” using different function parameter types).","security":"error prone"},"_decode":{"prefix":"abi.decode","description":"abi.decode(bytes memory encodedData, (...)) returns (...): ABI-decodes the given data, while the types are given in parentheses as second argument. Example: (uint a, uint[2] memory b, bytes memory c) = abi.decode(data, (uint, uint[2], bytes))","security":""},"_encode":{"prefix":"abi.encode","description":"abi.encode(...) returns (bytes memory): ABI-encodes the given arguments","security":""},"encodePacked":{"prefix":"abi.encodePacked","description":"abi.encodePacked(...) returns (bytes memory): Performs packed encoding of the given arguments. Note that packed encoding can be ambiguous!","security":""},"_encodeWithSelector":{"prefix":"abi.encodeWithSelector","description":"abi.encodeWithSelector(bytes4 selector, ...) returns (bytes memory): ABI-encodes the given arguments starting from the second and prepends the given four-byte selector","security":""},"encodeWithSignature":{"prefix":"abi.encodeWithSignature","description":"abi.encodeWithSignature(string memory signature, ...) returns (bytes memory): Equivalent to abi.encodeWithSelector(bytes4(keccak256(bytes(signature))), ...)`","security":""},"assert":{"prefix":"assert","description":"assert(bool condition):\\ncauses an invalid opcode and thus state change reversion if the condition is not met - to be used for internal errors.","security":""},"require":{"prefix":"require","description":["require(bool condition):\\n\\treverts if the condition is not met - to be used for errors in inputs or external components.","require(bool condition, string memory message):\\n\\treverts if the condition is not met - to be used for errors in inputs or external components. Also provides an error message."],"security":""},"revert":{"prefix":"revert","description":["revert():\\n\\tabort execution and revert state changes","revert(string memory reason):\\n\\tabort execution and revert state changes, providing an explanatory string"],"security":""},"addmod":{"prefix":"addmod","description":"addmod(uint x, uint y, uint k) returns (uint):\\n\\tcompute (x + y) % k where the addition is performed with arbitrary precision and does not wrap around at 2**256. Assert that k != 0 starting from version 0.5.0.","security":""},"mulmod":{"prefix":"mulmod","description":"mulmod(uint x, uint y, uint k) returns (uint):\\n\\tcompute (x * y) % k where the multiplication is performed with arbitrary precision and does not wrap around at 2**256. Assert that k != 0 starting from version 0.5.0.","security":""},"keccak256":{"prefix":"keccak256","description":"keccak256(bytes memory) returns (bytes32):\\n\\tcompute the Keccak-256 hash of the input","security":""},"sha256":{"prefix":"sha256","description":"sha256(bytes memory) returns (bytes32):\\n\\tcompute the SHA-256 hash of the input","security":"It might be that you run into Out-of-Gas for sha256, ripemd160 or ecrecover on a private blockchain. The reason for this is that those are implemented as so-called precompiled contracts and these contracts only really exist after they received the first message (although their contract code is hardcoded). Messages to non-existing contracts are more expensive and thus the execution runs into an Out-of-Gas error. A workaround for this problem is to first send e.g. 1 Wei to each of the contracts before you use them in your actual contracts. This is not an issue on the official or test net."},"ripemd160":{"prefix":"ripemd160","description":"ripemd160(bytes memory) returns (bytes20):\\n\\tcompute RIPEMD-160 hash of the input","security":"It might be that you run into Out-of-Gas for sha256, ripemd160 or ecrecover on a private blockchain. The reason for this is that those are implemented as so-called precompiled contracts and these contracts only really exist after they received the first message (although their contract code is hardcoded). Messages to non-existing contracts are more expensive and thus the execution runs into an Out-of-Gas error. A workaround for this problem is to first send e.g. 1 Wei to each of the contracts before you use them in your actual contracts. This is not an issue on the official or test net."},"ecrecover":{"prefix":"ecrecover","description":"ecrecover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) returns (address):\\n\\trecover the address associated with the public key from elliptic curve signature or return zero on error (example usage)","security":["Function ecrecover returns an address, and not an address payable. See address payable for conversion, in case you need to transfer funds to the recovered address.","It might be that you run into Out-of-Gas for sha256, ripemd160 or ecrecover on a private blockchain. The reason for this is that those are implemented as so-called precompiled contracts and these contracts only really exist after they received the first message (although their contract code is hardcoded). Messages to non-existing contracts are more expensive and thus the execution runs into an Out-of-Gas error. A workaround for this problem is to first send e.g. 1 Wei to each of the contracts before you use them in your actual contracts. This is not an issue on the official or test net.","check function signature (v:=uint8)","check if replay protection is needed (nonce, chainid)"]},"sha3":{"prefix":"sha3","description":"sha3() --> keccak256(bytes memory) returns (bytes32):\\n\\tcompute the Keccak-256 hash of the input","security":"There used to be an alias for keccak256 called sha3, which was removed in version 0.5.0."},"_balance":{"prefix":".balance","description":"<address>.balance (uint256):\\n\\tbalance of the Address in Wei","security":"Prior to version 0.5.0, Solidity allowed address members to be accessed by a contract instance, for example this.balance. This is now forbidden and an explicit conversion to address must be done: address(this).balance."},"_transfer":{"prefix":".transfer","description":"<address payable>.transfer(uint256 amount):\\n\\tsend given amount of Wei to Address, reverts on failure, forwards 2300 gas stipend, not adjustable","security":""},"_send":{"prefix":".send","description":"<address payable>.send(uint256 amount) returns (bool):\\n\\tsend given amount of Wei to Address, returns false on failure, forwards 2300 gas stipend, not adjustable","security":"There are some dangers in using send: The transfer fails if the call stack depth is at 1024 (this can always be forced by the caller) and it also fails if the recipient runs out of gas. So in order to make safe Ether transfers, always check the return value of send, use transfer or even better: Use a pattern where the recipient withdraws the money."},"_call":{"prefix":".call","description":"<address>.call(bytes memory) returns (bool, bytes memory):\\n\\tissue low-level CALL with the given payload, returns success condition and return data, forwards all available gas, adjustable","security":["You should avoid using .call() whenever possible when executing another contract function as it bypasses type checking, function existence check, and argument packing.","Prior to version 0.5.0, .call, .delegatecall and .staticcall only returned the success condition and not the return data."]},"_delegatecall":{"prefix":".delegatecall","description":"<address>.delegatecall(bytes memory) returns (bool, bytes memory):\\n\\tissue low-level DELEGATECALL with the given payload, returns success condition and return data, forwards all available gas, adjustable","security":["If state variables are accessed via a low-level delegatecall, the storage layout of the two contracts must align in order for the called contract to correctly access the storage variables of the calling contract by name. This is of course not the case if storage pointers are passed as function arguments as in the case for the high-level libraries.","Prior to version 0.5.0, .call, .delegatecall and .staticcall only returned the success condition and not the return data."]},"_staticcall":{"prefix":".staticcall","description":["<address>.staticcall(bytes memory) returns (bool, bytes memory):\\n\\tissue low-level STATICCALL with the given payload, returns success condition and return data, forwards all available gas, adjustable","Prior to version 0.5.0, .call, .delegatecall and .staticcall only returned the success condition and not the return data."],"security":""},"_callcode":{"prefix":".callcode","description":"<address>.delegatecall(bytes memory) returns (bool, bytes memory):\\n\\tissue low-level DELEGATECALL with the given payload, returns success condition and return data, forwards all available gas, adjustable","security":"Prior to version 0.5.0, there was a member called callcode with similar but slightly different semantics than delegatecall."},"selfdestruct":{"prefix":"selfdestruct","description":"selfdestruct(address payable recipient):\\n\\tdestroy the current contract, sending its funds to the given Address","security":""},"suicide":{"prefix":"suicide","description":"selfdestruct(address payable recipient):\\n\\tdestroy the current contract, sending its funds to the given Address","security":"Prior to version 0.5.0, there was a function called suicide with the same semantics as selfdestruct."},"this":{"prefix":"this","description":"this (current contract’s type):\\n\\tthe current contract, explicitly convertible to Address","security":""},"_creationCode":{"prefix":".creationCode","description":"type(C).creationCode:\\n\\tMemory byte array that contains the creation bytecode of the contract. This can be used in inline assembly to build custom creation routines, especially by using the create2 opcode. This property can not be accessed in the contract itself or any derived contract. It causes the bytecode to be included in the bytecode of the call site and thus circular references like that are not possible.","security":""},"_runtimeCode":{"prefix":".runtimeCode","description":"type(C).runtimeCode:\\n\\tMemory byte array that contains the runtime bytecode of the contract. This is the code that is usually deployed by the constructor of C. If C has a constructor that uses inline assembly, this might be different from the actually deployed bytecode. Also note that libraries modify their runtime bytecode at time of deployment to guard against regular calls. The same restrictions as with .creationCode also apply for this property.","security":""},"memory":{"prefix":"memory","description":"","security":["Array/Structs: check for uninit pointer.","Array/Structs: check that variable is not used before declaration"]},"storage":{"prefix":"storage","description":"","security":["Array/Structs: check for uninit pointer.","Array/Structs: check that variable is not used before declaration"]},"ERC20":{"prefix":"ERC20","description":"","security":"check if contract was modified"},"while":{"prefix":"while","description":"","security":"LOOP - check for OOG conditions (locking ether, DoS, ...)"},"do":{"prefix":"do","description":"","security":"LOOP - check for OOG conditions (locking ether, DoS, ...)"},"for":{"prefix":"for","description":"","security":"LOOP - check for OOG conditions (locking ether, DoS, ...)"},"pragma":{"prefix":"pragma","description":"","security":"avoid using experimental features! avoid specifying version ^"},"is":{"prefix":"is","description":"","security":"check inheritance order"},">>":{"prefix":">>","description":"","security":"The results produced by shift right of negative values of signed integer types is different from those produced by other programming languages. In Solidity, shift right maps to division so the shifted negative values are going to be rounded towards zero (truncated). In other programming languages the shift right of negative values works like division with rounding down (towards negative infinity)."},"byte":{"prefix":"byte","description":"byte is an alias for bytes1","security":""},"bytes":{"prefix":"bytes","description":"Dynamically-sized byte array, see Arrays. Not a value-type!","security":"As a rule of thumb, use bytes for arbitrary-length raw byte data and string for arbitrary-length string (UTF-8) data. If you can limit the length to a certain number of bytes, always use one of bytes1 to bytes32 because they are much cheaper."},"string":{"prefix":"string","description":"Dynamically-sized UTF-8-encoded string, see Arrays. Not a value-type!","security":"As a rule of thumb, use bytes for arbitrary-length raw byte data and string for arbitrary-length string (UTF-8) data. If you can limit the length to a certain number of bytes, always use one of bytes1 to bytes32 because they are much cheaper."},"_length":{"prefix":".length","description":"<byte[]|array>.length yields the fixed length of the byte array (read-only)."},"public":{"prefix":"public","description":"Public functions are part of the contract interface and can be either called internally or via messages. For public state variables, an automatic getter function (see below) is generated.","security":"make sure to authenticate calls to this method as anyone can access it"},"external":{"prefix":"external","description":"External functions are part of the contract interface, which means they can be called from other contracts and via transactions. An external function f cannot be called internally (i.e. f() does not work, but this.f() works). External functions are sometimes more efficient when they receive large arrays of data.","security":"make sure to authenticate calls to this method as anyone can access it"},"internal":{"prefix":"internal","description":"Those functions and state variables can only be accessed internally (i.e. from within the current contract or contracts deriving from it), without using this."},"private":{"prefix":"private","description":"Private functions and state variables are only visible for the contract they are defined in and not in derived contracts.","security":"Everything that is inside a contract is visible to all external observers. Making something private only prevents other contracts from accessing and modifying the information, but it will still be visible to the whole world outside of the blockchain."},"pure":{"prefix":"pure","description":"Functions can be declared pure in which case they promise not to read from or modify the state.","security":["It is not possible to prevent functions from reading the state at the level of the EVM, it is only possible to prevent them from writing to the state (i.e. only view can be enforced at the EVM level, pure can not).","Before version 0.4.17 the compiler didn’t enforce that pure is not reading the state."]},"view":{"prefix":"view","description":"function call CANNOT write state. It is however allowed to read state.","security":["Functions can be declared view in which case they promise not to modify the state.","constant on functions is an alias to view, but this is deprecated and will be dropped in version 0.5.0.","Getter methods are marked view.","The compiler does not enforce yet that a view method is not modifying state. It raises a warning though."]},"extcodehash":{"prefix":"extcodehash","description":"","security":"Note that EXTCODEHASH will be zero during constructor calls. Therefore it is not fit to use it to check if an address is a contract or not as this can be subverted by calling your contract in a constructor."}}');

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/**
 * @author github.com/tintinweb
 * @license MIT
 *
 * language definition based on: https://raw.githubusercontent.com/Microsoft/vscode/master/extensions/python/syntaxes/MagicPython.tmLanguage.json (MIT)
 * compilation related parts taken from: https://github.com/trufflesuite/truffle/tree/develop/packages/truffle-compile-vyper (MIT)
 * */

/** imports */
const vscode = __webpack_require__(1);

const mod_deco = __webpack_require__(2);
const mod_hover = __webpack_require__(3);
const settings = __webpack_require__(4);

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

    if (!IS_WEB) {
        //always run on save
        if (settings.extensionConfig().compile.onSave) {
            mod_compile.compileContractCommand(document);
        }
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
    if (!IS_WEB) mod_compile.init(context, type);
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
                    action: { indentAction: vscode.IndentAction.Indent },
                },
            ],
        });

        if (!IS_WEB) {
            context.subscriptions.push(
                vscode.commands.registerCommand(
                    "vyper.compileContract",
                    mod_compile.compileContractCommand
                )
            );
        }

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
                if (activeEditor && event.document === activeEditor.document) {
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

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=web-extension.js.map
