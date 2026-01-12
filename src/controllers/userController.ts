import { Request, Response } from 'express';
import { userCrud } from "./userController/crudUser";
import { userSegurity } from "./userController/segurityUser";

export class userThings {
    private userCrud: userCrud;
    private userSegurity: userSegurity;

    constructor() {
        this.userCrud = new userCrud();
        this.userSegurity = new userSegurity();
    }

    /* CONTROLADORES DEL CRUD */
    async editarPerfil(req: Request, res: Response) {
        return await this.userCrud.editarPerfil(req, res);
    }

    async eliminarPerfil(req: Request, res: Response) {
        return await this.userCrud.eliminarPerfil(req, res);
    }

    /* CONTROLADORES DE LA SEGURIDAD */
    async passwordSegurity(req: Request, res: Response) {
        return await this.userSegurity.passwordSegurity(req, res);
    }

    async emailSegurity(req: Request, res: Response) {
        return await this.userSegurity.emailSegurity(req, res);
    }
}

export const mainController = new userThings();