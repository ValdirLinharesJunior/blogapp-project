const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

//Chama os models
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Postagem");
const Postagem = mongoose.model("postagens");
//Pega os dados para validar se o usuario é admin
const { eAdmin } = require("../helpers/eAdmin");

//Rota index
router.get("/", eAdmin, (req, res) => {
  res.render("admin/index");
});

//Lista categorias na pagina de categorias somente se o usuario for admin
router.get("/categorias", eAdmin, (req, res) => {
  //Busca as categorias no banco para listar
  Categoria.find()
    .lean()
    .sort({ data: "asc" })
    .then((categorias) => {
      res.render("admin/categorias", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias");
      res.redirect("/admin");
    });
});

//Carrega a pagina de adição de categorias
router.get("/categorias/addcategoria", eAdmin, (req, res) => {
  res.render("admin/addcategoria");
});

//Salva nova categoria no banco
router.post("/categorias/nova", eAdmin, (req, res) => {
  //Fazer validação do form
  var erros = [];

  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
    erros.push({ texto: "Nome inválido" });
  }

  if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
    erros.push({ texto: "Slug inválido" });
  }

  if (req.body.nome.length < 2) {
    erros.push({ texto: "O nome deve ter mais que dois caracteres" });
  }

  if (erros.length > 0) {
    res.render("admin/addcategoria", { erros: erros });
  } else {
    //Captura os dados vindos do form para salvar no banco
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug,
    };

    //Adiciona no banco
    new Categoria(novaCategoria)
      .save()
      .then(() => {
        req.flash("success_msg", "Categoria criada com sucesso!");
        res.redirect("/admin/categorias");
      })
      .catch((err) => {
        req.flash("error_msg", "Erro ao salvar a categoria!");
        res.redirect("/admin");
      });
  }
});

//Busca uma categoria para edição
router.get("/categorias/edit/:id", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.params.id })
    .lean()
    .then((categoria) => {
      res.render("admin/editcategorias", { categoria: categoria });
    })
    .catch((err) => {
      req.flash("error_msg", "Esta categoria não existe");
      res.redirect("/admin/categorias");
    });
});

//Envia a edição para o banco
router.post("/categorias/edit", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.body.id })
    .then((categoria) => {
      //Captura os dados para edição
      categoria.nome = req.body.nome;
      categoria.slug = req.body.slug;

      categoria
        .save()
        .then(() => {
          req.flash("success_msg", "Categoria editada com sucesso!");
          res.redirect("/admin/categorias");
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro interno ai salvar a edição");
          res.redirect("/admin/categorias");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao editar a categoria");
      res.redirect("/admin/categorias");
    });
});

//Deleta uma categoria
router.post("/categorias/deletar", eAdmin, (req, res) => {
  Categoria.remove({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Categoria deletada com sucesso!");
      res.redirect("/admin/categorias");
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao deletar a categoria...");
      res.redirect("/admin/categorias");
    });
});

//Carrega a lista de postagens na pagina de postagens
router.get("/postagens", eAdmin, (req, res) => {
  Postagem.find()
    .lean()
    .populate("categoria")
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("admin/postagens", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as postagens");
      res.redirect("/admin");
    });
});

//Carrega a lista de categorias na pagina de adição de postagens
router.get("/postagens/addpostagem", eAdmin, (req, res) => {
  Categoria.find()
    .lean()
    .then((categorias) => {
      res.render("admin/addpostagem", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao carregar o formulário...");
      res.redirect("/admin");
    });
});

//Adiciona nova postagem no bando
router.post("/postagens/nova", eAdmin, (req, res) => {
  //Fazer validação do form
  var erros = [];

  if (req.body.categoria == "0") {
    erros.push({ texto: "Categoria invalida, registre uma categoria" });
  }

  if (erros.length > 0) {
    res.render("admin/addpostagem", { erros: erros });
  } else {
    const novaPostagem = {
      titulo: req.body.titulo,
      slug: req.body.slug,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
    };

    //Salva no banco
    new Postagem(novaPostagem)
      .save()
      .then(() => {
        req.flash("success_msg", "Postagem criada com sucesso!");
        res.redirect("/admin/postagens");
      })
      .catch((err) => {
        req.flash("error_msg", "Erro ao salvar a postagem!");
        res.redirect("/admin/postagens");
      });
  }
});

//Carrega formulário para edição de postagem
router.get("/postagens/edit/:id", eAdmin, (req, res) => {
  Postagem.findOne({ _id: req.params.id })
    .lean()
    .then((postagem) => {
      Categoria.find()
        .lean()
        .then((categorias) => {
          res.render("admin/editpostagens", { categorias: categorias, postagem: postagem });
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro ao listar as categorias");
          res.redirect("/admin/postagens");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao carregar o formulário");
      res.redirect("/admin/postagens");
    });
});

//Envia edição de postagem para o banco
router.post("/postagens/edit", eAdmin, (req, res) => {
  Postagem.findOne({ _id: req.body.id })
    .then((postagem) => {
      postagem.titulo = req.body.titulo;
      postagem.slug = req.body.slug;
      postagem.descricao = req.body.descricao;
      postagem.conteudo = req.body.conteudo;
      postagem.categoria = req.body.categoria;

      postagem
        .save()
        .then(() => {
          req.flash("success_msg", "Postagem editada com sucesso!");
          res.redirect("/admin/postagens");
        })
        .catch((err) => {
          req.flash("error_msg", "Erro interno");
          res.redirect("/admin/postagens");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao salvar a edição");
      res.redirect("/admin/postagens");
    });
});

//Deleta postagem
router.get("/postagens/deletar/:id", eAdmin, (req, res) => {
  Postagem.remove({ _id: req.params.id })
    .then(() => {
      req.flash("success_msg", "Postagem deletada com sucesso!");
      res.redirect("/admin/postagens");
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/admin/postagens");
    });
});

module.exports = router;
