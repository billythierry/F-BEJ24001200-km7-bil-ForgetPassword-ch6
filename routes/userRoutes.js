const express = require('express');
const UserControllers = require('../controllers/userControllers');
const router = express.Router();

router.get("/register", (req,res) => {
    res.render("register");
});
router.get("/login", (req,res) => {
    res.render("login");
});
router.get("/forgetPassword", (req,res) => {
    // const token = req.query.token;
    // if(!token){
    //     return res.status(400).json({message: "token is missing", error: "Unauthorized Access"});
    // };
    res.render("forgetPassword");
});
router.get("/resetPassword", (req,res) => {
    const token = req.query.token;
    if(!token){
        return res.status(400).json({message: "token is missing", error: "Unauthorized Access"});
    };
    res.render("resetPassword", {token});
});

router.post("/register", UserControllers.register);
router.post("/login", UserControllers.login);
router.post('/forgetPassword', UserControllers.forgetPassword);
router.post("/resetPassword", UserControllers.resetPassword);


module.exports = router;