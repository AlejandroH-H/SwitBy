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
exports.mainController = exports.userThings = void 0;
const crudUser_1 = require("./userController/crudUser");
const segurityUser_1 = require("./userController/segurityUser");
class userThings {
    constructor() {
        this.userCrud = new crudUser_1.userCrud();
        this.userSegurity = new segurityUser_1.userSegurity();
    }
    /* CONTROLADORES DEL CRUD */
    obtenerDatos(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userCrud.obtenerDatos(id);
        });
    }
    editarPerfil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userCrud.editarPerfil(req, res);
        });
    }
    eliminarPerfil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userCrud.eliminarPerfil(req, res);
        });
    }
    /* CONTROLADORES DE LA SEGURIDAD */
    passwordSegurity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userSegurity.passwordSegurity(req, res);
        });
    }
    emailSegurity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userSegurity.emailSegurity(req, res);
        });
    }
}
exports.userThings = userThings;
exports.mainController = new userThings();
