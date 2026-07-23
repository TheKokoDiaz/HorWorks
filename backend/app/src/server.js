// src/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require('dotenv').config();

const db = require('./config/db'); 

const app = express();
const PORT = process.env.PORT || 3000; 

// IMPORTACIÓN DE RUTAS
const productoRoutes = require('./routes/productoRoutes');
const habitacionRoutes = require('./routes/habitacionRoutes');
const clienteRoutes = require('./routes/clienteRoutes');

app.use(cors());
app.use(express.json());

// ENPOINTS PRINCIPALES
app.use('/api/platillos', productoRoutes);
app.use('/api/habitaciones', habitacionRoutes);
app.use('/api/clientes', clienteRoutes); // <-- (Para registrar clientes)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// RUTA DE PRUEBA DB
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS resultado');
    res.json({ message: "Conexión a MySQL exitosa, viva!", rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al conectar a MySQL", error: error.message });
  }
});

// LOGIN INTELIGENTE (ADMINISTRADORES Y CLIENTES)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Por favor, ingresa todos los campos.' });
  }

  try {
    // 1. INTENTAR BUSCAR EN LA TABLA ADMINISTRADOR
    const [adminRows] = await db.query('SELECT * FROM Administrador WHERE usuario = ?', [email]);

    if (adminRows.length > 0) {
      const admin = adminRows[0];
      // Validamos contraseña del admin
      if (password !== admin.contrasena) {
        return res.status(401).json({ message: 'Contraseña incorrecta.' });
      }
      // Retornamos sesión de Administrador
      return res.status(200).json({
        message: 'Autenticación exitosa',
        token: 'fake-jwt-token-for-admin',
        user: {
          idUsuario: admin.idAdmin,
          nombre: 'Administrador del Sistema',
          correo: admin.usuario,
          role: 'admin' // El frontend sabrá que debe mandarlo a /admin
        }
      });
    }

    // 2. SI NO ERA ADMIN, BUSCAR EN LA TABLA CLIENTE
    const [clienteRows] = await db.query('SELECT * FROM Cliente WHERE correo = ?', [email]);

    if (clienteRows.length === 0) {
      return res.status(401).json({ message: 'El correo electrónico no está registrado.' });
    }

    const cliente = clienteRows[0];

    if (password !== cliente.contrasena) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    // Retornamos sesión de Cliente
    return res.status(200).json({
      message: 'Autenticación exitosa',
      token: 'fake-jwt-token-for-client',
      user: {
        idUsuario: cliente.idCliente,
        nombre: cliente.nombre,
        correo: cliente.correo,
        role: 'client' // El frontend sabrá que debe mandarlo a /client
      }
    });

  } catch (error) {
    console.error("Error en el login:", error);
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});