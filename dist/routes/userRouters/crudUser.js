"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../../controllers/userController");
const crudUserRouter = (0, express_1.Router)();
const userController = new userController_1.userThings();
crudUserRouter.get('/:id', (req, res) => {
    const id = req.params.id;
    res.render("users/profile", { user: req.session.user });
});
crudUserRouter.get('/edit/:id', (req, res) => {
    res.render('users/editProfile', { user: req.session.user });
});
crudUserRouter.post('/edit/:id', (req, res) => {
    userController.editarPerfil(req, res);
});
crudUserRouter.get('/delete/:id', (req, res) => {
    const id = req.params.id;
    res.render('users/deleteProfile', { id, user: req.session.user });
});
crudUserRouter.post('/delete/:id', (req, res) => {
    userController.eliminarPerfil(req, res);
});
exports.default = crudUserRouter;
