"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
const fs = require("fs");
const admin = require("firebase-admin");
const tmp = require("tmp");
exports.getFirebaseFileBase64 = (url) => new Promise(async (resolve, reject) => {
    const tmpObj = tmp.fileSync();
    const pathName = tmpObj.name;
    // downloads file from web into local file
    const bucket = admin.storage().bucket();
    try {
        await bucket.file(url).download({
            destination: pathName,
        });
    }
    catch (err) {
        console.error('Could not download file: ', err);
        reject(err);
    }
    const fileBase64 = fs.readFileSync(pathName).toString('base64');
    tmpObj.removeCallback();
    resolve(fileBase64);
});
exports.default = (url, ref) => new Promise((resolve, reject) => {
    //creates temp path so that server isn't mad at us
    const tmpObj = tmp.fileSync();
    const pathName = tmpObj.name;
    const file = fs.createWriteStream(pathName);
    try {
        // downloads file from web into local file
        const request = https.get(url, response => {
            response.pipe(file);
            file.on('close', async (_) => {
                // stores file in storage
                const bucket = admin.storage().bucket();
                try {
                    await bucket.upload(pathName, {
                        destination: ref,
                    });
                    tmpObj.removeCallback();
                }
                catch (err) {
                    console.error(err);
                    return reject(err);
                }
                // gets access token
                try {
                    const signedUrl = await bucket.file(ref).getSignedUrl({
                        expires: '03-09-2491',
                        action: 'read',
                    });
                    resolve(signedUrl);
                }
                catch (err) {
                    console.error(err);
                    return reject(err);
                }
            });
            request.on('error', reject);
        });
    }
    catch (err) {
        console.error('Could not download file: ', err);
        reject(err);
    }
});
//# sourceMappingURL=download-file.js.map