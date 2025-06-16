const User=require('../models/user');

module.exports.registerForm=(req,res)=>{
  res.render('users/register');
}

module.exports.registerPost=async(req,res,next)=>{
  try{
    const {username,email,password}=req.body;
    const user=new User({username,email});
    const registeredUSER=await User.register(user,password);
    req.login(registeredUSER,err=>{
      if(err) return next(err);
      req.flash('success','Welcome!!!');
      res.redirect('/campgrounds');
    })
  } catch(e){
    req.flash('error', e.message);
    res.redirect('/register');
  }
}

module.exports.loginForm=(req,res)=>{
  res.render('users/login');
}

module.exports.loginPost=(req,res)=>{
  const redirectUrl = res.locals.returnTo || '/campgrounds';
  req.flash('success','Successfully loged in!!');
  res.redirect(redirectUrl);
}

module.exports.logout=(req,res)=>{
  req.logout(function(err){
    if(err)return next(err);
    req.flash('success','successfully logged out!!');
    res.redirect('/campgrounds');
  })
}