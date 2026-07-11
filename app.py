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

""" MÉTODOS FLASK """
# Home es la pagina después de iniciar sesión
@app.route('/')
def index():
    id = session.get("id")
    print(f"ID: {id}")

    if(id != 0 and id != None):
        return render_template('/home.html')
    else:
        return render_template('/login.html')

# Inicio de Sesión
@app.route('/login', methods=["POST"])
def login():
    # Aquí en el futuro puedes hacer las consultas a la base de datos 
    # y enviarlas a la plantilla HTML usando render_template
    return render_template('/home.html')

@app.route('/registro')
def registro():
    return render_template('/registro.html')


# pagina de bienvenida al entrar a la pagina (esta fuera de los templates por alguna razon por lo que aun no funcion)
# deberia ser la pagina principal
@app.route('/horworks')
def home():
    # Aquí en el futuro puedes hacer las consultas a la base de datos 
    # y enviarlas a la plantilla HTML usando render_template
    return render_template('/horworks.html')

@app.route('/ajustes')
def ajustes():
    return render_template('/ajustes.html')

@app.route('/home')
def perfil():
    return render_template('/home.html')

@app.route('/equipos')
def equipos():
    return render_template('/equipos.html')

@app.route('/crear_equipo')
def crear_equipo():
    return render_template('/crear_equipo.html')

@app.route('/roadmap')
def roadmap():
    # Aquí en el futuro puedes hacer las consultas a la base de datos 
    # y enviarlas a la plantilla HTML usando render_template
    return render_template('/roadmap.html')

# MODO DEBUG
if __name__ == '__main__':
    app.run(debug=True, port=5000)