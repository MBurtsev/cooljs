var cool =
{
    // entry point
    init: function()
    {
        cool.jsF =
        {
            "js-query": cool.tagQuery,
            "js-if": cool.tagIf,
            "js-load": cool.tagLoad,
            "js-page": cool.tagPage,
            "js-ajax": cool.tagAjax,
            "js-set": cool.tagSet,
            "js-event": cool.tagEvent,
            "js-several": cool.tagSeveral,
            "js-atr": cool.tagAttribute,
            "js-style": cool.tagStyle,
            "js-text": cool.tagText,
            "script": cool.tagScript,
            "js-validate": cool.tagValidate,
            "js-atr-proxy": cool.tagAtrProxy,
            "js-go": cool.tagGo,
            "js-call": cool.tagCall,
            "js-width": cool.tagWidth,
            "js-move": cool.tagMove
        };

        cool.jsA =
        {
            "js": cool.atrJs,
            "js-bind": cool.atrBindBoth,
            "js-read": cool.atrBindRead,
            "js-write": cool.atrBindWrite,
            "js-class": cool.atrClass,
            "js-class-cancel": cool.atrCancelClass
        };

        cool.initNavigator();

        cool.processElementWithPreload(document.body, function()
        {
            var html = document.documentElement;

            cool.processElement(html);

            html._cool.init("html", html); 
            html._cool.cancelDisplay = true;
            html._cool.action({ initial: html._cool.hash}, false);

            if (cool.lastUrlHash != window.location.hash)
            {
                cool.setPage();
            }
            else if (cool.defaultHash != "")
            {
                cool.go(cool.defaultHash);
            }
        });
    },

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // Tags processing

    // js-set
    tagSet: function(obj)
    {
        var name = obj.getAttribute("name");
        var type = obj.getAttribute("type");
        var cancel = obj.getAttribute("cancel");
        var value = obj.getAttribute("value");
        var once = obj.getAttribute("once") != null;

        if (name == null || name == "")
        {
            return console.log("js-set: The 'name' attribute is empty");
        }

        if (value == null)
        {
            return console.log("js-set: The 'value' attribute is empty");
        }

        obj._cool.info = name + " = " + value;
        obj._cool.tval = cool.createTypedValue("js-set", type, value);

        if (obj._cool.tval == null)
        {
            return;
        }

        if (cancel != null)
        {
            obj._cool.tcan = cool.createTypedValue("js-set", type, cancel);
        }
        else
        {
            obj._cool.tcan = null;
        }

        obj._cool.name = name;
        obj._cool.value = value;
        obj._cool.once = once;
        obj._cool.first = false;
        obj._cool.field = cool.createField(name);
        obj._cool.action = function (context, force)
        {
            if (!this.first || this.first && !this.once)
            {
                var tmp = this.tval.get();

                this.field._context = context;
                this.field.set(tmp);
                this.first = true;
            }

            this.actionBase(context, force);
        }
        obj._cool.cancel = function (context, force)
        {
            if (this.tcan != null)
            {
                this.field.set(this.tcan.get());
            }

            this.cancelBase(context, force);
        }
    },

    // js-ajax
    tagAjax: function(obj)
    {
        var src = obj.getAttribute("src");
        var type = obj.getAttribute("type");

        if (src == null || src == "")
        {
            return console.log("js-ajax: The src attribute is empty");
        }

        if (type == null || type == "")
        {
            return console.log("js-ajax: The type attribute is empty");
        }
        else if (type != "text" && type != "json" && type != "stream" && type != "xml")
        {
            return console.log("js-ajax: The type attribute must be text or json or stream or xml");
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
            obj._cool.target = cool.createField("");
        }
        else
        {
            obj._cool.target = cool.createField(target);
        }

        var desk = null;

        for (var i = 0; i < obj.children.length; ++i)
        {
            var itm = obj.children[i];
            var tnm = itm.tagName == null ? "" : itm.tagName.toLowerCase();

            if (tnm == "js-ajax-stream")
            {
                obj._cool.metaIndex = i;

                desk = itm;
            }
            else if (tnm == "js-ajax-params")
            {
                obj._cool.paramsIndex = i;
            }

            if (obj._cool.metaIndex != null && obj._cool.paramsIndex != null)
            {
                break;
            }
        }

        obj._cool.params = null;

        if (type == "stream")
        {
            if (obj._cool.metaIndex == null)
            {
                return console.log("js-ajax: The js-ajax-stream must be defined, because type='stream' was chosen.");
            }

            obj._cool.metaInline = desk.getAttribute("inline") != null;

            if (!obj._cool.metaInline)
            {
                obj._cool.meta = cool.metaStream.toShort(desk);
            }

            //if (desk.getAttribute("declare") != null)
            //{
            //    cool.metaStream.declare(obj._cool.meta, cool.gocField(obj._cool.target));
            //}
        }

        // init event
        obj._cool.eventComplete = document.createEvent('Event');
        obj._cool.eventComplete.initEvent('complete', true, true);
        
        obj._cool.src = src;
        obj._cool.type = type;
        obj._cool.data = data;
        obj._cool.method = method;
        obj._cool.mock = mock;
        obj._cool.request = request;
        obj._cool.response = response;
        obj._cool.once = once;
        obj._cool.first = false;
        obj._cool.nocache = nocache;
        //obj._cool.count = 0;
        obj._cool.action = function (context, force)
        {
            if (this.params == null)
            {
                this.params = [];

                if (this.paramsIndex != null)
                {
                    var pars = obj.children[this.paramsIndex];

                    for (var j = 0; j < pars.children.length; ++j)
                    {
                        var par = pars.children[j];

                        if (par.tagName != null && par.tagName.toLowerCase() == "js-ajax-param")
                        {
                            var par_name = par.getAttribute("name");
                            var par_value = par.getAttribute("value");
                            var isVar = par.getAttribute("var") != null;
                    
                            if (par_name == null || par_value == null || par_name == "" || par_value == "")
                            {
                                console.log("Ajax param have empty 'name/value' attribute.");
                            }

                            var val;

                            if (isVar)
                            {
                                val = cool.createTypedValue("js-ajax-param", "var", par_value);
                            }
                            else
                            {
                                val = cool.createTypedValue("js-ajax-param", "string", par_value);
                            }

                            this.params.push({ name: par_name, value: val });
                        }
                    }
                }
            }
            
            if (this.once && !this.first || !this.once)
            {
                var src_tmp = this.src;

                if (this.nocache)
                {
                    var ff = false;

                    for (var b = 0; b < this.params.length; ++b)
                    {
                        var pp = this.params[b];

                        if (pp.name == "nocache")
                        {
                            pp.value = cool.createTypedValue("js-ajax-param", "string", cool.getRandomString());

                            ff = true;
                        }
                    }

                    if (!ff)
                    {
                        this.params.push({ name: "nocache", value: cool.createTypedValue("js-ajax-param", "string", cool.getRandomString()) });
                    }
                }

                if (this.params.length > 0)
                {
                    if (src_tmp.indexOf("?") != -1)
                    {
                        src_tmp += "&";
                    }
                    else
                    {
                        src_tmp += "?";
                    }

                    for (var n = 0; n < this.params.length; ++n)
                    {
                        var par = this.params[n];
                        
                        src_tmp += par.name + "=" + par.value.get();

                        if (n < this.params.length - 1)
                        {
                            src_tmp += "&";
                        }
                    }
                }

                var ajax = cool.ajax(this.method, src_tmp, this.data, this, function(xhr, tag)
                {
                    var dt = {};

                    if (tag.response != null)
                    {
                        tag.response(xhr, tag.obj, dt);
                    }
                    else if (type == "text")
                    {
                        var text = xhr.responseText;

                        tag.target.set(text);
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
                                return console.log("js-ajax: The inline metadata is wrond.");
                            }
                        }
                        else
                        {
                            data = xhr.responseText;
                        }

                        cool.metaStream.parse(tag.meta, data, dt);
                    }

                    for (var p in dt)
                    {
                        if (dt.hasOwnProperty(p))
                        {
                            tag.target.set(dt[p], null, p);
                        }
                    }

                    tag.first = true;

                    // fire
                    tag.obj._cool.eventComplete.context = context;
                    tag.obj.dispatchEvent(tag.obj._cool.eventComplete);
                });

                if (this.request != null)
                {
                    this.request(ajax, this.obj);
                }

                ajax.go();
            }
            else
            {
                this.actionBase(context, force);
            }
        };
    },

    // js-page
    tagPage: function(obj)
    {
        var hash = obj.getAttribute("hash");4

        if (hash == null || hash == "")
        {
            return console.log("js-page: The src attribute is empty");
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

        obj._cool.hashurl = hash;
        obj._cool.first = false;
        obj._cool.isActiveNav = false;
        obj._cool.actionNav = function()
        {
            this.isActiveNav = true;

            if (this.parent._cool.isActive)
            {
                this.action({ initial: this.hash }, false);
            }
        }
        obj._cool.cancelNav = function()
        {
            this.isActiveNav = false;
            this.cancelBase({ initial: this.hash }, false);
        }
        obj._cool.action = function(context, force)
        {
            if (this.isActiveNav)
            {
                var hpg = window.location.hash;
                var arr = hpg.split("/");

                if ((arr.length - 1) % 2 != 0)
                {
                    console.log("The 'hash' has wrong format. Params must contain key/value pairs. Like this  #main/name_1/value_1/name_2/value_2");
                }
                else
                {
                    for (var n = 1; n < arr.length; n += 2)
                    {
                        var f = arr[n];
                        var v = null;

                        eval("v = " + decodeURIComponent(arr[n + 1]) + ";");

                        var fld = cool.createField(f);

                        fld._context = context;

                        fld.set(v);
                    }
                }

                this.actionBase(context, force);
            }
            else
            {
                this.cancelBase({initial: this.hash}, false);
            }
        }
    },

    // js-load +++
    tagLoad: function(elm)
    {
        cool.createAtrMap(elm,
        {
            src: function ()
            {
                var src = this.read("src");

                if (src == null || src == "")
                {
                    return console.log("js-load: The src attribute is empty");
                }

                this.element._cool.src = src;
                this.type();
            },
            type: function ()
            {
                var type = this.read("type");

                if (type == null || type == "")
                {
                    var ind = this.element._cool.src.lastIndexOf(".");

                    if (ind != -1 && ind < this.element._cool.src.length - 1)
                    {
                        type = this.element._cool.src.substr(ind + 1);
                    }
                    else
                    {
                        type = "";
                    }
                }

                if (type == "")
                {
                    return console.log("js-load: Wrong type");
                }

                this.element._cool.type = type;
            },
            always: function ()
            {
                this.element._cool.isAlways = this.element.hasAttribute("always");
            },
        });

        elm._cool.eventComplete = document.createEvent('Event');
        elm._cool.eventComplete.initEvent('complete', true, true);
        elm._cool.firstDone = false;
        elm._cool.ready = false;
        elm._cool.init = function ()
        {
            this.atrMap.src();
            this.atrMap.always();

            this.ready = true;
        };
        elm._cool.action = function (context, force)
        {
            if (!this.ready)
            {
                this.init();
            }

            if (this.isAlways || !this.firstDone)
            {
                switch (this.type)
                {
                    case "js":
                    {
                        var script = document.createElement('script');

                        script._cool = this.elm._cool;
                        script.context = context;
                        script.force = force;
                        script.onload = function()
                        {
                            // fire
                            this._cool.eventComplete.context = context;
                            this._cool.elm.dispatchEvent(this._cool.eventComplete);
                            this._cool.actionBase(this.context, this.force);
                        };
                        script.src = this.src;

                        elm.appendChild(script);
                        elm._cool.firstDone = true;

                        break;
                    }
                    case "css":
                    {
                        var link = document.createElement('link');

                        link._cool = this.elm._cool;
                        link.context = context;
                        link.force = force;
                        link.onload = function ()
                        {
                            // fire
                            this._cool.eventComplete.context = context;
                            this._cool.elm.dispatchEvent(this._cool.eventComplete);
                            this._cool.actionBase(this.context, this.force);
                        };
                        link.rel = 'stylesheet';
                        link.type = 'text/css';
                        link.href = this.src;
                        elm.appendChild(link);
                        
                        elm._cool.firstDone = true;

                        break;
                    }
                    case "html":
                    {
                        elm._cool.force = force;
                        elm._cool.context = context;

                        cool.ajaxGet(this.src, this.elm, function(http, tag)
                        {
                            var tmp = cool.toQueryScript(http.responseText);
                                
                            tag._cool.clear();

                            if (tag._cool.orign == null) 
                            {
                                 tag._cool.orign = tag.innerHTML;
                            }

                            tag.innerHTML = tag._cool.orign + tmp;

                            cool.processElement(tag);

                            tag._cool.firstDone = true;
                            tag._cool.eventComplete.context = context;
                            tag.dispatchEvent(tag._cool.eventComplete);

                            tag._cool.actionBase(tag._cool.context, tag._cool.force);

                        }).go();

                        break;
                    }
                    case "com":
                    {
                        break;
                    }
                }
            }
            else
            {
                this.elm._cool.actionBase(context, force);
            }
        }
    },

    // js-query
    tagQuery: function(obj)
    {
        var select = obj.getAttribute("select");

        if (select == null || select == "")
        {
            return console.log("js-query: The 'select' attribute is empty");
        }

        obj._cool.refresh = function (event, context)
        {
            var c = event.element._cool;

            c.isChanged = true;

            if (c.isActive)
            {
                c.action(context, false);

                return true;
            }

            return false;
        };
        
        // compile query
        var prog = { ht: {} };
        var tmp;
        var end;
        var ind = 0;

        var arr = cool.splitExpression(select);

        for (var i = 0; i < arr.length; ++i)
        {
            var scr;

            switch (arr[i])
            {
                case "From":
                {
                    if (prog.from != null)
                    {
                        return console.log("js-query: Operator 'From' must defined only once.");
                    }

                    if (i != 1)
                    {
                        return console.log("js-query: Operator 'From' must be first.");
                    }

                    end = cool.findNextOperator(i, arr);

                    //var fieldName = arr[i + end];
                    var fieldName = arr.slice(i + 1, end).join("");

                    prog.from =
                    {
                        field: cool.createField(fieldName, { callback : obj._cool.refresh, element: obj })
                    };

                    ind = arr[0].indexOf(".");

                    if (ind == -1)
                    {
                        prog.root = arr[0];
                        prog.from.v = arr[0];
                    }
                    else
                    {
                        prog.root = arr[0].substr(0, ind);
                        prog.from.v = arr[0].substr(ind + 1);
                        prog.ht[arr[0].substr(ind + 1)] = true;
                    }

                    i++;

                    break;
                }
                case "Join-full":
                case "Join-right":
                case "Join-left":
                case "Join":
                {
                    if (prog.where != null || prog.order != null || prog.group != null)
                    {
                        return console.log("js-query: Operator 'Join' must defined after 'From'.");
                    }

                    if (prog.join == null)
                    {
                        prog.join = 
                        {
                            list: [],
                            ht: {}
                        };
                    }

                    var join =
                    {
                        type: arr[i++],
                        field: cool.createField(arr[i++], { callback : obj._cool.refresh, element: obj })
                    }

                    if (arr[i++] != "As")
                    {
                        return console.log("js-query: Operator 'Join' has format <... Join source_array_path As object_name On link_conditionals ...>. Keyword 'As' required.");
                    }

                    join.v = arr[i++];
                    join.vField = join.v.split(".");
                    join.vRoot = join.vField[0];

                    prog.join.list.push(join);

                    prog.ht[join.vRoot] = true;

                    if (arr[i++] != "On")
                    {
                        return console.log("js-query: Operator 'Join' has format <... Join source_array_path As object_name On link_conditionals ...>. Keyword 'On' required.");
                    }

                    end = cool.findNextOperator(i, arr);

                    join.strCond = arr.slice(i, end).join("");
                    join.fieldCond = cool.createField(join.strCond);

                    // patch vars
                    for (var c = 0; c < join.fieldCond.vars.length; ++c)
                    {
                        var cv = join.fieldCond.vars[c];

                        if (prog.ht[cv.raw[0].path])
                        {
                            join.strCond = join.strCond.replace(cv.path, prog.root + "." + cv.path);
                        }
                    }
                    
                    join.funcName = cool.getRandomString();
                    scr = document.createElement('script');
                    scr.type = 'text/javascript';
                    scr.text = "document['" + join.funcName + "'] = function(" + prog.root + "){return " + join.strCond + ";}";

                    document.getElementsByTagName('body')[0].appendChild(scr);

                    i = end - 1;

                    break;
                }
                case "Where":
                {
                    if (prog.where != null)
                    {
                        return console.log("js-query: Operator 'Where' must defined only once.");
                    }

                    if (prog.order != null || prog.group != null)
                    {
                        return console.log("js-query: Operator 'Where' must defined after 'From' or after 'Join'.");
                    }

                    prog.where =
                    {
                    };

                    end = cool.findNextOperator(++i, arr);

                    var strCond = arr.slice(i, end).join("");

                    prog.where.fieldCond = cool.createField(strCond, { depth: 2, callback : obj._cool.refresh, element:  obj });
                    prog.where.condFuncName = cool.getRandomString();

                    // patch vars
                    for (var c = 0; c < prog.where.fieldCond.vars.length; ++c)
                    {
                        var cv = prog.where.fieldCond.vars[c];

                        if (prog.ht[cv.raw[0].path])
                        {
                            strCond = strCond.replace(cv.path, prog.root + "." + cv.path);
                        }
                    }
                    
                    scr = document.createElement('script');
                    scr.type = 'text/javascript';
                    scr.text = "document['" + prog.where.condFuncName + "'] = function(" + prog.root + "){return " + strCond + ";}";

                    document.getElementsByTagName('body')[0].appendChild(scr);

                    i = end - 1;

                    break;
                }
                case "Order":
                {
                    if (prog.order != null)
                    {
                        return console.log("js-query: Operator 'Order' must defined only once.");
                    }

                    if (prog.group != null)
                    {
                        return console.log("js-query: Operator 'Order' must defined before 'Group'");
                    }

                    prog.order = { func : cool.getRandomString()};

                    end = cool.findNextOperator(++i, arr);
                    tmp = [];

                    for (j = i; j < end; ++j)
                    {
                        tmp.push(arr[j]);
                    }

                    tmp = tmp.join('').split(',');

                    var f_str = "document['" + prog.order.func + "'] = function(a, b) { ";
                    var c_str = "return ";

                    var p = 0;

                    for (j = 0; j < tmp.length; ++j)
                    {
                        itm = tmp[j];

                        var op1 = ">";
                        var op2 = "<";

                        if (itm[0] == "!")
                        {
                            op1 = "<";
                            op2 = ">";

                            itm = itm.substr(1);
                        }
                        
                        ind = itm.indexOf(".", 0);

                        if (ind > -1)
                        {
                            str = itm.substr(0, ind);

                            if (str == prog.root)
                            {
                                itm = itm.substr(ind + 1);
                            }
                        }

                        f_str += "var c" + p + " = a." + itm + " " + op1 + " b." + itm + " ? 1 : a." + itm + " " + op2 + " b." + itm + " ? -1 : 0; ";

                        p++;
                    }

                    p--;

                    for (j = p; j >= 0; --j)
                    {
                        if (j > 0)
                        {
                            c_str += "(";
                        }

                        c_str += "c" + (p - j);

                        if (j > 0)
                        {
                            c_str +=" << " + j + ") + ";
                        }
                    }

                    f_str += c_str + "; }";

                    scr = document.createElement('script');
                    scr.type = 'text/javascript';
                    scr.text = f_str;

                    document.getElementsByTagName('body')[0].appendChild(scr);

                    i = end - 1;

                    break;
                }
                case "Group":
                {
                    // TODO check this
                    if (prog.group != null)
                    {
                        return console.log("js-query: Operator 'Group' must defined only once.");
                    }

                    prog.group = [];

                    end = cool.findNextOperator(i + 1, arr);
                    tmp = [];

                    for (j = i + 1; j < end; ++j)
                    {
                        tmp.push(arr[j]);
                    }

                    tmp = tmp.join(',').split(',');

                    for (j = i + 1; j < end; ++j)
                    {
                        prog.group.push(arr[j]);
                    }

                    break;
                }
            }
        }

        obj._cool.prog = prog;

        // getting js-query's stack
        var cur = obj._cool;

        obj._cool.stack = [];

        while (cur.parent != null)
        {
            tmp = cur.parent;
            cur = cur.parent._cool;

            if (cur.tagName == "js-query-item")
            {
                obj._cool.parentQueryItem = tmp;

                break;
            }
        }

        obj._cool.rootMap = {};
        obj._cool.rootMap[obj._cool.prog.root] = true;

        if (obj._cool.parentQueryItem != null)
        {
            obj._cool.parentQueryItem._cool.initMap(obj._cool.rootMap);
        }

        // compile template 
        obj._cool.isScript = obj._cool.tagName == "script";

        if (obj._cool.isScript)
        {
            tmp = obj.text; 
        }
        else
        {
            tmp = cool.decodeEntities(obj.innerHTML);
        }
        
        tmp = cool.toQueryScript(tmp);

        var pl_start = null;
        var pl_end = null;
        var inds = cool.findCloseTag(tmp, "#placeholder-start", "#placeholder-end");
        
        if (inds.start != -1)
        {
            var skip = false;
            var test = tmp.indexOf("<js-script");

            if (test >= 0 && inds.start > test)
            {
                skip = true;
            }
            else
            {
                test = tmp.indexOf("<script");

                if (test >= 0)
                {
                    var ind_scr = tmp.indexOf(">", test);

                    if (ind_scr > 0)
                    {
                        var ind_tpe = tmp.indexOf("type", test);

                        if (ind_tpe > 0 && ind_tpe < ind_scr)
                        {
                            var jsq = tmp.indexOf("js-query", ind_tpe);

                            if (jsq < ind_scr && inds.start > test)
                            {
                                skip = true;
                            }
                        }
                    }
                }
            }

            if (!skip)
            {
                if (inds.end != -1)
                {
                    pl_start = tmp.substr(0, inds.start);
                    pl_end = tmp.substr(inds.end + 16);
                    tmp = tmp.substr(inds.start + 18, inds.end - inds.start - 18);
                }
                else
                {
                    pl_start = tmp.substr(0, inds.start);
                    tmp = tmp.substr(inds.start + 18);
                }
            }
        }
        
        //if (select == "atm From rec.Atoms Order atm.fld.Order")
        //{
        //    var bp = 0;
        //}

        obj._cool.template = cool.buildTemplate(tmp, obj._cool.rootMap);

        obj._cool.template.pl_start = pl_start;
        obj._cool.template.pl_end = pl_end;
        
        // init events
        obj._cool.renderEnd = document.createEvent('Event');
        obj._cool.renderEnd.initEvent('renderEnd', true, true);


        obj._cool.beforeDestroy = document.createEvent('Event');
        obj._cool.beforeDestroy.initEvent('beforeDestroy', true, true);

        obj._cool.afterDestroy = document.createEvent('Event');
        obj._cool.afterDestroy.initEvent('afterDestroy', true, true);
 
        obj._cool.select = select;
        obj._cool.isChanged = true;
        obj._cool.isAlways = obj.getAttribute("always") != null;
        obj._cool.firstDone = false;
        obj._cool.cache = [];
        obj._cool.action = function (context, force)
        {
            // TODO extend observe meh
            //if (!this.isChanged)
            //{
            //    this.enable();
            //    return;
            //}

            if (this.data == null || this.isAlways || this.isChanged)
            {
                this.data = cool.computeData(this.prog);
            }

            if (this.data != null && (!this.firstDone || this.isAlways || this.isChanged))
            {
                if (this.obj.parentNode == null)
                {
                    return;
                }
                
                this.firstDone = true;

                if (this.parentQueryItem != null)
                {
                    this.parentQueryItem._cool.fillMap(this.rootMap);
                }

                // fire
                this.beforeDestroy.context = context;
                this.obj.dispatchEvent(this.beforeDestroy);

                this.clear();

                // clear
                if (!this.isScript)
                {
                    this.obj.innerHTML = "";
                }
                else if (this.targetObject != null)
                {
                    if (this.targetObject instanceof Array)
                    {
                        for (var s = 0; s < this.targetObject.length; ++s)
                        {
                            var itm = this.targetObject[s];

                            if (itm == this.obj)
                            {
                                continue;
                            }

                            if (this.obj.parentNode != itm.parentNode)
                            {
                                if (itm.coolDestroy != null)
                                {
                                    itm.coolDestroy(itm);
                                }

                                if (itm.parentNode != null)
                                {
                                    itm.parentNode.removeChild(itm);
                                }
                            }
                            else//if (this.obj.parentNode != null)
                            {
                                this.obj.parentNode.removeChild(itm);
                            }
                        }

                        this.targetObject = null;
                    }
                    else
                    {
                        this.targetObject.innerHTML = "";
                    }
                }

                // fire
                this.afterDestroy.context = context;
                this.obj.dispatchEvent(this.afterDestroy);

                var arr = [];

                if (this.template.pl_start != null)
                {
                    arr.push(this.template.pl_start);
                }

                if (select == "atm From rec.Atoms Order atm.fld.Order")
                {
                    var bp = 0;
                }

                // fill template
                for (var i = 0; i < this.data.length; ++i)
                {
                    var itm = this.data[i];

                    this.rootMap[this.prog.root] = itm;
                    this.rootMap.args = [];

                    for (var o in this.rootMap)
                    {
                        if (this.rootMap.hasOwnProperty(o) && o != "args")
                        {
                            this.rootMap.args.push(this.rootMap[o]);
                        }
                    }

                    this.rootMap.args.push(i);

                    var tmp = cool.makeQueryItem(this, true, i);
                  
                    arr.push(tmp);
                }

                if (this.template.pl_end != null)
                {
                    arr.push(this.template.pl_end);
                }

                var arr_ric = [];

                if (!this.isScript)
                {
                    this.obj.innerHTML = arr.join("");

                    cool.processElement(this.obj);

                    var tmp_arr = this.obj.querySelectorAll("[render-element-complate]");

                    for (var ta = 0; ta < tmp_arr.length; ++ta)
                    {
                        var tit = tmp_arr[ta];
                        var method = tit.getAttribute("render-element-complate");

                        if (method.length > 0)
                        {
                            arr_ric.push(tit);
                        }
                    }
                }
                else
                {
                    this.targetObject = [];

                    var div = document.createElement("div");

                    div.innerHTML = arr.join("");

                    var len = div.childNodes.length;
                    var del = 0;

                    for (var n = 0; n < len; ++n)
                    {
                        var itm = div.childNodes[del];

                        if (itm.nodeType != 1)
                        {
                            del++;

                            continue;
                        }

                        this.obj.parentNode.insertBefore(itm, this.obj);
                        this.targetObject.push(itm);
                        
                    }

                    cool.processElement(this.obj.parentNode, this.obj);

                    for (var w = 0; w < this.targetObject.length; ++w)
                    {
                        var itm = this.targetObject[w];
                        var method = itm.getAttribute("render-element-complate");

                        if (method != null && method.length > 0)
                        {
                            arr_ric.push(itm);
                        }
                        var tmp_arr = itm.querySelectorAll("[render-element-complate]");

                        for (var ta = 0; ta < tmp_arr.length; ++ta)
                        {
                            var tit = tmp_arr[ta];

                            method = tit.getAttribute("render-element-complate");
                            
                            if (method.length > 0)
                            {
                                arr_ric.push(tit);
                            }
                        }
                    }
                }

                // Calling render-element-complate functions
                for (var ta = 0; ta < arr_ric.length; ++ta)
                {
                    var tit = arr_ric[ta];

                    var method = tit.getAttribute("render-element-complate");

                    var fld = cool.createField(method);
                    var tmp = fld.get();

                    if (tmp == null)
                    {
                        console.log("render-element-complate: The function '" + method + "' is underfined.");
                    }
                    else
                    {
                        try 
                        {
                            tmp(tit);
                        }
                        catch(e)
                        {
                            console.log("Exception on render-element-complate event: " + e);
                        }
                    }
                }

                this.firstDone = true;

                // fire
                this.enable(context, force);
                this.renderEnd.context = context;
                this.obj.dispatchEvent(this.renderEnd);
            }
            else
            {
                this.enable(context, force);
            }

            this.isChanged = false;
        }
        obj._cool.cancel = function (context, force)
        {
            if (!cool.dissableDisplayPolicy && !this.cancelDisplay)
            {
                if (this.targetObject != null)
                {
                    if (this.targetObject instanceof Array)
                    {
                        for (var i = 0; i < this.targetObject.length; ++i)
                        {
                            this.targetObject[i].style.display = this.cancelDisplayVal;
                        }
                    }
                    else
                    {
                        this.targetObject.style.display = this.cancelDisplayVal;
                    }
                }
            }
            
            this.cancelBase(context, force);
        }
        obj._cool.enable = function (context, force)
        {
            if (!cool.dissableDisplayPolicy && !this.cancelDisplay)
            {
                if (this.targetObject != null)
                {
                    if (this.targetObject instanceof Array)
                    {
                        for (var i = 0; i < this.targetObject.length; ++i)
                        {
                            this.targetObject[i].style.display = this.actionDisplay;
                        }
                    }
                    else
                    {
                        this.targetObject.style.display = this.actionDisplay;
                    }
                }
            }

            this.actionBase(context, force);
        }
    },

    // js-if
    tagIf: function(obj)
    {
        var con = obj.getAttribute("conditional");

        if (con == null || con == "")
        {
            return console.log("The 'conditional' attribute is empty");
        }
        
        obj._cool.unobserved = obj.getAttribute("unobserved") != null;

        if (!obj._cool.unobserved)
        {
            obj._cool.refresh = function (event, context)
            {
                var c = event.element._cool;

                if (c.parent._cool.isActive)
                {
                    c.action(context, false);

                    return true;
                }

                return false;
            };

            obj._cool.fieldCond = cool.createField(con, { callback: obj._cool.refresh, element: obj });
        }

        obj._cool.conditional = con;
        obj._cool.isChanged = true;
        obj._cool.isFlug = null;
        obj._cool.action = function (context, force)
        {
            var flag = eval(this.conditional);

            if (flag)
            {
                this.actionBase(context, force);
            }
            else
            {
                this.cancelBase({ initial: this.hash }, false);
            }
        };
    },

    // js-event
    tagEvent: function(obj)
    {
        var name = obj.getAttribute("name");
        var select = obj.getAttribute("select");
        var onactive = obj.hasAttribute("onactive");

        if (name == null || name == "")
        {
            return console.log("js-event: The 'name' attribute is empty");
        }

        if (select == null || select == "")
        {
            select = "parent";
        }

        var prog = cool.compileSelector(select);
        var arr = cool.getBySelector(prog, obj);

        function initEvent(obj, name)
        {
            return function(e)
            {
                // #remove_line
                //console.log("Event: " + name);

                var srcelm = null;

                if (e.srcElement != null)
                {
                    srcelm = e.srcElement;
                }
                else
                {
                    srcelm = e.target;
                }


                if (obj._cool.parent._cool.isActive)
                {
                    var context = null;
                    var force = true;
                    //var force = false;

                    var id = srcelm.id;
                    
                    if (e.context != null)
                    {
                        context = e.context;
                    }
                    else
                    {
                        context = { initial: obj._cool.hash };
                    }
                    
                    cool.currentEventElement = srcelm;
                    obj._cool.actionBase(context, force);
                    obj._cool.eventActive = false;
                    obj._cool.cancelBase(context);
                    cool.currentEventElement = null;
                }
                else
                {
                    obj._cool.eventActive = true;
                }
                
                return false;
            }
        };

        obj._cool.name = name;
        obj._cool.eventActive = false;
        obj._cool.onactive = onactive;
        obj._cool.initCall = obj.hasAttribute("init-call");
        obj._cool.action = function (context, force)
        {
            //if (this.eventActive && this.onactive || this.initCall)
            //{
            //    this.initCall = false;

            //    this.actionBase(context, force);
            //}

            //this.eventActive = false;

            if (this.initCall)
            {
                this.initCall = false;

                this.actionBase(context, force);
            }
        };

        //obj._cool.event = initEvent(obj, name);

        for (var i = 0; i < arr.length; ++i)
        {
            var itm = arr[i];

            //itm.addEventListener(name, obj._cool.event);
            itm.addEventListener(name, initEvent(obj, name));
        }
    },

    // js-style
    tagStyle: function(obj)
    {
        var name = obj.getAttribute("name");
        var value = obj.getAttribute("value");
        obj._cool.select = obj.getAttribute("select");

        if (name == null || name == "")
        {
            return console.log("js-event: The 'name' attribute is empty");
        }

        if (value == null || value == "")
        {
            return console.log("js-event: The 'value' attribute is empty");
        }

        if (obj._cool.select == null || obj._cool.select == "")
        {
            obj._cool.isSeveral = obj.parentNode.tagName.toLowerCase() == "js-several";
            obj._cool.select = "parent";
        }

        if (obj._cool.isSeveral)
        {
            obj._cool.prog = obj.parentNode._cool.getProg();
        }
        else
        {
            obj._cool.prog = cool.compileSelector(obj._cool.select);
        }

        obj._cool.name = name;
        obj._cool.value = value;
        obj._cool.cancelValue = obj.getAttribute("cancel");
        obj._cool.isAlways = obj.getAttribute("always") != null;
        obj._cool.action = function (context, force)
        {
            if (this.arr == null || this.isAlways)
            {
                if (this.isSeveral)
                {
                    this.arr = this.obj.parentNode._cool.getArr();
                }
                else
                {
                    this.arr = cool.getBySelector(this.prog, this.obj);
                }
            }

            for (var i = 0; i < this.arr.length; ++i)
            {
                var itm = this.arr[i];

                var tmp;

                eval("tmp = " + this.value);

                itm.style[name] = tmp;
            }

            this.actionBase(context, force);
        };
        obj._cool.cancel = function (context, force)
        {
            if (this.cancelValue != null)
            {
                if (this.arr == null || this.isAlways)
                {
                    if (this.isSeveral)
                    {
                        this.arr = this.obj.parentNode._cool.getArr();
                    }
                    else
                    {
                        this.arr = cool.getBySelector(this.prog, this.obj);
                    }
                }

                for (var i = 0; i < this.arr.length; ++i)
                {
                    var itm = this.arr[i];

                    itm.style[name] = this.cancelValue;
                }
            }

            this.cancelBase(context, force);
        }
    },

    // js-atr
    tagAttribute: function(obj)
    {
        var name = obj.getAttribute("name");
        var value = obj.getAttribute("value");
        obj._cool.select = obj.getAttribute("select");

        if (name == null || name == "")
        {
            return console.log("js-atr: The 'name' attribute is empty");
        }

        if (value == null)
        {
            return console.log("js-atr: The 'value' attribute is empty");
        }

        if (obj._cool.select == null || obj._cool.select == "")
        {
            obj._cool.isSeveral = obj._cool.parent._cool.tagName == "js-several";
            obj._cool.select = "parent";
        }

        if (obj._cool.isSeveral)
        {
            obj._cool.prog = obj.parentNode._cool.getProg();
        }
        else
        {
            obj._cool.prog = cool.compileSelector(obj._cool.select);
        }

        var cancel = obj.getAttribute("cancel");

        if (value == "#remove")
        {
            obj._cool.mode = 1;
        }
        else
        {
            obj._cool.mode = 0;
        }

        if (cancel == "#remove")
        {
            obj._cool.cancelMode = 1;
        }
        else
        {
            obj._cool.cancelMode = 0;
        }

        obj._cool.value = cool.getTypedValue(value);
        obj._cool.cancelValue = cool.getTypedValue(cancel);
        obj._cool.name = name;
        obj._cool.isAlways = obj.getAttribute("always") != null;
        obj._cool.action = function (context, force)
        {
            if (this.arr == null || this.isAlways)
            {
                if (this.isSeveral)
                {
                    this.arr = this.obj.parentNode._cool.getArr();
                }
                else
                {
                    this.arr = cool.getBySelector(this.prog, this.obj);
                }
            }

            try 
            {
                for (var i = 0; i < this.arr.length; ++i)
                {
                    var itm = this.arr[i];

                    if (this.mode == 0)
                    {
                        var tmp;

                        eval("tmp = " + this.value);

                        if (itm[this.name] != null)
                        {
                            itm[this.name] = tmp;
                        }
                        else
                        {
                            itm.setAttribute(this.name, tmp);
                        }
                    }
                    else if (this.mode == 1)
                    {
                        itm.removeAttribute(this.name);
                    }

                    // changed atr of cool tag
                    if (itm._cool != null)
                    {
                        if (itm._cool.atrMap != null)
                        {
                            if (itm._cool.atrMap[name] != null)
                            {
                                itm._cool.atrMap[name]();
                            }
                            else if (itm._cool.atrMap.other != null)
                            {
                                itm._cool.atrMap.other(name);
                            }
                        }
                    }
                }
            }
            catch (e) 
            {
                console.log("Exeption on js-atr action: " + e);
            }

            this.actionBase(context, force);
        };
        obj._cool.cancel = function (context, force)
        {
            if (this.cancelValue != null)
            {
                if (this.arr == null || this.isAlways)
                {
                    if (this.isSeveral)
                    {
                        this.arr = this.obj.parentNode._cool.getArr();
                    }
                    else
                    {
                        this.arr = cool.getBySelector(this.prog, this.obj);
                    }
                }

                for (var i = 0; i < this.arr.length; ++i)
                {
                    var itm = this.arr[i];

                    if (this.cancelMode == 0)
                    {
                        itm.setAttribute(this.name, this.cancelValue);
                    }
                    else if (this.cancelMode == 1)
                    {
                        itm.removeAttribute(this.name);
                    }

                    // changed atr of cool tag
                    if (itm._cool != null)
                    {
                        if (itm._cool.atrMap != null)
                        {
                            if (itm._cool.atrMap[name] != null)
                            {
                                itm._cool.atrMap[name]();
                            }
                            else if (itm._cool.atrMap.other != null)
                            {
                                itm._cool.atrMap.other(name);
                            }
                        }
                    }
                }
            }

            this.cancelBase(context, force);
        }
    },

    // js-several
    tagSeveral: function(obj)
    {
        obj._cool.select = obj.getAttribute("select");

        if (obj._cool.select == null || obj._cool.select == "")
        {
            obj._cool.isSeveral = obj.parentNode.tagName.toLowerCase() == "js-several";
            obj._cool.select = "parent";
        }

        obj._cool.isAlways = obj.getAttribute("always") != null;
        obj._cool.getProg = function()
        {
            if (this.prog == null || this.isAlways)
            {
                if (this.isSeveral)
                {
                    this.prog = this.obj.parentNode._cool.getProg();
                }
                else
                {
                    this.prog = cool.compileSelector(this.select);
                }
            }

            return this.prog;
        }
        obj._cool.getArr = function()
        {
            if (this.arr == null || this.isAlways)
            {
                if (this.isSeveral)
                {
                    this.arr = this.obj.parentNode._cool.getArr();
                }
                else
                {
                    this.arr = cool.getBySelector(this.getProg(), this.obj);
                }
            }

            return this.arr;
        }
    },

    // script
    tagScript: function(obj)
    {
        var type = obj.getAttribute("type");

        if (type == "js-query")
        {
            cool.tagQuery(obj);
            
            // #remove_line
            obj._cool.info = "type:js-query, " + "select:" + obj._cool.select;
        }
    },

    // js-validate
    tagValidate: function(obj)
    {
        var set = obj.getAttribute("set");
        obj._cool.select = obj.getAttribute("select");

        if (obj._cool.select == null || obj._cool.select == "")
        {
            obj._cool.isSeveral = obj._cool.parent._cool.tagName == "js-several";
            obj._cool.select = "parent";
        }

        if (obj._cool.isSeveral)
        {
            obj._cool.prog = obj.parentNode._cool.getProg();
        }
        else
        {
            obj._cool.prog = cool.compileSelector(obj._cool.select);
        }

        if (set != null)
        {
            obj._cool.field = cool.createField(set);
        }

        obj._cool.set = set;
        obj._cool.validCount = 0;
        obj._cool.isAlways = obj.getAttribute("always") != null;
        obj._cool.action = function (context, force)
        {
            if (this.arr == null || this.isAlways)
            {
                if (this.isSeveral)
                {
                    this.arr = this.obj.parentNode._cool.getArr();
                }
                else
                {
                    this.arr = cool.getBySelector(this.prog, this.obj);
                }

                for (var i = 0; i < this.arr.length; ++i)
                {
                    var itm = this.arr[i];

                    if (itm._validate == null)
                    {
                        itm._validate = 
                        {
                            validateLast : null
                        }

                        if (itm.getAttribute("required") == null)
                        {
                            itm.setAttribute("required", true);
                        }

                        var t = itm.getAttribute("type");

                        if (t != null && cool.validate[t] != null)
                        {
                            if (itm.getAttribute("pattern") == null)
                            {
                                itm.setAttribute("pattern", cool.validate[t].pattern);
                            }

                            if (itm.getAttribute("title") == null)
                            {
                                itm.setAttribute("title", cool.validate[t].title);
                            }
                            
                            itm._validate.validateTitle = itm.getAttribute("title");
                        }
                    }

                    var bind = this.func.bind(this);

                    itm.addEventListener("keyup", bind);
                    itm.addEventListener("change", bind);
                }
            }

            if (this.arr.length > 0 && this.validCount == this.arr.length)
            {
                this.actionBase(context, force);
            }
            else
            {
                this.cancel(context);
            }
        };
        obj._cool.func = function(arg)
        {
            var elm = ((window.event)?(event.srcElement):(arg.currentTarget));

            var delta = elm._validate.validateLast == elm.validity.valid ? 0 : elm._validate.validateLast == null ? elm.validity.valid ? 1 : 0 : elm._validate.validateLast ? -1 : 1;

            elm._validate.validateLast = elm.validity.valid;
            this.validCount += delta;

            if (this.field != null && delta != 0)
            {
                var val = this.field.get();

                val += delta;

                this.field.set(val);
            }

            // not work without forms
            //if (!elm.validity.valid)
            //{
            //    if (this.validateTitle != null)
            //    {
            //        elm.setCustomValidity(this.validateTitle);
            //        elm.reportValidity();
            //    }
            //}
            //else
            //{
            //    elm.setCustomValidity("");
            //}

            if (this.validCount == this.arr.length)
            {
                if (!this.isActive)
                {
                    this.actionBase({ initial: this.hash }, false);
                }
            }
            else if (this.isActive)
            {
                this.cancelBase({ initial: this.hash }, false);
            }
        };
    },

    // js-atr-proxy. This tag needs for html elements who has js-attributes
    tagAtrProxy: function(elm)
    {
        elm._cool.cancelDisplay = true;
        elm._cool.atrMap =
        {
            element: elm,
            other: function(name)
            {
                if (this.element._cool[name] != null)
                {
                    var atr = this.element._cool[name];

                    if (atr.changed != null)
                    {
                        atr.changed();
                    }
                }

                if (this.element._cool.js != null)
                {
                    this.element._cool.js.refresh(name);
                    this.element._cool.js.actionItem(name);
                }
            }
        }

        for (var i = 0; i < elm._cool.attributes.length; ++i)
        {
            var itm = elm._cool.attributes[i];

            if (cool.jsA[itm.name] != null)
            {
                cool.jsA[itm.name](elm, i);
            }
        }

        elm._cool.action = function (context, force)
        {
            for (var i = 0; i < this.attributes.length; ++i)
            {
                var itm = this.attributes[i];

                if (itm.action != null)
                {
                    itm.action(context);
                }
            }

            this.actionBase(context, force);
        };

        elm._cool.canncel = function (context, force)
        {
            for (var i = 0; i < this.attributes.length; ++i)
            {
                var itm = this.attributes[i];

                if (itm.cancel != null)
                {
                    itm.cancel(context);
                }
            }

            this.cancelBase(context, force);
        };
    },
    
    // js-text
    tagText: function(obj)
    {
        var path = obj.getAttribute("path");

        if (path == null || path == "")
        {
            return console.log("js-text: The 'path' attribute is empty.");
        }

        obj._cool.path = path;
        obj._cool.obj = obj;
        obj._cool.refresh = function (event, context)
        {
            var c = event.element._cool;
            var val = c.field.get();

            itm.element.innerHTML = val;

            return true;
        }
        obj._cool.action = function (context, force)
        {
            this.obj.innerHTML = this.field.get();
            this.actionBase(context, force);
        };

        obj._cool.field = cool.createField(path, { callback: obj._cool.refresh, element: obj });
    },
    
    // js-go
    tagGo: function(obj)
    {
        obj._cool.atrMap =
        {
            obj: obj,
            value: function()
            {
                var value = this.obj.getAttribute("value");

                if (value == null)
                {
                    return console.log("js-go: The 'value' attribute is empty.");
                }

                this.obj._cool.value = value;
            }
        };

        obj._cool.action = function (context, force)
        {
            cool.go(this.value);

            this.actionBase(context, force);
        };

        obj._cool.atrMap.value();
    },

    // js-call
    tagCall: function(obj)
    {
        var name = obj.getAttribute("name");
        var method = obj.getAttribute("method");
        var context = obj.getAttribute("context") != null;
        
        if (name == null || name == "")
        {
            name = "window";
        }

        if (method == null || method == "")
        {
            return console.log("js-call: The 'method' attribute is empty.");
        }

        obj._cool.params = [];

        var tmp = obj.querySelectorAll("js-param");

        for (var i = 0; i < tmp.length; ++i)
        {
            var itm = tmp[i];

            var value = itm.getAttribute("value");
            var type = itm.getAttribute("type");
            var tval = cool.createTypedValue("js-call", type, value);

            if (tval == null)
            {
                return;
            }

            obj._cool.params.push(tval);
        }

        obj._cool.name = name;
        obj._cool.method = method;
        obj._cool.isContext = context;
        obj._cool.action = function (context, force)
        {
            if (this.field == null)
            {
                this.field = cool.createField(this.name);
            }

            var tmp = this.field.get();

            if (tmp == null)
            {
                return console.log("js-call: The field '" + this.field.path + "' is undefined.");
            }
            
            var pars = [];

            for (var i = 0; i < this.params.length; ++i)
            {
                var itm = this.params[i];

                pars.push(itm.get());
            }

            if (this.isContext)
            {
                pars.push(context);
            }

            if (tmp[this.method] == null)
            {
                return console.log("js-call: Method '" + this.method + "' underfined.");
            }

            tmp[this.method].apply(tmp, pars);

            cool.changed(this.field.path, this.method, pars, null, null, context);

            this.actionBase(context, force);
        };
    },

    // js-width
    tagWidth: function (obj)
    {
        obj._cool.target = obj.getAttribute("target");
        obj._cool.min = obj.getAttribute("min");
        obj._cool.max = obj.getAttribute("max");

        if (obj._cool.target == null || obj._cool.target == "")
        {
            obj._cool.target = "window";
        }

        if (obj._cool.min == null || obj._cool.min == "")
        {
            obj._cool.min = 0;
        }
        else
        {
            obj._cool.min = parseInt(obj._cool.min);
        }

        if (obj._cool.max == null || obj._cool.max == "")
        {
            obj._cool.max = 4096;
        }
        else
        {
            obj._cool.max = parseInt(obj._cool.max);
        }

        obj._cool.prog = cool.compileSelector(obj._cool.target);
        
        obj._cool.action = function (context, force)
        {
            var arr = cool.getBySelector(this.prog, this.obj);

            if (arr.length > 0)
            {
                var w = 0;

                if (arr[0] == window)
                {
                    w = arr[0].innerWidth;
                }
                else
                {
                    w = arr[0].getBoundingClientRect().width;
                }

                if (w >= this.min && w <= this.max)
                {
                    this.actionBase(context, force);
                }
                else
                {
                    this.cancelBase({ initial: this.hash }, false);
                }
            }
            else
            {
                this.actionBase(context, force);
            }
        };

        obj._cool.cancel = function(context, force)
        {
            this.cancelBase(context, force);
        }

        function initEvent(obj)
        {
            return function ()
            {
                obj._cool.action({initial: obj._cool.hash}, false);
            }
        };

        window.addEventListener('resize', initEvent(obj), true);
    },

    // js-move
    tagMove: function (obj)
    {
        obj._cool.target = obj.getAttribute("target");
        obj._cool.isCancel = obj.getAttribute("cancel") != null;
        obj._cool.isAlways = obj.getAttribute("always") != null;

        if (obj._cool.target == null || obj._cool.target == "")
        {
            return console.log("js-move: The 'target' attribute is empty.");
        }

        obj._cool.prog = cool.compileSelector(obj._cool.target);
        obj._cool.move = function(context)
        {
            //if (!this.isAlways)
            //{
            //    for (var p in context)
            //    {
            //        if (context.hasOwnProperty(p))
            //        {
            //            if (p != this.parent._cool.hash && p != this.hash)
            //            {
            //                return;
            //            }
            //        }
            //    }
            //}

            var arr = cool.getBySelector(this.prog, this.obj);

            if (arr.length > 0)
            {
                var tar = arr[0];
                var tmp = [];

                for (var i = 0; i < this.obj.childNodes.length; ++i)
                {
                    var itm = this.obj.childNodes[i];

                    if (itm.nodeType == 1)
                    {
                        tmp.push(itm);
                    }
                }

                for (var i = 0; i < tmp.length; ++i)
                {
                    var itm = tmp[i];

                    tar.appendChild(itm);
                }

                // fiend parent cool tag
                var car = tar;

                while (car != null)
                {
                    if (car._cool != null)
                    {
                        break;
                    }

                    car = car.parentNode;
                }

                // move
                for (var i = 0; i < this.chields.length; ++i)
                {
                    var itm = this.chields[i];

                    car._cool.chields.push(itm);
                    itm._cool.parent = car;
                }

                this.chields = [];
            }
        };
        obj._cool.action = function (context, force)
        {
            if (context.initial == this.parent._cool.hash)
            {
                this.move(context);
            }
            
            if (this.isCancel)
            {
                this.cancelBase(context, force);

                this.isActive = null;
            }
            else
            {
                this.actionBase(context, force);
            }
        };
        obj._cool.cancel = function (context, force)
        {
            if (this.isCancel)
            {
                this.actionBase(context, force);
            }
            else
            {
                this.cancelBase(context, force);
            }
        };
    },

    // Attributes
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    // js 
    atrJs: function(obj, index)
    {
        var atr = obj._cool.attributes[index];

        obj._cool.js = atr;
        
        atr.element = obj;
        atr.refresh = function(selector, value)
        {
            if (selector != null)
            {
                if (typeof (selector) == "string" && this.element.hasAttribute(selector))
                {
                    var itm = this.element.attributes.getNamedItem(selector);

                    if (value != null)
                    {
                        itm.value = value;
                    }

                    this.refreshItem(itm);
                }
                else if (typeof (selector) == "number" && selector < this.element.attributes.length)
                {
                    var itm = this.element.attributes[selector];

                    if (value != null)
                    {
                        itm.value = value;
                    }

                    this.refreshItem(itm);
                }

                return;
            }

            atr.map = {};

            for (var i = 0; i < obj.attributes.length; ++i)
            {
                var itm = obj.attributes[i];
                var val = itm.value;

                if (val == null)
                {
                    continue;
                }

                this.refreshItem(itm);
            }
        };
        atr.refreshItem = function (item)
        {
            var ind = 0;
            var key = item.name;
            var val = item.value;
            var cur = null;

            while (true)
            {
                var last = ind;
                ind = val.indexOf("{{", ind);

                if (ind > -1)
                {
                    var end = val.indexOf("}}", ind);

                    if (end == -1)
                    {
                        break;
                    }

                    if (cur == null)
                    {
                        cur =
                        {
                            key: key,
                            name: key,
                            orign: val,
                            fields: [],
                            data: []
                        };

                        // destroy old fields
                        if (this.map[key] != null)
                        {
                            var tmp = this.map[key];

                            for (var i = 0; i < tmp.fields.length; ++i)
                            {
                                var fld = tmp.fields[i];

                                fld.destroy();
                            }
                        }

                        this.map[key] = cur;
                    }

                    // add text
                    if (ind - last > 0)
                    {
                        cur.data.push({ type: 0, value: val.substr(last, ind - last )});
                    }

                    ind += 2;

                    // add value
                    var str = val.substr(ind, end - ind);

                    cur.data.push({ type: 1, value: str });

                    // add observe
                    var fld = cool.createField(str, { callback: atr.onFieldChanged, element: this.element, tag: cur });

                    cur.fields.push(fld);
                    
                    ind = end + 2;

                    continue;
                }

                // add final text
                if (last > 0 && last < val.length)
                {
                    cur.data.push({ type: 0, value: val.substr(last) });
                }

                break;
            }

            if (key.indexOf("to-") == 0)
            {
                if (cur == null)
                {
                    cur =
                    {
                        name: key,
                        key: key.substr(3),
                        orign: val,
                        data: [{ type: 0, value: val }]
                    };

                    this.map[key] = cur;
                }
                else
                {
                    cur.key = key.substr(3);
                }
            }
        };
        atr.action = function ()
        {
            for (var name in this.map)
            {
                this.actionItem(name);
            }
        };
        atr.actionItem = function (name)
        {
            var itm = this.map[name];

            if (itm == null)
            {
                return;
            }

            var key = itm.key;
            var val = "";

            for (var i = 0; i < itm.data.length; ++i)
            {
                var row = itm.data[i];

                // text
                if (row.type == 0)
                {
                    val += row.value;
                }
                // variable
                else if (row.type == 1)
                {
                    try
                    {
                        var tmp = null;

                        eval("tmp = " + row.value);

                        if (tmp != null)
                        {
                            val += tmp;
                        }
                    }
                    catch (e)
                    {
                        console.log(e);
                    }
                }
            }

            this.element.setAttribute(key, val);
        };
        atr.onFieldChanged = function (event)
        {
            event.element._cool.js.actionItem(event.tag.name);
        };
        atr.element.refresh = atr.refresh;
        atr.refresh();
    },

    // js-bind
    atrBindBoth: function(obj, index)
    {
        cool.atrBindEx(obj, obj._cool.attributes[index], false, false);
    },

    // js-read
    atrBindRead: function(obj, index)
    {
        cool.atrBindEx(obj, obj._cool.attributes[index], true, false);
    },

    // js-write
    atrBindWrite: function(obj, index)
    {
        cool.atrBindEx(obj, obj._cool.attributes[index], false, true);
    },

    // js-bind all modes
    atrBindEx: function (obj, bind, isReadOnly, isWriteOnly)
    {
        obj._cool.bind = bind;

        bind.path = bind.value;

        if (bind.path == null || bind.path == "")
        {
            return console.log(obj.tagName + ": has empty 'js-bing' attribute.");
        }

        var tnm = obj.tagName.toLowerCase();

        bind.isInput = tnm == "input";
        bind.isTextarea = tnm == "textarea";//Textarea
        bind.isSelect = tnm == "select";
        bind.isFloat = obj.hasAttribute("float");
        bind.lock1 = false;
        bind.lock2 = false;
        bind.isCheckbox = false;
        bind.isRadio = false;
        bind.isText = false;
        bind.isNumber = false;
        bind.obj = obj;
        bind.isReadOnly = isReadOnly;
        bind.isWriteOnly = isWriteOnly;

        // validate
        if (bind.isInput)
        {
            var type = obj.getAttribute("type");

            if (type == "checkbox")
            {
                bind.isCheckbox = true;
            }
            else if (type == "radio")
            {
                bind.isRadio = true;
            }
            else if (type == "range" || type == "number")
            {
                bind.isNumber = true;
            }
            else
            {
                bind.isText = true;
            }
        }
        else if (bind.isTextarea || bind.isSelect)
        {
            bind.isText = true;
        }
        else
        {
            return console.log("The " + obj.tagName + " tag can't used with js-bind. You can use js-text tag for text binding, see docks.");
        }

        // set observe
        if (!isWriteOnly)
        {
            if (bind.isInput)
            {
                if (bind.isCheckbox)
                {
                    bind.refreshEx = function ()
                    {
                        var tmp = this.field.get();

                        if (tmp != null)
                        {
                            this.obj.checked = tmp;
                        }
                    };
                }
                else if (bind.isRadio)
                {
                    bind.refreshEx = function()
                    {
                        var tmp = this.field.get();

                        if (this.obj.value == tmp)
                        {
                            this.obj.checked = true;
                        }
                    };
                }
                else if (bind.isNumber || bind.isText)
                {
                    bind.refreshEx = function()
                    {
                        var tmp = this.field.get();

                        if (tmp != null)
                        {
                            this.obj.value = tmp;
                        }
                    };
                }
            }
            else
            {
                bind.refreshEx = function()
                {
                    var tmp = this.field.get();

                    if (tmp != null)
                    {
                        this.obj.value = tmp;
                    }
                };
            }

            bind.refresh = function (event, context)
            {
                var c = event.element._cool.bind;

                if (!c.lock2)
                {
                    c.lock1 = true;
                    c.refreshEx();
                    c.lock1 = false;
                }

                return true;
            };

            bind.field = cool.createField(bind.path, { callback : bind.refresh, element:  obj });
        }
        else
        {
            bind.field = cool.createField(bind.path);
        }

        bind.isInited = false;

        // event changes
        if (!isReadOnly)
        {
            if (bind.isInput)
            {
                if (bind.isCheckbox)
                {
                    bind.getVal = function()
                    {
                        return this.obj.checked;
                    };
                }
                else if (bind.isRadio)
                {
                    bind.getVal = function()
                    {
                        if (this.checked)
                        {
                            return this.obj.value;
                        }

                        return null;
                    };
                }
                else if (bind.isText)
                {
                    bind.getVal = function()
                    {
                        return this.obj.value;
                    };
                }
                else if (bind.isNumber)
                {
                    bind.getVal = function()
                    {
                        var tmp = this.isFloat ? parseFloat(this.obj.value) : parseInt(this.obj.value);

                        return tmp;
                    };
                }
            }
            else if (bind.isSelect || bind.isTextarea)
            {
                bind.getVal = function ()
                {
                    return this.obj.value;
                };
            }

            obj.addEventListener("change", function()
            {
                if (!this._cool.bind.lock1)
                {
                    this._cool.bind.lock2 = true;

                    var tmp = this._cool.bind.getVal();

                    if (tmp != null)
                    {
                        this._cool.bind.field.set(tmp);
                    }

                    this._cool.bind.lock2 = false;
                }
            });
        }

        bind.action = function()
        {
            if (!this.isWriteOnly)
            {
                this.lock1 = true;
                this.refreshEx();
                this.lock1 = false;
            }
        }
    },

    // js-class
    atrClass: function(obj, index, isCancel)
    {
        var atr = obj._cool.attributes[index];

        if (isCancel == null)
        {
            isCancel = false;
        }

        if (atr.value == "")
        {
            return console.log("Attribute 'js-class' empty.");
        }

        // compile operations
        var arr = atr.value.split(" ");
        var prog = [];

        for (var i = 0; i < arr.length; ++i)
        {
            var itm = arr[i];

            if (itm == "")
            {
                continue;
            }

            var c = itm[0];

            if (c == "+")
            {
                prog.push(
                {
                    cmd: 0,
                    name: itm.substr(1)
                });
            }
            else if (c == "-")
            {
                prog.push(
                {
                    cmd: 1,
                    name: itm.substr(1)
                });
            }
            else
            {
                prog.push(
                {
                    cmd: 2,
                    name: itm
                });
            }
        }

        atr.prog = prog;
        atr.func = function()
        {
            for (var i = 0; i < this.prog.length; ++i)
            {
                var itm = this.prog[i];

                switch (itm.cmd)
                {
                    case 0:
                    {
                        if (this._cool.obj.className.indexOf(itm.name) == -1)  
                        {
                            this._cool.obj.className += " " + itm.name;
                        }

                        break;
                    }
                    case 1:
                    {
                        var ind = this._cool.obj.className.indexOf(itm.name);

                        if (ind != -1)
                        {
                            this._cool.obj.className = this._cool.obj.className.substr(0, ind) + this._cool.obj.className.substr(ind + itm.name.length);
                        }
                        
                        break;
                    }
                    case 2:
                    {
                        this._cool.obj.className = itm.name;

                        break;
                    }
                }
            }
        };

        if (isCancel)
        {
            atr.cancel = atr.func;
            atr._cool.classCancel = atr;
        }
        else
        {
            atr.action = atr.func;
            atr._cool.class = atr;
        }
    },
    
    // js-class-cancel
    atrCancelClass: function(obj,  index)
    {
        cool.atrClass(obj, index, true);
    },

    
    // Navigator
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
    // for change page
    go: function(src)
    {
        // URL mode
        if (src.indexOf("http") == 0)
        {
            window.open(src);

            return false;
        }

        if (src == "back")
        {
            history.go(-1);

            return false;
        }

        if (src == "next")
        {
            history.go(1);

            return false;
        }

        if (window.location.hash != src)
        {
            window.location.hash = src;
        }

        return false;
    },

    // init navigator enveroupment
    initNavigator: function()
    {
        window.addEventListener("hashchange", function()
        {
            var flag = false;
            var h = window.location.hash;
            
            while (true)
            {
                var ind = h.indexOf("{{");

                if (ind >= 0)
                {
                    var end = h.indexOf("}}", ind);

                    if (end >= 0)
                    {
                        flag = true;

                        var f = h.substr(ind + 2, end - ind - 2);
                        var val = cool.createField(f).get();

                        h = h.substr(0, ind) + val.toString() + h.substr(end + 2);
                    }
                    else
                    {
                        break;
                    }
                }
                else
                {
                    break;
                }
            }

            if (flag)
            {
                window.location.hash = h;

                return;
            }

            cool.setPage();
        }, false);
    },

    // activate page
    setPage: function()
    {
        if (cool.lastUrlHash == window.location.hash && cool.lastUrlHash.length > 0)
        {
            return;
        }

        var hpg = window.location.hash;
        var arr = hpg.split("/");
        var page = arr[0];
        var lastPage = cool.lastUrlHash.split("/")[0];
      
        var i = 0;
        var itm = null;
        var list = cool.hashList[lastPage];

        if (list != null)
        {
            for (i = 0; i < list.length; ++i)
            {
                itm = list[i];

                itm._cool.cancelNav();
            }
        }

        var context = { initial: 'nav' };

        cool.lastUrlHash = hpg;

        list = cool.hashList[arr[0]];

        if (list != null)
        {
            for (i = 0; i < list.length; ++i)
            {
                itm = list[i];

                itm._cool.actionNav(context, false);
            }
        }

        var tmp = cool.lastPage;

        cool.currentPage = page;
        cool.lastPage = lastPage;

        cool.changed("cool.currentPage", "set", null, lastPage, page, context);
        cool.changed("cool.lastPage", "set", null, tmp, lastPage, context);

        cool.processContext (context);
    },

    // Ajax
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
    // Ajax request helper todo make headers    XMLHttpRequest.setRequestHeader(name, value)
    ajax: function(method, url, data, tag, callback)
    {
        var obj = new XMLHttpRequest();

        //obj.responseType = "text";
        obj.open(method, encodeURI(url), true);
        obj.setRequestHeader('Content-Type', 'text/plain');

        InitCoolElement(null, obj).data = data;

        obj.onreadystatechange = function ()
        {
            if (obj.readyState == 4)
            {
                callback(obj, tag);
            }
        }
        obj.go = function()
        {
            obj.send(this._cool.data);
        }

        return obj;
    },

    // ajax short for get
    ajaxGet: function(url, tag, callback)
    {
        return cool.ajax("GET", url, null, tag, callback);
    },

    // ajax short for post
    ajaxPost: function(url, data, tag, callback)
    {
        return cool.ajax("POST", url, data, tag, callback);
    },

    
    // Fields
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
    // observe hashtable
    obHt: {},

    // create field from field path
    // observe options: { depth : num, callback : func, element: HTMLelement, tag : any tags }
    createField: function (path, observe)
    {
        if (observe == null)
        {
            observe = { callback : null, element: null };
        }

        var field =
        {
            observe: observe,
            js: cool.parseJs(path),
            vars: [],
            ht: {},
            isInited : false,
            offset: 0,
            path: path,
            checkedPath: false,
            root : "",
            get: function (target, property)
            {
                var tmp = null;
                //var sckipInit = this.js.list.length > 0 && this.js.list[0].type == 32;
                //var sckipInit =
                //    this.js.type & 1 == 1 ||
                //    this.js.type & 2 == 2 ||
                //    this.js.type & 4 == 4 ||
                //    this.js.type & 8 == 8 ||
                //    this.js.type & 16 == 16 ||
                //    this.js.type & 32 == 32 ||
                //    this.js.type = 0;

                var sckipInit = this.js.flags != 256;

                if (target == null)
                {
                    if (!sckipInit)
                    {
                        target = window;
                    }
                }

                if (property == null)
                {
                    property = ";";
                }
                else
                {
                    if (!sckipInit)
                    {
                        property = this.path.length > 0 ? "." + property + ";" : property + ";";
                    }
                }

                try
                {
                    if (!this.checkedPath && !sckipInit)
                    {
                        var cur = target;
                        var arr = this.root.split('.');

                        for (var i = 0; i < arr.length; ++i)
                        {
                            var itm = arr[i];

                            if (cur[itm] == null)
                            {
                                return null;
                            }

                            cur = cur[itm];
                        }

                        this.checkedPath = true;
                    }
                    
                    if (sckipInit)
                    {
                        eval("tmp = " + this.path + ";");
                    }
                    else
                    {
                        eval("tmp = target." + this.path + property);
                    }
                }
                catch (e)
                {
                    // #remove_line
                    console.log(e);
                } 
                
                return tmp;
            },
            set: function (val, target, property)
            {
                if (target == null)
                {
                    target = window;
                }

                var last = this.get(target, property);
                var empty = true;

                if (property == null)
                {
                    property = "";
                }
                else
                {
                    property = this.path.length > 0 ? "." + property : property;
                    empty = false;
                }

                if (!this.checkedPath)
                {
                    var cur = target;
                    var arr = this.root.split('.');
                    var len = arr.length;

                    if (empty)
                    {
                        len -= 1;
                    }

                    for (var i = 0; i < len; ++i)
                    {
                        var itm = arr[i];

                        if (cur[itm] == null)
                        {
                            return null;
                        }

                        cur = cur[itm];
                    }

                    this.checkedPath = true;
                }

                if (!this.isInited)
                {
                    this.init(target);
                }
                
                try
                {
                    eval("target." + this.path + property + " = val;");

                    cool.changed(this.path + property, "set", null, last, val, this._context);
                }
                catch (e)
                {
                    // #remove_line
                    console.log(e);
                }
            },
            init: function (target)
            {
                var cur = target;
                var path = "";

                for (var i = 0; i < this.js.list.length - 1; ++i)
                {
                    var prp = this.js.list[i];

                    path += i == 0 ? prp.path : "." + prp.path;

                    // property
                    if (prp.type == 9)
                    {
                        if (cur[prp.path] == null)
                        {
                            cur[prp.path] = {};
                        }

                        cur = cur[prp.path];
                    }
                    // array
                    else if (prp.type == 2)
                    {
                        if (cur[prp.path] == null)
                        {
                            cur[prp.path] = [];
                        }

                        cur = cur[prp.path];

                        var ind = eval(prp.inner);

                        if (cur[ind] != null)
                        {
                            cur = cur[ind];
                        }
                        else
                        {
                            break;
                        }
                    }
                    // function
                    else if (prp.type == 6)
                    {
                        cur = eval(path + "(" + prp.inner + ")");
                    }
                }

                this.isInited = true;
            },
            refreshVars: function(arr, role)
            {
                var t = cool.expressionType;

                if (arr == null)
                {
                    arr = this.js.list;
                    role = 0;
                }

                var path = "";
                var start = 0;
                var end = 0;
                var skipRoot = false;

                for (; end < arr.length; ++end)
                {
                    var itm = arr[end];
                    var len = path == null ? 0 : path.length;

                    if (itm.type == t.var)
                    {
                        if (!skipRoot)
                        {
                            path += len == 0 ? itm.path : "." + itm.path;
                        }
                    }
                    else if (itm.type == t.array)
                    {
                        if (!skipRoot)
                        {
                            path += len == 0 ? itm.path : "." + itm.path;
                            
                            this.root = path;
                            this.addVar(path, 0, arr, start, end);
                        }

                        if ((itm.bodyFlags & t.function) == t.function || (itm.bodyFlags & t.var) == t.var || (itm.bodyFlags & t.object) == t.object)
                        {
                            skipRoot = true;
                        }
                        else
                        {
                            path += itm.bodyExp;
                        }
                        
                        this.refreshVars(itm.body, 1);
                    }
                    else if (itm.type == t.function)
                    {
                        skipRoot = true;

                        this.refreshVars(itm.body, 2);
                    }
                    else if (itm.type == t.operator || itm.type == t.conditional || itm.type == t.nope)
                    {
                        this.addVar(path, role, arr, start, end);

                        skipRoot = false;
                        path = "";
                        start = end + 1;
                    }
                }
                
                this.addVar(path, role, arr, start, end);

                // roles
                // 0 - root
                // 1 - index of array
                // 2 - param of function
            },
            addVar : function(path, role, arr, start, end)
            {
                if (path.length == 0)
                {
                    return;
                }

                if (path[0] == ".")
                {
                    path = path.substr(1);
                }

                if (this.ht[path] != null)
                {
                    return;
                }
                else
                {
                    this.ht[path] = true;
                }

                // todo future arr convert to variable map in field
                this.vars.push({ path: path, role: role, raw: arr.slice(start, end), start : start, end : end });

                if (role == 0 && this.root.length == 0)
                {
                    this.root = path;
                }
            },
            destroy: function ()
            {
                for (var i = 0; i < this.vars.length; ++i)
                {
                    var itm = this.vars[i];

                    cool.removeObserve(itm.path, field);
                }
            }
        };

        field.refreshVars();
        delete field.ht;

        if (observe.callback != null)
        {
            for (var i = 0; i < field.vars.length; ++i)
            {
                var itm = field.vars[i];

                cool.addObserve(itm.path, field, itm, observe.callback, observe.element, observe.tag);
            }
        }

        return field;
    },

    // add field to observe, ignore depth
    addObserve: function (path, field, fieldVar, callback, element, tag)
    {
        var arr = [];
        var ind = path.indexOf(".");

        while (ind > -1)
        {
            arr.push(path.substr(0, ind));

            ind = path.indexOf(".", ind + 1);
        }

        arr.push(path);
        
        for (var j = 0; j < arr.length; ++j)
        {
            var str = arr[j];

            if (cool.obHt[str] == null)
            {
                cool.obHt[str] = { list: [] };
            }

            var list = cool.obHt[str].list;
            var skip = false;

            // check exist
            for (var f = 0; f < list.length; ++f)
            {
                if (list[f].field == field)
                {
                    skip = true;

                    break;
                }
            }

            if (!skip)
            {
                list.push({ path: str, field: field, fieldVar: fieldVar, callback: callback, element: element, tag : tag });
            }
        }
    },

    // remove field from observation
    removeObserve: function (path, field)
    {
        var ind = path.indexOf(".");

        while (ind > -1)
        {
            arr.push(path.substr(0, ind));

            ind = path.indexOf(".", ind + 1);
        }

        arr.push(path);

        for (var j = 0; j < arr.length; ++j)
        {
            var str = arr[j];

            if (cool.obHt[str] == null)
            {
                cool.obHt[str] = { list: [] };
            }

            var list = cool.obHt[str].list;
            
            // check exist
            for (var f = 0; f < list.length; ++f)
            {
                if (list[f].field == field)
                {
                    list.splice(f, 1);

                    break;
                }
            }
        }
    },

     // call than property changed
    changed: function (path, method, args, last, curent, context)
    {
        var iamowner = false;

        if (cool.lockObserve)
        {
            return;
        }

        if (last != null && last == curent && typeof last != "object" && !(last instanceof Array))
        {
            return;
        }

        if (args == null)
        {
            args = [];
        }

        if (method == null)
        {
            method = "set";
        }

        if (context == null)
        {
            context = { initial: 0 };
            iamowner = true;
        }

        if (cool.obHt[path] != null)
        {
            var ob = cool.obHt[path];

            // #remove_line
            if (cool.trace) cool.logEx("Changed: " + path + "; Observe count: " + ob.list.length);

            for (var i = 0; i < ob.list.length; ++i)
            {
                var itm = ob.list[i];

                // #remove_line
                if (cool.trace) console.log(cool.tagLvlToString("Refresh: ", itm.element));

                if (context.map == null)
                {
                    context.map = {};
                }

                if (context.map[itm.element._cool.hash] == null)
                {
                    itm.path = path;
                    itm.method = method;
                    itm.args = args;

                    context.map[itm.element._cool.hash] = itm;
                }
            }
        }

        if (iamowner)
        {
            cool.processContext (context);
        }
    },

    // create typed value
    createTypedValue: function (owner, type, value)
    {
        if (type == null || type == "")
        {
            return console.log(owner + ": The 'type' attribute is empty");
        }
        else if (type != "int" && type != "float" && type != "bool" && type != "string" && type != "object" && type != "array" && type != "var")
        {
            return console.log(owner + ": The 'type' attribute must be: int or float or bool or string or object");
        }

        var ret =
        {
            type: type,
            fieldVal: null,
            //fieldCan: null,
            fastType: 0, // 0 - inline, 1 - var, 2 - object
            get: function ()
            {
                if (this.fastType == 1)
                {
                    if (this.fieldVal == null)
                    {
                        this.fieldVal = cool.createField(this.value);
                    }

                    return this.fieldVal.get();
                }
                else if (this.fastType == 2)
                {
                    return cool.cloneObj(this.value);
                }

                return this.value;
            }
        };

        if (type == "int")
        {
            ret.value = parseInt(value);
        }
        else if (type == "float")
        {
            ret.value = parseFloat(value);
        }
        else if (type == "bool")
        {
            ret.value = cool.parseBool(value);
        }
        else if (type == "var")
        {
            ret.fastType = 1; 
            ret.value = value;
        }
        else if (type == "object" || type == "array")
        {
            ret.fastType = 2;

            eval("ret.value = " + value);
        }
        else
        {
            ret.value = value;
        }

        return ret;
    },

    // process context
    processContext: function(context)
    {
        if (context.map == null)
        {
            return;
        }

        for (var key in context.map)
        {
            if (context.map.hasOwnProperty(key))
            {
                var itm = context.map[key];

                if (context[itm.element._cool.hash] != true)
                {
                    if (itm.element._cool.isActive == null && itm.element._cool.parent._cool.isActive)
                    {
                        itm.element._cool.isActive = true;
                    }

                    if (itm.callback(itm, context) == true)
                    {
                        context[itm.element._cool.hash] = true;
                    }
                }
            }
        }
    },

    // Selector query
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
    // build selector
    compileSelector: function(query)
    {
        var arr = query.split(".");
        var ret = [];
        var s, e = 0;
        var err = "Unknown operation: ";
        // last cmd - m

        for (var i = 0; i < arr.length; ++i)
        {
            var cmd = arr[i];

            if (cmd.length == 0)
            {
                continue;
            }

            switch (cmd)
            {
                case "parent":
                {
                    ret.push(
                    {
                        cmd: "0"
                    });

                    continue;
                }
                case "push-all":
                {
                    ret.push(
                    {
                        cmd: "2"
                    });

                    continue;
                }
                case "back":
                {
                    ret.push(
                    {
                        cmd: "4"
                    });

                    continue;
                }
                case "back-tree":
                {
                    ret.push(
                    {
                        cmd: "5"
                    });

                    continue;
                }
                case "body":
                {
                    ret.push(
                    {
                        cmd: "8"
                    });

                    continue;
                }
                case "break":
                {
                    ret.push(
                    {
                        cmd: "9"
                    });

                    continue;
                }
                case "document":
                {
                    ret.push(
                    {
                        cmd: "a"
                    });

                    continue;
                }
                case "head":
                {
                    ret.push(
                    {
                        cmd: "b"
                    });

                    continue;
                }
                case "continue":
                {
                    ret.push(
                    {
                        cmd: "c"
                    });

                    continue;
                }
                case "next":
                {
                    ret.push(
                    {
                        cmd: "d"
                    });

                    continue;
                }
                case "next-tree":
                {
                    ret.push(
                    {
                        cmd: "e"
                    });

                    continue;
                }
                case "last":
                {
                    ret.push(
                    {
                        cmd: "h"
                    });

                    continue;
                }
                case "window":
                {
                    ret.push(
                    {
                        cmd: "w"
                    });

                    continue;
                }
                case "if":
                {
                    ret.push(
                    {
                        cmd: ""
                    });

                    continue;
                }
                case "each":
                {
                    ret.push(
                    {
                        cmd: ""
                    });

                    continue;
                }
                case "push":
                {
                    ret.push(
                    {
                        cmd: ""
                    });

                    continue;
                }
                case "exit":
                {
                    ret.push(
                    {
                        cmd: ""
                    });

                    continue;
                }
                case "range":
                {
                    ret.push(
                    {
                        cmd: ""
                    });

                    continue;
                }
                case "log":
                {
                    ret.push(
                    {
                        cmd: ""
                    });

                    continue;
                }
                case "end":
                {
                    ret.push(
                    {
                        cmd: ""
                    });

                    continue;
                }
            }

            var c0 = cmd[0];

            switch (c0)
            {
                case "p":
                {
                    if (cmd.length > 8 && cmd.substr(0, 6) == "parent" && cmd[6] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd: "1",
                            index: parseInt(cmd.substr(7, cmd.length - 8))
                        });
                    }
                    else
                    {
                        console.log(err + cmd);

                        return [];
                    }

                    break;
                }
                case "c":
                {
                    if (cmd.length > 8 && cmd.substr(0, 6) == "chield" && cmd[6] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd: "3",
                            index: parseInt(cmd.substr(7, cmd.length - 8))
                        });
                    }
                    else
                    {
                        console.log(err + cmd);

                        return [];
                    }

                    break;

                }
                case "b":
                {
                    if (cmd.length > 6 && cmd.substr(0, 4) == "back" && cmd[4] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd: "6",
                            index: parseInt(cmd.substr(5, cmd.length - 6))
                        });
                    }
                    else if (cmd.length > 11 && cmd.substr(0, 9) == "back-tree" && cmd[9] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd: "7",
                            index: parseInt(cmd.substr(10, cmd.length - 11))
                        });
                    }
                    else
                    {
                        console.log(err + cmd);

                        return [];
                    }

                    break;

                }
                case "n":
                {
                    if (cmd.length > 6 && cmd.substr(0, 4) == "next" && cmd[4] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd: "f",
                            index: parseInt(cmd.substr(5, cmd.length - 6))
                        });
                    }
                    else if (cmd.length > 11 && cmd.substr(0, 9) == "next-tree" && cmd[9] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd: "g",
                            index: parseInt(cmd.substr(10, cmd.length - 11))
                        });
                    }
                    else
                    {
                        console.log(err + cmd);

                        return [];
                    }

                    break;

                }
                case "l":
                {
                    if (cmd.length > 6 && cmd.substr(0, 4) == "last" && cmd[4] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd: "i",
                            index: parseInt(cmd.substr(5, cmd.length - 6))
                        });
                    }
                    else
                    {
                        console.log(err + cmd);

                        return [];
                    }

                    break;
                }
                case "s":
                {
                    if (cmd == "selector(" || cmd == "selector-all(")
                    {
                        cmd += "." + arr[++i];
                    }

                    if (cmd.length > 10 && cmd.substr(0, 9) == "selector(" && cmd[cmd.length - 1] == ")")
                    {
                        ret.push(
                        {
                            cmd: "j",
                            query: cmd.substr(9, cmd.length - 10)
                        });
                    }
                    else if (cmd.length > 17 && cmd.substr(0, 13) == "selector-all(" && cmd[cmd.length - 1] == "]")
                    {
                        var ind = cmd.lastIndexOf(")");

                        if (ind == -1)
                        {
                            return console.log("the ')' expected");
                        }

                        ret.push(
                        {
                            cmd: "l",
                            query: cmd.substr(13, ind - 13),
                            index: parseInt(cmd.substr(ind + 1, cmd.length - ind - 1))
                        });
                    }
                    else if (cmd.length > 14 && cmd.substr(0, 13) == "selector-all(" && cmd[cmd.length - 1] == ")")
                    {
                        ret.push(
                        {
                            cmd: "k",
                            query: cmd.substr(13, cmd.length - 14)
                        });
                    }
                    else
                    {
                        console.log(err + cmd);

                        return [];
                    }

                    break;

                }
                case "o":
                {
                    if (cmd.length > 7 && cmd.substr(0, 7) == "object(") //&& cmd[cmd.length - 1] == ")"
                    {
                        var j = i;

                        for (;j < arr.length; ++j)
                        {
                            var itm = arr[j];

                            if (itm[itm.length - 1] == ")")
                            {
                                break;
                            }
                        }
                        
                        if (j < arr.length)
                        {
                            var q = cmd.substr(7, cmd.length - 7);

                            for (var n = i + 1; n < j; ++n)
                            {
                                q += '.' + arr[n];
                            }

                            if (j > i)
                            {
                                q += '.' + arr[j].substr(0, arr[j].length - 1);
                            }

                            i = j;

                            ret.push
                            ({
                                cmd: "o",
                                query: q
                            });
                        }
                        else
                        {
                            
                        }
                    }
                    else
                    {
                        console.log(err + cmd);

                        return [];
                    }

                    break;
                }
                default:
                {
                    console.log(err + cmd);

                    return [];
                }
            }
        }

        return ret;
    },

    // get elements by selector
    getBySelector: function(prog, elm)
    {
        var ret = [];
        var cur = elm;
        var pos = 0;
        var i = 0;
        var tmp = null;

        while (pos < prog.length && cur != null)
        {
            var isLast = pos == prog.length - 1;
            var opr = prog[pos++];

            switch (opr.cmd)
            {
                case "0": // parent
                {
                    if (cur != document)
                    {
                        cur = cur.parentNode;
                    }

                    break;
                }
                case "1": // parent[n]
                {
                    for (i = 0; i < opr.index && cur != document; ++i)
                    {
                        cur = cur.parentNode;
                    }

                    break;
                }
                case "2": // push-all
                {
                    for (i = 0; i < cur.children.length; ++i)
                    {
                        ret.push(cur.children[i]);
                    }

                    break;
                }
                case "3": // chield[n]
                {
                    if (opr.index < cur.children.length)
                    {
                        cur = cur.children[opr.index];
                    }

                    break;
                }
                case "4": // back
                {
                    if (cur.previousElementSibling != null)
                    {
                        cur = cur.previousElementSibling;
                    }

                    break;
                }
                case "5": // back-tree
                {
                    if (cur.previousElementSibling != null)
                    {
                        cur = cur.previousElementSibling;
                    }
                    else
                    {
                        cur = cur.parentNode;
                    }

                    break;
                }
                case "6": // back[n]
                {
                    for (i = 0; i < opr.index; ++i)
                    {
                        if (cur.previousElementSibling != null)
                        {
                            cur = cur.previousElementSibling;
                        }
                    }

                    break;
                }
                case "7": // back-tree[n]
                {
                    for (i = 0; i < opr.index; ++i)
                    {
                        if (cur.previousElementSibling != null)
                        {
                            cur = cur.previousElementSibling;
                        }
                        else
                        {
                            cur = cur.parentNode;
                        }
                    }

                    break;
                }
                case "8": // body
                {
                    cur = document.body;

                    break;
                }
                case "9": // break
                {

                    break;
                }
                case "a": // document
                {
                    cur = document;

                    break;
                }
                case "b": // head
                {
                    cur = document.head;

                    break;
                }
                case "c": // continue
                {

                    break;
                }
                case "d": // next
                {
                    if (cur.nextElementSibling != null)
                    {
                        cur = cur.nextElementSibling;
                    }

                    break;
                }
                case "e": // next-tree
                {
                    if (cur.children.length > 0)
                    {
                        cur = cur.children[0];
                    }
                    else
                    {
                        while (cur != document)
                        {
                            if (cur.nextElementSibling != null)
                            {
                                cur = cur.nextElementSibling;

                                break;
                            }
                            else
                            {
                                cur = cur.parentNode;
                            }
                        }
                    }

                    break;
                }
                case "f": // next[n]
                {
                    for (i = 0; i < opr.index; ++i)
                    {
                        if (cur.nextElementSibling != null)
                        {
                            cur = cur.nextElementSibling;
                        }
                        else
                        {
                            break;
                        }
                    }

                    break;
                }
                case "g": // next-tree[n]
                {
                    for (i = 0; i < opr.index; ++i)
                    {
                        while (cur != document)
                        {
                            if (cur.nextElementSibling != null)
                            {
                                cur = cur.nextElementSibling;

                                break;
                            }
                            else
                            {
                                cur = cur.parentNode;
                            }
                        }
                    }

                    break;
                }
                case "h": // last
                {
                    if (cur.children.length > 0)
                    {
                        cur = cur.children[cur.children.length - 1];
                    }

                    break;
                }
                case "i": // last[n]
                {
                    if (opr.index < cur.children.length)
                    {
                        cur = cur.children[cur.children.length - opr.index];
                    }
                    else if (cur.children.length > 0)
                    {
                        cur = cur.children[0];
                    }

                    break;
                }
                case "j": // selector(query)
                {
                    cur = cur.querySelector(opr.query);

                    break;
                }
                case "k": // selector-all(query)
                {
                    cur =
                    {
                        parentNode: cur,
                        nextElementSibling: null,
                        previousElementSibling: null,
                        children: cur.querySelectorAll(opr.query)
                    };

                    if (isLast)
                    {
                        for (i = 0; i < cur.children.length; ++i)
                        {
                            ret.push(cur.children[i]);
                        }

                        cur = null;
                    }

                    break;
                }
                case "l": // selector-all(query)[n]
                {
                    tmp = cur.querySelectorAll(opr.query);

                    if (opr.index < tmp.length)
                    {
                        cur = tmp[opr.index];
                    }

                    break;
                }
                case "m": // selector-all[n]
                {

                    break;
                }
                case "o": // object(query)
                {
                    cur = eval(opr.query);

                    if (cur == null || !(cur instanceof HTMLElement))
                    {
                        cur = null;
                    }

                    break;
                }
                case "w": // window
                {
                    cur = window;

                    break;
                }
                case "if":
                {

                    break;
                }
                case "each":
                {

                    break;
                }

                case "push":
                {

                    break;
                }
                case "exit":
                {

                    break;
                }
                case "range":
                {

                    break;
                }
                case "var":
                {

                    break;
                }
                case "log":
                {

                    break;
                }
                case "end":
                {

                    break;
                }
            }

            if (pos >= prog.length)
            {
                if (cur != null)
                {
                    ret.push(cur);
                }

                break;
            }
        }

        return ret;
    },

    // 
    $: function (elm, query)
    {
        var prog = cool.compileSelector(query);
        var ret = cool.getBySelector(prog, elm);

        return ret;
    },
    
    // Stream data protocol
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
    metaStream:
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
                                val = cool.parseBool(val);
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
        toShort: function(obj, spliter, arr)
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

            if (tagName == "js-ajax-stream")
            {
                var short1 = obj.getAttribute("short");

                if (short1 != null)
                {
                    return short1;
                }

                spliter = obj.getAttribute("spliter");

                if (spliter == null || spliter == "")
                {
                    return console.log("js-ajax-stream: The 'spliter' attribute is empty");
                }

                arr = [];

                arr.push(spliter);

                for (i = 0; i < obj.children.length; ++i)
                {
                    itm = obj.children[i];

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
                    return console.log("js-stream-var: The 'name' attribute is empty");
                }

                if (type == null || type == "")
                {
                    return console.log("js-stream-var: The 'type' attribute is empty");
                }

                if (type == "object")
                {
                    arr.push("o");
                    arr.push(name);

                    for (i = 0; i < obj.children.length; ++i)
                    {
                        itm = obj.children[i];

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
                    return console.log(tagName + ": The 'name' attribute is empty");
                }

                if (type == null || type == "")
                {
                    return console.log(tagName + ": The 'type' attribute is empty");
                }

                if (obj.children.length > 0 && type != "object")
                {
                    return console.log(tagName + ": The 'type' must be 'object' than chields more zero.");
                }

                if (tagName == "js-stream-for")
                {
                    arr.push("f");
                }
                else
                {
                    arr.push("w");

                    var sign = obj.getAttribute("sign");

                    if (sign == null || sign == "")
                    {
                        return console.log(tagName + ": The 'sign' attribute is empty");
                    }

                    name += ":" + sign;
                }

                arr.push(name);

                if (type == "object")
                {
                    for (i = 0; i < obj.children.length; ++i)
                    {
                        itm = obj.children[i];

                        cool.metaStream.toShort(itm, spliter, arr);
                    }
                }
                else if (type == "int")
                {
                    arr.push("v:-i");
                }
                else if (type == "bool")
                {
                    arr.push("v:-b");
                }
                else if (type == "float")
                {
                    arr.push("v:-f");
                }
                else if (type == "string")
                {
                    arr.push("v:");
                }

                arr.push("e");
            }
            else if (tagName == "js-stream-if")
            {
                name = obj.getAttribute("name");
                var value = obj.getAttribute("value");

                if (name == null || name == "")
                {
                    return console.log(tagName + ": The 'name' attribute is empty");
                }

                if (value == null || value == "")
                {
                    return console.log(tagName + ": The 'value' attribute is empty");
                }

                arr.push("i");
                arr.push(name);
                arr.push(value);

                for (i = 0; i < obj.children.length; ++i)
                {
                    itm = obj.children[i];

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

            stack.push({ obj: objTar, end: meta.length });

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
    },


    // Templating and Data
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    // the js-query context of data processing
    queryContext: { items : [], index : 0 },
    
    // clone object
    cloneObj: function(src)
    {
        var dst;

        if (src instanceof Array)
        {
            dst = [];

            for (var i = 0; i < src.length; ++i)
            {
                if (typeof src[i] == "object")
                {
                    dst.push(cool.cloneObj(src[i]));
                }
                else
                {
                    dst.push(src[i]);
                }
            }
        }
        else
        {
            dst = {};

            for (var p in src)
            {
                if (src.hasOwnProperty(p))
                {
                    if (typeof src[p] == "object")
                    {
                        dst[p] = cool.cloneObj(src[p]);
                    }
                    else
                    {
                        dst[p] = src[p];
                    }
                }
            }
        }

        return dst;
    },

    // computing for select query
    computeData : function(prog)
    {
        var comp = [];
        var main = prog.from.field.get();

        if (main == null)
        {
            return console.log("js-query: From's field " + prog.from.field.path + " is underfined.");
        }

        if (!(main instanceof Array))
        {
            var arr_tmp = [];

            for (var itm in main)
            {
                if (main.hasOwnProperty(itm))
                {
                    arr_tmp.push({ key: itm, val: main[itm]});
                }
            }

            main = arr_tmp;
        }
        
        cool.queryContext = { items: main, index: 0 };

        if (prog.join != null)
        {
            // init main
            for (var i = 0; i < main.length; ++i)
            {
                var tmp = {};

                main[i]["__source"] = i;

                tmp[prog.from.v] = main[i];

                comp.push(tmp);
            }

            // compute joins
            for (var j = 0; j < prog.join.list.length; ++j)
            {
                var join = prog.join.list[j];
                var count = comp.length;

                if (join.data == null)
                {
                    join.data = join.field.get();

                    // todo reseach optimization
                    var joinIsArray = join.data instanceof Array;

                    if (!joinIsArray)
                    {
                        var arr_tmp = [];

                        for (var itm in join.data)
                        {
                            if (join.data.hasOwnProperty(itm))
                            {
                                arr_tmp.push(join.data[itm]);
                            }
                        }

                        join.data = arr_tmp;
                    }
                }

                if (join.data == null)
                {
                    return console.log("js-query: Join field " + join.conditional.str + " is underfined.");
                }
                
                for (var c = 0; c < count; ++c)
                {
                    var com = comp[c];

                    if (join.data.length == 0 && document[join.conditional.func](com, null))
                    {
                        if (typeof com[join.v] == 'undefined')
                        {
                            com[join.v] = null;
                        }
                    }
                    else
                    {
                        for (var d = 0; d < join.data.length; ++d)
                        {
                            var newRec = null;
                            var und = typeof com[join.v] == 'undefined';
                            
                            var backup = null;

                            if (!und)
                            {
                                backup = com[join.v];
                            }

                            com[join.v] = join.data[d];
                            
                            if (document[join.funcName](com, join.data[d]))
                            {
                                if (!und)
                                {
                                    comp.push(cool.cloneObj(com));
                                }
                                else
                                {
                                    newRec = true;
                                }
                            }
                            else if (join.type == "Join-right" || join.type == "Join-full")
                            {
                                newRec = {};

                                comp.push(newRec);
                            }

                            if (newRec == null)
                            {
                                if (und)
                                {
                                    delete com[join.v];
                                }
                                else
                                {
                                    com[join.v] = backup;
                                }
                            }
                        }
                    }

                    if ((join.type == "Join" || join.type == "Join-right") && typeof com[join.v] == 'undefined') //&& com[join.v] == null
                    {
                        comp.splice(c--, 1);
                        count--;
                    }
                }

                join.data = null;
            }
        }
        // without joins
        else
        {
            comp = [];

            // init main
            for (var i = 0; i < main.length; ++i)
            {
                main[i]["__source"] = i;

                comp.push(main[i]);
            }
        }

        // Where
        if (prog.where != null)
        {
            for (var e = 0; e < comp.length; ++e)
            {
                tmp = comp[e];

                cool.queryContext.index = e;

                if (!document[prog.where.condFuncName](tmp))
                {
                    comp.splice(e--, 1);
                }
            }
        }

        // Group 
        if (prog.group != null)
        {
            var sj = 0;

            if (prog.join == null)
            {
                sj = 1;
            }

            for (var y = 0; y < prog.group.length; ++y)
            {
                var grp = prog.group[y];
                var path = grp.split('.');

                var ht = {};

                for (var u = 0; u < comp.length; ++u)
                {
                    var ttt = comp[u];
                    
                    for (var q = sj; q < path.length; ++q)
                    {
                        ttt = ttt[path[q]];
                    }
                    
                    if (ht[ttt] == null)
                    {
                        ht[ttt] = 0;
                    }
                    else
                    {
                        comp.splice(u--, 1);
                    }
                }
            }
        }
        
        // Order
        if (prog.order != null)
        {
            comp.sort(document[prog.order.func]);
        }

        cool.queryContext.itemsResult = comp;

        return comp;
    },

    // check exist
    exist: function (item, obj, path)
    {
        var itemKey;
        var tmp = InitCoolElement(1, obj);
        var ht = null;

        if (path == null)
        {
            path = "";
        }

        var key = tmp.hash + "." + path;

        // build hashtable
        if (cool.queryContext[key] == null)
        {
            if (obj instanceof Array)
            {
                ht = {};

                for (var i = 0; i < obj.length; ++i)
                {
                    if (path == "")
                    {
                        itemKey = obj[i];
                    }
                    else
                    {
                        eval("itemKey = obj[i]." + path);
                    }

                    ht[itemKey] = 32;
                }
            }
            else
            {
                ht = obj;
            }

            cool.queryContext[key] = ht;
        }
        else
        {
            ht = cool.queryContext[key];
        }

        return ht[item] == 32;
    },

    // make element from template
    makeQueryItem: function (cnt, flag, index)
    {
        var arr = [];

        var tmp = cnt.template;
        var roots = cnt.rootMap;

        for (var i = 0; i < tmp.list.length; ++i)
        {
            var itm = tmp.list[i];

            itm.cache = cnt.cache;

            // text
            if (itm.type == 0)
            {
                arr.push(itm.text);
            }
            // #if #else block
            else if (itm.type == 1)
            {
                if (itm.conditional.selfVars)
                {
                    if (document[itm.func].apply(window, roots.args))
                    {
                        itm.template = itm.main_block;
                        itm.rootMap = roots;

                        arr.push(cool.makeQueryItem(itm, false, index));
                    }
                    else if (itm.else_block != null)
                    {
                        itm.template = itm.else_block;
                        itm.rootMap = roots;

                        arr.push(cool.makeQueryItem(itm, false, index));
                    }
                }
                else
                {
                    arr.push("#if");

                    itm.template = itm.conditional;
                    itm.rootMap = roots;

                    arr.push(cool.makeQueryItem(itm, false, index));
                    arr.push(" #");// todo and here

                    itm.template = itm.main_block;
                    itm.rootMap = roots;

                    arr.push(cool.makeQueryItem(itm, false, index));

                    if (itm.else_block != null)
                    {
                        itm.template = itm.else_block;
                        itm.rootMap = roots;

                        arr.push("#else");
                        arr.push(cool.makeQueryItem(itm, false, index));
                    }

                    arr.push("#end-if");
                }
            }
            // #script block
            else if (itm.type == 2)
            {
                if (itm.prog.selfVars)
                {
                    var res1 = document[itm.func].apply(window, roots.args);

                    if (res1 != null)
                    {
                        arr.push(res1);
                    }
                }
                else
                {
                    itm.template = itm.prog;
                    itm.rootMap = roots;

                    arr.push("#script");
                    arr.push(cool.makeQueryItem(itm, false, index));
                    arr.push("#end-script");
                }
            }
            // variable
            else if (itm.type == 3)
            {
                if (itm.selfVar)
                {
                    var res2 = itm.vField.get(roots);

                    if (res2 != null)
                    {
                        if (typeof res2 == "object")
                        {
                            var name = "v" + cool.getRandomString();

                            cool.__cache[name] = res2;

                            arr.push("cool.__cache." + name);

                            cnt.cache.push(name);
                        }
                        else
                        {
                            arr.push(res2);
                        }
                    }
                    else
                    {
                        arr.push(itm.text);
                    }
                }
                else
                {
                    arr.push("{{");
                    arr.push(itm.text);
                    arr.push("}}");
                }
            }
            // index
            else if (itm.type == 4)
            {
                if (itm.selfVar)
                {
                    arr.push(index);
                }
                else
                {
                    arr.push("{{");
                    arr.push(itm.text);
                    arr.push("}}");
                }
            }
            else if (itm.type == 5)
            {
                var __tmp;

                eval("__tmp = " + itm.text.substr(1));

                arr.push(__tmp);
            }
        }

        var str = arr.join("");

        return str;
    },

    // build js-query template
    buildTemplate : function(str, roots)
    {
        var tmp = { list: [], selfVars : true};

        var len_end_if = "#end-if".length;
        var len_end_sc = "#end-script".length;

        var skip_map = [];

        // build skip map for internal queries
        for (var i = 0; i < str.length; ++i)
        {
            var inds = cool.findCloseTag(str, "<js-query", "</js-query", i);

            if (inds.start > -1)
            {
                inds.type = 1;
                skip_map.push(inds);

                i += inds.end + "</js-query".length - 1;

                continue;
            }

            inds = cool.findCloseTag(str, "type='js-query", "</script", i);

            if (inds.start > -1)
            {
                inds.type = 1;
                skip_map.push(inds);

                i += inds.end + "</script".length - 1;

                continue;
            }

            inds = cool.findCloseTag(str, "type=\"js-query", "</script", i);

            if (inds.start > -1)
            {
                inds.type = 1;
                skip_map.push(inds);

                i += inds.end + "</script".length - 1;

                continue;
            }


            break;
        }

        for (var i = 0; i < str.length; ++i)
        {
            var inds0 = cool.findCloseTag(str, "#if", "#end-if", i);
            var inds1 = cool.findCloseTag(str, "#script", "#end-script", i);

            var inds = null;
            var flag = true;

            if (inds0.start > -1 && inds1.start > -1)
            {
                if (inds0.start < inds1.start) 
                {
                    inds = inds0;
                }
                else
                {
                    inds = inds1;
                    flag = false;
                }
            }
            else if (inds0.start > -1)
            {
                inds = inds0;
            }
            else if (inds1.start > -1)
            {
                inds = inds1;
                flag = false;
            }

            // nothing here exit
            if (inds == null)
            {
                tmp.list.push(
                {
                    type : 0,
                    text: str.substr(i)
                }); 

                break;
            }
            
            var need_skip = false;

            // check skip
            for (var j = 0; j < skip_map.length; ++j)
            {
                var skip = skip_map[j];

                if (inds.start > skip.start && inds.start < skip.end)
                {
                    need_skip = true;

                    break;
                }
            }

            if (need_skip)
            {
                var len = 0;

                if (flag)
                {
                    len = inds.end + len_end_if;
                }
                else
                {
                    len = inds.end + len_end_sc;
                }

                tmp.list.push(
                {
                    type : 0,
                    text: str.substr(i, len)
                }); 

                i += len - 1;

                continue;
            }

            if (flag)
            {
               // todo .... fuck here
                var ind1 = str.indexOf(" #", inds.start + 1);

                if (ind1 == -1)
                {
                    tmp.list.push(
                    {
                        type : 0,
                        text: str.substr(i)
                    }); 

                    console.log("js-query template warning at " + i + "char: Possible wrong #if syntax. The close conditional char '#' not found.");

                    break;
                }

                if (inds.end == -1)
                {
                    tmp.list.push(
                    {
                        type : 0,
                        text: str.substr(i)
                    });   

                    console.log("js-query template warning at " + i + "char: Possible wrong #if syntax. The '#end' of block #if-#end-if not found.");

                    break;
                }

                // text space
                tmp.list.push(
                {
                    type: 0,
                    text: str.substr(i, inds.start - i)
                });

                var inds_else = cool.findCloseTag(str, "#if", "#else", inds.start);

                var ind3 = inds_else.end;
                var text0 = cool.buildTemplate(str.substr(inds.start + 3, ind1 - inds.start - 3), roots);

                var obj1 =
                {
                    type: 1,
                    conditional: text0
                };

                if (ind3 != -1 && ind3 < inds.end)
                {
                    obj1.main_block = cool.buildTemplate(str.substr(ind1 + 2, ind3 - ind1 - 2), roots);
                    obj1.else_block = cool.buildTemplate(str.substr(ind3 + 5, inds.end - ind3 - 5), roots);
                }
                else
                {
                    obj1.main_block = cool.buildTemplate(str.substr(ind1 + 2, inds.end - ind1 - 2), roots);
                }
                
                if (obj1.conditional.selfVars)
                {
                    obj1.func = cool.getRandomString();

                    var args0 = "";

                    for (var m in roots)
                    {
                        if (roots.hasOwnProperty(m))
                        {
                            args0 += m + ", ";
                        }
                    }

                    args0 += "__index";

                    var scr0 = document.createElement('script');

                    scr0.type = 'text/javascript';
                    scr0.text = "document['" + obj1.func + "'] = function(" + args0 + "){ return " + cool.concateTmpFrag(obj1.conditional) + ";}";

                    document.getElementsByTagName('body')[0].appendChild(scr0);
                }
            
                tmp.list.push(obj1);

                i = inds.end + len_end_if - 1;
            }
            else
            {
                if (inds.end == -1)
                {
                    tmp.list.push(
                    {
                        type : 0,
                        text: str.substr(i)
                    }); 

                    console.log("js-query template warning at " + i + "char: Possible wrong #script syntax. The '#end-script' of #script block not found.");

                    break;
                }

                // text space
                tmp.list.push(
                {
                    type: 0,
                    text: str.substr(i, inds.start - i)
                });
                    
                var text = str.substr(inds.start + 7, inds.end - inds.start - 7);
                var prog = cool.buildTemplate(text, roots);
                var func = null;

                if (prog.selfVars)
                {
                    func = cool.getRandomString();

                    var args1 = "";

                    for (var l in roots)
                    {
                        if (roots.hasOwnProperty(l))
                        {
                            args1 += l + ", ";
                        }
                    }

                    args1 += " __index";

                    var scr1 = document.createElement('script');

                    scr1.type = 'text/javascript';
                    scr1.text = "document['" + func + "'] = function(" + args1 + "){" + cool.concateTmpFrag(prog) + ";}"; // args1.substr(0, args1.length - 2)

                    document.getElementsByTagName('body')[0].appendChild(scr1);
                }
                    
                tmp.list.push(
                {
                    type : 2,
                    prog: prog,
                    text: text,
                    func : func
                }); 

                i = inds.end + len_end_sc - 1;
            }
        }

        // parse variables
        for (var n = 0; n < tmp.list.length; ++n)
        {
            var itm1 = tmp.list[n];

            if (itm1.type == 0)
            {
                itm1 = tmp.list.splice(n, 1)[0];

                for (var r = 0; r < itm1.text.length; ++r)
                {
                    var ind6 = itm1.text.indexOf("{{", r);

                    if (ind6 == -1)
                    {
                        tmp.list.splice(n, 0,
                        {
                            type: 0,
                            text: itm1.text.substr(r)
                        });

                        break;
                    }

                    var ind7 = itm1.text.indexOf("}}", ind6);

                    if (ind7 == -1)
                    {
                        tmp.list.splice(n, 0,
                        {
                            type: 0,
                            text: itm1.text.substr(r)
                        });

                        console.log("js-query template warning at " + r + "char: Possible wrong {{...}} syntax. Closing braces '}}' not found.");

                        break;
                    }

                    // text space
                    tmp.list.splice(n++, 0,
                    {
                        type: 0,
                        text: itm1.text.substr(r, ind6 - r)
                    });

                    var text2 = itm1.text.substr(ind6 + 2, ind7 - ind6 - 2);
                    var vField = cool.createField(text2);
                    var selfVar = roots[vField.js.list[0].path] != null;

                    vField.offset = 1;

                    tmp.selfVars = tmp.selfVars && selfVar;

                    var ttt = 3;

                    if (vField.js.list.length == 2 && vField.js.list[1].path == "__index")
                    {
                        ttt = 4;
                    }

                    if (vField.js.list.length > 0 && vField.js.list[0].path[0] == "$")
                    {
                        ttt = 5;
                    }
                    
                    tmp.list.splice(n++, 0,
                    {
                        type: ttt,
                        text: text2,
                        vField: vField,
                        selfVar: selfVar
                    });

                    r = ind7 + 1;
                }
            }
        }

        return tmp;
    },

    // concate template fragments
    concateTmpFrag : function(frag)
    {
        var str = "";

        for (var i = 0; i < frag.list.length; ++i)
        {
            var itm = frag.list[i];

            // text
            if (itm.type == 0)
            {
                str += itm.text;
            }
            // #if-#end
            else if (itm.type == 1)
            {
                str += "if (" + cool.concateTmpFrag(itm.conditional) + " ) ";
                str += "{ " + cool.concateTmpFrag(itm.main_block) + " } ";

                if (itm.else_block != null)
                {
                    str += "else { " + cool.concateTmpFrag(itm.else_block) + " } ";
                }
            }
            // #script-#end
            else if (itm.type == 2)
            {
                str += cool.concateTmpFrag(itm.prog);
            }
            // #var
            else if (itm.type == 3)
            {
                str += itm.text;
            }
            // #index
            else if (itm.type == 4)
            {
                str += "__index";
            }
        }

        return str;
    },

    // make script tags
    toQueryScript: function(str)
    {
        var cur = 0;
        var ret = str;
        var inds = cool.findCloseTag(str, "<js-query", "</js-query", cur);

        while (inds.start >= 0 && inds.end > 0)
        {
            var tmp_s = str.indexOf("<script", cur);

            if (tmp_s != -1)
            {
                var tmp_e = str.indexOf(">", tmp_s);

                if (tmp_e != -1)
                {
                    var tmp_c = str.indexOf("</script", tmp_e);
                    var tmp_t = str.indexOf("type", tmp_s);

                    if (tmp_t != -1 && tmp_t < tmp_e && tmp_c != -1)
                    {
                        var tmp_q = str.indexOf("js-query", tmp_t);

                        if (tmp_q != -1 && tmp_q < tmp_e && tmp_s < inds.start && tmp_c > inds.start)
                        {
                            cur = tmp_c;

                            inds = cool.findCloseTag(ret, "<js-query", "</js-query", cur);
                            
                            continue;
                        }
                    }
                }
            }
            
            ret = ret.substr(0, inds.start) + "<script type='js-query'" + ret.substring(inds.start + "<js-query".length, inds.end) + "</script" + ret.substring(inds.end + "</js-query".length, ret.length);

            cur = inds.end;

            inds = cool.findCloseTag(ret, "<js-query", "</js-query", cur);
        }

        return ret;
    },

    // find close tag
    findCloseTag: function(str, stg, etg, init)
    {
        str = str.toLowerCase();

        if (init == null)
        {
            init = 0;
        }
        
        var lvl = 0;
        var ind = str.indexOf(stg, init);
        var start = ind;
        var end = -1;

        while (ind >= 0)
        {
            lvl++;

            var stop = str.indexOf(etg, ind);
            var tmp = ind;

            if (stop == -1)
            {
                break;
            }

            while (stop >= 0 || lvl == 0)
            {
                lvl--;

                end = stop;

                tmp = str.indexOf(stg, tmp + 1);

                if (tmp < 0 || tmp > stop)
                {
                    break;
                }

                lvl++;

                stop = str.indexOf(etg, stop + 1);
            }

            if (lvl == 0 || stop < 0)
            {
                break;
            }

            ind = str.indexOf(stg, stop + 1);
        }

        return { start: start, end: end };
    },

    // cteate attribute map for cool element
    createAtrMap: function (elm, map)
    {
        map.element = elm;
        map.fields = {};

        map.read = function (name)
        {
            var val = this.element.getAttribute(name);

            if (val == null)
            {
                return null;
            }

            var ind = 0;
            var str = "";

            // destroy old fields
            if (this.fields[name] != null)
            {
                var tmp = this.fields[name];

                for (var i = 0; i < tmp.fields.length; ++i)
                {
                    var fld = tmp.fields[i];

                    fld.destroy();
                }
            }

            this.fields[name] = [];

            while (true)
            {
                var last = ind;

                ind = val.indexOf("{{", ind);

                if (ind > -1)
                {
                    var end = val.indexOf("}}", ind);

                    if (end == -1)
                    {
                        break;
                    }

                    // add text
                    str += val.substr(last, ind - last);

                    ind += 2;

                    // add value
                    var tmp = val.substr(ind, end - ind);

                    // add observe
                    var fld = cool.createField(tmp, { callback: this.onFieldChanged, element: this.element, tag: name });

                    this.fields[name].push(fld);

                    str += fld.get();

                    ind = end + 2;

                    continue;
                }

                // add final text
                str += val.substr(last);

                break;
            }

            return str;
        };
        map.onFieldChanged = function(event)
        {
            event.element._cool.atrMap[event.tag]();
        }

        elm._cool.atrMap = map;
    },
    
    // Helpers
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
    // formating string
    decorateString : function(str)
    {
        if (str.length == 0 || cool.booleanHt[str] != null || parseInt(str) == str)
        {
            return str;
        }

        if (str[0] == '&')
        {
            return str.substring(1);
        }

        return "\"" + str + "\"";
    },

    expressionType:
    {
        nope: 0,
        object: 1,
        array: 2,  
        string: 4,
        int: 8, 
        float: 16,  
        function: 32,  
        operator: 64,  
        conditional: 128,  
        var: 256         
    },
    
    // parse Js expression
    parseJs: function (str, exps, start, end)
    {
        var t = cool.expressionType;

        if (exps == null)
        {
            exps = cool.splitExpression(str);

            start = 0;
            end = exps.length;
        }

        var ret = { list: [], flags: t.nope };
        var list = ret.list;

        for (var n = start; n < end; ++n)
        {
            var exp = exps[n];

            switch (exp)
            {
                case "{":
                case "[" :
                case "(" :
                {
                    var type = t.function;
                    var close = ")";

                    if (exp == "{")
                    {
                        type = t.object;
                        close = "}";
                    }
                    else if (exp == "[")
                    {
                        type = t.array;
                        close = "]";
                    }
                    
                    var ind = -1;

                    for (var j = n + 1; j < end; ++j)
                    {
                        if (exps[j] == close)
                        {
                            ind = j;

                            break;
                        }
                    }

                    if (ind < 0)
                    {
                        return console.log("Syntax error: closed brace '" + close + "' not found in " + str);
                    }


                    var js = cool.parseJs(null, exps, n + 1, ind);

                    if (list.length == 0)
                    {
                        list.push({path: ""});
                    }
                    
                    var ppc = list.length - 1;
                    
                    list[ppc] =
                    {
                        type: type,
                        head: list[ppc],
                        body: js.list,
                        bodyFlags : js.flags,
                        bodyExp: ""
                    };
                    
                    ret.flags |= type;
                    ret.flags |= js.flags;
                    
                    // todo make it rain
                    list[ppc].path = list[ppc].head.path;
                    list[ppc].inner = "";
                    
                    for (var c = n + 1; c < ind; ++c)
                    {
                        list[ppc].inner += exps[c];
                    }

                    for (var c = n; c <= ind; ++c)
                    {
                        list[ppc].bodyExp += exps[c];
                    }

                    n = ind;

                    break;
                }
                case '==':
                case '!=':
                case '&&':
                case '||':
                case '<=':
                case '>=':
                case '<':
                case '>':
                {
                    list.push
                    ({
                        type: t.conditional,
                        operator : exp
                    });
                    
                    ret.flags |= t.conditional;
                    
                    break;
                }
                case '<<':
                case '>>':
                case '+':
                case '-':
                case '/':
                case '*':
                case '&':
                case '^':
                case '!':
                {
                    list.push
                    ({
                        type: t.operator,
                        operator : exp
                    });

                    ret.flags |= t.operator;

                    break;
                }
                case ',':
                {
                    list.push
                    ({
                        type: t.nope,
                        operator: exp
                    });

                    ret.flags |= t.nope;

                    continue;
                }
                default:
                {
                    if (exp.length == 0)
                    {
                        continue;
                    }

                    if (exp[0] == '.')
                    {
                        exp = exp.substr(1);
                    }

                    var tmp = exp.split('.');

                    for (var b = 0; b < tmp.length; ++b)
                    {
                        var tmp_itm = tmp[b];
                        var tmp_t = cool.getType(tmp_itm);

                        list.push
                        ({
                            type: tmp_t,
                            path: tmp_itm
                        });

                        ret.flags |= tmp_t;
                    }

                    break;
                }
            }
        }

        return ret;
    },

    // split JS expression
    splitExpression: function (select)
    {
        var str = ['(', ')', '{', '}', '[', ']', '==', '!=', '&&', '||', '<=', '>=', '<<', '>>', '<', '>', '+', '-', '/', '*', '&', '^', '!', ','];
        var arr = select.split(' ');
        //var arr = cool.split(select, " ,");

        for (cool.outPos = 0; cool.outPos < arr.length; ++cool.outPos)
        {
            var itm = arr[cool.outPos];

            if (itm == "")
            {
                arr.splice(cool.outPos, 1);
                cool.outPos--;

                continue;
            }

            for (var j = 0; j < str.length && cool.outPos < arr.length; ++j)
            {
                cool.splitAndInsert(arr, str[j]);
            }
        }

        return arr;
    },

    // split and insert
    splitAndInsert: function(arr, str)
    {
        var ddd = cool.outPos;
        var itm = arr[ddd];
        var ind = itm.indexOf(str);
        var last = -1;
        var flag = false;

        if (itm == str)
        {
            return;
        }

        if (itm == str)
        {
            //ddd++;

            return false;
        }

        if (ind == 0)
        {
            arr[ddd++] = str;

            flag = true;
        }
        else if (ind > 0)
        {
            arr[ddd++] = itm.substr(0, ind);
            arr.splice(ddd++, 0, str);

            flag = true;
        }

        while (flag)
        {
            last = ind;
            ind = itm.indexOf(str, ind + 1);

            if (ind == -1)
            {
                break;
            }

            if (ind - last == 1)
            {
                arr.splice(ddd++, 0, str);
            }
            else
            {
                arr.splice(ddd++, 0, itm.substr(last + 1, ind - last - 1));
                arr.splice(ddd++, 0, str);
            }
        }

        if (last > -1 && itm.length - last > 1)
        {
            arr.splice(ddd++, 0, itm.substr(last + str.length));
        }
    },

    // get type value of string 
    getType: function(str)
    {
        var t = cool.expressionType;

        if (str.length == 0)
        {
            return t.nope;
        }

        if (str.length > 1 && (str[0] == '"' && str[str.length - 1] == '"' || str[0] == "'" && str[str.length - 1] == "'"))
        {
            return t.string;
        }

        if (str == parseInt(str).toString())
        {
            return t.int;
        }

        if (str == parseFloat(str).toString())
        {
            return t.float;
        }

        return t.var;
    },

    // random string for function name
    getRandomString : function()
    {
        return "rnd" + (performance.now().toString(36) + Math.random().toString(36)).split(".").join("_");
    },

    // finding next query operator. Used on select query compile.
    findNextOperator: function(pos, arr)
    {
        for (var i = pos; i < arr.length; ++i)
        {
            if (arr[i] == "Join" || arr[i] == "Join-left" || arr[i] == "Join-right" || arr[i] == "Join-full" || arr[i] == "Where" || arr[i] == "Order" || arr[i] == "Group")
            {
                return i;
            }
        }

        return arr.length;
    },

    // init dom tree and preload resource
    processElementWithPreload : function(elm, callback)
    {
        var arr = [];

        for (var i = 0; i < elm.childNodes.length; ++i)
        {
            var itm = elm.childNodes[i];

            if (itm.tagName == "JS-LOAD")
            {
                arr.push(itm);
            }
        }

        if (arr.length > 0)
        {
            for (var j = 0; j < arr.length; ++j)
            {
                var itm = arr[j];
                var src = itm.getAttribute("src");

                if (src == null)
                {
                    continue;
                }

                cool.ajaxGet(src, {arr: arr, index: j, elm: elm, callback: callback}, function (http, tag)
                {
                    tag.arr.splice(tag.index, 1);

                    if (tag.arr.length == 0)
                    {
                        //cool.processElement(tag.elm);

                        if (tag.callback != null)
                        {
                            tag.callback();
                        }
                    }
                }).go();
            }
        }
        else
        {
            //cool.processElement(elm);

            if (callback != null)
            {
                callback();
            }
        }
    },

    // init dom tree
    processElement : function(elm, forceParent)
    {
        var ptn = "js-set, js-call, js-query, script[type=js-query], js-load, js-page, js-if, js-ajax, js-several, js-event, js-style, js-atr, js-validate, js-text, js-go, js-width, js-move, [js-bind], [js-read], [js-write], [js-class], [js-class-cancel], [js], html";
        var tmp = elm.querySelectorAll(ptn);
        var ht = {}; 
        var i = 0;
        var itm = null;
        var name = "";
        var code = 0;

        if (ptn.indexOf(elm.tagName.toLowerCase()) > 0)
        {
            code = InitCoolElement(null, elm).hash;

            ht[code] = elm;
        }
      
        var arr = [];

        // filter tags and init base function
        for (i = 0; i < tmp.length; ++i)
        {
            itm = tmp[i];

            if (itm._cool != null)
            {
                continue;
            }

            name = itm.tagName.toLowerCase();

            for (var n in cool.jsA)
            {
                if (cool.jsA.hasOwnProperty(n))
                {
                    var val = itm.getAttribute(n);

                    if (val != null)
                    {
                        if (itm._cool == null)
                        {
                            InitCoolElement(null, itm);
                        }

                        if (cool.jsF[name] == null)
                        {
                            name = "js-atr-proxy";
                        }
                        
                        itm._cool.attributes.push(
                        {
                            name: n,
                            value: val,
                            _cool : itm._cool
                        });
                    }
                }
            }
            
            if (cool.jsF[name] != null)
            {
                arr.push({obj : itm, name : name});

                code = InitCoolElement(null, itm).hash;

                itm._cool.init(name, itm);

                if (ht[code] == null)
                {
                    ht[code] = itm;
                }
            }
        }

        var sets = [];

        // build tag tree
        for (i = 0 ; i < arr.length; ++i)
        {
            itm = arr[i];

            var cur = itm.obj.parentNode;

            while (cur != null)
            {
                if (cur._cool != null)
                {
                    if (cur._cool == true || cur._cool.tagName == "js-query" && (!cur._cool.isActive)) //cur._cool.isActive == null || 
                    {
                        itm._cool = true;

                        break;
                    }

                    //if (ht[cur._cool.hash] != null)
                    //{
                        if (itm.name == "js-set" && ht[cur._cool.hash] != null)
                        {
                            sets.push(itm.obj);
                        }
                        
                        if (forceParent != null && (cur == elm || ht[cur._cool.hash] == null))
                        {
                            itm.obj._cool.parent = forceParent;

                            forceParent._cool.chields.push(itm.obj);
                        }
                        else
                        {
                            itm.obj._cool.parent = cur;

                            cur._cool.chields.push(itm.obj);
                        }

                        break;
                    //}
                }

                cur = cur.parentNode;
            }
        }

        // init tags
        for (i = 0; i < arr.length; ++i)
        {
            itm = arr[i];

            if (itm.obj._cool.parent != null)
            {
                itm.obj._cool.isCancel = itm.obj.getAttribute("cancel") != null;
                cool.jsF[itm.name](itm.obj);
            }
        }

        cool.lockObserve = true;

        for (i = 0; i < sets.length; ++i)
        {
            var set = sets[i];
            var cur = set._cool.field.get();

            if (cur == null)
            {
                var tmp = set._cool.tval.get();

                set._cool.field.set(tmp);
            }
        }

        cool.lockObserve = false;

        delete ht;
        delete arr;
        delete tmp;
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
        if (cool.booleanHt[str] != null)
        {
            return cool.booleanHt[str];
        }

        return false;
    },
    
    // return typed value for tags
    getTypedValue: function(str)
    {
        if (str == null)
        {
            return null;
        }

        var boo = cool.parseBool(str);

        if (boo.toString() == str.toLowerCase())
        {
            return boo;
        }
        else
        {
            var num = parseInt(str);

            if (num.toString() == str)
            {
                return num;
            }

            num = parseFloat(str);

            if (num.toString() == str)
            {
                return num;
            }
        }
        
        return str;
    },

    // unescape
    decodeEntities : function(str)
    {
        if (cool.patternEntities == null)
        {
            cool.patternEntities = /&(?:#x[a-f0-9]+|#[0-9]+|[a-z0-9]+);?/ig;
        }

        if (cool.elementEntities == null)
        {
            cool.elementEntities = document.createElement('div');
        }

        var tmp = str.replace(cool.patternEntities, function(m)
        {
            cool.elementEntities.innerHTML = m;

            return cool.elementEntities.innerText;
        });

        return tmp;
    },
    
    // Structures
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    lastHash: 1,
    lockObserve: false,
    numHt: { 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true, ".": true },
    body: document.getElementsByTagName('BODY')[0],
    dissableDisplayPolicy: false,
    hashList: {},
    defaultHash: "",
    lastUrlHash: "",
    currentPage: "",
    currentEventElement: null,
    lastPage: "",
    outPos: 0,
    __cache: {},
    
    // headers for requests
    ajaxHeaders:
    [
        { key: 'Content-Type', val: 'text/plain; charset=utf-8' }
    ],

    //
    booleanHt:
    {
        "true": true,
        "True": true,
        "false": false,
        "False": false
    },

    // validation default
    validate :
    {
        text:
        {
            pattern : ".{1,}",
            title : "Can't be empty."
        },
        name:
        {
            pattern : ".{3,20}",
            title : "Must contain at least 3 or more characters."
        },
        password:
        {
            pattern : "(?=^.{8,}$)((?=.*\\d)|(?=.*\\W+))(?![.\\n])(?=.*[A-Z])(?=.*[a-z]).*$",
            title : "Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters."
        },
        email:
        {
            pattern : "^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$",
            title : "Email is not valid."
        },
        url:
        {
            pattern : "https?://.+",
            title : "Must start with http:// or https://"
        },
        tel:
        {
            pattern : "(\+?\d[- .]*){7,13}", 
            title : "Must contain only numbers, spaces and braces."
        }
    },
    
    // Class for binary io 
    createBinRW: function(obj)
    {
        var dv = null;

        if (obj == null)
        {
            dv = new DataView(new ArrayBuffer(512), 0);
        }
        else if (obj instanceof ArrayBuffer)
        {
            dv = new DataView(obj, 0);
        }
        else if (obj instanceof DataView)
        {
            dv = obj;
        }
        else
        {
            throw "Incorrect parameter type";
        }

        var ret =
        {
            dv: dv,
            position: 0,
            inverse: true,
            epochMicrotimeDiff : Math.abs(new Date(0, 0, 1).setFullYear(1)),

            // Read
            ReadSByte: function()
            {
                var val = this.dv.getInt8(this.position);

                this.position += 1;

                return val;
            },
            ReadInt16: function ()
            {
                var val = this.dv.getInt16(this.position, this.inverse);

                this.position += 2;

                return val;
            },
            ReadInt32: function ()
            {
                var val = this.dv.getInt32(this.position, this.inverse);

                this.position += 4;

                return val;
            },
            ReadInt64 : function()
            {
                var v0 = this.ReadUInt32();
                var v1 = this.ReadInt32();

                var val = this.to_int52(v1, v0);

                return val;
            },
            to_int52: function(hi, lo) 
            {
                if ((lo !== lo|0) && (lo !== (lo|0)+4294967296))
                {
                    throw new Error ("lo out of range: "+lo);
                }
                if (hi !== hi|0 && hi >= 1048576)
                {
                    throw new Error ("hi out of range: "+hi);
                }

                if (lo < 0)
                {
                    lo += 4294967296;
                }

                return hi * 4294967296 + lo;
            },
            ReadByte: function ()
            {
                var val = this.dv.getUint8(this.position, this.inverse);

                this.position += 1;

                return val;
            },
            ReadUInt16: function ()
            {
                var val = this.dv.getUint16(this.position, this.inverse);

                this.position += 2;

                return val;
            },
            ReadUInt32: function ()
            {
                var val = this.dv.getUint32(this.position, this.inverse);

                this.position += 4;

                return val;
            },
            ReadSingle: function ()
            {
                var val = this.dv.getFloat32(this.position, this.inverse);

                this.position += 4;

                return val;
            },
            ReadDouble: function ()
            {
                var val = this.dv.getFloat64(this.position, this.inverse);

                this.position += 8;

                return val;
            },
            ReadString: function ()
            {
                var buf = [];
                var len = this.dv.getInt32(this.position, this.inverse);

                this.position += 4;

                for (var i = 0; i < len; ++i)
                {
                    var chr = this.dv.getInt16(this.position, this.inverse);

                    this.position += 2;

                    buf.push(String.fromCharCode(chr));
                }

                var val = buf.join("");

                return val;
            },
            ReadBoolean: function()
            {
                var val = this.dv.getUint8(this.position, this.inverse);

                this.position += 1;

                return val == 1;
            },
            ReadSplitedDateTime : function ()
            {
                var y = this.ReadInt16();
                var m = this.ReadByte();
                var d = this.ReadByte();
                var h = this.ReadByte();
                var a = this.ReadByte();
                var s = this.ReadByte();

                var dt = new Date(y, m - 1, d, h, a, s, 0);

                return dt;
            },
            ReadDateTime : function ()
            {
                var ticks = this.ReadInt64();

                var ticksToMicrotime = ticks / 10000;
                var d = new Date(ticksToMicrotime - this.epochMicrotimeDiff);      
            
                return d;
            },
            
            // Write
            WriteSByte: function (val)
            {
                if (typeof val != 'number')
                {
                    val = Number(val);
                }

                this.Check();
                this.dv.setInt8(this.position, val);

                this.position += 1;
            },
            WriteInt16: function (val)
            {
                if (typeof val != 'number')
                {
                    val = Number(val);
                }

                this.Check();
                this.dv.setInt16(this.position, val, this.inverse);

                this.position += 2;
            },
            WriteInt32: function (val)
            {
                if (typeof val != 'number')
                {
                    val = Number(val);
                }

                this.Check();
                this.dv.setInt32(this.position, val, this.inverse);
                this.position += 4;
            },
            WriteInt64: function (val)
            {
                if (typeof val != 'number')
                {
                    val = Number(val);
                }

                var v0 = Math.floor(val / 4294967296);
                var v1 = (val & 0xFFFFFFFF);

                this.WriteInt32(v1);
                this.WriteUInt32(v0);
            },
            WriteByte: function (val)
            {
                if (typeof val != 'number')
                {
                    val = Number(val);
                }

                this.Check();
                this.dv.setUint8(this.position, val, this.inverse);

                this.position += 1;
            },
            WriteUInt16: function (val)
            {
                if (typeof val != 'number')
                {
                    val = Number(val);
                }

                this.Check();
                this.dv.setUint16(this.position, val, this.inverse);

                this.position += 2;
            },
            WriteUInt32: function (val)
            {
                if (typeof val != 'number')
                {
                    val = Number(val);
                }

                this.Check();
                this.dv.setUint32(this.position, val, this.inverse);

                this.position += 4;
            },
            WriteSingle: function (val)
            {
                if (typeof val != 'number')
                {
                    val = Number(val);
                }

                this.Check();
                this.dv.setFloat32(this.position, val, this.inverse);

                this.position += 4;
            },
            WriteDouble: function (val)
            {
                if (typeof val != 'number')
                {
                    val = Number(val);
                }

                this.Check();
                this.dv.setFloat64(this.position, val, this.inverse);

                this.position += 8;
            },
            WriteString: function(val)
            {
                if (typeof val != 'string')
                {
                    val = val.toString();
                }

                this.WriteInt32(val.length);

                for (var i = 0; i < val.length; ++i)
                {
                    var char = val.charCodeAt(i);

                    this.WriteUInt16(char);
                }
            },
            WriteBoolean: function(val)
            {
                if (typeof val != 'boolean')
                {
                    val = parseBool(val);
                }

                if (val)
                {
                    this.WriteByte(1);
                }
                else
                {
                    this.WriteByte(0);
                }
            },
            WriteDateTime: function(val)
            {
                var ticks = (val.getTime() + this.epochMicrotimeDiff) * 10000;

                this.WriteInt64(ticks);
            },
            WriteArrayBuffer: function (arr, pos, len) 
            {
                var buf = new DataView(arr, 0);

                for (var i = pos; i < pos + len; ++i) 
                {
                    var b = buf.getUint8(i, false);

                    this.WriteByte(b);
                }
            },
            Write: function(val, type)
            {
                eval("this.Write" + type + "(val);");
            },

            // API
            TrimToPosition: function()
            {
                this.Resize(this.position);
            },
            Check: function()
            {
                if (this.position >= this.dv.byteLength)
                {
                    this.Resize(this.dv.byteLength * 2);
                }
            },
            Resize: function(size)
            {
                var buf0 = this.dv.buffer;
                var buf1 = new ArrayBuffer(size);
                var dv = new DataView(buf1);

                var len = buf0.byteLength;

                if (len > buf1.byteLength)
                {
                    len = buf1.byteLength;
                }

                for (var i = 0; i < len; i++)
                {
                    var b = this.dv.getUint8(i, this.inverse);

                    dv.setUint8(i, b, this.inverse);
                }

                this.dv = dv;
            },
            GetBuffer: function()
            {
                return this.dv.buffer;
            },
            CanRead: function()
            {
                return this.position < this.dv.byteLength;
            },
            GetLength: function()
            {
                return dv.byteLength;
            }
        };
        
        return ret;
    },

    // #remove_block For debug
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    debug: true,
    trace: false,

    logEx: function(str)
    {
        if (cool.debug)
        {
            var level = cool.getLevel();
            console.log(Array(level * 2).join(' ') + str);
        }
    },

    getLevel: function()
    {
        var level = 1;
        var isStrict = (function() { return !this; })();
        var f = cool.getLevel;

        if (!isStrict)
        {
            while (f)
            {
                level++;

                f = f.caller;

                if (level > 30)
                {
                    break;
                }
            }
        }

        return level;
    },

    tagLvlToString : function(name, obj)
    {
        if (!cool.debug)
        {
            return "";
        }

        var c = obj._cool;
        var level = cool.getLevel();
        var str = Array(level * 2).join(' ') + name + cool.tagToString(obj);

        return str;
    },

    tagToString : function(obj)
    {
        var c = obj._cool;

        var str = c.tagName;

        if (c.tagName == "js-if")
        {
            str += " " + c.conditional;
        }
        else if (c.tagName == "js-set")
        {
            str += " " + c.name + "=" + c.value;
        }
        else if (c.tagName == "js-ajax")
        {
            str += " " + c.src;
        }
        else if (c.tagName == "js-page")
        {
            str += " " + c.hashurl;
        }
        else if (c.tagName == "js-load")
        {
            str += " " + c.src;
        }
        else if (c.tagName == "js-query")
        {
            str += " " + c.select;
        }
        else if (c.tagName == "js-event")
        {
            str += " " + c.name;
        }
        else if (c.tagName == "js-style")
        {
            str += " " + c.name;
        }
        else if (c.tagName == "js-atr")
        {
            str += " " + c.name;
        }
        else if (c.tagName == "js-go")
        {
            str += " " + c.value;
        }
        else if (c.tagName == "js-call")
        {
            str += " " + c.name + ":" + c.method;
        }
        else if (c.tagName == "js-atr")
        {
            str += " " + c.name + ":" + c.value;
        }
        else if (c.tagName == "js-several")
        {
            str += " " + c.select;
        }
        else if (c.tagName == "script")
        {
            str += " " + c.info;
        }
        else if (c.tagName == "js-validate")
        {
            str += " " + c.set + "; " + c.select;
        }
        else if (c.tagName == "js-atr-proxy")
        {
            for (var i = 0; i < obj._cool.attributes.length; ++i)
            {
                var atr = obj._cool.attributes[i];

                str +=  " " + atr.name;
            }
        }
        else if (c.tagName == "js-text")
        {
            str += " " + c.path;
        }
        else if (c.tagName == "js-width")
        {
            str += " min:" + c.min + ", max:" + c.max + " target:" + c.target;
        }

        return str;
    },

    atrToString : function(obj)
    {
        var c = obj._cool;
        var str = c.tagName;

        if (c.tagName == "js-if")
        {
            str += " " + c.conditional;
        }
        
        return str;
    },

    getStack: function(obj)
    {
        var arr = [];

        while (obj != null && obj._cool != null)
        {
            arr.unshift(cool.tagToString(obj));

            obj = obj._cool.parent;
        }

        return arr.join('   -->   ');
    }
    // #remove_block_end
};

function InitCoolElement(base, elm)
{
    if (base == null)
    {
        if (elm._cool == null || elm._cool == true)
        {
            elm._cool =
            {
                attributes: [],
                hash: cool.lastHash++,
                tagName: null,
                parent: null,
                chields: [],
                isActive: null,
                init: function (name, obj)
                {
                    this.tagName = name;
                    this.obj = obj;
                    this.cancelDisplay = obj.getAttribute("d") != null;
                    this.actionDisplay = this.obj.style.display;

                    if (!this.cancelDisplay)
                    {
                        this.cancelDisplayVal = obj.getAttribute("display-cancel");
                        this.cancelDisplayVal = this.cancelDispayVal != null ? this.cancelDisplayVal : "none";
                    }

                    this.ever = obj.getAttribute("ever");
                },
                action: function (context, force)
                {
                    this.actionBase(context, force);
                },
                cancel: function (context, force)
                {
                    this.cancelBase(context, force);
                },
                actionBase: function (context, force)
                {
                    // #remove_block
                    if (context == null || context.initial == null)
                    {
                        debugger;
                        alert("context is null");
                    }
                    // #remove_block_end
                    
                    this.isActive = true;

                    for (var i = 0; i < this.chields.length; ++i)
                    {
                        var itm = this.chields[i];

                        // call cancel
                        if (itm._cool.isCancel)
                        {
                            //if (itm._cool.isActive == null || itm._cool.isActive || force)
                            //{
                                if (context[itm._cool.hash] != true)
                                {
                                    context[itm._cool.hash] = true;

                                    itm._cool.isActive = false;
                                    itm._cool.cancel(context, force);
                                }
                            //}

                            continue;
                        }

                        // #remove_line
                        if (cool.trace) console.log(cool.tagLvlToString("Action: ", itm));

                        //for (var j = 0; j < itm._cool.attributes.length; ++j)
                        //{
                        //    var atr = itm._cool.attributes[j];

                        //    if (atr.action != null)
                        //    {
                        //        // #remove_line
                        //        if (cool.trace) console.log("Action atr: " + cool.atrToString(atr));
                                
                        //        try 
                        //        {
                        //            atr.action(context);
                        //        }
                        //        catch (e) 
                        //        {
                        //            console.log("Exeption on atr action: " + e);
                        //            // #remove_line
                        //            console.log(cool.getStack(itm));
                        //        }
                        //    }
                        //}

                        if (itm._cool.isActive == null || !itm._cool.isActive || force || itm._cool.ever != null)
                        {
                            if (context[itm._cool.hash] != true)
                            {
                                context[itm._cool.hash] = true;

                                itm._cool.isActive = true;

                                try 
                                {
                                    itm._cool.action(context, force);                                    
                                }
                                catch (e) 
                                {
                                    console.log("Exeption on " + itm._cool.tagName + " action: " + e);
                                    // #remove_line
                                    console.log(cool.getStack(itm));
                                }
                            }
                        }
                    }

                    if (!cool.dissableDisplayPolicy && !this.cancelDisplay)
                    {
                        this.obj.style.display = this.actionDisplay;
                    }

                    if (context.initial == this.hash)
                    {
                        cool.processContext (context);
                    }
                },
                cancelBase: function (context, force)
                {
                    // #remove_block
                    if (context == null || context.initial == null)
                    {
                        debugger;
                        alert("context is null");
                    }
                    // #remove_block_end

                    this.isActive = false;

                    for (var i = 0; i < this.chields.length; ++i)
                    {
                        var itm = this.chields[i];

                        // call action
                        if (itm._cool.isCancel)
                        {
                            //if (itm._cool.isActive == null || !itm._cool.isActive || force)
                            //{
                                if (context[itm._cool.hash] != true)
                                {
                                    context[itm._cool.hash] = true;

                                    itm._cool.isActive = true;
                                    itm._cool.action(context, force);
                                }
                            //}

                            continue;
                        }

                        // #remove_line
                        if (cool.trace) console.log(cool.tagLvlToString("Cancel: ", itm));

                        //for (var j = 0; j < itm._cool.attributes.length; ++j)
                        //{
                        //    var atr = itm._cool.attributes[j];

                        //    if (atr.cancel != null)
                        //    {
                        //        // #remove_line
                        //        if (cool.trace) console.log("Cancel atr: " + cool.atrToString(atr));

                        //        try 
                        //        {
                        //            atr.cancel(context);
                        //        }
                        //        catch (e) 
                        //        {
                        //            console.log("Exeption on atr " + itm._cool.tagName + " cancel: " + e);
                        //            // #remove_line
                        //            console.log(cool.getStack(itm));
                        //        }
                        //    }
                        //}

                        if (itm._cool.isActive == null || itm._cool.isActive || force)
                        {
                            if (context[itm._cool.hash] != true)
                            {
                                context[itm._cool.hash] = true;

                                itm._cool.isActive = false;

                                try 
                                {
                                    itm._cool.cancel(context, force);
                                }
                                catch (e) 
                                {
                                    console.log("Exeption on " + itm._cool.tagName + " cancel: " + e);
                                    // #remove_line
                                    console.log(cool.getStack(itm));
                                }
                            }
                        }
                    }

                    if (!cool.dissableDisplayPolicy && !this.cancelDisplay)
                    {
                        this.obj.style.display = this.cancelDisplayVal;
                    }

                    if (context.initial == this.hash)
                    {
                        cool.processContext (context);
                    }
                },
                clear: function ()
                {
                    this.chields = [];
                }
            };
        }
    }
    else if (elm._cool != null)
    {
        return elm._cool;
    }
    else if (base == 1)
    {
        elm._cool =
        {
            hash: cool.lastHash++
        };
    }

    return elm._cool;
};

window.onload = cool.init;
