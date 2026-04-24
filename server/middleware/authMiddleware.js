const jwt=require("jsonwebtoken");

const authMiddleware=(req,res,next)=>{
    try{
        const authHeader=req.headers.authorization;
        if(!authHeader){
            return res.status(401).json({
                message:"未提供 token",
            })
        }
        const token=authHeader.split(" ")[1];

        if(!token){
            return res.status(401).json({
                message:"token 格式错误",
            });
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        req.user=decoded;
        next();
    }catch(error){
        return res.status(401).json({
            message:"无效的 token 或 token 已过期",
            error:error.message,
        })
    }
}

module.exports=authMiddleware;