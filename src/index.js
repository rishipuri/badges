// Config
require('dotenv').config();

// Packages
const finalhandler = require('finalhandler');
const Router = require('router');

const router = Router();

// Routes
const {topics} = require('./routes/til');

router.get('/til/topics', topics);

module.exports = (req, res) => {
  router(req, res, finalhandler(req, res));
}
