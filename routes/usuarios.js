const { Router } = require('express')
const express = require('express')
const router = express.Router()
const moongose = require('mongoose')
require('../models/usuarios')
const Usuario = moongose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require('passport')


router.get('/registro', (req,res)=>{
    if(req.user){
        req.flash("fracasso", "Operação inválida para a situação atual!");
        res.redirect("/");
    }else{
    res.render('usuario/registro')
    }
})


router.post('/registro/novo', (req,res)=>{
    let erros = []
    
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null ){
        erros.push({
            text: "Campo nome vázio"
        })
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null ){
        erros.push({
            text: "Campo email vázio"
        })
    }

    if(!req.body.senha|| typeof req.body.senha == undefined || req.body.senha == null ){
        erros.push({
            text: "Campo senha vázio"
        })
    }

    if(req.body.senha.length < 8 ){
        erros.push({
            text: "Senha muito curta"
        })
    }

    if(req.body.senha != req.body.senha2 ){
        erros.push({
            text: "Senhas diferentes"
        })
    }

    if(erros.length > 0){

        res.render('usuario/registro', {erros: erros})

    }else{
        Usuario.findOne({email : req.body.email}).then((usuario)=>{
            if(usuario){
                req.flash('fracasso' , 'Email já existe no sistema')
                res.redirect('/usuarios/registro')

            }else{
                 
                const NovoUsuario = new Usuario({
                    
                    nome : req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10 , (error , salt)=>{
                    bcrypt.hash(NovoUsuario.senha, salt, (error , hash)=>{
                        if(error){
                            req.flash('fracasso' , 'Erro ao salvar Usuário')
                            res.redirect('/')

                        }else{
                            NovoUsuario.senha = hash
                            NovoUsuario.save().then(()=>{
                                req.flash('sucesso' , 'Usuário salvo com sucesso')
                                res.redirect('/')

                            }).catch((error)=>{
                                req.flash('fracasso', 'Erro ao salvar usuário : ' + error)
                                res.redirect('/')
                            })
                        }
                    })
                })


            }
        }).catch((error)=>{
            req.flash('fracasso' , 'Erro interno ' + error)
            res.redirect('/')
        })
    }

})


router.get('/login', (req,res)=>{
    if(req.user){
        req.flash("fracasso", "Você já esta logado!");
        res.redirect("/");
    }else{
    res.render('usuario/login')
    }
})

router.post('/login/novo' , ( req, res, next)=>{

    passport.authenticate('local' , {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)

})

router.get('/logout', (req,res)=>{
    req.logout()
    req.flash('sucesso', 'Até mais, volte sempre!')
    res.redirect('/')
})


module.exports = router
