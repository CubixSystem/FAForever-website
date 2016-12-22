/**
	Initialises the standard view locals

	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/

exports.initLocals = function(req, res, next) {

	var locals = res.locals;

	locals.navLinks = [
		{ label: 'News',		key: 'blog',		href: '/news' },
		{ label: 'Competitive',		key: 'competitive',		href: '/competitive/tournaments' }
	];

	locals.cNavLinks = [
		{ label: 'Tournaments',		key: 'tournaments',		href: '/competitive/tournaments' },
		{ label: '1v1 Leaderboards',		key: '1v1',		href: '/competitive/leaderboards/1v1' },
		{ label: 'Global Leaderboards',		key: 'global',		href: '/competitive/leaderboards/global' }
	];

	next();

};

exports.getLatestClientRelease = function(req, res, next) {

	var locals = res.locals;

	var clientLink = require('../link.json');

	locals.client_download_link = clientLink.client_link;
	locals.downlords_faf_client_download_link = clientLink.downlords_faf_client_link;

	next();

};

exports.clientChecks = function(req, res, next) {

    var locals = res.locals;
    locals.removeNavigation = false;

    if (req.query.page_id) {
        res.redirect('/news');
    }

    if (req.headers['user-agent'] == 'FAF Client') {
		locals.removeNavigation = true;
    }

    next();
};

exports.username = function(req, res, next) {
    var locals = res.locals;

    if (req.isAuthenticated()) {
        locals.username = req.user.data.attributes.login;
        next();
    }

    next();
};