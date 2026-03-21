"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postsMainController_1 = require("../controllers/postsMainController");
const postsController = new postsMainController_1.postCrud();
const router = (0, express_1.Router)();
router.post('/post/edit/:id', (req, res) => {
    postsController.editarPost(req, res);
});
router.post('/post/delete/:id', (req, res) => {
    postsController.eliminarPost(req, res);
});
exports.default = router;
