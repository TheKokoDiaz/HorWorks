from flask import Flask, render_template

app = Flask(__name__)

@app.route('/index' \
'')
def index():
    # Aquí en el futuro puedes hacer las consultas a la base de datos 
    # y enviarlas a la plantilla HTML usando render_template
    return render_template('/index.html')

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

@app.route('/home')
def home():
    # Aquí en el futuro puedes hacer las consultas a la base de datos 
    # y enviarlas a la plantilla HTML usando render_template
    return render_template('/home.html')

@app.route('/')
def perfil():
    # Aquí consultarás la tabla HOR_Usuario filtrando por el ID del usuario logueado
    return render_template('perfil.html')


if __name__ == '__main__':
    app.run(debug=True, port=5000)