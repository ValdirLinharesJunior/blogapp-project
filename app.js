//Carregamento de modulos
const express = require("express");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");
const admin = require("./routes/admin");
const path = require("path");
const app = express();

//Configs bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Config Handlebars
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//Config mongoose

//Public
app.use(express.static(path.join(__dirname, "public")));

//Rotas
app.use("/admin", admin);

//Inicia o servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando...");
});
