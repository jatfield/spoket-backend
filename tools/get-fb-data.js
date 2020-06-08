const https = require('https');

const getFbData = (fbId) => {
  return new Promise((resolve, reject) => {
    try { 
      let url = `https://graph.facebook.com/v6.0/${fbId}?fields=id,name,email,picture.type(large)&access_token=${process.env.SPOKET_FB_APPTOKEN}`;
      https.get(url, res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("error", () => reject(error));
        res.on("data", data => body += data);
        res.on("end", () => {
          parsedBody = JSON.parse(body);
          resolve(parsedBody);
        });
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = getFbData;