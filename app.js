//Carregamento de modulos
const express = require("express");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");
const admin = require("./routes/admin");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const app = express();

//Config sessao
app.use(
  session({
    secret: "123abc",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

//Middleware, configuração de variaveis globais para mensagem de sucesso e erro
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

//Configs bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Config handlebars
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//Config mongoose
mongoose.Promise = global.Promise;
//mongoose.set("useUnifiedTopology", true);
mongoose
  .connect("mongodb://localhost/blogapp")
  .then(() => {
    console.log("Conectado ao mongo...");
  })
  .catch((err) => {
    console.log("Erro ao se conectar: " + err);
  });

//Public (passa o path da pasta com o css e javascript)
app.use(express.static(path.join(__dirname, "public")));

//Rotas
app.use("/admin", admin);

//Inicia o servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando...");
});
