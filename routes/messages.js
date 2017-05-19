var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

var Message = require('../models/message');
var User = require('../models/user');

router.get('/', function(req, res, next) {
  Message.find()
    .exec(function(err, messages) {
      if (err) {
        return res.status(500).json({
          title: 'An error occurred',
          error: err
        });
      }

      res.status(200).json({
        message: 'Success',
        obj: messages
      });
    });
});

router.use('/', function (req, res, next) {
  jwt.verify(req.query.token, 'secret', function(err, decoded) {
    if (err) {
      return res.status(401).json({
        title: 'Not authenticated',
        error: {message: 'User must be authenticated'}
      });
    }

    next();
  });
});

router.post('/', function (req, res, next) {
  var decoded = jwt.decode(req.query.token);
  User.findById(decoded.user._id, function(err, user) {
    var message = new Message({
      content: req.body.content,
      user: user
    });
    message.save(function(err, result) {
      if (err) {
        return res.status(500).json({
          title: 'An error occurred',
          error: err
        });
      }

      user.messages.push(result);
      user.save();

      res.status(201).json({
        message: 'Saved message',
        obj: result
      });
    });
  });
});

router.patch('/:id', function(req, res, next) {
  var decoded = jwt.decode(req.query.token);
  Message.findById(req.params.id, function (err, message) {
    if (message.user != decoded.user._id) {
      return res.status(401).json({
        title: 'Not authenticated',
        error: {message: 'Users do not match'}
      });
    }

    if (err) {
      return res.status(500).json({
        title: 'An error occurred',
        error: err
      });
    }

    if (!message) {
      return res.status(500).json({
        title: 'No message found!',
        error: {message: 'Message not found'}
      });
    }

    message.content = req.body.content;
    message.save(function(err, result) {
      if (err) {
        return res.status(500).json({
          title: 'An error occurred',
          error: err
        });
      }
      
      res.status(200).json({
        message: 'Updated message',
        obj: result
      });
    });
  });
});

router.delete('/:id', function(req, res, next) {
  var decoded = jwt.decode(req.query.token);
  Message.findById(req.params.id, function (err, message) {
    if (message.user != decoded.user._id) {
      return res.status(401).json({
        title: 'Not authenticated',
        error: {message: 'Users do not match'}
      });
    }

    if (err) {
      return res.status(500).json({
        title: 'An error occurred',
        error: err
      });
    }

    if (!message) {
      return res.status(500).json({
        title: 'No message found!',
        error: {message: 'Message not found'}
      });
    }

    message.remove(function(err, result) {
      if (err) {
        return res.status(500).json({
          title: 'An error occurred',
          error: err
        });
      }

      res.status(200).json({
        message: 'Deleted message',
        obj: result
      });
    });
  });
});

module.exports = router;
