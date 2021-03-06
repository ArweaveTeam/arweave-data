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
exports.bundleData = exports.unbundleData = void 0;
const ar_data_verify_1 = require("./ar-data-verify");
/**
 * Unbundles a transaction into an Array of DataItems.
 *
 * Takes either a json string or object. Will throw if given an invalid json
 * string but otherwise, it will return an empty array if
 *
 * a) the json object is the wrong format
 * b) the object contains no valid DataItems.
 *
 * It will verify all DataItems and discard ones that don't pass verification.
 *
 * @param deps
 * @param txData
 */
function unbundleData(deps, txData) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof txData === "string") {
            txData = JSON.parse(txData);
        }
        if (typeof txData !== "object" ||
            !txData ||
            !txData.items ||
            !Array.isArray(txData.items)) {
            console.warn(`Invalid bundle, should be a json string or object with an items Array`);
            return [];
        }
        const itemsArray = txData.items;
        const verifications = yield Promise.all(itemsArray.map((d) => ar_data_verify_1.verify(deps, d)));
        const failed = verifications.filter((v) => !v).length;
        if (failed > 0) {
            console.warn(`${failed} pieces of Data failed verification and will be discarded`);
            return itemsArray.filter((x, idx) => verifications[idx]);
        }
        return itemsArray;
    });
}
exports.unbundleData = unbundleData;
/**
 * Verifies all datas and returns a json object with an items array.
 * Throws if any of the data items fail verification.
 *
 * @param deps
 * @param datas
 */
function bundleData(deps, datas) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.all(datas.map((d) => __awaiter(this, void 0, void 0, function* () {
            if (!(yield ar_data_verify_1.verify(deps, d))) {
                throw new Error("Invalid Data");
            }
        })));
        return { items: datas };
    });
}
exports.bundleData = bundleData;
