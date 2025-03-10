const Image = require('../models/image');
const { uploadToCloudinary } = require('../helpers/cloudinaryHelper');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');
const { parse } = require('path');

const uploadImageController = async (req, res) => {
  try {
    console.log("Received File:", req.file);

    // Check if file is missing in req object
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File is required. Please upload an image',
      });
    }

    // Upload to Cloudinary
    console.log("Uploading to Cloudinary:", req.file.path);
    const { url, publicId } = await uploadToCloudinary(req.file.path);
    console.log("Cloudinary Response:", { url, publicId });

    // Store the image URL and public ID along with the uploaded user ID in the database
    const newlyUploadedImage = new Image({
      url,
      publicId,
      uploadedBy: req.userInfo.userId,
    });

    console.log("Saving Image to DB:", newlyUploadedImage);
    await newlyUploadedImage.save();

    // delete the file from local storage
    //fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      image: newlyUploadedImage,
    });

  } catch (error) {
    console.log(error);
     res.status(500).json({
      success: false,
      message: 'Something went wrong! Please try again',
      
    });
  }
};

// fetch all the images
const fetchImageController = async(req,res)=>{
  try{
    const page = parseInt(req.query.page) || 1; // this gives the current page. if you click on page 1 then it will give 1, if clicked on page 2 then gives 2 ....
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const totalImages = await Image.countDocuments();
    const totalPages = Math.ceil(totalImages/limit);

    const sortObj = {};
    sortObj[sortBy] = sortOrder
    const images = await Image.find().sort(sortObj).skip(skip).limit(limit); // this will give all the images

    if(images){
      res.status(200).json({
        success : true,
        currentPage : page,
        totalPages : totalPages,
        totalImages :totalImages,
        data : images,
      });
    }

  }catch(error){
    console.log(error);
     res.status(500).json({
      success: false,
      message: 'Something went wrong! Please try again',
      
    });

  }
};

const deleteImageController = async(req,res)=>{
  try{
    const getCurrentIdOfImageToBeDeleted = req.params.id;
    const userId = req.userInfo.userId; // this we're getting from authMiddleware. 
    
    const image = await Image.findById(getCurrentIdOfImageToBeDeleted);

    if(!image){
      return res.status(404).json({
        success:false,
        mesage :'Image not found'
      })
    }

     // check if this image is uploaded by current user who is trying to delete this image .

    if(image.uploadedBy.toString() !== userId){
      return res.status(402).json({
        success : false,
        messsage :`You are not authorized to delete this image,because you haven't uploaded it`
      })
    }

    //delete this image first from cloudinary storage 
    await cloudinary.uploader.destroy(image.publicId);

    // delete this image from mongoDB database
    await Image.findByIdAndDelete(getCurrentIdOfImageToBeDeleted);

    res.status(200).json({
      success : true,
      mesage : 'image deleted successfully', 
    })

   

  }catch(error){
    console.log(error);
     res.status(500).json({
      success: false,
      message: 'Something went wrong! Please try again',
      
    });

  }
  
};

module.exports = {
  uploadImageController,
  fetchImageController,
  deleteImageController,
};
