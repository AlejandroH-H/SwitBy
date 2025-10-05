import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { initializeDB } from '../db';

export class RegisterController{
  async registerUser(req: Request, res: Response) {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Estos campos son Obligatorios!' });
    }

    const db = await initializeDB();

    //Validar existencia del usuario
    
    const revUser = await db.get(
      'SELECT * FROM usuarios WHERE email = ? OR name = ?', [email, name]
    );

    if (revUser) {
      return res.status(400).json({ message: 'El usuario ya existe :)' });
    }

    //Hashear la contraseña y guardar el usuario en la base de datos
    const passwordHash = await bcrypt.hash(password, 10);

    await db.run(
      'INSERT INTO usuarios (name, email, password) VALUES (?, ?, ?)', [name, email, passwordHash]
    );

    return res.status(201).json({ message: 'Usuario registrado correctamente :D' });
    
  }
}