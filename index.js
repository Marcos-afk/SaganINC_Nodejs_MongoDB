//módulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const moongose = require('mongoose')
const app = express()
const path = require('path')
const admin = require('./routes/admin')
const session = require('express-session')
const flash = require('connect-flash')
const moment = require('moment')
const usuario = require('./routes/usuarios')
const passport = require('passport')

require('./config/auth')(passport)

require('./models/postagem')
const Postagem = moongose.model('postagens')

require('./models/categorias')
const Categoria = moongose.model('categorias')

//configurações
app.use(session({
    secret: "3.14PI",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())


app.use(flash())
app.use((req, res, next)=>{
    res.locals.sucesso =  req.flash("sucesso")
    res.locals.fracasso = req.flash("fracasso")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null
    next()
})

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.engine('handlebars', handlebars({
    defaultLayout: 'main',
    helpers: {
        formatDate: (date) => {
             return moment(date).format('DD/MM/YYYY')
         }
        },
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        }

}))
app.set('view engine', 'handlebars')

//conexão com o banco de dados
moongose.Promise = global.Promise
moongose.set('useFindAndModify', false);
moongose.set('useCreateIndex', true);
moongose.connect('mongodb://localhost/SaganINC',{
    useNewUrlParser: true ,
    useUnifiedTopology: true
}).then(()=>{
    console.log('Conexão com o banco bem sucedida')
}).catch((erro)=>{
    console.log('Erro ao se conectar: ' + erro)
})

//arquivos estáticos css/js
app.use(express.static(path.join(__dirname,'public')))

//rotas
app.use('/admin',admin)
app.use('/usuarios', usuario)

app.get('/',(req,res)=>{
    Postagem.find().populate('categoria').sort({date:'desc'}).limit(5).then((postagens)=>{
        res.render('index', {postagens:postagens})

    }).catch((erro)=>{
        req.flash('fracasso' , 'Erro ao Carregar a página inicial')
        res.redirect('/404')
    })
})

app.get('/postagem/:slug', (req,res)=>{
    Postagem.findOne({slug: req.params.slug}).populate('categoria').then((postagem)=>{
        if(postagem){
            res.render('postagem/index',{postagem : postagem})
        }else{
            req.flash('fracasso' , 'Postagem não existe')
            res.redirect('/')

        }
    }).catch((erro)=>{
        req.flash('fracasso' , 'Erro interno, tente novamente mais tarde ' + erro)
        res.redirect('/')
    })

})

app.get('/categorias',(req,res)=>{
    if(req.user){
    Categoria.find().sort({date: 'desc'}).then((categorias)=>{
        res.render('categoria/index', {categorias:categorias})
    }).catch((erro) =>{
        req.flash('fracasso' , 'Erro interno , tente novamente mais tarde ' + erro)
        res.redirect('/')
    })
    }else{
        req.flash('fracasso' , 'Para acessar essa área faça login')
        res.redirect('/')
    }
})

app.get('/categorias/:slug' ,(req,res)=>{
    if(req.user){
    Categoria.findOne({slug : req.params.slug}).then((categoria)=>{
        if(categoria){
            Postagem.find({categoria : categoria._id}).then((postagens)=>{
                res.render('categoria/postagens', {postagens:postagens , categoria: categoria})
            }).catch((erro)=>{
                req.flash('fracasso' , 'Erro ao listar as postagens ' + erro)
                res.redirect('/')
            })
        }else{
            req.flash('fracasso' , 'Categoria não existe')
            res.redirect('/')

        }

    }).catch((erro)=>{
        req.flash('fracasso' , 'Erro interno , tente novamente mais tarde ' + erro)
        res.redirect('/')
    })
    }else{
        req.flash('fracasso' , 'Para acessar essa área faça login')
        res.redirect('/')
    }

})

app.get('/404',(req,res)=>{
    res.send('Erro 404')
})

//criando server
const PORT = 8081
app.listen(PORT,()=>{
    console.log('Servidor rodando , url : http://localhost:8081')
})


