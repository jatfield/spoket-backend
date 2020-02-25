const inspectToken = require('../tools/inspect-token')

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authentication.split(' ')[1];
    
    if (!token) {
      const errorResponse = new Error('Missing token.');
      errorResponse.errorCode = 401; 
      return next(errorResponse);
    }
    
    req.userData = {valid, id} = await inspectToken(token);
    
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