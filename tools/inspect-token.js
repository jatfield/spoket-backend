const https = require('https');

const inspectToken = (token) => {
  return new Promise((resolve, reject) => {
    try { 
      let url = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${process.env.SPOKET_FB_APPTOKEN}`;
      https.get(url, res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("error", () => reject(error));
        res.on("data", data => body += data);
        res.on("end", () => {
          parsedBody = JSON.parse(body);
          resolve({valid: parsedBody.data.is_valid, id: parsedBody.data.user_id});
        });
      });
    } catch (error) {
      reject(error);
    }
  });

/* 
{
    "data": {
        "app_id": 138483919580948, 
        "type": "USER",
        "application": "Social Cafe", 
        "expires_at": 1352419328, 
        "is_valid": true, 
        "issued_at": 1347235328, 
        "metadata": {
            "sso": "iphone-safari"
        }, 
        "scopes": [
            "email", 
            "publish_actions"
        ], 
        "user_id": "1207059"
    }
}
*/
}

module.exports = inspectToken;