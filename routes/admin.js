const express = require('express')
const router = express.Router()
const moongose = require('mongoose')
require('../models/categorias')
require('../models/postagem')
const Categoria = moongose.model('categorias')
const Postagem = moongose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin')



router.get('/' , eAdmin,(req,res)=>{
    res.render('admin/index')
})

router.get('/postagens', eAdmin,(req,res)=>{
    Postagem.find().populate('categoria').sort({date: 'desc'}).then((postagens)=>{
        res.render('admin/postagens', {postagens : postagens})
    }).catch((error)=>{
            req.flash('fracasso' , 'Erro ao listar as postagens')
            res.redirect('/admin')

        })

    })

router.get('/postagens/adicionar', eAdmin,(req,res)=>{
    Categoria.find().sort({date: 'desc'}).then((categorias)=>{
        res.render('admin/addpostagens', {categorias: categorias})
    }).catch((erro)=>{
        req.flash('fracasso', 'Erro ao carregar o formulário : ' + erro)
        res.redirect('/admin/postagens')

    })
})

router.post('/postagens/nova', eAdmin,(req,res)=>{
    let erros = []
    
    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null ){
        erros.push({
            text: "Titulo inválido da postagem"
        })
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null ){
        erros.push({
            text: "Slug inválido da postagem"
        })
    }

    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null ){
        erros.push({
            text: "Descrição inválida da postagem"
        })
    }

    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null ){
        erros.push({
            text: "Conteúdo inválido da postagem"
        })
    }

    if(req.body.categoria == "0"){
        erros.push({
            text: "Categoria inválida"
        })
    }

    if(erros.length > 0){
        Categoria.find().sort({date: 'desc'}).then((categorias)=>{
            res.render('admin/addpostagens', {erros:erros, categorias:categorias})
        })

    }else{

        const NovaPostagem = {
            titulo : req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(NovaPostagem).save().then(()=>{
            req.flash('sucesso' , 'Postagem criada com sucesso')
            res.redirect('/admin/postagens')
        }).catch((error)=>{
            req.flash('fracasso', 'Erro ao criar Postagem : ' + error)
            res.redirect('/admin/postagens')
        })
        
    }
    
})

router.get('/postagens/editar/:id', eAdmin, (req,res)=>{
    Postagem.findOne({_id: req.params.id}).then((postagem)=>{
        Categoria.find().sort({date : 'desc'}).then((categorias)=>{
            res.render('admin/editarpostagens',{postagem: postagem , categorias: categorias})
        }).catch((error)=>{
            req.flash('fracasso' , 'Erro ao listar as categorias')
            res.redirect('/admin/postagens')
        })
    }).catch((error)=>{
        req.flash('fracasso' , 'Erro ao editar categoria as categorias')
        res.redirect('/admin/postagens')
    })
})


router.post('/postagens/edit', eAdmin,(req,res)=>{
    Postagem.findOne({_id : req.body.id}).then((postagem)=>{
        let erros = []
    
        if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null ){
            erros.push({
            text: "Titulo inválido da postagem"
        })
        }

        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null ){
            erros.push({
            text: "Slug inválido da postagem"
        })
        }

        if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null ){
            erros.push({
            text: "Descrição inválida da postagem"
        })
        }

        if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null ){
            erros.push({
            text: "Conteúdo inválido da postagem"
        })
        }

        if(req.body.categoria == "0"){
            erros.push({
            text: "Categoria inválida"
        })
        }

        if(erros.length > 0){
            Categoria.find().sort({date: 'desc'}).then((categorias)=>{
                res.render('admin/editarpostagens', {erros:erros, categorias:categorias , postagem : postagem})
        })
    }else{
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash('sucesso' , 'Postagem editada com sucesso')
            res.redirect('/admin/postagens')

        }).catch((erro) =>{
            req.flash('fracasso', 'Erro ao editar postagem : ' + erro)
        res.redirect('/admin/postagens')
        })
    }
         
    }).catch((error)=>{
        req.flash('fracasso' , 'Erro ao editar categoria')
        res.redirect('/admin/postagens')

    })

})

router.post('/postagens/excluir', eAdmin,(req,res)=>{
    Postagem.deleteOne({_id: req.body.id}).then(()=>{
        req.flash('sucesso' , 'Postagem excluida com sucesso')
        res.redirect('/admin/postagens')

    }).catch((erro)=>{
        req.flash('fracasso', 'Erro ao excluir postagem : ' + erro)
        res.redirect('/admin/postagens')

    })
})



router.get('/categorias', eAdmin,(req,res)=>{
    Categoria.find().sort({date : 'desc'}).then((categorias)=>{
        res.render('admin/categorias', {categorias: categorias})
    }).catch((error)=>{
        req.flash('fracasso' , 'Erro ao listar as categorias')
        res.redirect('/admin')
    })
    
})

router.get('/categorias/adicionar', eAdmin, (req,res)=>{
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', eAdmin, (req,res)=>{
    let erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({
            text: "Nome inválido da categoria"
        })
    }
    
    if(req.body.nome.length < 2){
        erros.push({
            text: "Nome da categoria muito pequeno"
        })
    }
     
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({
            text: "Nome do slug inválido"
        })
    }

    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    }else{

    const NovaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
    }


    new Categoria(NovaCategoria).save().then(()=>{
        req.flash('sucesso' , 'Categoria criada com sucesso')
        res.redirect('/admin/categorias')
    }).catch((error)=>{
        req.flash('fracasso', 'Erro ao criar categoria : ' + error)
       res.redirect('/admin/categorias')
    })
    }
})

router.get('/categorias/edit/:id', eAdmin, (req, res)=>{
    Categoria.findOne({_id: req.params.id}).then((categoria)=>{
    res.render('admin/editarcategoria', {categoria : categoria})
    }).catch((erro)=>{
        req.flash('fracasso', 'Erro ao encontrar categoria : ' + erro)
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/editar', eAdmin, (req,res)=>{
    Categoria.findOne({_id:req.body.id}).then((categoria)=>{
        let erros = []
        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({
                text: "Nome inválido da categoria"
            })
        }
        
        if(req.body.nome.length < 2){
            erros.push({
                text: "Nome da categoria muito pequeno"
            })
        }
        
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({
                text: "Nome do slug inválido"
            })
        }

        if(erros.length > 0){
            res.render('admin/editarcategoria',{categoria:categoria, erros:erros})
        }else{
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(()=>{
            req.flash('sucesso' , 'Categoria editada com sucesso')
            res.redirect('/admin/categorias')

        }).catch((erro) =>{
            req.flash('fracasso', 'Erro ao editar categoria : ' + erro)
        res.redirect('/admin/categorias')
        })
    }
    }).catch((erro)=>{
        req.flash('fracasso', 'Erro ao editar categoria : ' + erro)
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/excluir', eAdmin,(req, res)=>{
    Categoria.deleteOne({_id : req.body.id}).then(()=>{
        req.flash('sucesso' , 'Categoria excluida com sucesso')
        res.redirect('/admin/categorias')

    }).catch((erro)=>{
        req.flash('fracasso', 'Erro ao excluir categoria : ' + erro)
        res.redirect('/admin/categorias')
    })

})



module.exports = router
