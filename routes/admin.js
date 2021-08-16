const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("admin/index");
});

router.get("/categorias", (req, res) => {
  res.render("admin/categorias");
});

router.get("/categorias/add-ategorias", (req, res) => {
  res.render("admin/add-ategorias");
});

module.exports = router;
