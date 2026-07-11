""" COMANDO DE EJECUCIÓN """
# flask --app app run

""" CUENTA DE PRUEBAS """
# carlos@horworks.com
# 1234

""" LIBRERÍAS """
import pymysql

from flask import Flask, render_template, request, session

""" INICIO """
app = Flask(__name__)

""" VARIABLES DE SESIÓN """
app.secret_key = "poiuytrewqasdfghjklmnbvcxz"

# Ejemplo para obtener un valor:
# name = session.get("name")

""" CONEXIÓN CON BASE DE DATOS """
def get_db_connection():
    return pymysql.connect(
        host     = "127.0.0.1",
        user     = "root",
        password = "",
        database = "DB_HORWORKS",
        port     = 3306
    )

""" FUNCIONES """
def verTareasPendientes():
    id = session.get("id")

    conn   = get_db_connection()
    cursor = conn.cursor()
    cursor.callproc("SP_VerTareasPendientes", [id])
    query = cursor.fetchall()
    cursor.close()
    conn.close()

    return query

def verTareasCompletas():
    id = session.get("id")

    conn   = get_db_connection()
    cursor = conn.cursor()
    cursor.callproc("SP_VerTareasCompletas", [id])
    query = cursor.fetchall()
    cursor.close()
    conn.close()

    return query

""" MÉTODOS FLASK """
# Home es la pagina después de iniciar sesión
@app.route('/')
def index():
    id = session.get("id")

    if(id != 0 and id != None):
        return render_template('/home.html')
    else:
        return render_template('/login.html')

# Ir a Inicio de Sesión
@app.route('/login')
def login():
    return render_template('/login.html')

# Comprobar credenciales
@app.route('/doLogin', methods=["POST"])
def doLogin():
    # Recuperamos los datos del formulario
    email = request.form["email"]
    password = request.form["password"]

    # Ejecutamos nuestro procedimiento almacenado
    conn   = get_db_connection()
    cursor = conn.cursor()
    cursor.callproc("SP_IniciarSesion", [email, password])
    query = cursor.fetchall()[0] # Recuperamos la fila resultante
    cursor.close()
    conn.close()

    """ 
        VALORES DEL QUERY:
        [0]  USU_Id			    Id,
        [1]  USU_Nombre 		Nombre,
        [2]  USU_Usuario		Usuario,
        [3]  USU_Foto 		    Foto
    """

    # Comprobamos que se haya obtenido un ID
    if(query[0] != 0):
        # Exito, guardamos los datos
        session["id"] = query[0]
        session["nombre"] = query[1]
        session["foto"] = query[3]

        tareas = verTareasPendientes()

        return render_template('/home.html', tareas = tareas)
    else:
        # Fallido, se reintenta el login
        return render_template('/login.html', alert=True)

# Registro
@app.route('/registro')
def registro():
    return render_template('/registro.html')

# Dashboard / Página inicial
@app.route('/home')
def home():
    # Se revisan las tareas pendientes
    tareas = verTareasPendientes()

    return render_template('/home.html', tareas = tareas)

# Todas las tareas
@app.route('/tareas')
def tareas():
    # Se revisan todas las tareas
    pendientes = verTareasPendientes()
    completas = verTareasCompletas()

    return render_template('/tareas.html', pendientes = pendientes, completas = completas)

@app.route('/nueva_tarea', methods=["POST"])
def nueva_tarea():
    id = session.get("id")

    # Recuperamos los datos del formulario
    nombre = request.form["nombre"]
    descripcion = request.form["descripcion"]

    # Procedimiento almacenado
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.callproc("SP_CrearTarea", [id, nombre, descripcion, None])
    conn.commit()
    cursor.close()
    conn.close()

    # Se revisan todas las tareas
    pendientes = verTareasPendientes()
    completas = verTareasCompletas()

    return render_template('/tareas.html', pendientes = pendientes, completas = completas)

@app.route('/crear_tarea')
def crear_tarea():
    return render_template('/crear_tarea.html')

@app.route('/ajustes')
def ajustes():
    return render_template('/ajustes.html')

@app.route('/perfil')
def perfil():
    return render_template('/perfil.html')

@app.route('/equipos')
def equipos():
    return render_template('/equipos.html')

@app.route('/crear_equipo')
def crear_equipo():
    return render_template('/crear_equipo.html')

@app.route('/roadmap')
def roadmap():
    return render_template('/roadmap.html')

@app.route('/logout')
def logout():
    session.clear()
    return render_template('/login.html')

# MODO DEBUG
if __name__ == '__main__':
    app.run(debug=True, port=5000)