const inspectToken = require('../tools/inspect-token');
const jwt = require ('jsonwebtoken');

checkFbAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authentication.split(' ');    
    const token = authHeader[1];
    
    if (!token) {
      const errorResponse = new Error('Missing token.');
      errorResponse.errorCode = 401; 
      return next(errorResponse);
    }

    req.userData = {valid, fbId} = await inspectToken(token);
    
  if (!req.userData.valid) {
    res.status(401).json({message: "Invalid token"});
    return
  }
    next();
  } catch (error) {
    const errorResponse = new Error("Invalid token");
    errorResponse.errorCode = 401; 
    return next(errorResponse);
  }
}

checkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authentication.split(' ');    
    const token = authHeader[1];
    
    if (!token) {
      const errorResponse = new Error('Missing token.');
      errorResponse.errorCode = 401; 
      return next(errorResponse);
    }
    
    decodedToken = jwt.verify(token, process.env.SPOKET_JWT_PASS);
    req.userData = {spoketId, fbToken} = decodedToken;
    next();
  } catch (error) {
    console.log(error);
    const errorResponse = new Error("Invalid token");
    errorResponse.errorCode = 401; 
    return next(errorResponse);
  }
}


module.exports = {checkAuth, checkFbAuth};