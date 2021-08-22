const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
const bcrypt = require("bcryptjs");
const passport = require("passport");

//Rota para o form de cadastro de usuário
router.get("/registro", function (req, res) {
  res.render("usuarios/registro");
});

//Rota para gravar usuario no banco de dados
router.post("/registro", function (req, res) {
  var erros = [];

  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
    erros.push({ texto: "Nome inválido" });
  }

  if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
    erros.push({ texto: "E-mail inválido" });
  }

  if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
    erros.push({ texto: "Senha inválida" });
  }

  if (req.body.senha.length < 4) {
    erros.push({ texto: "A senha precisa ter pelo menos 4 caracteres" });
  }

  if (req.body.senha != req.body.senha2) {
    erros.push({ texto: "As senhas não são iguais" });
  }

  if (erros.length > 0) {
    res.render("usuarios/registro", { erros: erros });
    //
  } else {
    //
    Usuario.findOne({ email: req.body.email })
      .then(function (usuario) {
        //
        if (usuario) {
          //
          req.flash("error_msg", "Esse usuário já está cadastrado");
          res.redirect("/usuario/registro");
          //
        } else {
          //Cria um usuario para gravar no banco
          const novoUsuario = new Usuario({
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha,
          });

          bcrypt.genSalt(10, function (erro, salt) {
            bcrypt.hash(novoUsuario.senha, salt, function (erro, hash) {
              if (erro) {
                req.flash("error_msg", "Houve um erro ao salvar o usuário");
                res.redirect("/");
              }

              novoUsuario.senha = hash;

              novoUsuario
                .save()
                .then(function () {
                  req.flash("success_msg", "Usuário criado com sucesso!");
                  res.redirect("/");
                })
                .catch(function (err) {
                  req.flash("error_msg", "Houve um erro ao cadastrar o usuário");
                  res.redirect("/usuario/registro");
                });
            });
          });
        }
      })
      .catch(function (err) {
        req.flash("error_msg", "Houve um erro interno");
        res.redirect("/");
      });
  }
});

//Rota de login de usuario
router.get("/login", function (req, res) {
  res.render("usuarios/login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/usuario/login",
    failureFlash: true,
  })(req, res, next);
});

//Rota de logout
router.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "Deslogado com sucesso!");
  res.redirect("/");
});

module.exports = router;
