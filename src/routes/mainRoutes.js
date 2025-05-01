const express = require("express");
const router = express.Router();
const controller = require("../controllers/mainController");

router.get("/", controller.index);
router.post("/contact", controller.sendContact);
router.get("/contact-success", controller.contactSuccess);

module.exports = router;