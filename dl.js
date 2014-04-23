var $ = document.getElementById.bind(document);
var dom = require("ace/lib/dom");

var db = new PouchDB('dbn2'),
    remote = 'http://zip:16120zip@localhost:5984/db2',
    opts = {
      continuous: true
};

db.replicate.to(remote, opts);
db.replicate.from(remote, opts);

function openF(){
	var xhr = new XMLHttpRequest();
	var fname = prompt("File Name:");
	xhr.open("GET", fname, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4){
			var text = xhr.responseText;
			$('titlebox').value = fname;
			$('fileName').innerHTML = fname;
			//$('pageTitle').innerHTML = "Editor  "fname;
			editor.insert(text);
		}
};
xhr.send(null);
}

function saveF(){
	var text = editor.getValue();
	var fname = $("titlebox").value;
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

function newF(){
	clear3();
	var nam = prompt("Enter file name:");
	$("fileName").innerHTML = nam;
	$('titlebox').value = nam;
	$('pageTitle').innerHTML = "Editor  " + nam;
}

function cp(){
    txt = editor.getCopyText();
    document.oncopy = function(event) {
    event.clipboardData.setData("Text", txt);
    event.preventDefault();
    };
    document.execCommand("Copy");
    document.oncopy = undefined;
}

function paste(){
    editor.insert(txt);
	return editor.focus(true);
}

function clear3(){   // Clears all text from boxes.
	$('id').value = "";
	$('titlebox').value = "";
	$('fileName').innerHTML = "No Name";
	$('pageTitle').innerHTML = "Editor";
   editor.setValue('');
	editor.focus(true);
}

function saveD() {  
	db.put({
       _id: $('id').value,
       title: $('titlebox').value,
       content: editor.getValue()
       });
	//clear3();
}

function getDoc(id){    // Gets a document from the database.
		id = $('id').value;
	db.get(id, function(err, doc) {
		$('id').value = doc._id;
		$('titlebox').value = doc.title;
		$('fileName').innerHTML = doc.title;
		$('pageTitle').innerHTML = "Editor  " + doc.title;
		editor.insert(doc.content);
		editor.focus();
		editor.session.selection.clearSelection();
	}
)}

function upDate(){
	var id = $('id').value;
	var t =  $('titlebox').value;
	var c =  editor.getValue();
		db.get(id).then(function(otherDoc) {
  return db.put({
    _id: id,
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
	//clear3();
}

function del(){   //deletes a document from the database whose _id is in the id.
	var id = $('id').value;
	db.get(id).then(function(doc) {
	return db.remove(doc);
		}).catch(function(err){
			//errors
	});
	$('id').value = "";
}

function mkLink(){
	var t =  $('titlebox').value,
        id = $('id').value,
        list = $("list1"),
        kids = list.children,
        kds = Array.prototype.slice.call(kids),
        fn = function(element, index, kds){list.appendChild(element);},
        item = "<li><a href=\"javascript:reCallDoc('" + id + "');\">" + id + " "  + t + "</a></li>";
    list.innerHTML = item;
    kds.forEach(fn);
}

function list1(){
	$("list").innerHTML = "";
db.allDocs({include_docs: true}, function(err, dsD) {
    var totalRows = dsD.total_rows;
	var s = ["<li><a href=\"javascript:reCallDoc('", "", "');\">", "", " ", "", "</a></li>"];
    var lst = [];
	
for (i = 0; i < totalRows; i++) {
    var x = dsD.rows[i].doc._id;
    var y = dsD.rows[i].doc.title;
	lst.push({id: x, title: y});
	}
        lst.sort(function(p, q){
        return p.id-q.id;
    });
    
    var oLength = lst.length;
for (i = 0; i < oLength; i++) {
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
}

function reCallDoc(id){
	$('id').value = id;
	getDoc();
}

function clist(){
	$("list").innerHTML = "";
}

function ba(b,a){
	cp();
    var wrp = [b,a];
    wrp.splice(1, 0, txt);
    txt = wrp.join("");
    editor.insert(txt);
	return editor.focus(true);
}

function setcur(t, num){
	editor.insert(t);
	editor.navigateLeft(num);
	return editor.focus(true);
}

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

function wrap(tag){
    cp();
    var wrp = ["<", ">", "</", ">"];
    wrp.splice(1, 0, tag);
    wrp.splice(3, 0, txt);
    wrp.splice(5, 0, tag);
    txt = wrp.join("");
    editor.insert(txt);
	return editor.focus(true);
}

function fr() {
    var fl = "var i;\nfor (i = 0; i < ; i++) {\n\n}";
    editor.insert(fl);
}

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

function cl(){
    var log = "console.log();";
    editor.insert(log);
}

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


