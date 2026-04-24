const express =require("express")
const cors=require("cors");
require("dotenv").config();
const db=require("./config/db")
const userRoutes=require("./routes/userRoutes");
const path=require("path")

const app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/uploads",express.static(path.join(__dirname,"uploads")))

app.use("/api/users",userRoutes);

app.get("/",(req,res)=>{
    res.send("good")
})

app.get("/test-db",(req,res)=>{
    db.query("SELECT 1",(err,results)=>{
        if(err){
            return res.status(500).json({message:"db faliue",error:err.message}
                
            )
        }
        res.json({message:"数据库连接成功",results});
    })
})

const PORT=process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`server is running at http://localhost:${PORT}`);
})