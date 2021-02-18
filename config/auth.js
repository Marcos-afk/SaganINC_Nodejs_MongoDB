const local = require('passport-local').Strategy
const moongose = require('mongoose')
const bcrypt = require('bcryptjs')

require('../models/usuarios')
const Usuario = moongose.model('usuarios')

module.exports = function(passport){
    passport.use(new local({usernameField: 'email', passwordField: 'senha'}, (email,senha,done)=>{
        Usuario.findOne({email: email}).then((usuario)=>{
            if(!usuario){
                return done(null, false, {message: 'Conta não encontrada no sistema, verifique os dados inseridos'})
            }

            bcrypt.compare(senha, usuario.senha , (error, batem)=>{

                if(batem){
                    
                    return done(null, usuario)
                }else{
                    return done(null, false, {message: 'Senha incorreta'})
                }
            })

        }).catch((error)=>{
            req.flash('fracasso' , 'Erro interno ' + error)
            res.redirect('/')
        })
    }))

    passport.serializeUser((user,done)=>{
        
        done(null, user._id)
    })

    passport.deserializeUser((id, done)=>{
        Usuario.findById(id, (err, user) => {
            done(err, user)
        })

    })
}