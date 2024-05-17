import axios from 'axios';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import moment from 'moment';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define las constantes __filename y __dirname para utilizar en la ruta del archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crea una instancia de Express
const app = express();



// agrega esta ruta al archivo index.html 
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Mensaje de bienvenida
app.get('/Bienvenido', (req, res) => {
  res.send('Hola Bienvenido a Citas Médicas.');
});

// Arreglo para almacenar datos de usuarios registrados
const dataUsuario = [];

// Crea una instancia de Axios con la base URL de la API randomuser.me
const instanciarAxios = axios.create({
    baseURL: 'https://randomuser.me/api/',
});


// Función asincrónica para obtener un usuario aleatorio de la API randomuser.me
const getUsuario = async () => {
    const { data } = await instanciarAxios.get();
    const user = {
        id: uuidv4(), //Genera un ID único para el usuario
        name: data.results[0].name.first,
        last_name: data.results[0].name.last,
        gender: data.results[0].gender,
        registered: moment(data.results[0].registered.date).format('MMMM Do YYYY, h:mm:ss a')
    };
    return user;
};
// Middleware para manejar JSON en las solicitudes
app.use(express.json());



// Ruta para agregar un usuario
app.post('/add-user', async (req, res) => {
    try {
        const user = await getUsuario();
        dataUsuario.push(user);
        console.log(chalk.green(`Usuario ${user.name} agregado correctamente`));
        res.status(201).json({ message: `Usuario ${user.name} agregado correctamente`, user });
    } catch (error) {
        console.error(chalk.red('Error al agregar usuario:'), error.message);
        res.status(500).json({ error: 'Error al agregar usuario' });
    }
});


// Ruta para obtener y mostrar la lista de usuarios registrados
app.get('/usuarios', (req, res) => {
  try {
      const grupoUsuarios = _.groupBy(dataUsuario, 'gender');// Agrupa los usuarios por género usando Lodash
      const mujeres = grupoUsuarios.female || [];
      const hombres = grupoUsuarios.male || [];
      console.log(chalk.bgWhite.blue('Mujeres:'));
      mujeres.forEach((user, index) => {
          console.log(chalk.blue(`${index + 1}. Nombre: ${user.name}, Apellido: ${user.last_name}, ID: ${user.id.slice(0, 6)}, Timestamp: ${user.registered}`));
      });
      console.log(chalk.bgWhite.blue('Hombres:'));
      hombres.forEach((user, index) => {
          console.log(chalk.blue(`${index + 1}. Nombre: ${user.name}, Apellido: ${user.last_name}, ID: ${user.id.slice(0, 6)}, Timestamp: ${user.registered}`));
      });
      res.status(200).json({ mujeres, hombres });// Devuelve una respuesta con las listas de mujeres y hombres al cliente
  } catch (error) {
      console.error(chalk.red('Error al obtener usuarios:'), error.message);
      res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});




// Inicia el servidor en el puerto 3010
const PORT = 3010;
app.listen(PORT, () => {
    console.log(chalk.blue(`Servidor levantado por http://localhost:${PORT}`));
});