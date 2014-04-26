var $ = document.getElementById.bind(document);
var dom = require("ace/lib/dom"); // See - https://github.com/ajaxorg/ace 
var nextKey;
var key = "";

//PouchDB can work on its own without a remote Couchdb if preferred. 
// See -- https://github.com/pouchdb/pouchdb

var db = new PouchDB('db1'),
    remote = 'http://userName:passwordp@localhost:5984/db1', //This references a local instance of Couchdb.
    opts = {
      continuous: true 
};

db.replicate.to(remote, opts);
db.replicate.from(remote, opts);

//Opens a file from the local file system.
function openFile(){
	var xhr = new XMLHttpRequest();
	var fname = prompt("File Name:");
	if (fname){
	xhr.open("GET", fname, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4){
			var text = xhr.responseText;
			$('titlebox').value = fname;
			$('fileName').innerHTML = fname;
			//$('pageTitle').innerHTML = "Editor  " + fname;
			editor.insert(text);
}

};
xhr.send(null);
}
}

function saveFile(){
	var text = editor.getValue();
	var fname = $("titlebox").value;
	if (fname === ""){
		alert("Enter File Name:");
	}
	else {
    var Download = {
        click : function(node) {
            var ev = document.createEvent("MouseEvents");
            ev.initMouseEvent("click", true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            return node.dispatchEvent(ev);
        },
        encode : function(data) {
                return 'data:application/octet-stream;base64,' + btoa( data );
        },
        link : function(data, name){
            var a = document.createElement('a');
            a.download = name || self.location.pathname.slice(self.location.pathname.lastIndexOf('/')+1);
            a.href = data || self.location.href;
            return a;
        }
    };
    Download.save = function(data, name){
        this.click(
            this.link(this.encode(data), name));
    };
	Download.save(text, fname);
}
}

function newFile(){
	var nam = prompt("Enter file name:");
	$("fileName").innerHTML = nam;
	$('titlebox').value = nam;
	$('pageTitle').innerHTML = "Editor  " + nam;
}


//Cut
function _cut(){
    txt = editor.getCopyText();
	editor.insert("");
    document.oncut = function(event) {
    event.clipboardData.setData("Text", txt);
    event.preventDefault();
    };
    document.execCommand("Cut");
    document.oncut = undefined;
}

//Copy
function _copy(){
    txt = editor.getCopyText();
    document.oncopy = function(event) {
    event.clipboardData.setData("Text", txt);
    event.preventDefault();
    };
    document.execCommand("Copy");
    document.oncopy = undefined;
}
//Paste

function paste(){
    editor.insert(txt);
	return editor.focus(true);
}


//Lists all document in the database. -- needs revision to limit the return to 20 at a time.

function list1(){
	$("list").innerHTML = "";
db.allDocs({include_docs: true}, function(err, dsD) {
    var totalRows = dsD.total_rows;
	var s = ["<li><a href=\"javascript:getDoc('", "", "');\">", "", " ", "", "</a></li>"];
    var lst = [];
	
for (i = 0; i < totalRows; i++) {
    var x = dsD.rows[i].doc._id;
    var y = dsD.rows[i].doc.title;
	lst.push({id: x, title: y});
	}
        lst.sort(function(p, q){
        return p.id-q.id;
    });
        var l = lst.length - 1;
	var m = lst[l];
	nextKey = parseInt(m.id) + 1;
	$("state").innerHTML = nextKey;
for (i = 0; i < l; i++) {
        var o1 = lst.pop();
		var o = o1.id;
		var p = o1.title;
	s.splice(1, 1, o);
	s.splice(3, 1, o);
	s.splice(5, 1, p);
	var item = s.join("");
	list.innerHTML += item;
    }
});	
return editor.focus(true);
}

//Adds a link to the Documents List ---- mkLink()
// Gets a document from the database.

function sav(){
	if ($("titlebox").value === ""){
		alert('Please Enter a Title\n or File Name.');
	}
    var k = parseInt(key, 10);
    var nk = parseInt(nextKey, 10);
    
    if (k < nk){
        upDate();
    }
    else{
        saveD();
    }
	
}
/*
function next(){
    db.get("0", function(err, doc) {
	nextKey = doc.title;
	$("state").innerHTML = nextKey;
}
)}
*/

function clr(){
	$("state").innerHTML = nextKey;
	key = "";
	$('titlebox').value = "";
	$('fileName').innerHTML = "No Name";
	$('pageTitle').innerHTML = "Editor";
	editor.setValue('');
	editor.focus(true);
	setTimeout(function(){window.scrollTo(0,0)},250);
}

//    <a href="javascript:reCallDoc('27');">27 Another Doc</a>

function getDoc(k){
        $("state").innerHTML = k;
		key = k;
		db.get(key, function(err, doc) {
		$('titlebox').value = doc.title;
		$('fileName').innerHTML = doc.title;
		$('pageTitle').innerHTML = "Editor  " + doc.title;
		editor.insert(doc.content);
		editor.focus();
		editor.session.selection.clearSelection();
	}
)}


function saveD() {
	var k = nextKey.toString();
   	db.put({
    _id: k,//@
    title: $('titlebox').value,
    content: editor.getValue()
    });
	//incIndex();
	clr();
	window.scrollTo(0,0);
	setTimeout(function(){list1()},250);
}

//Updates a document.
function upDate(){
	var k = key;
	var t =  $('titlebox').value;
	var c =  editor.getValue();
		db.get(k).then(function(otherDoc) {
  return db.put({
    _id: k,
    _rev: otherDoc._rev,
    title: t,
    content: c
  });
}, function(err, response) {
  if (err) {
    // on error
  } else {
    console.log('success');
	
  }
});	 
	clr();
	window.scrollTo(0,0);
	setTimeout(function(){list1()},250);	
}

//deletes a document from the database whose _id is in the id inputbox.
function del(){   
	db.get(key).then(function(doc) {
	return db.remove(doc);
		}).catch(function(err){
			//errors
	});
	key = "";
	clr();
	setTimeout(function(){list1()},250);
}

//Clears the Documents List.
function clist(){
	$("list").innerHTML = "";
}
//Before and After cursor.
function ba(b,a){
	_copy();
    var wrp = [b,a];
    wrp.splice(1, 0, txt);
    txt = wrp.join("");
    editor.insert(txt);
	return editor.focus(true);
}

//Moves cursor to speed up editing.
function setcur(t, num){
	editor.insert(t);
	editor.navigateLeft(num);
	return editor.focus(true);
}
//Toggles the visibility of an element.
function visTog(elem){
    if (!$){
    return;
    }
        if (elem.style.display=="block"){
        elem.style.display="none";
        }
        else{
        elem.style.display="block";
        }
}

//Wraps selected text with an arg indicated HTML tag.
function wrap(tag){
    _copy();
    var wrp = ["<", ">", "</", ">"];
    wrp.splice(1, 0, tag);
    wrp.splice(3, 0, txt);
    wrp.splice(5, 0, tag);
    txt = wrp.join("");
    editor.insert(txt);
	return editor.focus(true);
}


// fr()

//Makes array literal from word list.
function aRay() {
	var gw = prompt('Enter words.');
	var x = gw.split(" ");
	var b = '", "';
	var c = '"]'; 
	var a = '["';
	var str = [];
	str.push(a);
    for(i = 0; i < x.length; i = i + 1){
        if (i < x.length - 1){
            str.push(x[i]); 
            str.push(b);
        }
        else {
            str.push(x[i]);
            str.push(c);    
        }
    }
str = str.join("");
editor.insert(str);
}

//Creates an Object literal (keys only) from a word list.
function oStub(){
	var ostr = prompt("Enter words.");
	var a = ostr.split(" "); //quick split 
	var sr = ["\t{\n"];
	var fn = function(element, index, a){
     sr.push(element + ":  ,\n");
	};
		if(ostr){
		a.forEach(fn);
		var n = sr.join("");
		n = n.substr(0, n.length - 2);
		n = n + "\n}";
		editor.insert(n);
		}
	return editor.focus(true);
}

function htm(){
	var htm = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<title></title>\n</head>\n<body>\n\n</body>\n</html>';
	editor.insert(htm);
}

//---------------------------------------------------------------------

//---------------------------------------------------------------------
//add command to all new editor instaces
require("ace/commands/default_commands").commands.push({
    name: "Toggle Fullscreen",
    bindKey: "F11",
    exec: function(editor) {
        dom.toggleCssClass(document.body, "fullScreen");
        dom.toggleCssClass(editor.container, "fullScreen");
        editor.resize();
    }
}, {
    name: "add",
    bindKey: "Shift-Return",
    exec: add
});

// create first editor
var editor = ace.edit("editor");
editor.setTheme("ace/theme/twilight");
editor.session.setMode("ace/mode/javascript");


var count = 1;
function add() {
    var oldEl = editor.container;
    var pad = document.createElement("div");
    pad.style.padding = "40px";
    oldEl.parentNode.insertBefore(pad, oldEl.nextSibling);

    var el = document.createElement("div");
    oldEl.parentNode.insertBefore(el, pad.nextSibling);

    count++;
    var theme = "ace/theme/" + themes[Math.floor(themes.length * Math.random() - 1e-5)];
    editor = ace.edit(el);
    editor.setTheme(theme);
    editor.session.setMode("ace/mode/javascript");

    editor.setValue([
        "this is editor number: ", count, "\n",
        "using theme \"", theme, "\"\n",
        ":)"
    ].join(""), -1);

    scroll();
}


function scroll(speed) {
    var top = editor.container.getBoundingClientRect().top;
    speed = speed || 10;
    if (top > 60 && speed < 500) {
        if (speed > top - speed - 50)
            speed = top - speed - 50;
        else
            setTimeout(scroll, 10, speed + 10);
        window.scrollBy(0, speed);
    }
}

var themes = {
    bright: [ "chrome", "clouds", "crimson_editor", "dawn", "dreamweaver", "eclipse", "github",
        "solarized_light", "textmate", "tomorrow"],
    dark: [ "clouds_midnight", "cobalt", "idle_fingers", "kr_theme", "merbivore", "merbivore_soft",
        "mono_industrial", "monokai", "pastel_on_dark", "solarized_dark",  "tomorrow_night",
        "tomorrow_night_blue", "tomorrow_night_bright", "tomorrow_night_eighties", "twilight", "vibrant_ink"]
};

themes = [].concat(themes.bright, themes.dark);
setTimeout(function(){ window.scrollTo(0,0) }, 10);

function foo() {
    editor.setFontSize(parseInt(14,10));
    editor.setShowInvisibles(true);
}
