var fs = require('fs'),
    path = require('path'),
    express = require('express'),
    handlebars = require('express-handlebars');////test

var helpers = require('./lib/helpers');

var app = express();

app.use('/public', express.static(path.join(__dirname + '/public')));


// Create Handlebars instace wthi a  default layout
var hbs = handlebars.create({
   defaultLayout:'main',
   helpers: helpers
});

// Register 'hbs' as our view engine using its bound 'engine()' function.
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// json
var pasFromJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'cat.conf')));


//app.use(express.static('/home/js/webdev/fs/public' + '/public'));

var testJson = {
items:[/*
{linkIndex:'test1', nameFile:'test1', folder: boolean, link: boolean }*/
]
};
var castomerPathDir = __dirname;
if(pasFromJson.path)
castomerPathDir = pasFromJson.path;



app.get('/', function(req, res){
var carrentPath = castomerPathDir;
   testJson.items = [];
   fs.readdir(carrentPath, (err, files) => {
   for(var i = 0; i < files.length; i++){
     if(fs.statSync(carrentPath + '/' + files[i]).isDirectory())
        testJson.items.push({linkIndex:'/'+ files[i], nameFile:files[i], typeCat:"catbox", folder: true, link: false});
     else if(fs.statSync(carrentPath + '/' + files[i]).isFile())
        testJson.items.push({linkIndex:'/'+ files[i], nameFile:files[i], typeCat:"cat",folder: false, link: false});
     if(i == files.length - 1) res.render('list', {items:testJson.items,
                                          linkIndexBack:'/',
                                          labelLinkBack:'/'
                                           });
      }
   });
});



app.get('*', (req, res, next) => {
var vLabelLinkBack;
   var pathUrl = req.path;
   if(pathUrl !== '/') {
     testJson.items = [];
     var fileDirName = req.originalUrl.replace(/%20/g, "\ ");
     if(fs.statSync(castomerPathDir +  fileDirName).isFile()){ console.log('=====' + req.originalUrl.replace(/%20/g, "\ "))
     res.download(path.join(castomerPathDir, fileDirName), fileDirName, err => {
        if (err) console.log(err);
    });
    }
   if(fs.statSync(castomerPathDir +  fileDirName).isDirectory()){
    testJson.items = [];
    pathTmp = castomerPathDir + fileDirName;
    if(fileDirName.indexOf("/") == fileDirName.lastIndexOf("/"))
     vLabelLinkBack = fileDirName.slice(0, 1);
    else
     vLabelLinkBack = fileDirName.slice(0 ,fileDirName.lastIndexOf("/"));
    var files = fs.readdirSync(pathTmp);
    if(files.length != 0){
    for(var i = 0; i < files.length; i++){
   var tmpPathDirIsNotFound = pathTmp.slice(castomerPathDir.length, pathTmp.length);
     if(fs.statSync(pathTmp + '/' + files[i]).isDirectory()){
        testJson.items.push({linkIndex:tmpPathDirIsNotFound + '/'+ files[i], nameFile:files[i], typeCat:"catbox", folder: true, link: false});}
     else if(fs.statSync(pathTmp + '/' + files[i]).isFile())
        testJson.items.push({linkIndex:tmpPathDirIsNotFound + '/'+ files[i], nameFile:files[i], typeCat:"cat", folder: false, link: false});
     if(i == files.length - 1) res.render('list', {items:testJson.items,
                                          linkIndexBack: vLabelLinkBack,
                                          labelLinkBack: vLabelLinkBack
                                           });
      }
      }
      else res.redirect(vLabelLinkBack);
      }
   } else {
       next();
   }
});

function seatchCustomer(nameFileDir){
  var resultSearch = [];
   var tmpDir = castomerPathDir;
   var tmpresultSearch = [];
   tmpresultSearch.push(tmpDir);
   var tmp2resultSearch = [];

    function readDirFolder(){
      var files = fs.readdirSync(tmpDir);
      for(var i in files){
         var carentPathDirFile = tmpDir + '/' + files[i];
      if(fs.statSync(carentPathDirFile).isDirectory()){
         tmp2resultSearch.push(carentPathDirFile);
         if(files[i].search(nameFileDir) != -1) //console.log(files[i]);
         resultSearch.push(carentPathDirFile.slice(castomerPathDir.length, carentPathDirFile.length));
      }else{
         if(files[i].search(nameFileDir) != -1) //console.log(files[i]);
         resultSearch.push(carentPathDirFile.slice(castomerPathDir.length, carentPathDirFile.length));
      }
   }

}

  while(1){
   for(var diri in  tmpresultSearch){
      tmpDir = tmpresultSearch[diri];
      readDirFolder();
   }
      tmpresultSearch = [];
      tmpresultSearch = tmp2resultSearch;

      tmp2resultSearch = [];
   if(tmpresultSearch.length == 0)
   break;
   }

   return resultSearch;

}

app.post('/serch', express.urlencoded(), (req, res) => {
   var listResultSearch = seatchCustomer(req.body.serch);
   testJson.items = [];
   for(i in listResultSearch){
   if(fs.statSync(castomerPathDir + listResultSearch[i]).isDirectory())
   testJson.items.push({linkIndex: listResultSearch[i], nameFile:listResultSearch[i], typeCat:"cat", folder: true, link: false});
   else
   testJson.items.push({linkIndex:listResultSearch[i], nameFile:listResultSearch[i], typeCat:"cat", folder: false, link: false});
   }
   res.render('list', {items:testJson.items,
                                          linkIndexBack:'/',
                                          labelLinkBack:'/'
                                           });

});

var castomerPort = 3000;
if(pasFromJson.port)
castomerPort = pasFromJson.port;

app.listen(castomerPort);
