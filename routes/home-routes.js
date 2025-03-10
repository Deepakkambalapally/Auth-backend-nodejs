const express = require('express');
const authMiddleware = require('../middleware/auth-middleware');

const router = express.Router();

// we're going tp protect this route with auth-middleware
router.get('/welcome', authMiddleware, (req,res)=>{
  const {username,userId, role} = req.userInfo;
  res.json({
    message : 'Welcome to the home page',
    user:{
      _id : userId,
      username,
      role
    }
  });
});

module.exports = router;