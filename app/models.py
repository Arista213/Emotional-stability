from app import db
import random


class Game(db.Model):
    id = db.Column(db.String(16), primary_key=True)

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
                  'users': []}
        for user in self.users:
            result.get('users').append(user.json())
        return result


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.String(16), db.ForeignKey('game.id'))
    name = db.Column(db.String(64), nullable=False)
    role = db.Column(db.String(16), nullable=False)

    board = db.relationship('Board', uselist=False, backref='user_board')

    def __init__(self, *args, **kwargs):
        super(User, self).__init__(*args, **kwargs)

    def json(self):
        return {'id': self.id,
                'game_id': self.game_id,
                'name': self.name,
                'role': self.role,
                'board': None if self.board is None else self.board.json()}


class Board(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    trait_name = db.Column(db.String(64), default='')

    note = db.relationship('Note', uselist=False, backref='board_note')
    chips = db.relationship('Chip', backref='board_chips', lazy='joined')

    def __init__(self, *args, **kwargs):
        super(Board, self).__init__(*args, **kwargs)
        self.note = Note()
        db.session.add(self.note)
        db.session.commit()

    def json(self):
        result = {'id': self.id,
                  'user_id': self.user_id,
                  'trait_name': self.trait_name,
                  'note': self.note.json(),
                  'chips': []}
        for chip in self.chips:
            result['chips'].append(chip.json())
        return result


class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    board_id = db.Column(db.Integer, db.ForeignKey('board.id'))
    note_text = db.Column(db.Text, nullable=True)

    def __init__(self, *args, **kwargs):
        super(Note, self).__init__(*args, **kwargs)

    def json(self):
        return {'id': self.id,
                'board_id': self.board_id,
                'note_text': self.note_text}


class Chip(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    board_id = db.Column(db.Integer, db.ForeignKey('board.id'))
    color = db.Column(db.String(16), nullable=False)
    left = db.Column(db.Integer, nullable=False)
    top = db.Column(db.Integer, nullable=False)

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
