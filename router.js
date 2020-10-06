const express = require('express');
const router = express.Router();
const {mdTree} = require('./utils');
const _ = require('lodash');
const config = require('config');
const Mailgun = require('mailgun-js');

const docsTree = mdTree('./docs', './views');
const releaseTree = mdTree('./releases', './views');

// Home

router.get('/', function(req, res) {
  const t = 'drachtio - the open source SIP application server framework';
  const d = 'drachtio - making SIP server apps as easy to build as web apps.';
  const k = 'drachtio, SIP, sip, Node.js, nodejs, sofia, drachtio-srf';
  res.render('index', {title : t, description : d, keywords: k});
});

// Interior Pages

router.get('/about', function(req, res) {
  const t = 'drachtio - about';
  const d = 'Learn more about drachtio, the node.js SIP application server framework.';
  res.render('about', {title : t, description : d});
});

/*
router.get('/features', function(req, res) {
  const t = 'Features - drachtio';
  const d = 'Learn more about what drachtio has to offer.';
  res.render('features', {title : t, description : d});
});
*/

router.get('/middleware', function(req, res) {
  const t = 'drachtio - middleware';
  const d = 'drachtio middleware';
  res.render('middleware', {title : t, description : d});
});

router.get('/apps', function(req, res) {
  const t = 'drachtio - apps';
  const d = 'drachtio reference apps';
  res.render('apps', {title : t, description : d});
});

router.get('/api', function(req, res) {
  const t = 'drachtio API';
  const d = 'drachtio API documentation';
  res.render('api', {title : t, description : d});
});

// Contact

router.get('/contact', function(req, res) {
  const t = 'Contact - drachtio';
  const d = 'Have a question? Contact us.';
  res.render('contact', {title : t, description : d, submitted: false});
});

router.post('/contact', function(req, res) {
  const mailgun = Mailgun(config.get('mailgun'));
  const t = 'Contact - drachtio';
  const d = 'Have a question? Contact us.';
  console.log(req.body);

  const data = {
    from: req.body.email,
    to: config.get('mailgun.to'),
    subject: req.body.subject,
    html: req.body.message
  };

  mailgun.messages().send(data, (err, body) => {
    if (err) {
      res.render('error', { error : err});
      console.log(`got an error: ${err}`);
    }
    else {
      res.render('contact', {title : t, description : d, submitted: true});
    }
  });
});
//
// Releases

router.get('/releases', (req, res) => {
  var len = releaseTree.children.length;
  var children = JSON.parse(JSON.stringify(releaseTree.children));

  var pageSize = 2,
    pageCount = len / 2,
    currentPage = 1,
    currentType = 'drachtio-srf',
    data = [];

  for (var i = 0; i < children.length; i++) {
    data.push([]);
    while (children[i].children.length > 0) {
      data[i].push(children[i].children.splice(0, pageSize));
    }
  }

  if (typeof req.query.page !== 'undefined') {
    currentPage = req.query.page;
  }
  if (typeof req.query.type !== 'undefined') {
    currentType = req.query.type;
  }

  res.render('releases', {
    title : 'drachtio - releases',
    description : 'Release notes for drachtio.',
    tree: releaseTree.children,
    data: data,
    pageSize: pageSize,
    total: len,
    pageCount: pageCount,
    currentPage: currentPage,
    currentType: currentType
  });
});

// Documentation

router.get('/docs', (req, res) => {
  res.render('docs', {
    title : 'drachtio - docs',
    description : 'Documentation for dracht.io, the node.js SIP application server framework.',
    tree: docsTree.children,
    active: 'developer-guide'
  });
});


router.get('/docs/:folder', (req, res) => {
  const t = 'drachtio - docs';
  const d = 'Documentation for drachtio, the node.js SIP application server framework.';

  const tree = _.find(docsTree.children, (c) => c.file === req.params.folder);
  if (tree) {
    console.log('found folder');
    res.render('docs', {
      title : t,
      description : d,
      tree: docsTree.children,
      active: req.params.folder
    });
  } else {
    res.render('docs', {
      title : t,
      description : d,
      tree: docsTree.children,
      active: 'api'
    });
  }
});


module.exports = router;
