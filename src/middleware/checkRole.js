import User from "../models/users/User.js";
import healthWorkerProfile from "../models/users/healthWorkerProfile.js"

export const checkRole = async (req, res, next) => {
    try {
        // Assuming user ID is available in the request
        const userId = req.user.id; 
        
        // Find the user by ID
        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user is a health worker
        if (user.role === 'health_worker') {
            // Check if the health worker has a professional profile
            const profile = await healthWorkerProfile.findOne({ where: { userId } });
            
            if (!profile) {
                return res.status(403).json({ message: 'Health worker must create a professional profile' });
            }
        }
        
        next(); // Proceed to the next middleware or route
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
