const router = require('express').Router();

const messengerController = require('../controllers/messengerController');

const authController = require("./../controllers/authController");

router.use(authController.protect);

router.get('/get-list-conversations', messengerController.getListConversations);
router.post('/send-message', messengerController.messageUploadDB);
router.get('/get-message/:id', messengerController.messageGet);
router.post('/image-message-send', messengerController.ImageMessageSend);

router.post('/seen-message', messengerController.messageSeen);
router.post('/delivared-message', messengerController.delivaredMessage);
 

module.exports = router;