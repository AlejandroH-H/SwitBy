"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crudUser_1 = __importDefault(require("./userRouters/crudUser"));
const segurityUser_1 = __importDefault(require("./userRouters/segurityUser"));
const router = (0, express_1.Router)();
router.use('/profile', crudUser_1.default);
router.use('/profile/segurity', segurityUser_1.default);
exports.default = router;
