const projects = require('../models/Project');
const user = require('../models/User');
const bids = require('../models/Bid');
// check i f i need to valiada teh usein every rqust
const seedDB = require('../seed/user_dummy');

// this will b e for the freelancer dashboard scrren
// it will display the relevant projects
const DashboardProjects = async (req, res) => {


    // ------add user auth stuff
    // const userId= req.session.userId;
    // if (!user){
    //     res.status(400).json({message:"Error"})
    // }

    
    console.log("inserting in db  controllerdashboard")
    
    const tempUser = await user.findOne({ role: "freelancer" });
    const userId = tempUser._id;
    console.log(userId)
    console.log("runnign controllerdashboard")
    const userInfo = await user.findById(userId);
    console.log(userInfo)
    const usersSkills = userInfo.skills;
    console.log("users skills")
    console.log(usersSkills)

    const projectsToDisplay = await projects.find({ requiredSkills: usersSkills })

    // i thin this should work
    res.json(projectsToDisplay)

}

/// now designning the browins gscrreen
const SearchedProjects = async (req, res) => {
    const searchedStr  = req.query.skill;

    console.log(searchedStr)
    const projectsToDisplay = await projects.find({ requiredSkills: searchedStr })
    console.log(projectsToDisplay)
    res.json(projectsToDisplay);
}

const ProjectDetails = async (req, res) => {
    console.log("inside deatils")
    selectedProj = req.params.id;
    console.log("id")
   

    console.log(selectedProj)
    const projectDetails = await projects.findById(selectedProj)
    console.log(projectDetails)
    res.json(projectDetails)
}

const placeBid = async (req, res) => {
    selectedProj = req.body.project;
    price = req.body.price;
    bids.insertOne({
        project: selectedProj,
        proposedPrice: price
    })

    res.status(200);
}

const viewBids = async (req, res) => {
    const allBids = await bids.find();
    res.send(allBids)
}

module.exports = {
    DashboardProjects,
    SearchedProjects,
    ProjectDetails,
    placeBid,
    viewBids
};