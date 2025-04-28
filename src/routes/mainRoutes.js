const express = require("express");
const router = express.Router();
const controller = require("../controllers/mainController");

router.get("/", controller.index);
router.post("/contact", controller.sendContact);
// rutas de login y logout
router.get("/login", controller.login);
router.post("/login-submit", controller.loginSubmit);
router.get("/logout", controller.logout);

module.exports = router;