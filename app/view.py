from app import app
from flask import render_template, request, redirect, url_for, flash, make_response
from models import *


@app.route('/', methods=['POST', 'GET'])
def index():
    with app.app_context():
        if request.method == 'POST':
            if 'btn-role-master' in request.form:
                return render_template('index.html', start=False)
            elif 'btn-role-player' in request.form:
                return render_template('log-on-menu.html')

            elif 'btn-creating-board' in request.form:
                token = generate_token()
                game = Game(token=token, name=request.form['name'], has_board=request.form['btn-creating-board'] == 'Да')
                db.session.add(game)
                db.session.commit()
                res = make_response(redirect(url_for('gaming', token=token)))
                res.set_cookie(key='game_id', value=game.id, max_age=60 * 60)
                res.set_cookie(key='user_id', value=str(game.users[0].id), max_age=60 * 60)
                return res

            elif 'btn-create-game' in request.form:
                token = request.form['token']
                game = Game(token=token, name=request.form['name'], has_board=request.form['has_board'] == 'Да')
                db.session.add(game)
                db.session.commit()
                res = make_response(redirect(url_for('gaming', token=token)))
                res.set_cookie(key='game_id', value=game.id, max_age=60 * 60)
                res.set_cookie(key='user_id', value=str(game.users[0].id), max_age=60 * 60)
                return res

            elif 'btn-log-on' in request.form:
                name = request.form['name']
                id = request.form['token']
                res = make_response(redirect(url_for('gaming', token=id)))
                res.set_cookie(key='game_id', value=id, max_age=60 * 60)
                game = Game.query.filter(Game.id == id).first()
                if game is None:
                    flash('error')
                    return render_template('log-on-menu.html')
                else:
                    user = User(name=name, role="player")
                    board = Board()
                    user.board = board
                    game.users.append(user)
                    db.session.add(user)
                    db.session.add(board)
                    db.session.commit()
                    res.set_cookie(key='user_id', value=str(user.id), max_age=60 * 60)
                return res
        elif request.method == 'GET':
            res = make_response(render_template('index.html', start=True))
            if request.cookies.get('user_id'):
                user = User.query.filter(User.id == int(request.cookies.get('user_id'))).first()
                if user is not None:
                    if user.board is not None:
                        db.session.delete(user.board)
                        for chip in user.board.chips:
                            db.session.delete(chip)
                    db.session.delete(user)
                    db.session.commit()
            res.set_cookie(key='game_id', value='', max_age=0)
            res.set_cookie(key='user_id', value='', max_age=0)
            return render_template('index.html', start=True)


@app.route('/<token>')
def gaming(token):
    if Game.query.filter(Game.id == token).first() is None and token == request.cookies.get('game_id'):
        return redirect(url_for('index'))
    user = User.query.filter(
        request.cookies.get('user_id') is not None and User.id == int(request.cookies.get('user_id'))).first()
    if user is None:
        return redirect(url_for('index'))

    return render_template('game-player-mode.html', token=token)


@app.route('/test')
def test():
    return render_template('game-player-mode.html')
