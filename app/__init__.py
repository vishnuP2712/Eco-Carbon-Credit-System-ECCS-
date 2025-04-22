from flask import Flask
from .routes import main
from .models import db
from flask_migrate import Migrate
from flask_cors import CORS
def create_app():# function
    app=Flask(__name__)
    cors=CORS(app)
    migrate=Migrate(app,db)
    app.config['SECRET_KEY'] = "dsiuchscjaSDqw"
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///carbon_credit_db.sqlite3'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app) #database object
    # app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///carbon_credit_db.sqlite3')
    app.register_blueprint(main)
    return app