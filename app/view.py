from app import app
from flask import render_template, request, redirect, url_for, flash, make_response
from models import *


@app.route('/', methods=['POST', 'GET'])
def index():
    if request.method == 'POST':
        if 'btn-role-master' in request.form:
            return render_template('index.html', start=False)
        elif 'btn-role-player' in request.form:
            return render_template('log-on-menu.html')

        elif 'btn-creating-board' in request.form:
            return render_template('create-game-menu.html',
                                   token=generate_token(),
                                   name=request.form['name'],
                                   has_board=request.form['btn-creating-board'])

        elif 'btn-create-game' in request.form:
            token = request.form['token']
            with app.app_context():
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
            with app.app_context():
                game = Game.query.filter(Game.id == id).first()
                if game is None:
                    flash('error')
                    return render_template('log-on-menu.html')
                else:
                    user = User(name=name, role="player")
                    game.users.append(user)
                    db.session.add(user)
                    db.session.commit()
                    res.set_cookie(key='user_id', value=str(user.id), max_age=60 * 60)
            return res
    elif request.method == 'GET':
        res = make_response(render_template('index.html', start=True))
        if request.cookies.get('user_id'):
            with app.app_context():
                user = User.query.filter(User.id == int(request.cookies.get('user_id'))).first()
                if user is not None:
                    game = Game.query.filter(Game.id == user.game_id).first()
                    if len(game.users) < 2:
                        db.session.delete(game)
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
    if Game.query.filter(Game.id == token).first() is None and token==request.cookies.get('game_id'):
        return redirect(url_for('index'))
    user = User.query.filter(User.id == int(request.cookies.get('user_id'))).first()
    if user is None:
        return redirect(url_for('index'))

    if user.role == 'master':
        if user.board is None:
            return render_template('game-master-mode.html')
    return render_template('game-player-mode.html')
