"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const registerController_1 = require("../controllers/registerController");
const router = (0, express_1.Router)();
const manejoRegistro = new registerController_1.RegisterController();
router.get('/register', (req, res) => {
    // res.send("Registro");
    res.render('auth/register');
});
router.post('/register', (req, res) => manejoRegistro.registerUser(req, res));
exports.default = router;
