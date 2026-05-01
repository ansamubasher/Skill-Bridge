const projects = require('../models/Project');
const user = require('../models/User');
const bids = require('../models/Bid');
// check i f i need to valiada teh usein every rqust
const seedDB = require('../seed/user_dummy');

// this will be for the freelancer dashboard scrren
// it will display the relevant projects
const DashboardProjects = async (req, res) => {


    // ------add user auth stuff
    // const userId= req.session.userId;
    // if (!user){
    //     res.status(400).json({message:"Error"})
    // }

    // wha tim trying to do 
    // - do  i need to find the user ?
    // - i think the userId u got above kinda helps u get the userID
    // - now i wanna get the proejcts - and the fileter will be
    // - filter will be  requiredSkills = user.skills
    // dont we als oneed to get the users skills - eys we do
    
    console.log("inserting in db  controllerdashboard")
    
    const tempUser = await user.findOne({ role: "freelancer" });
    const userId = tempUser._id;
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
    searchedStr = req.params;
    const projectsToDisplay = await projects.find({ requiredSkills: searchedStr })
    res.json(projectsToDisplay);
}

const ProjectDetails = async (req, res) => {
    selectedProj = req.query;
    const projectDetails = await projects.find({ title: selectedProj })
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