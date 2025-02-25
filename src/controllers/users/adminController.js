import User from "../../models/users/User.js"
// import healthWorkerProfile from "../../models/users/healthWorkerProfile.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"

dotenv.config();

export const makeAdmin = async(req, res) =>{
    try {
        const {userId} = req.user;
        let userInfo = await User.findByPk(userId);
        if (!userInfo) {
            return res.status(404).json({
                message: ` User not found in the database`
            })
        }
        userInfo.isAdmin = true;
        userInfo.role = `admin`;
        await userInfo.save();

        res.status(200).json({
            info: ` Congratulations! ${userInfo.firstName}, You are now an admin`,
            userInfo
        })
        
    } catch (error) {
        res.status(500).json({
            message: `Unable to make admin because: ${error.message}`
        })
    }
}

export const allUser = async(req, res) =>{
    try {
        const allUser = await User.findAll();
        if(!allUser <= 0) {
            return res.status(400).json({
                message: `oops! No user found in the database `
            })
        }
        const everyUsers = allUsers.map(user =>{
            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expires: "1 hour"});
            return {
                ...user.toObject(),
                token,
                isAdmin: user.role === 'admin' ? true : false
            }
        })
        return res.status(200).json({
            info: `All ${allUser.length} user in the database retrieved successfully`,
            users: everyUsers
        })
        
    } catch (error) {
        return res.status(500).json({
            message: `Cannot get all users in the database because ${error}`
        })
    }
}