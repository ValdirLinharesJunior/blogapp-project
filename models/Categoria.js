//Modelo de categoria para gravar no banco
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Cria uma tabela de categoria
const Categoria = new Schema({
  nome: {
    type: String,
    required: true,
  },

  slug: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now(),
  },
});

mongoose.model("categorias", Categoria);
