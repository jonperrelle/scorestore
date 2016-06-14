'use strict';

const path = require('path');
const router = require('express').Router();
const db = require(path.join(__dirname, '../../../db'));
const User = db.model('user');
const Address = db.model('address');
// const Composer = db.model('composer');
// const Genre = db.model('genre');
// const Photo = db.model('photo');

router.get('', function (req, res, next){
  return User.findAll({
    where: req.query
  })
  .then(function (users) {
    res.send(users);
  })
  .catch(next);
});

router.param('id', function (req, res, next, id) {
  return User.findOne({
    include: [Address],
    where:{
      id:id
    }
  })
  .then(function (user) {
    req.foundUser = user;
    next();
  })
  .catch(next);
});

router.post('/', function (req, res, next) {
  if (req.user) {
    if (req.user.isAdmin) {
      User.create(req.body)
      .then(function () {
        res.sendStatus(201);
      })
      .catch(next);
    } else {
      res.sendStatus(403);
    }
   } else {
    res.sendStatus(401);
  }
});

router.get('/:id', function (req, res, next) {
  res.send(req.foundUser);
});

router.delete('/:id', function (req, res, next) {
  if (req.user) {
    if (req.user.isAdmin) {
      req.foundUser.destroy()
      .then(function () {
        res.sendStatus(204);
      })
      .catch(next);
    } else {
      res.sendStatus(403);
    }
   } else {
    res.sendStatus(401);
  }
});

router.put('/:id', function (req, res, next) {
  if (req.user) {
    if (req.user.isAdmin) {
      req.foundUser.update(req.body)
      .then(function () {
        res.sendStatus(200);
      })
      .catch(next);
    } else {
      res.sendStatus(403);
    }
   } else {
    res.sendStatus(401);
  }
});

router.put('/myAccount/:id', function (req, res, next) {
  User.findOne({
    where:{
      id: req.params.id
    }
  })
  .then(function(user){
    user.update({firstName:req.body.firstName, lastName:req.body.lastName})
    .then(function(updatedUser){
      Address.findOne({
        where:{
          id: updatedUser.addressId
        }
      })
      .then(function(addressToUpdate){
        addressToUpdate.update(req.body);
      });
    });
  });
});


module.exports = router;