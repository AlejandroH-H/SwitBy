"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../../controllers/userController");
const crudUserRouter = (0, express_1.Router)();
const userController = new userController_1.userThings();
crudUserRouter.get('/myprofile/:id', (req, res) => {
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
crudUserRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = req.params.id;
        const targetUser = yield userController.obtenerDatos(id);
        console.log("ID del Perfil visitado:", id);
        console.log("ID del Usuario en sesión:", (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.id);
        if (!targetUser) {
            return res.status(404).send("Usuario no encontrado");
        }
        res.render("users/profile", {
            user: targetUser,
            currentUser: req.session.user || null
        });
    }
    catch (error) {
        res.status(500).send("Error en el servidor");
    }
}));
exports.default = crudUserRouter;
