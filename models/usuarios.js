const moongose = require('mongoose')
const Schema = moongose.Schema

const Usuario = new Schema({
    nome :{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    senha :{
        type: String,
        required: true
    },
    eAdmin:{
        type: Number,
        default: 0
    }
})

moongose.model('usuarios', Usuario)