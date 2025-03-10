const User = require('../models/user'); // this is user model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// register controller
const registerUser = async(req,res)=>{
  try{
    // extract user information from our request body
    const {username, email, password, role} = req.body;

    // check if user is already exists in our database
    const checkExistingUser = await User.findOne({$or :[{username},{email}]});
    if(checkExistingUser){
      return res.status(400).json({
        sucess: false,
        messsgae :'user is already exists either with same username or same email. please try with a different username or email',
      });
    }
    
    // hash the user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);
    
    // now create a new user and save in your database
    const newlyCreatedUser = new User({
      username,
      email,
      password : hashedPassword,
      role : role || 'user'
    });

    await newlyCreatedUser.save();

    if(newlyCreatedUser){
      res.status(201).json({
        success: true,
        message: 'User registered succesfully'
      })
    } else{
      res.status(404).json({
        success: false,
        message: 'Unable to register user! please try again.'
      })
    }



  }catch(e){
    console.log(e);
    res.status(500).json({
      success : false,
      message:'some error occured! please try again',
    })
  }
}

// login controller
const loginUser = async(req,res)=>{
  try{
    const {username, password} = req.body;
    
    // first find if the current user is exists in database or not
    const user = await User.findOne({username});

    if(!user){
      return res.status(404).json({
        success : false,
        message:`user doesn't exist`
      })
    }
    
    // if password is correct or not
    const ispasswordMatch = await bcrypt.compare(password,user.password);

    if(!ispasswordMatch){
      return res.status(404).json({
        success : false,
        message:'Invalid credentials'
      })
    }


    // we're to going to create token
      // create user token
    const accessToken = jwt.sign({
      userId : user._id,
      username : user.username,
      role : user.role
    },process.env.JWT_SECRET_KEY,{
      expiresIn : '30m'
    })

     // we're returning the token back
    res.status(200).json({
      success : true,
      message : 'Logged in successful',
      accessToken
    })

 
  }catch(e){
    console.log(e);
    res.status(500).json({
      success : false,
      message:'some error occured! please try again',
    })
  }
};

const changePassword = async(req,res)=>{
  try{
    // current user id
    // you will only change the password after log in.
    const userId = req.userInfo.userId;

    // extract old and new password
   const {oldPassword, newPassword} = req.body;

   // find the current logged in user
   const user = await User.findById(userId);

   if(!user){
    res.status(400).json({
      sucess:false,
      message : 'User not find'
    })
   }

   // check if old password is correct
   const ispasswordMatch = await bcrypt.compare(oldPassword,user.password);

   if(!ispasswordMatch){
    return res.status(400).json({
      success: false,
      message:'old password is not correct! please try again.'
    });   
   }
   // hash the new password here
   const salt = await bcrypt.genSalt(10);
   const newHashedPassword =await bcrypt.hash(newPassword,salt); 

   // update the user password
    user.password = newHashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message:"password changed successfully", 
    })


  }catch(e){
    console.log(e);
    res.status(500).json({
      success : false,
      message:'some error occured! please try again',
    })

  }
}

module.exports = {
  registerUser,
  loginUser,
  changePassword,
};