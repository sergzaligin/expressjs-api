const User = require('../models/User');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const errorHandler = require('../utils/errorHandler');

module.exports.registration = async (req, res) => {

	try {

		const candidateEmail = await User.findOne({
			email: req.body.email
		});

		const candidateNickname = await User.findOne({
			nickname: req.body.nickname
		});

		if (candidateEmail || candidateNickname) {
			res.status(409).json({
				msg: `Пользователь ${candidateNickname ? 'c никнеймом ' + candidateNickname.nickname : 'c почтой ' + candidateEmail.email} уже зарегистрирован.`,
				status: 409,
				isEmailFailure:  candidateNickname ? false : true
			});
		} else {

			const salt = bcryptjs.genSaltSync(10);
			const password = req.body.password;

			const user = new User({
				nickname: req.body.nickname,
				email: req.body.email,
				password: bcryptjs.hashSync(password, salt)
			});

			await user.save();

			res.status(201).json({
				msg: 'Вы успешно зарегистрировались.',
				status: 201
			});
		}

	} catch(e) {
		errorHandler(res, e);
	}
	
};

module.exports.login = async (req, res) => {
	try {

		const candidate = await User.findOne({
			email: req.body.email
		});

		if (candidate) {

			const passwordResult = bcryptjs.compareSync(req.body.password, candidate.password);

			if (passwordResult) {
				/**
				 * Set params token
				 * first conf object
				 * second sicret key
				 * thert time a live 1h 60sec * 60min
				 */
				const token = jwt.sign({
					userId: candidate._id,
					nickname: candidate.nickname,
					email: candidate.email,
					role: candidate.role,
					avatar: candidate.avatar,
					signature: candidate.signature
				}, process.env.JWT, {expiresIn: 60 * 60});

				res.status(200).json({
					token: `Bearer ${token}`,
					status: 200
				});
			} else {
				res.status(401).json({
					msg: 'Почта или пароль не совпадают.',
					status: 401
				});
			}
		} else {
			res.status(404).json({
				msg: 'Вы не зарегистрированы.',
				status: 404
			});
		}

	} catch(e) {
		errorHandler(res, e);
	}
};
