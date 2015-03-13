var cool =
{
    lastHash: 1,
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
            "js-set": cool.tagSet,
            "js-event": cool.tagEvent,
            "js-several": cool.tagSeveral,
            "js-attribute": cool.tagAttribute,
            "js-style": cool.tagStyle
        };

        cool.initNavigator();
        cool.processElement(document);

        document._cool.action();

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
    tagSet : function(obj)
    {
        var name = obj.getAttribute("name");
        var type = obj.getAttribute("type");
        var cancel = obj.getAttribute("cancel");
        var value = obj.getAttribute("value");

        if (name == null || name == "")
        {
            return cool.logErr("js-set: The 'name' attribute is empty");
        }

        if (value == null || value == "")
        {
            return cool.logErr("js-set: The 'value' attribute is empty");
        }

        if (type == null || type == "")
        {
            return cool.logErr("js-set: The 'type' attribute is empty");
        }
        else if (type != "int" && type != "float" && type != "bool" && type != "string" && type != "object")
        {
            return cool.logErr("js-set: The 'type' attribute must be: int or float or bool or string or object");
        }

        if (type == "int")
        {
            obj._cool.value = parseInt(value);

            if (cancel != null)
            {
                obj._cool.cancelValue = parseInt(cancel);
            }
        }
        else if (type == "float")
        {
            obj._cool.value = parseFloat(value);

            if (cancel != null)
            {
                obj._cool.cancelValue = parseFloat(cancel);
            }
        }
        else if (type == "bool")
        {
            obj._cool.value = cool.parseBool[value];

            if (cancel != null)
            {
                obj._cool.cancelValue = parseBool(cancel);
            }
        }
        else if (type == "object")
        {
            eval("obj._cool.value = " + value);

            if (cancel != null)
            {
                eval("obj._cool.cancelValue = " + cancel);
            }
        }

        obj._cool.type = type;
        obj._cool.field = cool.createField(name, type == "object");
        obj._cool.action = function()
        {
            cool.applyField(this.field, this.value);
            
            this.actionBase();
        }
        obj._cool.cancel = function()
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
            return cool.logErr("js-ajax: The src attribute is empty");
        }

        if (type == null || type == "")
        {
            return cool.logErr("js-ajax: The type attribute is empty");
        }
        else if (type != "text" && type != "json" && type != "stream" && type != "xml")
        {
            return cool.logErr("js-ajax: The type attribute must be text or json or stream or xml");
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
            obj._cool.target = cool.createField("", true);
        }
        else
        {
            obj._cool.target = cool.createField(target, true);
        }
        
        var desk = null;

        for (var i = 0; i < obj.childNodes.length; ++i)
        {
            var itm = obj.childNodes[i];
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

        if (obj._cool.paramsIndex != null)
        {
            obj._cool.params = [];

            var pars = obj.childNodes[obj._cool.paramsIndex];

            for (var j = 0; j < pars.childNodes.length; ++j)
            {
                var par = pars.childNodes[j];

                if (par.tagName != null && par.tagName.toLowerCase() == "js-ajax-param")
                {
                    var par_name = par.getAttribute("name");
                    var par_value = par.getAttribute("value");

                    if (par_name == null || par_value == null || par_name == "" || par_value == "")
                    {
                        cool.logErr("Ajax param have empty 'name/value' attribute.");
                    }

                    obj._cool.params.push({ name: par_name, value: cool.createField(par_value, false) });
                }
            }
        }

        if (type == "stream")
        {
            if (obj._cool.metaIndex == null)
            {
                return cool.logErr("js-ajax: The js-ajax-stream must be defined, because type='stream' was chosen.");
            }
            
            obj._cool.metaInline = desk.getAttribute("inline") != null;

            if (!obj._cool.metaInline)
            {
                obj._cool.meta = cool.metaStream.toShort(desk);
            }

            if (desk.getAttribute("declare") != null)
            {
                cool.metaStream.declare(obj._cool.meta, cool.gocField(obj._cool.target));
            }
        }

        obj._cool.obj        = obj;
        obj._cool.src        = src;
        obj._cool.type       = type;
        obj._cool.display    = obj.style.display;
        obj._cool.data       = data;
        obj._cool.method     = method;
        obj._cool.mock       = mock;
        obj._cool.request    = request;
        obj._cool.response   = response;
        obj._cool.once       = once;
        obj._cool.nocache    = nocache;
        obj._cool.count      = 0;
        obj._cool.action = function()
        {
            if (this.once && this.count == 0 || !this.once)
            {
                var src_tmp = this.src;

                if (this.params != null)
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

                        src_tmp += par.name + "=" + cool.getField(par.value);

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
                                return cool.logErr("js-ajax: The inline metadata is wrond.");
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
        obj._cool.cancel = function()
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
            return cool.logErr("js-page: The src attribute is empty");
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

        //obj._cool.hash = hash;
        obj._cool.obj = obj;
        obj._cool.display = obj.style.display;
        obj._cool.isActiveNav = false;
        obj._cool.actionNav = function()
        {
            this.isActiveNav = true;

            if (this.parent._cool.isActive)
            {
                this.obj.style.display = this.display;
                this.actionBase();
            }
        }
        obj._cool.cancelNav = function()
        {
            this.isActiveNav = false;
            this.obj.style.display = "none";
            this.cancelBase();
        }
        obj._cool.action = function()
        {
            if (this.isActiveNav)
            {
                this.obj.style.display = this.display;
                this.actionBase();
            }
        }
        obj._cool.cancel = function()
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
            return cool.logErr("js-load: The src attribute is empty");
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
            return cool.logErr("js-load: Wrong type");
        }

        obj._cool.type = type;
        obj._cool.src = src;
        obj._cool.obj = obj;
        obj._cool.display = obj.style.display;
        obj._cool.action = function()
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
                    cool.ajaxGet(this.src, this.obj, function(http, tag)
                    {
                        tag.innerHTML = http.responseText;

                        cool.processElement(tag);
                        tag._cool.actionBase();
                    }).go();

                    break;
                }
                case "com":
                {

                    break;
                }
            }
        }
        obj._cool.cancel = function()
        {
            this.obj.style.display = "none";
            this.cancelBase();
        }

        obj._cool.cancel();
    },

    // js-query
    tagQuery: function(obj)
    {
        var select = obj.getAttribute("select");

        if (select == null || select == "")
        {
            return cool.logErr("js-query: The 'select' attribute is empty");
        }

        // compile query
        var arr = select.split(' ');
        var prog = {};

        for (var i = 0; i < arr.length; ++i)
        {
            var end;
            var tmp;
            var j = 0;

            switch (arr[i])
            {
                case "From":
                {
                    if (prog.from != null)
                    {
                        return cool.logErr("js-query: Operator 'From' must defined only once.");
                    }

                    if (i != 1)
                    {
                        return cool.logErr("js-query: Operator 'From' must be first.");
                    }

                    prog.from =
                    {
                        path: arr[i + 1]
                    };

                    var ind = arr[0].indexOf(".");

                    if (ind == -1)
                    {
                        prog.root = arr[0];
                        prog.from.v = arr[0];
                    }
                    else
                    {
                        prog.root = arr[0].substr(0, ind);
                        prog.from.v = arr[0].substr(ind + 1);
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
                        return cool.logErr("js-query: Operator 'Join' must defined after 'From'.");
                    }

                    if (prog.join == null)
                    {
                        prog.join = [];
                    }

                    var join =
                    {
                        type : arr[i++],
                        v: arr[i++]
                    }

                    if (arr[i] != "On")
                    {
                        return cool.logErr("js-query: Operator 'Join' has format <... Join variable_name On conditionals ...>.");
                    }

                    end = cool.findNextOperator(i + 1, arr);
                    tmp = [];
                    
                    for (j = i; j < end; ++j)
                    {
                        tmp.push(arr[j]);
                    }

                    join.conditional = tmp.join(' ');

                    prog.join.push(join);

                    break;
                }
                case "Where":
                {
                    if (prog.where != null)
                    {
                        return cool.logErr("js-query: Operator 'Where' must defined only once.");
                    }

                    if (prog.order != null || prog.group != null)
                    {
                        return cool.logErr("js-query: Operator 'Where' must defined after 'From' or after 'Join'.");
                    }

                    prog.where = {};

                    end = cool.findNextOperator(i + 1, arr);
                    tmp = [];
                    
                    for (j = i; j < end; ++j)
                    {
                        tmp.push(arr[j]);
                    }

                    prog.where.conditional = tmp.join(' ');

                    break;
                }
                case "Order":
                {
                    if (prog.order != null)
                    {
                        return cool.logErr("js-query: Operator 'Order' must defined only once.");
                    }

                    if (prog.group != null)
                    {
                        return cool.logErr("js-query: Operator 'Order' must defined before 'Group'");
                    }

                    prog.order = [];

                    end = cool.findNextOperator(i + 1, arr);
                    tmp = [];
                    
                    for (j = i; j < end; ++j)
                    {
                        tmp.push(arr[j]);
                    }

                    tmp = tmp.join(' ').split(',');

                    for (j = i; j < end; ++j)
                    {
                        prog.order.push(arr[j]);
                    }

                    break;
                }
                case "Group":
                {
                    if (prog.group != null)
                    {
                        return cool.logErr("js-query: Operator 'Group' must defined only once.");
                    }

                    prog.group = [];

                    end = cool.findNextOperator(i + 1, arr);
                    tmp = [];
                    
                    for (j = i; j < end; ++j)
                    {
                        tmp.push(arr[j]);
                    }

                    tmp = tmp.join(' ').split(',');

                    for (j = i; j < end; ++j)
                    {
                        prog.group.push(arr[j]);
                    }

                    break;
                }
            }
        }
        
        // build template




        obj._cool.prog = prog;
    },

    // js-if
    tagIf: function (obj)
    {
        var con = obj.getAttribute("conditional");

        if (con == null || con == "")
        {
            return cool.logErr("The conditional attribute is empty");
        }

        var arr = cool.parseCon(con);

        for (var i = 0; i < arr.length; ++i)
        {
            var itm = arr[i];

            cool.addToObserve(itm.path, obj);
        }

        //for (var i = 0; i < arr.length; ++i)
        //{
        //    var itm = arr[i];
        //    var p = "window." + itm.path;

        //    if (cool.obHt[p] == null)
        //    {
        //        cool.obHt[p] = itm;

        //        itm.list = [];
        //    }
        //    else
        //    {
        //        itm = cool.obHt[p];
        //    }

        //    itm.list.push(obj);
        //}

        obj._cool.conditional = con;
        obj._cool.obj = obj;
        obj._cool.display = obj.style.display;
        obj._cool.isChanged = true;
        obj._cool.isFlug = null;
        obj._cool.action = function()
        {
            if (this.isChanged)
            {
                this.refreshEx();
            }
        };
        obj._cool.cancel = function()
        {
            this.obj.style.display = "none";
            this.cancelBase();
        };
        obj._cool.refresh = function(elm, path)
        {
            this.isChanged = true;

            this.refreshEx();
        };
        obj._cool.refreshEx = function()
        {
            if (this.parent._cool.isActive)
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

    // js-event
    tagEvent: function(obj)
    {
        var name = obj.getAttribute("name");
        var select = obj.getAttribute("select");
        var onactive = obj.hasAttribute("onactive");

        if (name == null || name == "")
        {
            return cool.logErr("js-event: The 'name' attribute is empty");
        }

        if (select == null || select == "")
        {
            select = "parent";
        }

        var prog = cool.compileSelector(select);
        var arr = cool.getBySelector(prog, obj);

        function initEvent(obj)
        {
            return function()
            {
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

        obj._cool.event = initEvent(obj);

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
            return cool.logErr("js-event: The 'name' attribute is empty");
        }

        if (value == null || value == "")
        {
            return cool.logErr("js-event: The 'value' attribute is empty");
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

        obj._cool.obj = obj;
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

    // js-attribute
    tagAttribute: function(obj)
    {
        var name = obj.getAttribute("name");
        var value = obj.getAttribute("value");
        obj._cool.select = obj.getAttribute("select");

        if (name == null || name == "")
        {
            return cool.logErr("js-event: The 'name' attribute is empty");
        }

        if (value == null || value == "")
        {
            return cool.logErr("js-event: The 'value' attribute is empty");
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

        obj._cool.obj = obj;
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

                itm[name] = this.value;
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

                    itm[name] = this.cancelValue;
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

        obj._cool.obj = obj;
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

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // Attributes

    // js-bind, js-read, js-write
    atrBind : function(obj, isReadOnly, isWriteOnly)
    {
        obj.cooljs();

        obj._cool.path = "";

        if (isReadOnly)
        {
            obj._cool.path = obj.getAttribute("js-read");
        }
        else if (isWriteOnly)
        {
            obj._cool.path = obj.getAttribute("js-write");
        }
        else
        {
            obj._cool.path = obj.getAttribute("js-bind");
        }

        if (obj._cool.path == null || obj._cool.path == "")
        {
            return cool.logErr(obj.tagName + ": has empty 'js-bing' attribute.");
        }
        else
        {
            obj._cool.path = "window." + obj._cool.path;
        }

        var tnm = obj.tagName.toLowerCase();
        obj._cool.isInput = tnm == "input";
        obj._cool.isTextaria = tnm == "textaria";
        obj._cool.isSelect = tnm == "select";
        obj._cool.isFloat = obj.hasAttribute("float");
        obj._cool.lock1 = false;
        obj._cool.lock2 = false;
        obj._cool.isCheckbox = false;
        obj._cool.isRadio = false;
        obj._cool.isText = false;
        obj._cool.isNumber = false;
        obj._cool.field = cool.createField(obj._cool.path, false);
        obj._cool.obj = obj;

        // validate
        if (obj._cool.isInput)
        {
            var type = obj.getAttribute("type");

            if (type == null || type == "" || type == "text" || type == "password" || type == "email" || type == "url" || type == "date" || type == "month" || type == "week" || type == "time" || type == "datetime-local" || type == "search" || type == "color" || type == "tel")
            {
                obj._cool.isText = true;
            }
            else if (type == "checkbox")
            {
                obj._cool.isCheckbox = true;
            }
            else if (type == "radio")
            {
                obj._cool.isRadio = true;
            }
            else if ( type == "range" || type == "number")
            {
                obj._cool.isNumber = true;
            }
            else
            {
                return cool.logErr("The input type='" + type + "' not supported.");
            }
        }
        else if (obj._cool.isTextaria || obj._cool.isSelect)
        {
            obj._cool.isText = true;
        }
        else
        {
            return cool.logErr("The " + obj.tagName + " tag can't used with js-bind. You can use js-text tag for text binding, see docks.");
        }

        // set observe
        if (!isWriteOnly)
        {
            if (obj._cool.isInput)
            {
                if (obj._cool.isCheckbox)
                {
                    obj._cool.refreshEx = function()
                    {
                        this.obj.checked = cool.getField(this.field);
                    };
                }
                else if (obj._cool.isRadio)
                {
                    obj._cool.refreshEx = function()
                    {
                        var tmp = cool.getField(this.field);

                        if (this.obj.value == tmp)
                        {
                            this.obj.checked = true;
                        }
                    };                    
                }
                else if (obj._cool.isNumber || obj._cool.isText)
                {
                    obj._cool.refreshEx = function()
                    {
                        var tmp = cool.getField(this.field);

                        this.obj.value = tmp;
                    }; 
                }
            }
            else
            {
                obj._cool.refreshEx = function()
                {
                    var tmp = cool.getField(this.field);

                    this.obj.value = tmp;
                }; 
            }

            obj._cool.refresh = function(elm, path)
            {
                if (!this.lock2)
                {
                    this.lock1 = true;
                    this.refreshEx();
                    this.lock1 = false;
                }
            };

            cool.addToObserve(path);
        }

        // event changes
        if (!isReadOnly)
        {
            if (obj._cool.isInput)
            {
                if (obj._cool.isCheckbox)
                {
                    obj._cool.getVal = function()
                    {
                        return this.obj.checked;
                    };
                }
                else if (obj._cool.isRadio)
                {
                    obj._cool.getVal = function()
                    {
                        if (this.checked)
                        {
                            return this.obj.value;
                        }

                        return null;
                    };                    
                }
                else if (obj._cool.isText)
                {
                    obj._cool.getVal = function()
                    {
                        return this.obj.value;
                    };                    
                }
                else if (obj._cool.isNumber)
                {
                    obj._cool.getVal = function()
                    {
                        var tmp = this.isFloat ? parseFloat(this.obj.value) : parseInt(this.obj.value);

                        return tmp;
                    };                    
                }
            }

            obj.addEventListener("change", function ()
            {
                if (!this._cool.lock1)
                {
                    this._cool.lock2 = true;

                    var tmp = this._cool.getVal();

                    if (tmp != null)
                    {
                        cool.setField(this._cool.field, tmp);
                        cool.changed(obj._cool.path);
                    }

                    this._cool.lock2 = false;
                }
            });
        }
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

                itm._cool.cancelNav();
            }
        }

        cool.lastUrlHash = window.location.hash;

        list = cool.hashList[cool.lastUrlHash];

        if (list != null)
        {
            for (i = 0; i < list.length; ++i)
            {
                itm = list[i];

                itm._cool.actionNav();
            }
        }        
    },
    
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // Ajax

    // Ajax request helper todo make headers    XMLHttpRequest.setRequestHeader(name, value)
    ajax : function (method, url, data, tag, callback)
    {
        var obj = new XMLHttpRequest();

        //obj.responseType = "text";
        obj.open(method, url, true);
        obj.setRequestHeader('Content-Type', 'text/plain');
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
            obj.send(this._cool.data);
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
    // Fields and observe

    // observe hashtable
    obHt: {},

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
                    return cool.logErr("Syntax error: closed brace ']' not found " + path);
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

            if (cur == null)
            {
                return cool.logErr("The variable '" + itm.name + "' on path '" + field.path + " is underfined! Define it with js-set tag.");
            }

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
                        // todo return cool.logErr(here? or maybe create observe ?

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
                    // todo return cool.logErr(here? or maybe create observe ?

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

    // only apply
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

    // signal of change each object field
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

    // call than property changed
    changed : function(path)
    {
        if (cool.obHt[path] != null)
        {
            var ob = cool.obHt[path];

            for (var i = 0; i < ob.list.length; ++i)
            {
                var itm = ob.list[i];

                itm._cool.refresh(itm, path);
            }
        }
    },

    // add field to observe
    addToObserve : function(path, obj)
    {
        var p = "window." + path;

        if (cool.obHt[p] == null)
        {
            cool.obHt[p] = { list: [] };
        }

        cool.obHt[p].list.push(obj);
    },
    
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // Selector query

    // get elements by selector
    compileSelector : function(query)
    {
        var arr = query.split(".");
        var ret = [];
        var s, e = 0;
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
                        cmd : "0"
                    });

                    continue;
                }
                case "push-all":
                {
                    ret.push(
                    {
                        cmd : "2"
                    });

                    continue;
                }
                case "back":
                {
                    ret.push(
                    {
                        cmd : "4"
                    });

                    continue;
                }
                case "back-tree":
                {
                    ret.push(
                    {
                        cmd : "5"
                    });

                    continue;
                }
                case "body":
                {
                    ret.push(
                    {
                        cmd : "8"
                    });

                    continue;
                }
                case "break":
                {
                    ret.push(
                    {
                        cmd : "9"
                    });

                    continue;
                }
                case "document":
                {
                    ret.push(
                    {
                        cmd : "a"
                    });

                    continue;
                }
                case "head":
                {
                    ret.push(
                    {
                        cmd : "b"
                    });

                    continue;
                }
                case "continue":
                {
                    ret.push(
                    {
                        cmd : "c"
                    });

                    continue;
                }
                case "next":
                {
                    ret.push(
                    {
                        cmd : "d"
                    });

                    continue;
                }
                case "next-tree":
                {
                    ret.push(
                    {
                        cmd : "e"
                    });

                    continue;
                }
                case "last":
                {
                    ret.push(
                    {
                        cmd : "h"
                    });

                    continue;
                }
                case "if":
                {
                    ret.push(
                    {
                        cmd : ""
                    });

                    continue;
                }
                case "each":
                {
                    ret.push(
                    {
                        cmd : ""
                    });

                    continue;
                }
                case "push":
                {
                    ret.push(
                    {
                        cmd : ""
                    });

                    continue;
                }
                case "exit":
                {
                    ret.push(
                    {
                        cmd : ""
                    });

                    continue;
                }
                case "range":
                {
                    ret.push(
                    {
                        cmd : ""
                    });

                    continue;
                }
                case "log":
                {
                    ret.push(
                    {
                        cmd : ""
                    });

                    continue;
                }
                case "end":
                {
                    ret.push(
                    {
                        cmd : ""
                    });

                    continue;
                }
            }

            var c0 = cmd[0];

            switch (c0)
            {
                case "p":
                {
                    if (cmd.length > 8 && cmd.substr(0, 6) == "parent" && cmd[7] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd : "1",
                            index : parseInt(cmd.substr(7, cmd.length - 8))
                        });                        
                    }
                    else
                    {
                        return cool.logErr(err + cmd);
                    }

                    break;
                }
                case "c":
                {
                    if (cmd.length > 8 && cmd.substr(0, 6) == "chield" && cmd[7] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd : "3",
                            index : parseInt(cmd.substr(7, cmd.length - 8))
                        });                        
                    }
                    else
                    {
                        return cool.logErr(err + cmd);
                    }

                    break;                    

                }
                case "b":
                {
                    if (cmd.length > 6 && cmd.substr(0, 4) == "back" && cmd[5] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd : "6",
                            index : parseInt(cmd.substr(5, cmd.length - 6))
                        });                        
                    }
                    else if (cmd.length > 11 && cmd.substr(0, 9) == "back-tree" && cmd[10] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd : "7",
                            index : parseInt(cmd.substr(10, cmd.length - 11))
                        });                        
                    }
                    else
                    {
                        return cool.logErr(err + cmd);
                    }

                    break;                    

                }
                case "n":
                {
                    if (cmd.length > 6 && cmd.substr(0, 4) == "next" && cmd[5] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd : "f",
                            index : parseInt(cmd.substr(5, cmd.length - 6))
                        });                        
                    }
                    else if (cmd.length > 11 && cmd.substr(0, 9) == "next-tree" && cmd[10] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd : "g",
                            index : parseInt(cmd.substr(10, cmd.length - 11))
                        });                        
                    }
                    else
                    {
                        return cool.logErr(err + cmd);
                    }

                    break;                    

                }
                case "l":
                {
                    if (cmd.length > 6 && cmd.substr(0, 4) == "last" && cmd[5] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd : "i",
                            index : parseInt(cmd.substr(5, cmd.length - 6))
                        });                        
                    }
                    else
                    {
                        return cool.logErr(err + cmd);
                    }

                    break;                    
                }
                case "s":
                {
                    if (cmd.length > 10 && cmd.substr(0, 9) == "selector(" && cmd[cmd.length - 1] == ")")
                    {
                        ret.push(
                        {
                            cmd : "j",
                            query : cmd.substr(9, cmd.length - 10)
                        });                        
                    }
                    else if (cmd.length > 17 && cmd.substr(0, 13) == "selector-all(" && cmd[cmd.length - 1] == "]")
                    {
                        var ind = cmd.lastIndexOf(")");

                        if (ind == -1)
                        {
                            return cool.logErr("the ')' expected");
                        }

                        ret.push(
                        {
                            cmd: "l",
                            query: cmd.substr(13, ind - 13),
                            index : parseInt(cmd.substr(ind + 1, cmd.length - ind - 1))
                        });                        
                    }
                    else if (cmd.length > 14 && cmd.substr(0, 13) == "selector-all(" && cmd[cmd.length - 1] == ")")
                    {
                        ret.push(
                        {
                            cmd : "k",
                            query : cmd.substr(13, cmd.length - 14)
                        });                        
                    }
                    else
                    {
                        return cool.logErr(err + cmd);
                    }

                    break;                    

                }
            }
            
        }

        return ret;
    },

    // get elements by selector
    getBySelector : function(prog, elm)
    {
        var ret = [];
        var cur = elm;
        var pos = 0;
        var i = 0;
        var tmp = null;

        while (true)
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
                    for (i = 0; i < cur.childNodes.length; ++i)
                    {
                        ret.push(cur.childNodes[i]);
                    }

                    break;
                }
                case "3": // chield[n]
                {
                    if (opr.index < cur.childNodes.length)
                    {
                        cur = cur.childNodes[opr.index];
                    }

                    break;
                }
                case "4": // back
                {
                    if (cur.previousSibling != null)
                    {
                        cur = cur.previousSibling;
                    }

                    break;
                }
                case "5": // back-tree
                {
                    if (cur.previousSibling != null)
                    {
                        cur = cur.previousSibling;
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
                        if (cur.previousSibling != null)
                        {
                            cur = cur.previousSibling;
                        }
                    }

                    break;
                }
                case "7": // back-tree[n]
                {
                    for (i = 0; i < opr.index; ++i)
                    {
                        if (cur.previousSibling != null)
                        {
                            cur = cur.previousSibling;
                        }
                        else
                        {
                            cur = cur.parentNode;
                        }
                    }

                    break;
                }
                case "8" : // body
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
                    if (cur.nextSibling != null)
                    {
                        cur = cur.nextSibling;
                    }

                    break;
                }
                case "e": // next-tree
                {
                    if (cur.childNodes.length > 0)
                    {
                        cur = cur.childNodes[0];
                    }
                    else
                    {
                        while (cur != document)
                        {
                            if (cur.nextSibling != null)
                            {
                                cur = cur.nextSibling;

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
                        if (cur.nextSibling != null)
                        {
                            cur = cur.nextSibling;
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
                            if (cur.nextSibling != null)
                            {
                                cur = cur.nextSibling;

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
                    if (cur.childNodes.length > 0)
                    {
                        cur = cur.childNodes[cur.childNodes.length - 1];
                    }

                    break;
                }
                case "i": // last[n]
                {
                    if (opr.index < cur.childNodes.length)
                    {
                        cur = cur.childNodes[cur.childNodes.length - opr.index];
                    }
                    else if (cur.childNodes.length > 0)
                    {
                        cur = cur.childNodes[0];
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
                        nextSibling: null,
                        previousSibling: null,
                        childNodes: cur.querySelectorAll(opr.query)
                    };

                    if (isLast)
                    {
                        for (i = 0; i < cur.childNodes.length; ++i)
                        {
                            ret.push(cur.childNodes[i]);
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
    
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // Stream data protocol
    metaStream :
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
                    return cool.logErr("js-ajax-stream: The 'spliter' attribute is empty");
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
                    return cool.logErr("js-stream-var: The 'name' attribute is empty");
                }

                if (type == null || type == "")
                {
                    return cool.logErr("js-stream-var: The 'type' attribute is empty");
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
                    return cool.logErr(tagName + ": The 'name' attribute is empty");
                }

                if (type == null || type == "")
                {
                    return cool.logErr(tagName + ": The 'type' attribute is empty");
                }

                if (obj.childNodes.length > 0 && type != "object")
                {
                    return cool.logErr(tagName + ": The 'type' must be 'object' than chields more one.");
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
                        return cool.logErr(tagName + ": The 'sign' attribute is empty");
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
                    return cool.logErr(tagName + ": The 'name' attribute is empty");
                }

                if (value == null || value == "")
                {
                    return cool.logErr(tagName + ": The 'value' attribute is empty");
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
    
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // Helpers

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
        var tmp = elm.querySelectorAll("js-set, js-load, js-page, js-if, js-ajax, js-several, js-event, js-style, js-attribute, [js-bind], [js-read], [js-write]");
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

            if (cool.jsF[name] != null)
            {
                arr.push({obj : itm, name : name});

                code = itm.cooljs().hash;

                if (ht[code] == null)
                {
                    ht[code] = itm;
                }
            }
            else if (itm.getAttribute("js-bind") != null)
            {
                cool.atrBind(itm, false, false);
            }
            else if (itm.getAttribute("js-read") != null)
            {
                cool.atrBind(itm, true, false);
            }
            else if (itm.getAttribute("js-write") != null)
            {
                cool.atrBind(itm, false, true);
            }
        }

        // build tag tree
        for (i = arr.length - 1; i >= 0; --i)
        {
            itm = arr[i];

            var cur = itm.obj.parentNode;

            while (cur != null)
            {
                if (cur._cool != null && ht[cur._cool.hash] != null)
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

                cur = cur.parentNode;
            }
        }

        // run init tags
        for (i = 0; i < arr.length; ++i)
        {
            itm = arr[i];

            cool.jsF[itm.name](itm.obj);
        }

        delete ht;
        delete arr;
        delete tmp;
    },

    // log exception
    logErr : function(mess)
    {
        console.log(mess);

        return null;
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

Object.prototype._cool = null;
Object.prototype.cooljs = function()
{
    if (this._cool == null)
    {
        this._cool =
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

                    itm._cool.action();
                }
            },
            cancelBase : function()
            {
                this.isActive = false;

                for (var i = 0; i < this.chields.length; ++i)
                {
                    var itm = this.chields[i];

                    itm._cool.cancel();
                }
            }
        };
    }

    return this._cool;
};

window.onload = cool.init;


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