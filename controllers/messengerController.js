const formidable = require("formidable");
const fs = require("fs");

const User = require("../models/userModel");
const Message = require("../models/messageModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const getLastMessage = async (myId, fdId) => {
  const msg = await Message.findOne({
    $or: [
      {
        $and: [
          {
            senderId: {
              $eq: myId,
            },
          },
          {
            reseverId: {
              $eq: fdId,
            },
          },
        ],
      },
      {
        $and: [
          {
            senderId: {
              $eq: fdId,
            },
          },
          {
            reseverId: {
              $eq: myId,
            },
          },
        ],
      },
    ],
  }).sort({
    updatedAt: -1,
  });
  return msg;
};

module.exports.getListConversations = async (req, res) => {
  const myId = req.user.id;
  let fnd_msg = [];
  try {
    const friendGet = await User.find({
      _id: {
        $ne: myId,
      },
    });
    for (let i = 0; i < friendGet.length; i++) {
      let lmsg = await getLastMessage(myId, friendGet[i].id);
      if (!lmsg) {
        continue;
      }
      fnd_msg = [
        ...fnd_msg,
        {
          fndInfo: friendGet[i],
          msgInfo: lmsg,
        },
      ];
    }

    // const filter = friendGet.filter(d=>d.id !== myId );
    res.status(200).json({ success: true, friends: fnd_msg });
  } catch (error) {
    res.status(500).json({
      error: {
        errorMessage: "Internal Sever Error",
      },
    });
  }
};

module.exports.getFriend = async (req, res) => {
  const myId = req.user.id;
  let fnd_msg = [];
  try {
    const friendGet = await User.find({
      _id: {
        $ne: myId,
      },
    });
    for (let i = 0; i < friendGet.length; i++) {
      let lmsg = await getLastMessage(myId, friendGet[i].id);
      if (!lmsg) {
        continue;
      }
      fnd_msg = [
        ...fnd_msg,
        {
          fndInfo:  friendGet[i]
        },
      ];
    }

    // const filter = friendGet.filter(d=>d.id !== myId );
    res.status(200).json({ success: true, friends: fnd_msg });
  } catch (error) {
    res.status(500).json({
      error: {
        errorMessage: "Internal Sever Error",
      },
    });
  }
};

module.exports.messageUploadDB = async (req, res) => {
  const {
    // senderName, 
     reseverId,
      message } = req.body;
  const senderId = req.user.id;

  try {
    const insertMessage = await Message.create({
      senderId: senderId,
    //  senderName: senderName,
      reseverId: reseverId,
      message: {
        text: message,
        image: "",
      },
    });
    res.status(201).json({
      success: true,
      message: insertMessage,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        errorMessage: "Internal Sever Error",
      },
    });
  }
};
module.exports.messageGet = async (req, res) => {
  const myId = req.user.id;
  const fdId = req.params.id;

  try {
    let getAllMessage = await Message.find({
      $or: [
        {
          $and: [
            {
              senderId: {
                $eq: myId,
              },
            },
            {
              reseverId: {
                $eq: fdId,
              },
            },
          ],
        },
        {
          $and: [
            {
              senderId: {
                $eq: fdId,
              },
            },
            {
              reseverId: {
                $eq: myId,
              },
            },
          ],
        },
      ],
    });

    // getAllMessage = getAllMessage.filter(m=>m.senderId === myId && m.reseverId === fdId || m.reseverId ===  myId && m.senderId === fdId );

    res.status(200).json({
      success: true,
      message: getAllMessage,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        errorMessage: "Internal Server error",
      },
    });
  }
};

module.exports.ImageMessageSend = (req, res) => {
  const senderId = req.user.id;
  const form = formidable();

  form.parse(req, (err, fields, files) => {
    const { 
   //   senderName, 
      reseverId, 
      imageName } = fields;

    const newPath = __dirname + `/public/img/msg/${imageName}`;
    files.image.originalFilename = imageName;

    try {
      fs.copyFile(files.image.filepath, newPath, async (err) => {
        if (err) {
          res.status(500).json({
            error: {
              errorMessage: "Image upload fail",
            },
          });
        } else {
          const insertMessage = await Message.create({
            senderId: senderId,
       //     senderName: senderName,
            reseverId: reseverId,
            message: {
              text: "",
              image: files.image.originalFilename,
            },
          });
          res.status(201).json({
            success: true,
            message: insertMessage,
          });
        }
      });
    } catch (error) {
      res.status(500).json({
        error: {
          errorMessage: "Internal Sever Error",
        },
      });
    }
  });
};

module.exports.messageSeen = async (req, res, next) => {
  const seenMessage = await Message.findOneAndUpdate(
    {
      _id: {
        $eq: req.body._id,
      },
      reseverId: {
        $eq: req.user.id,
      },
      status: {
        $ne: "seen",
      },
    },
    {
      status: "seen",
    }
  );
  if (!seenMessage) {
    return next(new AppError("seen message invalid", 400));
  }

  res.status(200).json({
    status: "success",
    data: {
      message_id: seenMessage._id,
    },
  });


};

module.exports.delivaredMessage = async (req, res) => {

 const delivaredMessage = await Message.findByIdAndUpdate( req.body._id, {
    status: "delivared",
  });
  
  res.status(200).json({
    status: "success",
    data: {
      message: delivaredMessage,
    },
  });


};

