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
    user     = request.form["email"]
    password = request.form["password"]

    if user == "" or password == "":
        return render_template('/login.html')

    conn   = get_db_connection()
    cursor = conn.cursor()

    cursor.callproc("SP_IniciarSesion", [user, password])
    query = cursor.fetchall()[0]

    cursor.close()
    conn.close()

    if query[0] != 0:
        session["id"] = query[0]
        session["name"] = query[1]

        return render_template('/home.html')
    else:
        return render_template('/login.html')

@app.route('/registro')
def registro():
    return render_template('/registro.html')

@app.route('/welcome')
def welcome():
    return render_template('/welcome.html')

@app.route('/ajustes')
def ajustes():
    return render_template('/ajustes.html')

@app.route('/perfil')
def perfil():
    return render_template('/perfil.html')

# MODO DEBUG
if __name__ == '__main__':
    app.run(debug=True, port=5000)