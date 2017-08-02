var express = require('express');
var router = express.Router();
var models = require('../models');
var User = models.User;
var Book = models.Book;
var depts = require('../departments');

//////////////////////////////// PUBLIC ROUTES ////////////////////////////////
// Users who are not logged in can see these routes

router.get('/', function(req, res, next) {
  res.render('home');
});

router.get('/users', function(req, res, next) {
  User.find(function(err, users) {
    if (err) return next(err);
    res.render('users', {
      users: users
    });
  });
});

router.get('/books', function(req, res, next){
    Book.find(function(err, books){
        console.log(books);
        if (err) return next(err);
        res.render('books', {
            books: books
        });
    });
});

///////////////////////////// END OF PUBLIC ROUTES /////////////////////////////

router.use(function(req, res, next){
  if (!req.user) {
    res.redirect('/login');
  } else {
    return next();
  }
});

//////////////////////////////// PRIVATE ROUTES ////////////////////////////////
router.get('/profile', function(req, res, next) {
  Book.find({owner: req.user._id})
    .then((books) => {
      res.render('profile', {
        username: req.user.username,
        books: books
        })
    })
});

router.post('/removebook/:id', function(req, res, next){
    var bookId = req.params.id;
    console.log('+++++++++++++++++');
      Book.findByIdAndRemove(bookId)
      .then(() => {
          console.log('----------');
          Book.find({
              owner: req.user._id})
              .then((books) => {
                  console.log('list of books', books);
                  res.render('profile', {
                    username: req.user.username,
                    books: books
                })
              })
    })
})


router.get('/addbook', function(req, res, next) {
  res.render('addbook', {
    username: req.user.username,
    depts: depts.depts
  });
});

router.post('/addbook', function(req, res, next) {
  var book = new Book({
    title: req.body.title,
    author: req.body.author,
    department: req.body.department,//jquery here??
    price:  req.body.price,
    owner: req.user._id,
    email: req.user.email
  });
  console.log(book);
  book.save(function(err) {
    if (err) return next(err);
    res.redirect('/profile');
  })
});

router.post('/searchresults', function(req, res, next) {
  console.log(req.body);
  Book.find({title: new RegExp('^'+req.body.titleinput+'$', "i")})
  .then((books) => {
    console.log(books);
    res.render('searchresults', {
      books: books
    });
  })
})


///////////////////////////// END OF PRIVATE ROUTES /////////////////////////////

module.exports = router;
