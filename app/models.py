from app import db
import random
import datetime


class Game(db.Model):
    id = db.Column(db.String(16), primary_key=True)
    created_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    users = db.relationship('User', backref='game_users', lazy='joined')

    def __init__(self, token, name, has_board):
        if token is None:
            self.id = generate_token()
        else:
            self.id = token
        master = User(name=name, role='master')
        self.users.append(master)
        db.session.add(master)
        db.session.commit()
        if has_board:
            master_board = Board()
            master.board = master_board
            db.session.add(master_board)
            db.session.commit()

    def json(self):
        result = {'id': self.id,
                  'created_date': self.created_date,
                  'users': []}
        for user in self.users:
            result.get('users').append(user.json())
        return result


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.String(16), db.ForeignKey('game.id'))
    name = db.Column(db.String(64), nullable=False)
    role = db.Column(db.String(16), nullable=False)
    can_view = db.Column(db.Boolean, default=False)

    board = db.relationship('Board', uselist=False, backref='user_board')
    note = db.relationship('Note', uselist=False, backref='user_note')

    def __init__(self, *args, **kwargs):
        super(User, self).__init__(*args, **kwargs)
        self.note = Note()
        db.session.add(self.note)
        db.session.commit()

    def json(self):
        return {'id': self.id,
                'game_id': self.game_id,
                'name': self.name,
                'role': self.role,
                'can_view': self.can_view,
                'board': None if self.board is None else self.board.json(),
                'note': self.note.json()}


class Board(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    trait_name = db.Column(db.String(64), default='')

    chips = db.relationship('Chip', backref='board_chips', lazy='joined')

    def __init__(self, *args, **kwargs):
        super(Board, self).__init__(*args, **kwargs)

    def json(self):
        result = {'id': self.id,
                  'user_id': self.user_id,
                  'trait_name': self.trait_name,
                  'chips': []}
        for chip in self.chips:
            result['chips'].append(chip.json())
        return result


class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    note_text = db.Column(db.Text, nullable=True, default='')

    def __init__(self, *args, **kwargs):
        super(Note, self).__init__(*args, **kwargs)

    def json(self):
        return {'id': self.id,
                'user_id': self.user_id,
                'note_text': self.note_text}


class Chip(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    board_id = db.Column(db.Integer, db.ForeignKey('board.id'))
    color = db.Column(db.String(16), nullable=False)
    left = db.Column(db.FLOAT, nullable=False)
    top = db.Column(db.FLOAT, nullable=False)

    def __init__(self, *args, **kwargs):
        super(Chip, self).__init__(*args, **kwargs)

    def json(self):
        return {'id': self.id,
                'board_id': self.board_id,
                'color': self.color,
                'left': self.left,
                'top': self.top}


def generate_token():
    chars = 'abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
    token = ''
    for i in range(0, 8):
        token += random.choice(chars)
    return token
