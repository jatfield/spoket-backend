const inspectToken = require('../tools/inspect-token')

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authentication.split(' ');    
    const token = authHeader[1];
    const spoketId = authHeader[3];
    
    if (!token) {
      const errorResponse = new Error('Missing token.');
      errorResponse.errorCode = 401; 
      return next(errorResponse);
    }    
    !spoketId ? req.userData = {valid, id} = await inspectToken(token) : req.userData = {valid: true, spoketId};
    
  if (!req.userData.valid) {
    res.status(401).json({message: "Invalid token"});
    return
  }
    next();
  } catch (error) {
    const errorResponse = new Error('Érvénytelen token.');
    errorResponse.errorCode = 401; 
    return next(errorResponse);
  }
}