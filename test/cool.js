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
            "js-call": cool.tagCall
        };

        cool.jsA =
        {
            "js-bind": cool.atrBindBoth,
            "js-read": cool.atrBindRead,
            "js-write": cool.atrBindWrite,
            "js-class": cool.atrClass,
            "js-class-cancel": cool.atrCancelClass
        };

        var html = document.documentElement;

        cool.initNavigator();
        cool.processElement(html);

        html._cool.init("html", html);
        html._cool.cancelDisplay = true;
        html._cool.action();

        if (cool.lastUrlHash != window.location.hash)
        {
            cool.setPage();
        }
        else if (cool.defaultHash != "")
        {
            cool.go(cool.defaultHash);
        }
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
        obj._cool.action = function()
        {
            if (!this.first || this.first && !this.once)
            {
                this.field.set(this.tval.getValue());

                this.first = true;
            }

            this.actionBase();
        }
        obj._cool.cancel = function()
        {
            if (this.tcan != null)
            {
                this.field.set(this.tcan.getValue());
            }

            this.cancelBase();
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

        obj._cool.params = [];

        if (obj._cool.paramsIndex != null)
        {
            var pars = obj.children[obj._cool.paramsIndex];

            for (var j = 0; j < pars.children.length; ++j)
            {
                var par = pars.children[j];

                if (par.tagName != null && par.tagName.toLowerCase() == "js-ajax-param")
                {
                    var par_name = par.getAttribute("name");
                    var par_value = par.getAttribute("value");

                    if (par_name == null || par_value == null || par_name == "" || par_value == "")
                    {
                        console.log("Ajax param have empty 'name/value' attribute.");
                    }

                    obj._cool.params.push({ name: par_name, value: cool.createField(par_value) });
                }
            }
        }

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
        obj._cool.eventComplate = document.createEvent('Event');
        obj._cool.eventComplate.initEvent('complate', true, true);
        
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
        obj._cool.action = function()
        {
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
                            pp.value = cool.getRandomString();

                            ff = true;
                        }
                    }

                    if (!ff)
                    {
                        this.params.push({ name: "nocache", value: cool.getRandomString() });
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

                        //src_tmp += par.name + "=" + par.value.get();

                        if (typeof par.value == "object")
                        {
                            src_tmp += par.name + "=" + par.value.get();
                        }
                        else
                        {
                            src_tmp += par.name + "=" + par.value;
                        }

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
                    tag.obj.dispatchEvent(tag.obj._cool.eventComplate);
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
            }
        }
        obj._cool.cancel = function()
        {
            this.cancelBase();
        }
    },

    // js-page
    tagPage: function(obj)
    {
        var hash = obj.getAttribute("hash");

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

        obj._cool.hash = hash;
        obj._cool.first = false;
        obj._cool.isActiveNav = false;
        obj._cool.actionNav = function()
        {
            this.isActiveNav = true;

            if (this.parent._cool.isActive)
            {
                this.action();
            }
        }
        obj._cool.cancelNav = function()
        {
            this.isActiveNav = false;
            this.cancelBase();
        }
        obj._cool.action = function()
        {
            if (this.isActiveNav)
            {
                this.actionBase();
            }
        }
        obj._cool.cancel = function()
        {
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
            return console.log("js-load: The src attribute is empty");
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
            return console.log("js-load: Wrong type");
        }

        obj._cool.type = type;
        obj._cool.src = src;
        obj._cool.isAlways = obj.getAttribute("always") != null;
        obj._cool.firstDone = false;
        obj._cool.action = function()
        {
            this.obj.style.display = this.display;

            if (this.isAlways || !this.firstDone)
            {
                switch (this.type)
                {
                    case "js":
                    {
                        var script = document.createElement('script');

                        script.src = this.src;

                        obj.appendChild(script);

                        obj._cool.firstDone = true;

                        break;
                    }
                    case "css":
                    {
                        var link = document.createElement('link');

                        link.rel = 'stylesheet';
                        link.type = 'text/css';
                        link.href = this.src;
                        obj.appendChild(link);
                        
                        obj._cool.firstDone = true;

                        break;
                    }
                    case "html":
                    {
                        cool.ajaxGet(this.src, this.obj, function(http, tag)
                        {
                            var tmp = http.responseText;
                                
                            if (tmp.indexOf("<js-query") >= 0)
                            {
                                tmp = tmp.replace(new RegExp("<js-query", 'g'), "<script type='js-query'").replace(new RegExp("</js-query",'g'), "</script");
                            }
                            
                            tag._cool.clear();
                            tag.innerHTML = tmp;

                            cool.processElement(tag);
                            tag._cool.actionBase();

                            obj._cool.firstDone = true;

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
                this.obj._cool.actionBase();
            }
        }
        obj._cool.cancel = function()
        {
            this.cancelBase();
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

        obj._cool.refresh = function(elm, path)
        {
            var c = elm._cool;

            c.isChanged = true;

            if (c.isActive)
            {
                c.action();
            }
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

                    var fieldName = arr[i + 1];

                    prog.from =
                    {
                        field: cool.createField(fieldName, 2, obj._cool.refresh)
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
                        field: cool.createField(arr[i++], 2, obj._cool.refresh)
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

                    prog.where.fieldCond = cool.createField(strCond, 2, obj._cool.refresh);
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

        var pl_start = null;
        var pl_end = null;
        var ind1 = tmp.indexOf("#placeholder");
        
        if (ind1 != -1)
        {
            var ind2 = tmp.indexOf("#placeholder-end");

            if (ind2 != -1)
            {
                pl_start = tmp.substr(0 ,ind1);
                pl_end = tmp.substr(ind2 + 16);
                tmp = tmp.substr(ind1 + 12, ind2 - ind1 - 12);
            }
            else
            {
                pl_start = tmp.substr(0, ind1);
                tmp = tmp.substr(ind1 + 12);
            }
        }
        
        obj._cool.template = cool.buildTemplate(tmp, obj._cool.rootMap);

        obj._cool.template.pl_start = pl_start;
        obj._cool.template.pl_end = pl_end;
        
 
        obj._cool.select = select;
        obj._cool.isChanged = true;
        obj._cool.isAlways = obj.getAttribute("always") != null;
        obj._cool.firstDone = false;
        obj._cool.action = function()
        {
            // TODO extend observe meh
            //if (!this.isChanged)
            //{
            //    this.enable();

            //    return;
            //}

            this.isChanged = false;

            if (this.data == null || this.isAlways)
            {
                this.data = cool.computeData(this.prog);
            }

            if (this.data != null && (!this.firstDone || this.isAlways))
            {
                this.firstDone = true;

                if (this.parentQueryItem != null)
                {
                    this.parentQueryItem._cool.fillMap(this.rootMap);
                }

                this.clear();

                // clear
                if (!this.isScript)
                {
                    this.obj.innerHTML = "";
                }
                else if (this.targetObject != null)
                {
                    this.targetObject.innerHTML = "";
                }

                var arr = [];

                if (this.template.pl_start != null)
                {
                    arr.push(this.template.pl_start);
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

                    var tmp = cool.makeQueryItem(this.template, this.rootMap, true, i);

                    arr.push(tmp);
                }

                if (this.template.pl_end != null)
                {
                    arr.push(this.template.pl_end);
                }

                if (!this.isScript)
                {
                    this.obj.innerHTML = arr.join("");

                    cool.processElement(this.obj);
                }
                else
                {
                    if (this.targetObject == null)
                    {
                        this.targetObject = document.createElement("div");
                        this.targetObject._cool = this;
                        this.obj.parentNode.insertBefore(this.targetObject, this.obj);
                    }

                    this.targetObject.innerHTML = arr.join("");

                    cool.processElement(this.targetObject);
                }

                this.firstDone = true;
            }

            this.enable();
        }
        obj._cool.cancel = function()
        {
            if (!cool.dissableDisplayPolicy && !this.cancelDisplay)
            {
                if (this.targetObject != null)
                {
                    this.targetObject.style.display = this.cancelDisplayVal;
                }
            }
            
            this.cancelBase();
        }
        obj._cool.enable = function()
        {
            if (!cool.dissableDisplayPolicy && !this.cancelDisplay)
            {
                if (this.targetObject != null)
                {
                    this.targetObject.style.display = this.actionDisplay;
                }
            }

            this.actionBase();            
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

        obj._cool.fieldCond = cool.createField(con, 2, obj._cool.refresh);
        
        obj._cool.refresh = function(elm, path)
        {
            var c = elm._cool;

            if (c.parent._cool.isActive)
            {
                c.action();
            }
        };

        obj._cool.conditional = con;
        obj._cool.isChanged = true;
        obj._cool.isFlug = null;
        obj._cool.action = function()
        {
            var flag = eval(this.conditional);

            if (flag)
            {
                this.actionBase();
            }
            else
            {
                this.cancel();
            }
        };
        obj._cool.cancel = function()
        {
            this.cancelBase();
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
            return function()
            {
                // #remove_line
                console.log("Event: " + name);

                if (obj._cool.parent._cool.isActive)
                {
                    obj._cool.actionBase();
                    obj._cool.eventActive = false;
                }
                else
                {
                    obj._cool.eventActive = true;
                }
            }
        };

        obj._cool.name = name;
        obj._cool.eventActive = false;
        obj._cool.onactive = onactive;
        obj._cool.action = function()
        {
            if (this.eventActive && this.onactive)
            {
                this.actionBase();
            }

            this.eventActive = false;
        };

        obj._cool.event = initEvent(obj, name);

        for (var i = 0; i < arr.length; ++i)
        {
            var itm = arr[i];

            itm.addEventListener(name, obj._cool.event);
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
        obj._cool.action = function()
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

                itm.style[name] = this.value;
            }

            this.actionBase();
        };
        obj._cool.cancel = function()
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

            this.cancelBase();
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
        obj._cool.action = function()
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

                if (this.mode == 0)
                {
                    if (itm[this.name] != null)
                    {
                        itm[this.name] = this.value;
                    }
                    else
                    {
                        itm.setAttribute(this.name, this.value);
                    }
                }
                else if (this.mode == 1)
                {
                    itm.removeAttribute(this.name);
                }
            }

            this.actionBase();
        };
        obj._cool.cancel = function()
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
                }
            }

            this.cancelBase();
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
        obj._cool.action = function()
        {
            if (this.arr == null)
            {
                this.cancel();
            }

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

                    itm.addEventListener("change", this.func.bind(this));
                }
            }

            if (this.validCount == this.arr.length)
            {
                this.actionBase();
            }
        };
        obj._cool.cancel = function()
        {
            this.cancelBase();
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
                    this.actionBase();
                }
            }
            else if (this.isActive)
            {
                this.cancel();
            }
        };
    },

    // js-atr-proxy. This tag needs for html elements who has js-attributes
    tagAtrProxy: function(obj)
    {
        obj._cool.cancelDisplay = true;

        for (var i = 0; i < obj._cool.attributes.length; ++i)
        {
            var itm = obj._cool.attributes[i];

            if (cool.jsA[itm.name] != null)
            {
                cool.jsA[itm.name](obj, i);
            }
        }
    },
    
    // js-text
    tagText: function(obj)
    {
        var name = obj.getAttribute("name");

        if (name == null || name == "")
        {
            return console.log("js-text: The 'name' attribute is empty.");
        }

        obj._cool.name = name;
        obj._cool.obj = obj;
        obj._cool.field = cool.createField(name, 2, obj._cool.refresh, false);
        obj._cool.refresh = function(elm, path)
        {
            var c = elm._cool;
            var val = c.field.get();

            elm.innerHTML = val;
        }
        obj._cool.action = function()
        {
            this.obj.innerHTML = this.field.get();
            this.actionBase();
        };
    },
    
    // js-go
    tagGo: function(obj)
    {
        var value = obj.getAttribute("value");

        if (value == null)
        {
            return console.log("js-go: The 'value' attribute is empty.");
        }
        
        obj._cool.value = value;
        obj._cool.action = function()
        {
            cool.go(this.value);

            this.actionBase();
        };
        obj._cool.cancel = function()
        {
            this.cancelBase();
        };
    },

    // js-call
    tagCall: function(obj)
    {
        var name = obj.getAttribute("name");
        var method = obj.getAttribute("method");
        
        if (name == null || name == "")
        {
            return console.log("js-call: The 'name' attribute is empty.");
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
        obj._cool.action = function()
        {
            if (this.field == null)
            {
                this.field = cool.createField(this.name);
            }

            var tmp = this.field.get();
            var pars = [];

            for (var i = 0; i < this.params.length; ++i)
            {
                var itm = this.params[i];

                pars.push(itm.getValue());
            }

            tmp[this.method].apply(tmp, pars);

            cool.changed(this.field.path);

            this.actionBase();
        };
        obj._cool.cancel = function()
        {
            this.cancelBase();
        };
    },


    // Attributes
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
    // js-bind
    atrBindBoth: function(obj, index)
    {
        cool.atrBindEx(obj, obj._cool.attributes[index].value, false, false);
    },

    // js-read
    atrBindRead: function(obj, index)
    {
        cool.atrBindEx(obj, obj._cool.attributes[index].value, true, false);
    },

    // js-write
    atrBindWrite: function(obj, index)
    {
        cool.atrBindEx(obj, obj._cool.attributes[index].value, false, true);
    },

    // js-bind all modes
    atrBindEx: function(obj, value, isReadOnly, isWriteOnly)
    {
        var bind = {};

        obj._cool.bind = bind;

        bind.path = value;

        if (bind.path == null || bind.path == "")
        {
            return console.log(obj.tagName + ": has empty 'js-bing' attribute.");
        }

        var tnm = obj.tagName.toLowerCase();

        bind.isInput = tnm == "input";
        bind.isTextaria = tnm == "textaria";
        bind.isSelect = tnm == "select";
        bind.isFloat = obj.hasAttribute("float");
        bind.lock1 = false;
        bind.lock2 = false;
        bind.isCheckbox = false;
        bind.isRadio = false;
        bind.isText = false;
        bind.isNumber = false;
        bind.obj = obj;

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
        else if (bind.isTextaria || bind.isSelect)
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
            bind.field = cool.createField(bind.path, 1, bind.refresh);

            if (bind.isInput)
            {
                if (bind.isCheckbox)
                {
                    bind.refreshEx = function()
                    {
                        this.obj.checked = cool.getField(this.field);
                    };
                }
                else if (bind.isRadio)
                {
                    bind.refreshEx = function()
                    {
                        var tmp = cool.getField(this.field);

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

                        this.obj.value = tmp;
                    };
                }
            }
            else
            {
                bind.refreshEx = function()
                {
                    var tmp = this.field.get();

                    this.obj.value = tmp;
                };
            }

            bind.refresh = function(elm, path)
            {
                var c = elm._cool.bind;

                if (!c.lock2)
                {
                    c.lock1 = true;
                    c.refreshEx();
                    c.lock1 = false;
                }
            };
        }
        else
        {
            bind.field = cool.createField(bind.path);
        }

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

            return;
        }

        if (src == "back")
        {
            history.go(-1);

            return;
        }

        if (src == "next")
        {
            history.go(1);

            return;
        }

        if (window.location.hash != src)
        {
            window.location.hash = src;
        }
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
        },
        false);
    },

    // activate page
    setPage: function()
    {
        if (cool.lastUrlHash == window.location.hash && cool.lastUrlHash.length > 0)
        {
            return;
        }

        var page = window.location.hash;
        var arr = page.split("/");

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

                eval("v = " + cool.decorateString(arr[n + 1]) + ";");
            
                cool.createField(f).set(v);
            }
        }
        
        var i = 0;
        var itm = null;
        var list = cool.hashList[cool.lastUrlHash.split("/")[0]];

        if (list != null)
        {
            for (i = 0; i < list.length; ++i)
            {
                itm = list[i];

                itm._cool.cancelNav();
            }
        }

        cool.lastUrlHash = page;

        list = cool.hashList[arr[0]];

        if (list != null)
        {
            for (i = 0; i < list.length; ++i)
            {
                itm = list[i];

                itm._cool.actionNav();
            }
        }

        var t = 0;
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
        
        obj.onreadystatechange = function()
        {
            if (obj.readyState == 4)
            {
                callback(obj, tag);
            }
        }
        obj.cooljs().data = data;
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
    createField: function (path, observe, callback)
    {
        if (observe == null)
        {
            observe = 0;
            callback = null;
        }

        var field =
        {
            observe: observe,
            list: cool.parseJs(path),
            vars: [],
            isInited : false,
            offset: 0,
            path: path,
            root : "",
            get: function (target, property)
            {
                var tmp;

                if (target == null)
                {
                    target = window;
                }

                if (property == null)
                {
                    property = ";";
                }
                else
                {
                    property = this.path.length > 0 ? "." + property + ";" : property + ";";
                }

                // todo make function, for set too
                eval("tmp = target." + this.path + property);

                return tmp;
            },
            set: function (val, target, property)
            {
                if (target == null)
                {
                    target = window;
                }

                if (property == null)
                {
                    property = "";
                }
                else
                {
                    property = this.path.length > 0 ? "." + property : property;
                }

                if (!this.isInited)
                {
                    this.init(target);
                }

                eval("target." + this.path + property + " = val;");

                cool.changed2(this.path + property, "set");
            },
            init: function (target)
            {
                var cur = target;
                var path = "";

                for (var i = 0; i < this.list.length - 1; ++i)
                {
                    var prp = this.list[i];

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
                if (arr == null)
                {
                    arr = this.list;
                    role = 0;
                }

                var path = "";
                var start = 0;
                var end = 0;

                for (; end < arr.length; ++end)
                {
                    var itm = arr[end];

                    // property
                    if (itm.type == 9)
                    {
                        path += end == 0 ? itm.path : "." + itm.path;
                    }
                    // array
                    else if (itm.type == 2)
                    {
                        path += end == 0 ? itm.path : "." + itm.path;

                        this.refreshVars(itm.body, 1);
                    }
                    // function
                    else if (itm.type == 6)
                    {
                        path += end == 0 ? itm.path : "." + itm.path;

                        this.refreshVars(itm.body, 2);
                    }
                    // operator or conditional
                    else if (itm.type == 7 || itm.type == 8)
                    {
                        this.addVar(path, role, arr, start, end);

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

                // todo future arr convert to variable map in field
                this.vars.push({ path: path, role: role, raw: arr.slice(start, end), start : start, end : end });

                if (role == 0)
                {
                    this.root = path;
                }
            }
        };

        field.refreshVars();

        if (observe > 0 && callback != null)
        {
            field.observe = { depth: observe, callback: callback };

            for (var i = 0; i < field.vars.length; ++i)
            {
                var itm = field.vars[i];

                cool.addToObserve2(itm.path, field, itm, callback, observe);
            }
        }

        return field;
    },

    // add field to observe
    addToObserve2: function (path, field, tag, callback, depth)
    {
        if (cool.obHt[path] == null)
        {
            cool.obHt[path] = { list: [] };
        }

        var ind = -1;

        for (var f = 0; f < cool.obHt[path].list.length; ++f)
        {
            if (cool.obHt[path].list[f].field == field)
            {
                ind = f;

                break;
            }
        }

        if (ind == -1)
        {
            cool.obHt[path].list.push({ field: field, tag: tag, callback: callback });
        }

        // for parent observe
        if (depth > 1)
        {
            var arr = path.split(".");

            for (var j = arr.length - depth; j >= 0 && j < arr.length - 1; ++j)
            {
                var str = "";

                for (var n = 0; n <= j; ++n)
                {
                    str += arr[n] + (n < j ? "." : "");
                }

                cool.addToObserve2(str, field, tag, callback, 1);
            }
        }
    },

    // call than property changed
    // 
    changed2: function (path, method, args)
    {
        if (cool.obHt[path] != null)
        {
            var ob = cool.obHt[path];

            // #remove_line
            cool.logEx("Changed: " + path + "; Observe count: " + ob.list.length);

            for (var i = 0; i < ob.list.length; ++i)
            {
                var itm = ob.list[i];

                // #remove_line
                console.log(cool.tagTostring("Refresh: ", itm.field.path));

                itm.callback(path, method, ob.field, ob.tag);
            }
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
            fieldCan: null,
            fastType: 0,
            getValue: function ()
            {
                if (this.fastType == 1)
                {
                    if (this.fieldVal == null)
                    {
                        this.fieldVal = cool.createField(this.value);
                    }

                    return cool.getField(this.fieldVal);
                }
                else if (this.fastType == 2)
                {
                    var tmp = null;

                    eval("tmp = " + value);

                    return tmp;
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
            ret.value = cool.parseBool[value];
        }
        else if (type == "var")
        {
            ret.fastType = 1;
            ret.value = value;
        }
        else if (type == "object" || type == "array")
        {
            ret.fastType = 2;
            ret.value = value;
        }
        else
        {
            ret.value = value;
        }

        return ret;
    },

    // Selector query
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    
    // get elements by selector
    compileSelector: function(query)
    {
        var arr = query.split(".");
        var ret = [];
        var s,
            e = 0;
        var err = "Unknown operation: ";

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

        while (pos < prog.length)
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

                    var sign = obj.getAttribute("name");

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
    queryContext: { items : [], index : 0},
    
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
                        //if (dst[p] == null)
                        //{
                        //    dst[p] = {};
                        //}

                        //cool.applyFieldEx(src[p], dst[p]);

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
        cool.queryContext = { items: main, index: 0 };

        if (main == null)
        {
            return console.log("js-query: From's field " + prog.from.field.path + " is underfined.");
        }

        if (prog.join != null)
        {
            // init main
            for (var i = 0; i < main.length; ++i)
            {
                var tmp = {};

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
                                    newRec = cool.cloneObj(com);

                                    comp.push(newRec);
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
            }
        }
        // without joins
        else
        {
            comp = [];

            // init main
            for (var i = 0; i < main.length; ++i)
            {
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

        return comp;
    },

    // check exist
    exist: function (item, obj)
    {
        var tmp = obj.cooljs(1);
        var ht = null;

        // build hashtable
        if (cool.queryContext[tmp.hash] == null)
        {
            if (obj instanceof Array)
            {
                ht = {};

                for (var i = 0; i < obj.length; ++i)
                {
                    ht[obj[i]] = true;
                }
            }
            else
            {
                ht = obj;
            }

            cool.queryContext[tmp.hash] = ht;
        }
        else
        {
            ht = cool.queryContext[tmp.hash];
        }

        return ht[item] != null;
    },

    // make element from template
    makeQueryItem: function (tmp, roots, flag, index)
    {
        var arr = [];

        for (var i = 0; i < tmp.list.length; ++i)
        {
            var itm = tmp.list[i];

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
                        arr.push(cool.makeQueryItem(itm.main_block, roots, false, index));
                    }
                    else if (itm.else_block != null)
                    {
                        arr.push(cool.makeQueryItem(itm.else_block, roots, false, index));
                    }
                }
                else
                {
                    arr.push("#if");
                    arr.push(cool.makeQueryItem(itm.conditional, roots, false, index));
                    arr.push("#");
                    arr.push(cool.makeQueryItem(itm.main_block, roots, false, index));

                    if (itm.else_block != null)
                    {
                        arr.push("#else");
                        arr.push(cool.makeQueryItem(itm.else_block, roots, false, index));
                    }

                    arr.push("#end");
                }
            }
            // #script #else block
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
                    arr.push("#script");
                    arr.push(cool.makeQueryItem(itm.prog, roots, false, index));
                    arr.push("#end");
                }
            }
            // variable
            else if (itm.type == 3)
            {
                if (itm.selfVar)
                {
                    //var res2 = cool.getField(itm.vField, roots[itm.vField.list[0].path]);
                    //var res2 = itm.vField.get(roots[itm.vField.list[0].path]);
                    var res2 = itm.vField.get(roots);

                    if (res2 != null)
                    {
                        arr.push(res2);
                    }
                    else
                    {
                        arr.push("null");
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
        }

        var str = arr.join("");

        return str;
    },

    // build js-query template
    buildTemplate : function(str, roots)
    {
        //str = unescape(str);

        var tmp = { list: [], selfVars : true};

        // parse #if #else #end
        for (var i = 0; i < str.length; ++i)
        {
            var ind0 = str.indexOf("#if", i);

            if (ind0 == -1)
            {
                tmp.list.push(
                {
                    type : 0,
                    text: str.substr(i)
                }); 

                break;
            }

            var ind1 = str.indexOf("#", ind0 + 1);

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

            var ind2 = str.indexOf("#end", ind1 + 1);

            if (ind2 == -1)
            {
                tmp.list.push(
                {
                    type : 0,
                    text: str.substr(i)
                });   

                console.log("js-query template warning at " + i + "char: Possible wrong #if syntax. The '#end' of block #if-#end not found.");

                break;
            }

            // text space
            tmp.list.push(
            {
                type: 0,
                text: str.substr(i, ind0 - i)
            });
            
            var ind3 = str.indexOf("#else", ind1 + 1);
            var text0 = cool.buildTemplate(str.substr(ind0 + 3, ind1 - ind0 - 3), roots);

            var obj1 =
            {
                type: 1,
                conditional: text0
            };

            if (ind3 != -1 && ind3 < ind2)
            {
                obj1.main_block = cool.buildTemplate(str.substr(ind1 + 1, ind3 - ind1 - 1), roots);
                obj1.else_block = cool.buildTemplate(str.substr(ind3 + 5, ind2 - ind3 - 5), roots);
            }
            else
            {
                obj1.main_block = cool.buildTemplate(str.substr(ind0 + 3, ind1 - ind0 - 3), roots);
                obj1.else_block = cool.buildTemplate(str.substr(ind1 + 1, ind2 - ind1), roots);
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

                var scr0 = document.createElement('script');

                scr0.type = 'text/javascript';
                scr0.text = "document['" + obj1.func + "'] = function(" + args0.substr(0, args0.length - 2) + "){ return " + cool.concateTmpFrag(obj1.conditional) + ";}";

                document.getElementsByTagName('body')[0].appendChild(scr0);
            }
            
            tmp.list.push(obj1);

            i = ind2 + 3;
        }

        // parse #script #end
        for (var j = 0; j < tmp.list.length; ++j)
        {
            var itm0 = tmp.list[j];

            if (itm0.type == 0)
            {
                itm0 = tmp.list.splice(j, 1)[0];

                for (var k = 0; k < itm0.text.length; ++k)
                {
                    var ind4 = itm0.text.indexOf("#script", k);

                    if (ind4 == -1)
                    {
                        tmp.list.splice(j, 0,
                        {
                            type : 0,
                            text: itm0.text.substr(k)
                        }); 

                        break;
                    }

                    var ind5 = itm0.text.indexOf("#end", ind4);

                    if (ind5 == -1)
                    {
                        tmp.list.splice(j, 0,
                        {
                            type : 0,
                            text: itm0.text.substr(k)
                        }); 

                        console.log("js-query template warning at " + k + "char: Possible wrong #script syntax. The '#end' of block #script-#end not found.");

                        break;
                    }

                    // text space
                    tmp.list.splice(j++, 0,
                    {
                        type: 0,
                        text: itm0.text.substr(k, ind4 - k)
                    });
                    
                    var text = itm0.text.substr(ind4 + 7, ind5 - ind4 - 7);
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

                        var scr1 = document.createElement('script');

                        scr1.type = 'text/javascript';
                        scr1.text = "document['" + func + "'] = function(" + args1.substr(0, args1.length - 2) + "){" + cool.concateTmpFrag(prog) + ";}";

                        document.getElementsByTagName('body')[0].appendChild(scr1);
                    }
                    
                    tmp.list.splice(j++, 0,
                    {
                        type : 2,
                        prog: prog,
                        text: text,
                        func : func
                    }); 

                    k = ind5 + 3;
                }
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
                    var selfVar = roots[vField.list[0].path] != null;

                    vField.offset = 1;

                    tmp.selfVars = tmp.selfVars && selfVar;

                    var ttt = 3;

                    if (vField.list.length == 2 && vField.list[1].path == "#index")
                    {
                        ttt = 4;
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
        }

        return str;
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

    // parse Js expression
    parseJs: function (str, exps, start, end)
    {
        if (exps == null)
        {
            exps = cool.splitExpression(str);

            start = 0;
            end = exps.length;
        }

        var list = [];

        for (var n = start; n < end; ++n)
        {
            var exp = exps[n];

            switch (exp)
            {
                case "{":
                case "[" :
                case "(" :
                {
                    var type = 6;
                    var close = ")";

                    if (exp == "{")
                    {
                        type = 1;
                        close = "}";
                    }
                    else if (exp == "[")
                    {
                        type = 2;
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
                        return console.log("Syntax error: closed brace ')' not found " + str);
                    }
                    
                    var ppc = list.length - 1;

                    list[ppc] =
                    {
                        type: type,
                        head: list[ppc],
                        body: cool.parseJs(null, exps, n + 1, ind)
                    };

                    // todo make it rain
                    list[ppc].path = list[ppc].head.path;
                    list[ppc].inner = "";
                    
                    for (var c = n + 1; c < ind; ++c)
                    {
                        list[ppc].inner += exps[c];
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
                        type: 8,
                        operator : exp
                    });

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
                        type: 7,
                        operator : exp
                    });

                    break;
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

                        list.push
                        ({
                            type: cool.getType(tmp_itm),
                            path: tmp_itm,
                        });
                    }

                    break;
                }
            }
        }

        // expression types
        // 0 - none
        // 1 - object
        // 2 - array
        // 3 - string
        // 4 - int
        // 5 - float
        // 6 - function
        // 7 - operator
        // 8 - conditional
        // 9 - var
        return list;
    },

    // split JS expression
    splitExpression: function (select)
    {
        var str = ['(', ')', '{', '}', '[', ']', '==', '!=', '&&', '||', '<=', '>=', '<<', '>>', '<', '>', '+', '-', '/', '*', '&', '^', '!'];
        var arr = select.split(' ');

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
        if (str.length == 0)
        {
            return 0;
        }

        if (str.length > 1 && str[0] == '"' && str[str.length - 1] == '"')
        {
            return 3;
        }

        if (str == parseInt(str).toString())
        {
            return 4;
        }

        if (str == parseFloat(str).toString())
        {
            return 5;
        }

        return 9;
    },

    // random string for function name
    getRandomString : function()
    {
        return (performance.now().toString(36) + Math.random().toString(36)).split(".").join("_");
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

    // init dom tree
    processElement : function(elm)
    {
        var tmp = elm.querySelectorAll("js-set, js-call, js-query, script[type=js-query], js-load, js-page, js-if, js-ajax, js-several, js-event, js-style, js-atr, js-validate, js-text, js-go, [js-bind], [js-read], [js-write], [js-class], [js-class-cancel]");
        var code = elm.cooljs().hash;
        var ht = {}; 
        var i = 0;
        var itm = null;
        var name = "";

        ht[code] = elm;

        var arr = [];

        // filter tags and init base function
        for (i = 0; i < tmp.length; ++i)
        {
            itm = tmp[i];
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
                            itm.cooljs();
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

                code = itm.cooljs().hash;

                itm._cool.init(name, itm);

                if (ht[code] == null)
                {
                    ht[code] = itm;
                }
            }
        }

        // build tag tree
        for (i = arr.length - 1; i >= 0; --i)
        {
            itm = arr[i];

            var cur = itm.obj.parentNode;

            while (cur != null)
            {
                if (cur._cool != null)
                {
                    if (cur._cool == true || cur._cool.tagName == "js-query")
                    {
                        itm._cool = true;

                        break;
                    }

                    if (ht[cur._cool.hash] != null)
                    {
                        if (itm.name == "js-set")
                        {
                            cur._cool.chields.splice(cur._cool.jssetCount++, 0, itm.obj);
                        }
                        else
                        {
                            cur._cool.chields.push(itm.obj);
                        }

                        itm.obj._cool.parent = cur;

                        break;
                    }
                }

                cur = cur.parentNode;
            }
        }

        // init tags
        for (i = 0; i < arr.length; ++i)
        {
            itm = arr[i];

            cool.jsF[itm.name](itm.obj);
        }

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
    numHt: { 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true, ".": true },
    body: document.getElementsByTagName('BODY')[0],
    dissableDisplayPolicy: false,
    hashList: {},
    defaultHash: "",
    lastUrlHash: "",
    outPos: 0,

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
            pattern : "(?=^.{8,}$)((?=.*\\d)|(?=.*\\W+))(?![.\\n])(?=.*[A-Z])(?=.*[a-z]).*$",//(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}
            title : "Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters."
        },
        email:
        {
            pattern : "[^@]+@[^@]+\.[a-zA-Z]{2,6}",//"^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$"
            title : "Email is not valid."
        },
        url:
        {
            pattern : "https?://.+",
            title : "Must start with http:// or https://"
        },
        tel:
        {
            pattern : "(\+?\d[- .]*){7,13}", //"(?:\(\d{3}\)|\d{3})[- ]?\d{3}[- ]?\d{4}",
            title : "Must contain only numbers, spaces and braces."
        }
    },
    
    // For debug #remove_block
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    logEx: function(str)
    {
        var level = 0;
        var f = cool.logEx;

        while (f)
        {
            level++;
            f = f.caller;
        }

        console.log(Array(level * 2).join(' ') + str);
    },

    tagTostring : function(name, obj)
    {
        var c = obj._cool;
        var level = 0;

        var f = cool.tagTostring;

        while (f)
        {
            level++;
            f = f.caller;
        }

        var str = Array(level * 2).join(' ') + name + c.tagName;

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
            str += " " + c.hash;
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
            str += " " + c.name;
        }

        return str;
    },

    atrTostring : function(obj)
    {
        var c = obj._cool;
        var str = c.tagName;

        if (c.tagName == "js-if")
        {
            str += " " + c.conditional;
        }
        
        return str;
    }

    // #remove_block_end
};

Object.prototype._cool = null;
Object.prototype.cooljs = function(base)
{
    if (base == null)
    {
        if (this._cool == null || this._cool == true)
        {
            this._cool =
            {
                attributes: [],
                hash: cool.lastHash++,
                tagName: null,
                parent: null,
                chields: [],
                isActive: false,
                jssetCount: 0,
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
                },
                action: function ()
                {
                    this.actionBase();
                },
                cancel: function ()
                {
                    this.cancelBase();
                },
                actionBase: function ()
                {
                    this.isActive = true;

                    for (var i = 0; i < this.chields.length; ++i)
                    {
                        var itm = this.chields[i];

                        // #remove_line
                        console.log(cool.tagTostring("Action: ", itm));

                        for (var j = 0; j < itm._cool.attributes.length; ++j)
                        {
                            var atr = itm._cool.attributes[j];

                            if (atr.action != null)
                            {
                                // #remove_line
                                console.log("Action atr: " + cool.atrTostring(atr));

                                atr.action();
                            }
                        }

                        itm._cool.action();
                    }

                    if (!cool.dissableDisplayPolicy && !this.cancelDisplay)
                    {
                        this.obj.style.display = this.actionDisplay;
                    }
                },
                cancelBase: function ()
                {
                    this.isActive = false;

                    for (var i = 0; i < this.chields.length; ++i)
                    {
                        var itm = this.chields[i];

                        // #remove_line
                        console.log(cool.tagTostring("Cancel: ", itm));

                        for (var j = 0; j < itm._cool.attributes.length; ++j)
                        {
                            var atr = itm._cool.attributes[j];

                            if (atr.cancel != null)
                            {
                                // #remove_line
                                console.log("Cancel atr: " + cool.atrTostring(atr));

                                atr.cancel();
                            }
                        }

                        itm._cool.cancel();
                    }

                    if (!cool.dissableDisplayPolicy && !this.cancelDisplay)
                    {
                        this.obj.style.display = this.cancelDisplayVal;
                    }
                },
                clear: function ()
                {
                    this.chields = [];
                }
            };
        }
    }
    else if (this._cool != null)
    {
        return this._cool;
    }
    else if (base == 1)
    {
        this._cool =
        {
            hash: cool.lastHash++
        };
    }

    return this._cool;
};

window.onload = cool.init;