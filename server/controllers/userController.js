const db=require("../config/db");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken")

const registerUser=async(req,res)=>{
    try{
        const{username,password,nickname,email}=req.body;
        if(!username||!password){
            return res.status(400).json({
                message:"用户名和密码不能为空",
            });
        }
        const checkSql="SELECT * FROM users where username=?";
        db.query(checkSql,[username],async(err,results)=>{
            if(err){
                return res.status(500).json({
                    message:"查询失败",
                    error:err.message,
                })
            }

            if(results.length>0){
                return res.status(400).json({
                    message:"用户名已存在",
                    
                });
            }

            const hashedPassword=await bcrypt.hash(password,10);

            const insertSql="INSERT INTO users(username,password,nickname,email) VALUES(?,?,?,?)";
            db.query(insertSql,[username,hashedPassword,nickname||null,email||null],
                (err,result)=>{
                    if(err){
                        return res.status(500).json({
                            message:"注册失败",
                            error:err.message,
                        });
                    }
                    res.status(201).json({
                        message:"注册成功",
                        userId:result.insertId,
                    });
                }
            )
        })
    }catch(error){
        res.status(500).json({
            message:"服务器错误",
            error:error.message,
        });
    }
}

const loginUser=(req,res)=>{
    try{
        const { username,password }=req.body;

        if(!username||!password){
            return res.status(400).json({
                message:"用户名和密码不能为空"
            });
        }

        const sql="SELECT * FROM users WHERE username=?";
        db.query(sql,[username],async(err,results)=>{
            if(err){
                return res.status(500).json({
                    message:"查询失败",
                    error:err.message,
                })
            }

            if(results.length===0){
                return res.status(400).json({
                    message:"用户不存在"
                })
            }

            const user=results[0];

            const isMatch=await bcrypt.compare(password,user.password);
            if(!isMatch){
                return res.status(400).json({
                    message:"密码错误",
                });
            }

            const token=jwt.sign(
                {
                    id:user.id,
                    username:user.username,

                },
                process.env.JWT_SECRET,
                {
                    expiresIn:"7d",
                }
            );
            res.json({
                message:"登录成功",
                token,
                user:{
                    id:user.id,
                    username:user.username,
                    nickname: user.nickname,
          email: user.email,
          avatar: user.avatar,
                }
            })
        })

    }catch(error){
        res.staus(500).json({
            message:"服务器错误",
            error:error.message,
        })
    }
}

const getUserProfile=(req,res)=>{
    try{
        const userId=req.user.id;
        const sql="SELECT id, username, nickname, email, avatar, created_at, updated_at FROM users WHERE id = ?";
        db.query(sql,[userId],(err,results)=>{
            if(err){
                return res.status(500).json({
                    message:"查询用户信息失败",
                    error:err.message,
                })
            }

            if(results.length===0){
                return res.status(404).json({
                    message:"用户不存在",
                })
            }

            res.json({
                message:"获取用户信息成功",
                user:results[0],
            })
        })
    }catch(error){
        res.status(500).json({

            message:"服务器错误",
            error:error.message,
        })
    }
}

const changePassword=(req,res)=>{
    try{
        const userId=req.user.id
        const {oldPassword,newPassword,confirmPassword}=req.body

        if(!oldPassword||!newPassword||!confirmPassword){
            return res.status(400).json({
                message:"旧密码、新密码、确认密码都不能为空",
            })
        }

        if(newPassword.length<6){
            return res.status(400).json({
                message:"新密码长度不能少于 6 位",
            })
        }

        if(newPassword!==confirmPassword){
            return res.status(400).json({
                message:"两次输入的新密码不一致",
            })
        }

        const sql="SELECT * FROM users WHERE id = ?"
        db.query(sql,[userId],async(err,results)=>{
            if(err){
                return res.status(500).json({
                    message:"查询用户失败",
                    error:err.message,
                })
            }

            if(results.length===0){
                return res.status(404).json({
                    message:"用户不存在",
                })
            }

            const user=results[0]

            const isMatch=await bcrypt.compare(oldPassword,user.password)
            if(!isMatch){
                return res.status(400).json({
                     message: "旧密码错误",
                })
            }

            const isSamePassword=await bcrypt.compare(newPassword,user.password)
            if(isSamePassword){
                return res.status(400).json({
                    message:"新密码不能和旧密码相同",
                })
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10)

            const updateSql="UPDATE users SET password= ? WHERE id= ?"
            db.query(updateSql,[hashedPassword,userId],(err,result)=>{
                if(err){
                    return res.status(500).json({
                        message: "修改密码失败",
                        error:err.message,
                    })
                }

                res.json({
                    message:"密码修改成功，请重新登录",
                })
            })
        })
        }catch(error){
            res.status(500).json({
                message: "服务器错误",
                error:error.message,
            })
    }
}

const updateUserProfile = (req, res) => {
  try {
    const userId = req.user.id;
    const { nickname, email, avatar } = req.body;

    const sql =
      "UPDATE users SET nickname = ?, email = ?, avatar = ? WHERE id = ?";

    db.query(sql, [nickname || null, email || null, avatar || null, userId], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "更新用户信息失败",
          error: err.message,
        });
      }

      res.json({
        message: "用户信息更新成功",
      });
    });
  } catch (error) {
    res.status(500).json({
      message: "服务器错误",
      error: error.message,
    });
  }
};

const uploadAvatar=(req,res)=>{
    try{
        if(!req.file){
            return res.status(400).json({
                message:"请先选择图片"
            })
        }

        const avatarUrl = `/uploads/${req.file.filename}`
        res.json({
            message:"头像上传成功",
            avatarUrl
        })
    }catch(error){
        res.status(500).json({
            message:"头像上传失败",
            error: error.message,
        })
    }
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadAvatar,
};