function isAuth(req,res,next){
    if (req.cookies.loggedIn){
        next();
    } else {
        res.redirect('/login');
    }
  }

  module.exports = { isAuth }