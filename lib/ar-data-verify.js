"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEncodedTagSize = exports.verifyEncodedTagsArray = exports.verify = exports.MAX_TAG_COUNT = exports.MAX_TAG_VALUE_LENGTH_BYTES = exports.MAX_TAG_KEY_LENGTH_BYTES = void 0;
const ar_data_base_1 = require("./ar-data-base");
exports.MAX_TAG_KEY_LENGTH_BYTES = 1024 * 1;
exports.MAX_TAG_VALUE_LENGTH_BYTES = 1024 * 3;
exports.MAX_TAG_COUNT = 128;
/**
 * Verifies a DataItem is valid.
 *
 * @param deps
 * @param d
 * @param jwk
 */
function verify(deps, d) {
    return __awaiter(this, void 0, void 0, function* () {
        // Try-catch all so malformed data like invalid base64 or something just returns false.
        try {
            // Get signature data and signature present in di.
            const signatureData = yield ar_data_base_1.getSignatureData(deps, d);
            const signatureBytes = deps.utils.b64UrlToBuffer(d.signature);
            // Verifiy Id is correct
            const idBytes = yield deps.crypto.hash(signatureBytes);
            const idOk = deps.utils.bufferTob64Url(idBytes) === d.id;
            if (!idOk) {
                return false;
            }
            // Verify Signature is correct
            const signatureOk = yield deps.crypto.verify(d.owner, signatureData, signatureBytes);
            if (!signatureOk) {
                return false;
            }
            // Verify tags array is valid.
            if (!verifyEncodedTagsArray(deps, d.tags)) {
                return false;
            }
            // Everything passed.
            return true;
        }
        catch (e) {
            console.warn(e);
            return false;
        }
    });
}
exports.verify = verify;
/**
 *
 * Verify an array of tags only contains objects with exactly two keys, `name` and `value`
 * that they are both non-empty strings, and are with the bounds of tag sizes.
 *
 * @param tags
 */
function verifyEncodedTagsArray(deps, tags) {
    if (tags.length > exports.MAX_TAG_COUNT) {
        return false;
    }
    // Search for something invalid.
    const invalid = tags.find((t) => Object.keys(t).length !== 2 ||
        typeof t.name !== "string" ||
        typeof t.value !== "string" ||
        !verifyEncodedTagSize(deps, t));
    return !invalid;
}
exports.verifyEncodedTagsArray = verifyEncodedTagsArray;
/**
 * Verifies the tag name or value does not exceed reasonable bounds in bytes.
 *
 * @param deps
 * @param tag
 */
function verifyEncodedTagSize(deps, tag) {
    const nameLen = deps.utils.b64UrlToBuffer(tag.name).length;
    if (nameLen < 1 || nameLen > exports.MAX_TAG_KEY_LENGTH_BYTES) {
        return false;
    }
    const valueLen = deps.utils.b64UrlToBuffer(tag.value).length;
    if (valueLen < 1 || nameLen > exports.MAX_TAG_VALUE_LENGTH_BYTES) {
        return false;
    }
    return true;
}
exports.verifyEncodedTagSize = verifyEncodedTagSize;
