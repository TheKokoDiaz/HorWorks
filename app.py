# LIBRERÍAS
from flask import Flask, render_template

# INICIO
app = Flask(__name__)

# MÉTODOS FLASK

# Home es la pagina despues de iniciar sesion
@app.route('/')
def index():
    # Aquí en el futuro puedes hacer las consultas a la base de datos 
    # y enviarlas a la plantilla HTML usando render_template
    return render_template('/home.html')

@app.route('/login')
def login():
    # Aquí en el futuro puedes hacer las consultas a la base de datos 
    # y enviarlas a la plantilla HTML usando render_template
    return render_template('/login.html')

@app.route('/registro')
def registro():
    # Aquí en el futuro puedes hacer las consultas a la base de datos 
    # y enviarlas a la plantilla HTML usando render_template
    return render_template('/registro.html')


# pagina de bienvenida al entrar a la pagina (esta fuera de los templates por alguna razon por lo que aun no funcion)
# deberia ser la pagina principañ
@app.route('/horworks')
def home():
    # Aquí en el futuro puedes hacer las consultas a la base de datos 
    # y enviarlas a la plantilla HTML usando render_template
    return render_template('/horworks.html')

@app.route('/ajustes')
def ajustes():
    # Aquí en el futuro puedes hacer las consultas a la base de datos 
    # y enviarlas a la plantilla HTML usando render_template
    return render_template('/ajustes.html')

@app.route('/perfil')
def perfil():
    # Aquí en el futuro puedes hacer las consultas a la base de datos 
    # y enviarlas a la plantilla HTML usando render_template
    return render_template('/perfil.html')

# MODO DEBUG
if __name__ == '__main__':
    app.run(debug=True, port=5000)