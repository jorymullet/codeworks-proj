"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const csv = require("csvtojson");
/**
 * This turns a csv into an object where the keys are headers and the values are arrays of their columns
 */
exports.headerAndColumn = (filePath) => {
    return new Promise(async (resolve) => {
        const json = await csv().fromFile(filePath);
        const output = {};
        json.forEach(obj => {
            Object.keys(obj).forEach(key => {
                if (!obj[key])
                    return;
                if (!output[key]) {
                    output[key] = [];
                }
                output[key].push(obj[key]);
            });
        });
        resolve(output);
    });
};
//# sourceMappingURL=parse-csv.js.map