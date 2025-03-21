const jwt = require('jsonwebtoken');
const authMiddleware = (req,res,next)=>{
  
  const authHeader = req.headers['authorization'];
  console.log(authHeader); // it will come with bearer and space
  const token = authHeader && authHeader.split(" ")[1];

  if(!token){
    return res.status(404).json({
      success:false,
      message : 'Access denied.No token provided. please login to continue'
    });
  }
  // decode this token  //means to get the user information

  try{
    const decodedTokenInfo = jwt.verify(token,process.env.JWT_SECRET_KEY);
    console.log(decodedTokenInfo);

    req.userInfo = decodedTokenInfo;
    next(); // passs controll to the next middleware or route
  }catch(error){
    return res.status(500).json({
      success:false,
      message : 'Access denied.No token provided. please login to continue'
    });
  }

};

module.exports = authMiddleware;