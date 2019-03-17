const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const imdb = require('./src/imdb');
const Random = require("random-js").Random;
const random = new Random()

const DENZEL_IMDB_ID = 'nm0000243';

const CONNECTION_URL = "mongodb+srv://eziark:1234@denzeldb-ttwxi.mongodb.net/test?retryWrites=true"

const DATABASE_NAME = "denzelmovies";


var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var denzeldb, denzeldbcollection, denzeldbcollectionReview;

app.listen(9292, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        denzeldb = client.db(DATABASE_NAME);
        denzeldbcollection = denzeldb.denzeldbcollection("Movies");
		denzeldbcollectionReview = denzeldb.denzeldbcollection("ReviewMovies")
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});


app.get("/Movies/populate", async(request, response) => {
	
	const AllMovies = await imdb(DENZEL_IMDB_ID);
    
	denzeldbcollection.insertMany(AllMovies, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result.result);
    });
    denzeldbcollection.find({}).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
		var messageToSend = { "total":result.length }
        response.send(messageToSend);
    });
});

app.get("/Movies", (request, response) => {
    denzeldbcollection.find({ metascore: { $gt: 70 }}).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        var messageToSend = result[random.integer(0, result.length-1)]
        response.send(messageToSend);
    });

});

app.get("/Movies/:id", (request, response) => {
    denzeldbcollection.findOne({ "id": request.params.id }, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

app.get("/Movies/search", (request, response) => {
    console.log(request.query.limit);
    console.log('Bonjour');
    console.log(request.query.metascore);
    response.send('Bonjour');
});

app.post("/Movies/:id", (request, response) => {
    denzeldbcollectionReview.insert( request.body, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result.result);
    });
});
