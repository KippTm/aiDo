from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    # Create database
    db.init_app(app)

    with app.app_context():
        from models.todo import ToDo
