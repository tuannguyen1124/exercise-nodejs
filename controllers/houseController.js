const fs = require('fs');
const House = require('./../models/houseModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new AppError('Not an image! Please upload only image'));
    }
  };
  
  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
  });

  exports.resizeHouseImages = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();
  
    req.body.imageCover = `house-${req.params.id}-${Date.now()}-cover.jpeg`;
  
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/house/${req.body.imageCover}`);
  
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `house-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
  
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/house/${filename}`);
  
        req.body.images.push(filename);
      })
    );
  
    next();
  });

  exports.uploadHouseImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
  ]);

exports.GetAllHouse = factory.getAll(House);
exports.getHousebyId = factory.getOne(House)
exports.createHouse = factory.createOne(House);
exports.updateHouse = factory.updateOne(House);
exports.deleteHouse = factory.deleteOne(House)