from models import db
from datetime import datetime

class ToDo(db.Model):
    #Simple Todo class
    __tablename__ = 'todo'

    # Keys
    id = db.Column(db.Integer, primary_key=True)
    
    # Data / information
    title = db.Column(db.Text, nullable=False)
    content = db.Column(db.Text)

    #metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f'<ToDo {self.id}: {self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
        }

    @staticmethod
    def create(todo_data):
        new_todo = ToDo(
            id = todo_data.get('id', ''),
            title = todo_data.get('title', ''),
            content = todo_data.get('content', ''),
            created_at = datetime.utcnow()
        )
        db.session.add(new_todo)
        db.session.commit()
        return new_todo

    @staticmethod
    def get_by_id(todo_id):
        return ToDo.query.get(todo_id)

    @staticmethod
    def get_all():
        return ToDo.query.all()

    @staticmethod
    def edit(todo_data):
        todo_id = todo_data.get('id', '')
        todo = ToDo.get_by_id(todo_id)

        if todo:
            todo.title = todo_data.get('title', todo.title)
            todo.content = todo_data.get('content', todo.content)
            todo.updated_at = datetime.utcnow()

            db.session.commit()
            return todo
        print("ToDo does not exists")
        return False

    @staticmethod
    def delete(todo_id):
        todo = ToDo.get_by_id(todo_id)

        if todo:
            db.session.delete(todo)
            db.session.commit()
            return True
        return False
