function isAuth(req,res,next){
    if (!req.user){
        return res.redirect('/login')
    } 
    next();
  }

  module.exports = { isAuth }