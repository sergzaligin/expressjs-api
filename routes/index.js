const express = require('express');
const router = express.Router();

const passport = require('passport');

/* GET home page. */
router.get('/', passport.authenticate('jwt', { session: false}), function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
