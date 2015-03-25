
module.exports = function(app){

	// the index
	app.get('/', function(req, res){
		res.render('index');
	});

};