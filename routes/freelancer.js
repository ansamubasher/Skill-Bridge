const express = require('express');
const router = express.Router();

const freelancerController = require('../controllers/freelancerController');
const { authenticateToken } = require("../midllewares/authMiddleware.js");
// routers to be used
console.log("about to run route dashboard");
 
router.get('/dashboard', authenticateToken, freelancerController.DashboardProjects);
router.get('/searched',authenticateToken,  freelancerController.SearchedProjects);
router.get('/details/:id', authenticateToken, freelancerController.ProjectDetails);
router.post('/bid',authenticateToken,  freelancerController.placeBid);
router.get('/viewBids',authenticateToken,  freelancerController.viewBids);
 
module.exports = router;