const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

//Chama o model de categorias para uso de forma externa
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Postagem");
const Postagem = mongoose.model("postagens");

//Rota index
router.get("/", (req, res) => {
  res.render("admin/index");
});

//Rota categorias
router.get("/categorias", (req, res) => {
  //Busca as categorias no banco para listar no front
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

//Rota add-categorias
router.get("/categorias/addcategoria", (req, res) => {
  res.render("admin/addcategoria");
});

//Rota nova categoria (salva no banco)
router.post("/categorias/nova", (req, res) => {
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
    //Captura os dados vindos do form e salva no banco
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

//Rota de edição de categorias (busca os dados da categoria que será editada)
router.get("/categorias/edit/:id", (req, res) => {
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
router.post("/categorias/edit", (req, res) => {
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

//Deletar uma categoria
router.post("/categorias/deletar", (req, res) => {
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

//Rota para renderizar as postagens****************************************************************************
router.get("/postagens", (req, res) => {
  res.render("admin/postagens");
});

//Carrega a lista de categorias na pagina de adição de postagens
router.get("/postagens/addpostagem", (req, res) => {
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

//Rota nova postagem (salva no banco)
router.post("/postagens/nova", (req, res) => {
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

    //Adiciona no banco
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

module.exports = router;
