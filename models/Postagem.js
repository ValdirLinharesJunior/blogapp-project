//Modelo de postagens para gravar no banco
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Cria uma tabela de postagem
const Postagem = new Schema({
  titulo: {
    type: String,
    required: true,
  },

  slug: {
    type: String,
    required: true,
  },

  descricao: {
    type: String,
    required: true,
  },

  conteudo: {
    type: String,
    required: true,
  },

  categoria: {
    type: Schema.Types.ObjectId,
    ref: "categorias",
    required: true,
  },

  date: {
    type: Date,
    default: Date.now(),
  },
});

mongoose.model("postagens", Postagem);
