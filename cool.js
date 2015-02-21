﻿var cool =
{
    lastHash: 1,
    obHt: {},
    numHt: { 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true, ".": true },
    body : document.getElementsByTagName('BODY')[0],
    hashList : {},
    defaultHash : "",
    lastUrlHash : "",

    // entry point
    init : function()
    {
        cool.jsF =
        {
            "js-query": cool.tagQuery,
            "js-if": cool.tagIf,
            "js-load": cool.tagLoad,
            "js-page": cool.tagPage,
            "js-ajax": cool.tagAjax,
            "js-set": cool.tagSet
        },
        cool.jsA =
        {
            "js-click": cool.atrClick
        }

        cool.initNavigator();
        cool.processElement(document);

        document.cool.action();

        if (cool.lastUrlHash != window.location.hash)
        {
            cool.setPage();
        }
        else if (cool.defaultHash != "")
        {
            cool.go(cool.defaultHash);
        }


        //cool.processAtr("js-click");
    },
    
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // Tags processing

    // js-set
    tagSet : function(obj)
    {
        var name = obj.getAttribute("name");
        var type = obj.getAttribute("type");
        var cancel = obj.getAttribute("cancel");
        var value = obj.getAttribute("value");

        if (name == null || name == "")
        {
            throw "js-set: The 'name' attribute is empty";
        }

        if (value == null || value == "")
        {
            throw "js-set: The 'value' attribute is empty";
        }

        if (type == null || type == "")
        {
            throw "js-set: The 'type' attribute is empty";
        }
        else if (type != "int" && type != "float" && type != "bool" && type != "string" && type != "object")
        {
            throw "js-set: The 'type' attribute must be: int or float or bool or string or object";
        }

        if (type == "int")
        {
            obj.cool.value = parseInt(value);

            if (cancel != null)
            {
                obj.cool.cancelValue = parseInt(cancel);
            }
        }
        else if (type == "float")
        {
            obj.cool.value = parseFloat(value);

            if (cancel != null)
            {
                obj.cool.cancelValue = parseFloat(cancel);
            }
        }
        else if (type == "bool")
        {
            obj.cool.value = cool.parseBool[value];

            if (cancel != null)
            {
                obj.cool.cancelValue = parseBool(cancel);
            }
        }
        else if (type == "object")
        {
            eval("obj.cool.value = " + value);

            if (cancel != null)
            {
                eval("obj.cool.cancelValue = " + cancel);
            }
        }

        obj.cool.type = type;
        obj.cool.field = cool.createField(name, type == "object");
        obj.cool.action = function()
        {
            cool.applyField(this.field, this.value);
            
            this.actionBase();
        }
        obj.cool.cancel = function()
        {
            if (this.cancelValue != null)
            {
                cool.applyField(this.field, this.cancelValue);
            }
            
            this.cancelBase();
        }
    },

    // js-ajax
    tagAjax : function(obj)
    {
        var src = obj.getAttribute("src");
        var type = obj.getAttribute("type");

        if (src == null || src == "")
        {
            throw "js-ajax: The src attribute is empty";
        }

        if (type == null || type == "")
        {
            throw "js-ajax: The type attribute is empty";
        }
        else if (type != "text" && type != "json" && type != "stream" && type != "xml")
        {
            throw "js-ajax: The type attribute must be text or json or stream or xml";
        }

        var method = obj.getAttribute("method");
        var data = obj.getAttribute("data");
        var target = obj.getAttribute("target");
        var mock = obj.getAttribute("mock");
        var request = obj.getAttribute("request");
        var response = obj.getAttribute("response");
        var once = obj.getAttribute("once") != null;
        var nocache = obj.getAttribute("nocache") != null;

        if (method == null || method == "")
        {
            method = "GET";
        }

        if (target == null)
        {
            obj.cool.target = cool.createField("", true);
        }
        else
        {
            obj.cool.target = cool.createField(target, true);
        }

        if (type == "stream")
        {
            var desk = null;

            for (var i = 0; i < obj.childNodes.length; ++i)
            {
                var itm = obj.childNodes[i];

                if (itm.tagName != null && itm.tagName.toLowerCase() == "js-stream-description")
                {
                    obj.cool.metaIndex = i;

                    desk = itm;

                    break;
                }
            }

            if (obj.cool.metaIndex == null)
            {
                throw "js-ajax: The js-stream-description must be defined, because type='stream' was chosen.";
            }
            
            obj.cool.metaInline = desk.getAttribute("inline") != null;

            if (!obj.cool.metaInline)
            {
                obj.cool.meta = cool.metaStream.toShort(desk);
            }

            if (desk.getAttribute("declare") != null)
            {
                cool.metaStream.declare(obj.cool.meta, cool.gocField(obj.cool.target));
            }
        }

        obj.cool.obj        = obj;
        obj.cool.src        = src;
        obj.cool.type       = type;
        obj.cool.display    = obj.style.display;
        obj.cool.data       = data;
        obj.cool.method     = method;
        obj.cool.mock       = mock;
        obj.cool.request    = request;
        obj.cool.response   = response;
        obj.cool.once       = once;
        obj.cool.nocache    = nocache;
        obj.cool.count      = 0;
        obj.cool.action = function()
        {
            var bp = 0;

            if (this.once && this.count == 0 || !this.once)
            {
                var ajax = cool.ajax(this.method, this.src, this.data, this, function(xhr, tag)
                {
                    var dt = {};

                    if (tag.response != null)
                    {
                        tag.response(xhr, tag.obj, dt);
                    }
                    else if (type == "text")
                    {
                        // todo
                    }
                    else if (type == "json")
                    {
                        dt = JSON.parse(xhr.responseText);
                    }
                    else if (type == "xml")
                    {
                        // todo
                    }
                    else if (type == "stream")
                    {
                        if (xhr.responseText.length == 0)
                        {
                            return;
                        }

                        var data = "";

                        if (tag.metaInline)
                        {
                            var spliter = xhr.responseText[0];
                            var ind = xhr.responseText.indexOf(spliter, 1);

                            if (ind > -1)
                            {
                                tag.meta = xhr.responseText.substr(0, ind);

                                data = xhr.responseText.substr(ind + 1);
                            }
                            else
                            {
                                throw "js-ajax: The inline metadata is wrond.";
                            }
                        }
                        else
                        {
                            data = xhr.responseText;
                        }

                        cool.metaStream.parse(tag.meta, data, dt);
                    }

                    cool.applyField(tag.target, dt);
                });

                if (this.request != null)
                {
                    this.request(ajax, this.obj);
                }

                ajax.go();
            }
            else
            {
                this.actionBase();
                this.obj.style.display = this.display;
            }
        }
        obj.cool.cancel = function()
        {
            this.obj.style.display = "none";
            this.cancelBase();
        }
    },

    // js-page
    tagPage : function(obj)
    {
        var hash = obj.getAttribute("hash");

        if (hash == null || hash == "")
        {
            throw "js-page: The src attribute is empty";
        }

        var def = obj.getAttribute("default");

        if (def != null)
        {
            cool.defaultHash = hash;
        }

        if (cool.hashList[hash] == null)
        {
            cool.hashList[hash] = [];
        }

        cool.hashList[hash].push(obj);

        //obj.cool.hash = hash;
        obj.cool.obj = obj;
        obj.cool.display = obj.style.display;
        obj.cool.isActiveNav = false;
        obj.cool.actionNav = function()
        {
            this.isActiveNav = true;

            if (this.parent.cool.isActive)
            {
                this.obj.style.display = this.display;
                this.actionBase();
            }
        }
        obj.cool.cancelNav = function()
        {
            this.isActiveNav = false;
            this.obj.style.display = "none";
            this.cancelBase();
        }
        obj.cool.action = function()
        {
            if (this.isActiveNav)
            {
                this.obj.style.display = this.display;
                this.actionBase();
            }
        }
        obj.cool.cancel = function()
        {
            this.obj.style.display = "none";
            this.cancelBase();
        }
    },

    // js-load
    tagLoad: function(obj)
    {
        var src = obj.getAttribute("src");
        var type = obj.getAttribute("type");

        if (src == null || src == "")
        {
            throw "js-load: The src attribute is empty";
        }

        if (type == null || type == "")
        {
            var ind = src.lastIndexOf(".");

            if (ind != -1 && ind < src.length - 1)
            {
                type = src.substr(ind + 1);
            }
            else
            {
                type = "";
            }
        }

        if (type == "")
        {
            throw "js-load: Wrong type";
        }

        obj.cool.type = type;
        obj.cool.src = src;
        obj.cool.obj = obj;
        obj.cool.display = obj.style.display;
        obj.cool.action = function()
        {
            this.obj.style.display = this.display;

            switch (this.type)
            {
                case "js":
                {
                    var script = document.createElement('script');

                    script.src = this.src;

                    obj.appendChild(script);

                    break;
                }
                case "css":
                {
                    var link = document.createElement('link');

                    link.rel = 'stylesheet';
                    link.type = 'text/css';
                    link.href = this.src;
                    obj.appendChild(link);

                    break;
                }
                case "html":
                {
                    cool.ajaxGet(this.src, this.obj, function(http, obj)
                    {
                        obj.innerHTML = http.responseText;

                        cool.processElement(obj);
                        this.actionBase();
                    }).go();

                    break;
                }
                case "com":
                {

                    break;
                }
            }
        }
        obj.cool.cancel = function()
        {
            this.obj.style.display = "none";
            this.cancelBase();
        }

        obj.cool.cancel();
    },

    // js-query
    tagQuery: function(obj)
    {
        var select = obj.getAttribute("select");

        if (select == null || select == "")
        {
            throw "The select attribute is empty";
        }

        // 

    },

    // js-if
    tagIf: function (obj)
    {
        var con = obj.getAttribute("conditional");

        if (con == null || con == "")
        {
            throw "The conditional attribute is empty";
        }

        var arr = cool.parseCon(con);

        for (var i = 0; i < arr.length; ++i)
        {
            var itm = arr[i];
            var p = "window." + itm.path;

            if (cool.obHt[p] == null)
            {
                cool.obHt[p] = itm;

                itm.list = [];
            }

            itm.list.push(obj);
        }

        obj.cool.conditional = con;
        obj.cool.obj = obj;
        obj.cool.display = obj.style.display;
        obj.cool.isChanged = true;
        obj.cool.isFlug = null;
        obj.cool.action = function()
        {
            if (this.isChanged)
            {
                this.refreshEx();
            }
        };
        obj.cool.cancel = function()
        {
            this.obj.style.display = "none";
            this.cancelBase();
        };
        obj.cool.refresh = function(elm, path)
        {
            this.isChanged = true;

            this.refreshEx();
        };
        obj.cool.refreshEx = function()
        {
            if (this.parent.cool.isActive)
            {
                if (this.isChanged)
                {
                    var flug = eval(this.conditional);

                    if (flug != this.isFlug)
                    {
                        if (flug)
                        {
                            this.obj.style.display = this.display;
                            this.actionBase();
                        }
                        else
                        {
                            this.cancel();
                        }
                    }

                    this.isFlug = flug;
                    this.isChanged = false;
                }
                else if (this.isFlug)
                {
                    this.obj.style.display = this.display;
                    this.actionBase();
                }
            }
        }

        //obj.coolJs.refresh();
    },

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // Navigator

    // for change page
    go : function(src)
    {
        if (window.location.hash != src)
        {
            window.location.hash = src;
        }
    },

    // init navigator enveroupment
    initNavigator : function()
    {
        window.addEventListener("hashchange", function()
        {
            cool.setPage();
        }, 
        false);  
    },

    // activate page
    setPage : function()
    {
        var i = 0;
        var itm = null;
        var list = cool.hashList[cool.lastUrlHash];

        if (list != null)
        {
            for (i = 0; i < list.length; ++i)
            {
                itm = list[i];

                itm.cool.cancelNav();
            }
        }

        cool.lastUrlHash = window.location.hash;

        list = cool.hashList[cool.lastUrlHash];

        if (list != null)
        {
            for (i = 0; i < list.length; ++i)
            {
                itm = list[i];

                itm.cool.actionNav();
            }
        }        
    },
    
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // Ajax

    // Ajax request helper todo make headers    XMLHttpRequest.setRequestHeader(name, value)
    ajax : function (method, url, data, tag, callback)
    {
        var obj = new XMLHttpRequest();

        obj.open(method, url, true);
        obj.onreadystatechange = function ()
        {
            if (obj.readyState == 4)
            {
                callback(obj, tag);
            }
        }
        obj.cooljs().data = data;
        obj.go = function()
        {
            obj.send(this.cool.data);
        }
        
        return obj;
    },

    // ajax short for get
    ajaxGet : function(url, tag, callback)
    {
        return cool.ajax("GET", url, null, tag, callback);
    },

    // ajax short for post
    ajaxPost: function (url, data, tag, callback)
    {
        return cool.ajax("POST", url, data, tag, callback);
    },

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // Field

    // create field from field path
    createField : function(path, isObject)
    {
        if (path == "")
        {
            path = "window";
        }
        else
        {
            path = "window." + path;
        }

        var arr = path.split(".");

        var field =
        {
            path: path, 
            list : []
        };

        for (var i = 0; i < arr.length; ++i)
        {
            var itm = arr[i];
            var ind = itm.indexOf("[");

            if (ind == -1)
            {
                field.list.push(
                {
                    isArray : false,
                    name: itm,
                    isObject : isObject
                });
            }
            else
            {
                var end = itm.lastIndexOf("]");

                if (end == -1)
                {
                    throw ("Syntax error: closed brace ']' not found " + path);
                }

                var str = itm.substr(ind, end - ind);
                var num = parseInt(str);

                if (str == num.toString())
                {
                    field.list.push(
                    {
                        isArray: true,
                        isIndexInt : true,
                        name: itm.substr(0, ind),
                        index : num,
                        isObject : false
                    });
                }
                else
                {
                    field.list.push(
                    {
                        isArray: true,
                        isIndexInt : false,
                        isObject : false,
                        name: itm.substr(0, ind),
                        index: cool.createField(str, false)
                    });
                }
            }
        }

        return field;
    },

    // set field value
    setField : function(field, val)
    {
        var cur = window;

        for (var i = 0; i < field.list.length; ++i)
        {
            var itm = field.list[i];
            var last = i == field.list.length - 1;

            if (itm.isArray)
            {
                if (cur[itm.name] == null)
                {
                    cur[itm.name] = [];
                }

                var ind = 0;
                
                if (itm.isIndexInt)
                {
                    ind = itm.index;
                }
                else
                {
                    var fval = cool.getField(itm.index);

                    if (fval == null)
                    {
                        // todo throw here? or maybe create observe ?

                        return;

                        //ind = 0;
                    }
                    else
                    {
                        ind = fval;
                    }
                }

                if (ind >= cur[itm.name].length)
                {
                    // todo throw here? or maybe create observe ?

                    return;
                }

                if (last)
                {
                    if (typeof val == "object")
                    {
                        cool.applyFieldEx(val, cur[itm.name][ind]);
                    }
                    else
                    {
                        cur[itm.name][ind] = val;
                    }
                }
                else
                {
                    cur = cur[itm.name][ind];
                }
            }
            else
            {
                if (last)
                {
                    if (typeof val == "object")
                    {
                        cool.applyFieldEx(val, cur[itm.name]);
                    }
                    else
                    {
                        cur[itm.name] = val;
                    }
                }
                else
                {
                    cur = cur[itm.name];
                }
            }
        }
    },

    // read field value 
    getField : function(field)
    {
        var cur = window;

        for (var i = 0; i < field.list.length; ++i)
        {
            var itm = field.list[i];

            if (itm.isArray)
            {
                if (cur[itm.name] == null)
                {
                    return null;
                }

                var ind = 0;

                if (itm.isIndexInt)
                {
                    ind = itm.index;
                }
                else
                {
                    ind = cool.getField(itm.index);

                    if (ind == null)
                    {
                        return null;
                    }
                }

                if (ind >= cur[itm.name].length)
                {
                    return null;
                }

                cur = cur[itm.name][ind];
            }
            else
            {
                cur = cur[itm.name];
            }
        }

        return cur;
    },

    // get or create parent object from field
    gocField : function(field, isObject)
    {
        var cur = window;

        for (var i = 0; i < field.list.length; ++i)
        {
            var itm = field.list[i];
            var last = i == field.list.length - 1;

            if (itm.isArray)
            {
                if (cur[itm.name] == null)
                {
                    cur[itm.name] = [];
                }

                var ind = 0;

                if (itm.isIndexInt)
                {
                    ind = itm.index;
                }
                else
                {
                    ind = cool.getField(itm.index);

                    if (ind == null)
                    {
                        ind = 0;
                    }
                }

                if (ind >= cur[itm.name].length)
                {
                    cur[itm.name][ind] = {};
                }

                cur = cur[itm.name][ind];
            }
            else
            {
                var t = typeof cur[itm.name];

                if (t != "object")
                {
                    if (itm.isObject || !last)
                    {
                        cur[itm.name] = {};
                    }
                }

                if (itm.isObject || !last)
                {
                    cur = cur[itm.name];
                }
            }
        }

        return cur;
    },

    // apply all obj fields to target fields, and signal of change.
    applyField : function(field, obj)
    {
        var tar = cool.gocField(field);

        cool.applyFieldEx(obj, tar);
        cool.signalFieldChange(field.path, obj);
    },
    applyFieldEx : function(src, dst)
    {
        for (var p in src)
        {
            if (src.hasOwnProperty(p))
            {
                if (typeof src[p] == "object")
                {
                    if (dst[p] == null)
                    {
                        dst[p] = {};
                    }

                    applyFieldEx(src[p], dst[p]);
                }
                else
                {
                    dst[p] = src[p];
                }
            }
        }
    },
    signalFieldChange : function(path, obj)
    {
        for (var p in obj)
        {
            if (obj.hasOwnProperty(p))
            {
                if (typeof obj[p] == "object")
                {
                    signalFieldChange(path + "." + p, obj[p]);
                }
                else
                {
                    cool.changed(path + "." + p);
                }
            }
        }
    },


    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // Helpers
    
    // init dom tree
    processElement : function(elm)
    {
        var arr = elm.querySelectorAll("js-set, js-load, js-page, js-if, js-ajax");
        var code = elm.cooljs().hash;
        var ht = {}; 
        var i = 0;
        var itm = null;
        var name = "";

        ht[code] = elm;

        for (i = 0; i < arr.length; ++i)
        {
            itm = arr[i];
            code = itm.cooljs().hash;

            if (ht[code] == null)
            {
                ht[code] = itm;
            }
        }

        for (i = arr.length - 1; i >= 0; --i)
        {
            itm = arr[i];
            name = itm.tagName.toLowerCase();

            var cur = itm.parentNode;

            while (cur != null)
            {
                if (cur.cool != null && ht[cur.cool.hash] != null)
                {
                    if (name == "js-set")
                    {
                        cur.cool.chields.splice(cur.cool.jssetCount++, 0, itm);
                    }
                    else
                    {
                        cur.cool.chields.push(itm);
                    }

                    itm.cool.parent = cur;

                    break;
                }

                cur = cur.parentNode;
            }
        }

        for (i = 0; i < arr.length; ++i)
        {
            itm = arr[i];
            name = itm.tagName.toLowerCase();

            if (cool.jsF[name] != null)
            {
                cool.jsF[name](itm);
            }
        }

        delete ht;
        delete arr;
    },

    //
    buildSet : function(str)
    {
        var arr = cool.split(str, ";");
        var tmp = "";

        for (var i = 0; i < arr.length; ++i)
        {
            var itm = arr[i].trim();

            if (itm.length > 2 && itm[0] == 'd' && itm[1] == 'o' && itm[2] == 'm')
            {
                
            }
        }

        var f = new Function("elm", tmp);

        return f;
    },

    // 
    parseCon : function(str)
    {
        var ret = [];
        var arr = cool.split(str.split(" ").join(""), "|!=&^+-*\\");

        for (var i = 0; i < arr.length; ++i)
        {
            cool.parseVar(ret, arr[i]);
        };

        return ret;
    },

    // 
    parseVar : function(ret, itm)
    {
        // string
        if (itm.indexOf("\"") > -1 || itm.indexOf("'") > -1)
        {
            return false;
        }

        // array
        var sub = "";
        var ind = itm.indexOf("[");

        if (ind > -1)
        {
            if (itm[itm.length - 1] == "]")
            {
                sub = itm.substr(ind + 1, itm.length - ind - 2);

                if (!cool.parseVar(ret, sub))
                {
                    ret.push(
                    {
                        type: "arr",
                        path: itm.substr(0, ind),
                        index: parseInt(sub)
                    });
                }

                return true;
            }
            else
            {
                sub = itm.substr(ind + 1);

                return cool.parseVar(ret, sub);
            }
        }

        // function
        ind = itm.indexOf("(");

        if (ind > -1)
        {
            if (itm[itm.length - 1] == ")")
            {
                sub = itm.substr(ind + 1, itm.length - ind - 2);

                return cool.parseVar(ret, sub);
            }
            else
            {
                sub = itm.substr(ind + 1);

                return cool.parseVar(ret, sub);
            }
        }

        // noise
        if (itm[itm.length - 1] == ")" || itm[itm.length - 1] == "]")
        {
            return cool.parseVar(ret, itm.substr(0, itm.length - 1));;
        }

        // bool
        var tmp = itm.toLowerCase();
        
        if (tmp == "true" || tmp == "false")
        {
            return false;
        }
        
        // number
        var flug = true;
        
        for (var i = 0; i < itm.length; ++i)
        {
            if (!cool.numHt[itm[i]])
            {
                flug = false;

                break;
            }
        }

        if (flug)
        {
            return false;
        }

        // object.field
        ret.push(
        {
            type: "obj",
            path: itm
        });
    },

    //
    atrClick: function (obj)
    {
        var val = obj.getAttribute("js-click");

        if (val == null || val == "")
        {
            return;
        }

        obj.addEventListener("click", function(e)
        {
            var cmd = this.coolJs.cmd;

            eval(cmd.action);

            for (var j = 0; j < cmd.vars.length; ++j)
            {
                var v = cmd.vars[j];

                if (cool.obHt[v] != null)
                {
                    cool.changed(v);
                }
            }
        });

        obj.coolJs.cmd =
        {
            action: val,
            vars : []
        };

        var arr = val.split(';');

        for (var i = 0; i < arr.length; ++i)
        {
            var itm = arr[i];
            var ind = itm.indexOf('=');

            if (ind > -1)
            {
                var tmp = itm.substr(0, ind).trim();

                obj.coolJs.cmd.vars.push(tmp);
            }
        }
    },

    //
    addVariableListener: function (name, onChange)
    {
        
    },

    // call than property changed
    changed : function(path)
    {
        if (cool.obHt[path] != null)
        {
            var ob = cool.obHt[path];

            for (var i = 0; i < ob.list.length; ++i)
            {
                var itm = ob.list[i];

                itm.cool.refresh(itm, path);
            }
        }
    },

    // split string arr
    split: function(str, sep)
    {
        for (var i = 0; i < sep.length; ++i)
        {
           str =  str.split(sep[i]).join('↔');
        }

        var ret = [];
        var tmp = str.split('↔');

        for (var j = 0; j < tmp.length; ++j)
        {
            if (tmp[j] != "")
            {
                ret.push(tmp[j]);
            }
        }

        return ret;
    },

    // parse boolean
    parseBool: function(str)
    {
        if (cool[str] != null)
        {
            return cool[str];
        }

        return false;
    },

    booleanHt:
    {
        "true": true,
        "True": true,
        "1": true,
        "false": false,
        "False": false,
        "0": false
    },
};

Object.prototype.cool = null;
Object.prototype.cooljs = function()
{
    if (this.cool == null)
    {
        this.cool =
        {
            hash : cool.lastHash++,
            chields : [],
            isActive : false,
            jssetCount: 0,
            action: function()
            {
                this.actionBase();
            },
            cancel: function()
            {
                this.cancelBase();
            },
            actionBase : function()
            {
                this.isActive = true;

                for (var i = 0; i < this.chields.length; ++i)
                {
                    var itm = this.chields[i];

                    itm.cool.action();
                }
            },
            cancelBase : function()
            {
                this.isActive = false;

                for (var i = 0; i < this.chields.length; ++i)
                {
                    var itm = this.chields[i];

                    itm.cool.cancel();
                }
            }
        };
    }

    return this.cool;
};

window.onload = cool.init;

cool.metaStream =
{
    // data parsing
    parse: function(metaStr, data, root)
    {
        var spliter = metaStr[0];
        var arr = data.split(spliter);

        if (root == null)
        {
            root = {};
        }

        var meta = metaStr.split(':');
        var cur = 1;
        var pos = 0;
        var name = "";
        var node = null;
        var obj = root;

        while (cur < meta.length)
        {
            switch (meta[cur])
            {
                case 'v':
                {
                    var val = arr[pos++];

                    name = meta[++cur];

                    if (name.length > 1 && name[name.length - 2] == '-')
                    {
                        if (name[name.length - 1] == 'i')
                        {
                            val = parseInt(val);
                        }
                        else if (name[name.length - 1] == 'f')
                        {
                            val = parseFloat(val);
                        }
                        else if (name[name.length - 1] == 'b')
                        {
                            val = cool.parseBool[val];
                        }

                        name = name.substr(0, name.length - 2);
                    }

                    //cool.metaStream.console.push('name = ' + name + ", val = " + val);

                    if (name.length == 0)
                    {
                        obj = val;
                    }
                    else
                    {
                        obj[name] = val;
                    }

                    break;
                }
                case 'f':
                {
                    var tmp0 =
                    {
                        type: 'f',
                        start: cur + 1,
                        end: cool.metaStream.findEnd(meta, cur + 1),
                        parent: null,
                        count: arr[pos++],
                        index: 0,
                        arr: [],
                        context: obj
                    };

                    name = meta[++cur];
                    obj[name] = tmp0.arr;

                    // skip
                    if (tmp0.count == 0)
                    {
                        cur = tmp0.end;

                        break;
                    }

                    if (node == null)
                    {
                        node = tmp0;
                    }
                    else
                    {
                        tmp0.parent = node;
                        node = tmp0;
                    }

                    obj = {};

                    break;
                }
                case 'w':
                {
                    name = meta[++cur];

                    var tmp1 =
                    {
                        type: 'w',
                        start: cur + 1,
                        end: cool.metaStream.findEnd(meta, cur + 1),
                        parent: null,
                        sign: meta[++cur],
                        arr: [],
                        context: obj
                    };

                    // skip
                    if (tmp1.sign != arr[pos++])
                    {
                        cur = tmp1.end;
                    }

                    if (node == null)
                    {
                        node = tmp1;
                    }
                    else
                    {
                        tmp1.parent = node;
                        node = tmp1;
                    }

                    obj[name] = node.arr;

                    obj = {};

                    break;
                }
                case 'o':
                {
                    name = meta[++cur];

                    var tmp2 =
                    {
                        type: 'o',
                        start: cur + 1,
                        end: cool.metaStream.findEnd(meta, cur + 1),
                        parent: null,
                        context: obj
                    };

                    if (node == null)
                    {
                        node = tmp2;
                    }
                    else
                    {
                        tmp2.parent = node;
                        node = tmp2;
                    }
                    
                    obj[name] = {};
                    obj = obj[name];

                    break;
                }
                case 'i':
                {
                    name = meta[++cur];

                    var sign = meta[++cur];

                    if (obj[name] != sign)
                    {
                        var end = cool.metaStream.findEnd(meta, cur + 1);

                        cur = end;
                    }

                    break;
                }
            }

            // end of cycle
            if (node != null && node.end == cur + 1)
            {
                var exit = false;

                if (node.type == 'f')
                {
                    node.arr.push(obj);
                    node.index++;

                    if (node.index >= node.count)
                    {
                        exit = true;
                    }
                }
                else if (node.type == 'w')
                {
                    node.arr.push(obj);

                    if (node.sign != arr[pos++])
                    {
                        exit = true;
                    }
                }
                else if (node.type == 'o')
                {
                    exit = true;
                }

                if (exit)
                {
                    obj = node.context;
                    node = node.parent;
                }
                else
                {
                    obj = {};
                    cur = node.start;
                }
            }

            cur++;
        }

        return root;
    },

    // get short string from decription data tags
    toShort : function(obj, spliter, arr)
    {
        if (obj.tagName == null)
        {
            return "";
        }

        var tagName = obj.tagName.toLowerCase();
        var i = 0;
        var itm = null;
        var name = "";
        var type = "";

        if (tagName == "js-stream-description")
        {
            var short1 = obj.getAttribute("short");

            if (short1 != null)
            {
                return short1;
            }
            
            spliter = obj.getAttribute("spliter");

            if (spliter == null || spliter == "")
            {
                throw "js-stream-description: The 'spliter' attribute is empty";
            }
            
            arr = [];

            arr.push(spliter);

            for (i = 0; i < obj.childNodes.length; ++i)
            {
                itm = obj.childNodes[i];

                cool.metaStream.toShort(itm, spliter, arr);
            }

            var ret = arr.join(":");

            return ret;
        }
        else if (tagName == "js-stream-var")
        {
            name = obj.getAttribute("name");
            type = obj.getAttribute("type");

            if (name == null || name == "")
            {
                throw "js-stream-var: The 'name' attribute is empty";
            }

            if (type == null || type == "")
            {
                throw "js-stream-var: The 'type' attribute is empty";
            }

            if (type == "object")
            {
                arr.push("o");
                arr.push(name);

                for (i = 0; i < obj.childNodes.length; ++i)
                {
                    itm = obj.childNodes[i];

                    cool.metaStream.toShort(itm, spliter, arr);
                }

                arr.push("e");
            }
            else
            {
                arr.push("v");

                if (type == "int")
                {
                    name += "-i";
                }
                else if (type == "float")
                {
                    name += "-f";
                }
                else if (type == "bool")
                {
                    name += "-b";
                }

                arr.push(name);
            }
        }
        else if (tagName == "js-stream-for" || tagName == "js-stream-while")
        {
            name = obj.getAttribute("name");
            type = obj.getAttribute("type");
            
            if (name == null || name == "")
            {
                throw tagName + ": The 'name' attribute is empty";
            }

            if (type == null || type == "")
            {
                throw tagName + ": The 'type' attribute is empty";
            }

            if (obj.childNodes.length > 0 && type != "object")
            {
                throw tagName + ": The 'type' must be 'object' than chields more one.";
            }

            if (tagName == "js-stream-for")
            {
                arr.push("f");
            }
            else
            {
                arr.push("w");

                var sign = obj.getAttribute("name");

                if (sign == null || sign == "")
                {
                    throw tagName + ": The 'sign' attribute is empty";
                }

                name += ":" + sign;
            }

            arr.push(name);

            if (type == "object")
            {
                for (i = 0; i < obj.childNodes.length; ++i)
                {
                    itm = obj.childNodes[i];

                    cool.metaStream.toShort(itm, spliter, arr);
                }
            }
            else if (type == "int")
            {
                arr.push("-i");
            }
            else if (type == "bool")
            {
                arr.push("-b");
            }
            else if (type == "float")
            {
                arr.push("-f");
            }
            else if (type == "string")
            {
                arr.push("");
            }

            arr.push("e");
        }
        else if (tagName == "js-stream-if")
        {
            name = obj.getAttribute("name");
            var value = obj.getAttribute("value");
            
            if (name == null || name == "")
            {
                throw tagName + ": The 'name' attribute is empty";
            }

            if (value == null || value == "")
            {
                throw tagName + ": The 'value' attribute is empty";
            }
            
            arr.push("i");
            arr.push(name);
            arr.push(value);

            for (i = 0; i < obj.childNodes.length; ++i)
            {
                itm = obj.childNodes[i];

                cool.metaStream.toShort(itm, spliter, arr);
            }

            arr.push("e");
        }
        return "";
    },

    // find end of block position
    findEnd: function(meta, cur)
    {
        var depf = 0;

        for (var i = cur; i < meta.length; ++i)
        {
            if (meta[i] == 'f' || meta[i] == 'w' || meta[i] == 'o' || meta[i] == 'i')
            {
                depf++;
            }
            else if (meta[i] == 'e')
            {
                if (depf > 0)
                {
                    depf--;
                }
                else
                {
                    return i;
                }
            }
        }

        return meta.length - 1;
    },

    // declaring top fields of data stream
    declare: function(metaStr, objTar)
    {
        var meta = metaStr.split(':');
        var name = "";
        var has = false;

        var stack = [];

        stack.push({ obj: objTar, end : meta.length });

        for (var cur = 1; cur < meta.length; ++cur)
        {
            var itm = stack[stack.length - 1];

            if (cur >= itm.end)
            {
                stack.pop();
            }

            var obj = stack[stack.length - 1].obj;

            switch (meta[cur])
            {
                case 'v':
                {
                    name = meta[++cur];
                    has = name in obj;

                    if (!has)
                    {
                        if (name.length > 1 && name[name.length - 2] == '-')
                        {
                            var n = name.substr(0, name.length - 2);

                            if (name[name.length - 1] == 'i')
                            {
                                obj[n] = 0;
                            }
                            else if (name[name.length - 1] == 'f')
                            {
                                obj[n] = parseFloat("0");
                            }
                            else if (name[name.length - 1] == 'b')
                            {
                                obj[n] = false;
                            }
                        }
                        else
                        {
                            obj[name] = "";
                        }
                    }

                    break;
                }
                case 'w':
                case 'f':
                {
                    name = meta[++cur];
                    has = name in obj;

                    if (!has)
                    {
                        obj[name] = [];
                    }

                    cur = cool.metaStream.findEnd(meta, cur + 1);

                    break;
                }
                case 'o':
                {
                    name = meta[++cur];
                    has = name in obj;

                    if (!has)
                    {
                        obj[name] = {};
                    }

                    stack.push({ obj: obj[name], end: cool.metaStream.findEnd(meta, cur + 1) });
                    
                    break;
                }
                case 'i':
                {
                    // name and sign

                    cur += 2;

                    break;
                }
            }
        }
    }
}


//cool.parseCon("map.hasFlug == true && map.age == some.getAge(wer - (web * 4) + 10) || arr[5] != 'test' || cash[n + 89] == ver.ss + 530");

/*


------------------------------

if (flug)               - отслеживание переменной
if (some.flug)          - отслеживание изменения объекта some и его поля flug
if (arr[5])             - отслеживание изменения массива arr и его значения с индексом 5 (если меняется что то другое то пофиг)
if (arr[index])         - отслеживается изменение переменной index, отслеживается массив arr, отслеживается значение arr[index]
if (arr[3].flug)        - отслеживается массив arr, отслеживается объект arr[3], отслеживается поле arr[3].flug
if (arr[index].flug)    - отслеживается arr, index, arr[index], arr[index].flug



arr[5] - отслеживаю а arr[5 + index] - не отслеживаю, отслеживаю только arr и index

мысль если отслеживается arr[index], а изменился arr[3], где index == 3, тогда должно быть срабатывание.

иными словами при отслеживании условий, я должен запоминать использованный индекс? Не нужно запоминать, потому что сработает изменение
index, условие перезапустится и так.


map.hasFlug
map.age
wer
arr - a
cash - a
n
ver.ss
web


*/

    //processTag: function(tag)
    //{
    //    var arr = document.getElementsByTagName(tag);

    //    for (var i = 0; i < arr.length; ++i)
    //    {
    //        var itm = arr[i];

    //        cool.jsF[itm.tagName.toLowerCase()](itm);
    //    }
    //},

    //processAtr: function (atr)
    //{
    //    var arr = document.querySelectorAll('[' + atr + ']');

    //    for (var i = 0; i < arr.length; ++i)
    //    {
    //        var itm = arr[i];

    //        cool.jsA[atr](itm);
    //    }
    //},