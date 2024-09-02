module.exports = func=>{
    return(req,res,next)=>{
        func(req,res,next).catch(next);    
    };
};

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}