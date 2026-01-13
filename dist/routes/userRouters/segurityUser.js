"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../../controllers/userController");
const segurityRouter = (0, express_1.Router)();
const userController = new userController_1.userThings();
segurityRouter.get('/:id', (req, res) => {
    const id = req.params.id;
    res.render('users/segurityProfile', { user: req.session.user });
});
segurityRouter.get('/password/:id', (req, res) => {
    const id = req.params.id;
    res.render('users/authSegurity/passwordSegurity', { user: req.session.user });
});
segurityRouter.post('/password/:id', (req, res) => {
    userController.passwordSegurity(req, res);
});
segurityRouter.get('/email/:id', (req, res) => {
    const id = req.params.id;
    res.render('users/authSegurity/emailSegurity', { user: req.session.user });
});
segurityRouter.post('/email/:id', (req, res) => {
    userController.emailSegurity(req, res);
});
exports.default = segurityRouter;
