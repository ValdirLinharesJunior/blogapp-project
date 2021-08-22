//Carregamento de modulos
const express = require("express");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");
const admin = require("./routes/admin");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
require("./models/Postagem");
const Postagem = mongoose.model("postagens");
require("./models/Categoria");
const Categoria = mongoose.model("categorias");
const usuario = require("./routes/usuario");
const passport = require("passport");
require("./config/auth")(passport);
const app = express();

//Config sessao
app.use(
  session({
    secret: "123abc",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//Flash, para retorno e menssagens de alerta
app.use(flash());

//Middleware, configuração de variaveis globais para mensagem de sucesso e erro
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
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
mongoose.set("useUnifiedTopology", true);
mongoose
  .connect("mongodb://localhost/blogapp", { useNewUrlParser: true })
  .then(() => {
    console.log("Conectado ao mongo...");
  })
  .catch((err) => {
    console.log("Erro ao se conectar: " + err);
  });

//Public (passa o path da pasta com o css e javascript)
app.use(express.static(path.join(__dirname, "public")));

//Rota principal, carrega as postagens na home
app.get("/", (req, res) => {
  Postagem.find()
    .lean()
    .populate("categoria")
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("index", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/404");
    });
});

//Rota para a pagina de leitura da postagem
app.get("/postagem/:slug", (req, res) => {
  Postagem.findOne({ slug: req.params.slug })
    .lean()
    .then((postagem) => {
      if (postagem) {
        res.render("postagem/index", { postagem: postagem });
      } else {
        req.flash("error_msg", "Está postagem não existe");
        res.redirect("/");
      }
    })
    .catch(function (err) {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
    });
});

//Listagem de categorias
app.get("/categorias", function (req, res) {
  Categoria.find()
    .lean()
    .then(function (categorias) {
      res.render("categorias/index", { categorias: categorias });
    })
    .catch(function (err) {
      req.flash("error_msg", "Houve um erro interno ao listar as categorias");
      res.redirect("/");
    });
});

//Lista apenas os posts da categoria selecionada
app.get("/categorias/:slug", function (req, res) {
  Categoria.findOne({ slug: req.params.slug })
    .lean()
    .then(function (categoria) {
      if (categoria) {
        Postagem.find({ categoria: categoria._id })
          .lean()
          .then((postagens) => {
            res.render("categorias/postagens", { postagens: postagens, categoria: categoria });
          })
          .catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar os posts");
            res.redirect("/");
          });
      } else {
        req.flash("error_msg", "Está categoria não existe");
        res.redirect("/");
      }
    })
    .catch(function (err) {
      req.flash("error_msg", "Houve um erro interno ao carregar a pagina de categoria");
      res.redirect("/");
    });
});

//Rota de erro, carrega a pagina de erro
app.get("/404", (req, res) => {
  res.send("Erro 404!");
});

//Chama as rotas de admin e usuario
app.use("/admin", admin);
app.use("/usuario", usuario);

//Inicia o servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando...");
});
