const express = require('express');
const houseController = require('./../controllers/houseController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.protect)

router
  .route('/')
  .get(authController.protect, houseController.GetAllHouse)
  .post(authController.protect, authController.restrictTo('admin', 'householder'), houseController.createHouse)

router
  .route('/:id')
  .get(houseController.getHousebyId)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'householder'),
    houseController.uploadHouseImages,
    houseController.resizeHouseImages,
    houseController.updateHouse
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'householder'),
    houseController.deleteHouse
  );


module.exports = router;