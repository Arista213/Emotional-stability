from flask import request, jsonify, redirect, url_for
from app import db, app
from models import *


@app.route('/api/games', methods=['GET', 'POST'])
def request_game_leaders():
    if request.method == 'GET':
        response = []
        for game in Game.query.all():
            response.append(game.json())
        return jsonify(response)
    elif request.method == 'POST':
        data = request.json
        with app.app_context():
            game = Game(name=data['name'], has_board=data['has_board'], token=None)
            db.session.add(game)
            db.session.commit()
            return redirect(url_for('request_game', token=game.id))
    return 404


@app.route('/api/games/<token>', methods=['GET', 'DELETE'])
def request_game(token):
    with app.app_context():
        game = Game.query.filter(Game.id == token).first()
        if game is None:
            return 'Нет такого Ведущего', 404

        if request.method == 'GET':
            return jsonify(game.json())

        elif request.method == 'DELETE':
            users = User.query.filter(User.game_id == token).all()
            for user in users:
                if user.board is not None:
                    board = user.board
                    chips = Chip.query.filter(Chip.board_id == board.id).all()
                    for chip in chips:
                        db.session.delete(chip)
                    db.session.delete(board.note)
                    db.session.delete(board)
                db.session.delete(user)
            db.session.delete(game)
            db.session.commit()
            return 'Игра[' + token + '] удалена', 200
    return 404


@app.route('/api/games/<token>/users', methods=['GET', 'POST'])
def request_users(token):
    with app.app_context():
        game = Game.query.filter(Game.id == token).first()
        if game is None:
            return 'Нет игры с токеном - "' + token + '"', 404

        if request.method == 'GET':
            response = []
            for user in game.users:
                response.append(user.json())
            return jsonify(response)
        elif request.method == 'POST':
            data = request.json
            user = User(name=data['name'], role='player')
            board = Board()
            user.board = board
            game.users.append(user)
            db.session.add(user)
            db.session.add(board)
            db.session.commit()
            return redirect(url_for('request_user', token=token, user_id=user.id))
    return 404


@app.route('/api/games/<token>/users/<user_id>', methods=['GET', 'PUT', 'DELETE'])
def request_user(token, user_id):
    with app.app_context():
        game = Game.query.filter(Game.id == token).first()
        if game is None:
            return 'Нет такого Ведущего', 404
        user = User.query.filter(User.id == user_id).first()
        if user is None:
            return 'Нет такого Игрока', 404

        if request.method == 'GET':
            return jsonify(user.json())

        elif request.method == 'PUT':
            data = request.json
            user.name = data['name']
            db.session.commit()
            return jsonify(user.json())

        elif request.method == 'DELETE':
            if user.board is not None:
                board = user.board
                chips = Chip.query.filter(Chip.board_id == board.id).all()
                for chip in chips:
                    db.session.delete(chip)
                db.session.delete(board.note)
                db.session.delete(board)
            db.session.delete(user)
            db.session.commit()
            return 'Игрок[' + user_id + '] удалён', 200
    return 404


@app.route('/api/games/<token>/users/<user_id>/board', methods=['GET', 'PUT'])
def request_board(token, user_id):
    with app.app_context():
        game = Game.query.filter(Game.id == token).first()
        if game is None:
            return 'Нет такого Ведущего', 404
        user = User.query.filter(User.id == user_id).first()
        if user is None:
            return 'Нет такого Игрока', 404
        if user.board is None:
            return 'У данного игрока нет Доски', 404

        if request.method('GET'):
            return jsonify(user.board.json()), 200
        elif request.method('PUT'):
            data = request.json
            user.board.trait_name = data['trait_name']
            db.session.commit()
            return jsonify(user.board.json()), 200
    return 404



@app.route('/api/games/<token>/users/<user_id>/board/chips', methods=['GET', 'POST'])
def request_chips(token, user_id):
    game = Game.query.filter(Game.id == token).first()
    if game is None:
        return 'Нет такого Ведущего', 404
    user = User.query.filter(User.id == user_id).first()
    if user is None:
        return 'Нет такого Игрока', 404
    if user.board is None:
        return 'У данного игрока нет Доски', 404

    if request.method == 'GET':
        response = []
        for chip in user.board.chips:
            response.append(chip.json())
        return jsonify(response)

    elif request.method == 'POST':
        data = request.json
        chip = Chip(color=data['color'], left=data['left'], top=data['top'])
        user.board.chips.append(chip)
        db.session.add(chip)
        db.session.commit()
        return redirect(url_for('request_chip', token=token, user_id=user.id, chip_id=chip.id))


@app.route('/api/games/<token>/users/<user_id>/board/chips/<chip_id>', methods=['GET', 'PUT', 'DELETE'])
def request_chip(token, user_id, chip_id):
    with app.app_context():
        game = Game.query.filter(Game.id == token).first()
        if game is None:
            return 'Нет такого Ведущего', 404
        user = User.query.filter(User.id == user_id).first()
        if user is None:
            return 'Нет такого Игрока', 404
        if user.board is None:
            return 'У данного игрока нет Доски', 404
        chip = Chip.query.filter(Chip.id == chip_id).first()
        if chip is None:
            return 'У данного игрока нет такой фишки', 404

        if request.method == 'GET':
            return jsonify(chip.json())

        elif request.method == 'PUT':
            data = request.json
            chip.left = data['left']
            chip.top = data['top']
            db.session.commit()
            return jsonify(chip.json())

        elif request.method == 'DELETE':
            db.session.delete(chip)
            db.session.commit()
            return 'Фишка[' + chip_id + '] удалена', 200
    return 404


@app.route('/api/games/<token>/users/<user_id>/board/note', methods=['GET'])
def request_note(token, user_id):
    game = Game.query.filter(Game.id == token).first()
    if game is None:
        return 'Нет такого Ведущего', 404
    user = User.query.filter(User.id == user_id).first()
    if user is None:
        return 'Нет такого Игрока', 404
    if user.board is None:
        return 'У данного игрока нет Доски', 404
    return jsonify(user.board.note.json()), 200

