const express = require('express');
const env = require('../config/env.json');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Live Balls' });
});

router.get('/getEnv', (req, res) => {
  const envData = env[process.env.NODE_ENV || 'development'];
  res.json(envData);
});

module.exports = router;
