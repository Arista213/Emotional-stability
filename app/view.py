from app import app
from flask import render_template, request, redirect, url_for, flash
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
            return redirect(url_for('gaming', token=token))

        elif 'btn-log-on' in request.form:
            name = request.form['name']
            id = request.form['token']
            with app.app_context():
                game = Game.query.filter(Game.id == id).first()
                print(1)
                if game is None:
                    print(2)
                    flash('error')
                    return render_template('log-on-menu.html')
                else:
                    print(3)
                    user = User(name=name, role="player")
                    game.users.append(user)
                    db.session.add(user)
                    db.session.commit()
            return redirect(url_for('gaming', token=id))
    else:
        return render_template('index.html', start=True)


@app.route('/<token>')
def gaming(token):
    return 'Типо игра'
