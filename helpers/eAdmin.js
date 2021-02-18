module.exports = {

    eAdmin: function(req, res, next){

        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next()
        }

        req.flash('fracasso' , ' Você precisa ser Admin para entrar!')
        res.redirect('/')

    }

}