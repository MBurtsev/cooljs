var cool =
{
    lastHash: 1,
    numHt: { 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true, ".": true },
    body: document.getElementsByTagName('BODY')[0],
    hashList: {},
    defaultHash: "",
    lastUrlHash: "",
    outPos: 0,

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
    tagSet: function(obj)
    {
        var name = obj.getAttribute("name");
        var type = obj.getAttribute("type");
        var cancel = obj.getAttribute("cancel");
        var value = obj.getAttribute("value");

        if (name == null || name == "")
        {
            return console.log("js-set: The 'name' attribute is empty");
        }

        if (value == null || value == "")
        {
            return console.log("js-set: The 'value' attribute is empty");
        }

        if (type == null || type == "")
        {
            return console.log("js-set: The 'type' attribute is empty");
        }
        else if (type != "int" && type != "float" && type != "bool" && type != "string" && type != "object")
        {
            return console.log("js-set: The 'type' attribute must be: int or float or bool or string or object");
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
                        console.log("Ajax param have empty 'name/value' attribute.");
                    }

                    obj._cool.params.push({ name: par_name, value: cool.createField(par_value, false) });
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

            if (desk.getAttribute("declare") != null)
            {
                cool.metaStream.declare(obj._cool.meta, cool.gocField(obj._cool.target));
            }
        }

        obj._cool.obj = obj;
        obj._cool.src = src;
        obj._cool.type = type;
        obj._cool.display = obj.style.display;
        obj._cool.data = data;
        obj._cool.method = method;
        obj._cool.mock = mock;
        obj._cool.request = request;
        obj._cool.response = response;
        obj._cool.once = once;
        obj._cool.nocache = nocache;
        obj._cool.count = 0;
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
                                return console.log("js-ajax: The inline metadata is wrond.");
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
            return console.log("js-query: The 'select' attribute is empty");
        }
        
        // compile query
        var arr = select.split(' ');
        var prog = {};
        var tmp;
        var end;
        var j = 0;
        var ind = 0;
        var str = ['(', ')', '[', ']', '==', '!=', '&&', '||', '<=', '>=', '<<', '>>', '<', '>', '+', '-', '/', '*', '&', '^'];

        for (cool.outPos = 0; cool.outPos < arr.length; ++cool.outPos)
        {
            var itm = arr[cool.outPos];

            if (itm == "")
            {
                arr.splice(cool.outPos, 1);
                cool.outPos--;

                continue;
            }

            for (var j = 0; j < str.length; ++j)
            {
                cool.splitAndInsert(arr, str[j]);
            }
        }

        for (var i = 0; i < arr.length; ++i)
        {
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

                    prog.from =
                    {
                        field : cool.createField(arr[i + 1], true)
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
                            list : []
                        };
                    }

                    var join =
                    {
                        type: arr[i++],
                        field: cool.createField(arr[i++]),
                        conditional:
                        {
                             expressions: []
                        }
                    }

                    if (arr[i++] != "As")
                    {
                        return console.log("js-query: Operator 'Join' has format <... Join source_array_path As object_name On link_conditionals ...>. Keyword 'As' required.");
                    }

                    join.v = arr[i++];
                    join.vField = join.v.split(".");
                    join.vRoot = join.vField[0];

                    if (arr[i++] != "On")
                    {
                        return console.log("js-query: Operator 'Join' has format <... Join source_array_path As object_name On link_conditionals ...>. Keyword 'On' required.");
                    }

                    end = cool.findNextOperator(i, arr);
                    var cur_exp = {};
                    var isLeft = true;

                    for (j = i; j < end; ++j)
                    {
                        switch (arr[j])
                        {
                            case "!=":
                            case "==":
                            case "<=":
                            case ">=":
                            case ">":
                            case "<":
                            {
                                cur_exp.type = arr[j];
                                isLeft = false;

                                break;
                            }
                            case "||":
                            case "&&":
                            {
                                join.conditional.expressions.push(cur_exp);
                                cur_exp = {};
                                isLeft = true;

                                break;
                            }
                            case "(":
                            case ")":
                            {
                                //brace

                                break;
                            }
                            case "[":
                            case "]":
                            {
                                // array

                                break;
                            }
                            case "<<":
                            case ">>":
                            case "*":
                            case "/":
                            case "+":
                            case "-":
                            case "&":
                            case "^":
                            {
                                // operators

                                break;
                            }
                            default :
                            {
                                tmp = { v : arr[j], vField : arr[j].split(".")};
                                
                                if (isLeft)
                                {
                                    cur_exp.left = tmp;
                                }
                                else
                                {
                                    cur_exp.right = tmp;
                                }

                                break;    
                            }
                        }
                    }

                    if (cur_exp.left != null)
                    {
                        join.conditional.expressions.push(cur_exp);
                    }

                    join.conditional.isSimple = join.conditional.expressions.length == 1;

                    //join.conditional = tmp.join(' ');

                    prog.join.list.push(join);

                    //function a(comp, obj)
                    //{
                    //    return comp.user.id > obj.code;
                    //}

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
                        return console.log("js-query: Operator 'Order' must defined only once.");
                    }

                    if (prog.group != null)
                    {
                        return console.log("js-query: Operator 'Order' must defined before 'Group'");
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
                        return console.log("js-query: Operator 'Group' must defined only once.");
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
        var fragments = [];
        var values = [];
        tmp = obj.innerHTML;

        obj._cool.func = cool.getRandomString();

        var func = "<script>function " + obj._cool.func + "(prog, item){var str = '';";

        func += "";

        //for (var n = 0; n < tmp.length; ++n)
        //{
        //    var sv = tmp.indexOf("{{", n);
        //    var si = tmp.indexOf("#if", n);
        //    var ev = 0;
        //    var ei = 0;
        //    var cmd = 0;

        //    if (sv != -1 && si != -1)
        //    {
        //        if (sv < si)
        //        {
        //            cmd = 1;
        //        }
        //        else
        //        {
        //            cmd = 2;
        //        }
        //    }
        //    else if (sv != -1)
        //    {
        //        cmd = 1;
        //    }
        //    else if (si != -1)
        //    {
        //        cmd = 2;
        //    }
        //    else
        //    {
        //        break;
        //    }

        //    if (cmd == 1)
        //    {
        //    }
        //    else
        //    {
        //    }

        //    var ied = 0;

        //    if (ist == -1)
        //    {
        //        ist = tmp.indexOf("#if", n);

        //        if (ist == -1)
        //        {
        //            break;
        //        }

        //        ied = tmp.indexOf("#end", ist);

        //        if (ied == -1)
        //        {
        //            return console.log("js-query: No closed #if.");
        //        }
        //    }
        //}

        func += "return str; }</script>";

        // actions
        obj._cool.isAlways = obj.getAttribute("alwaysData") != null;
        obj._cool.display = obj.style.display;
        obj._cool.prog = prog;
        obj._cool.action = function()
        {
            if (this.tree == null || this.isAlways)
            {
                this.prog.from.src = cool.getField(this.prog.from.field);

                if (this.prog.from.src == null)
                {
                    return console.log("js-query: From's field " + this.prog.from.field.path + " is underfined.");
                }

                var cmp = 
                {
                    compare : function()
                    {
                        
                    }
                };


            }

            this.obj.style.display = this.display;
            this.actionBase();
        }
        obj._cool.cancel = function()
        {
            this.obj.style.display = "none";
            this.cancelBase();
        }
    },

    computeData : function(prog)
    {
        var comp = [];
        var main = cool.getField(prog.from.field);

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
                    join.data = cool.getField(join.field);
                }

                for (var c = 0; c < count; ++c)
                {
                    var com = comp[c];

                    for (var d = 0; d < join.data; ++c)
                    {
                        if (eval(join.conditional))
                        {
                            if (com[join.v] == null)
                            {
                                com[join.v] = join.data[d];
                            }
                            else
                            {
                                var new_rec = cool.cloneObj(com);

                                new_rec[join.v] = join.data[d];

                                comp.push(new_rec);
                            }
                        }
                    }
                }
            }
        }
    },

    // js-if
    tagIf: function(obj)
    {
        var con = obj.getAttribute("conditional");

        if (con == null || con == "")
        {
            return console.log("The conditional attribute is empty");
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
            return console.log("js-event: The 'name' attribute is empty");
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
    atrBind: function(obj, isReadOnly, isWriteOnly)
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
            return console.log(obj.tagName + ": has empty 'js-bing' attribute.");
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
            else if (type == "range" || type == "number")
            {
                obj._cool.isNumber = true;
            }
            else
            {
                return console.log("The input type='" + type + "' not supported.");
            }
        }
        else if (obj._cool.isTextaria || obj._cool.isSelect)
        {
            obj._cool.isText = true;
        }
        else
        {
            return console.log("The " + obj.tagName + " tag can't used with js-bind. You can use js-text tag for text binding, see docks.");
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

            obj.addEventListener("change", function()
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
    go: function(src)
    {
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
                cool.setPage();
            },
            false);
    },

    // activate page
    setPage: function()
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
    ajax: function(method, url, data, tag, callback)
    {
        var obj = new XMLHttpRequest();

        //obj.responseType = "text";
        obj.open(method, url, true);
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

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // Fields and observe

    // observe hashtable
    obHt: {},

    // create field from field path
    createField: function(path, isObject)
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
            list: []
        };

        for (var i = 0; i < arr.length; ++i)
        {
            var itm = arr[i];
            var ind = itm.indexOf("[");

            if (ind == -1)
            {
                field.list.push(
                {
                    isArray: false,
                    name: itm,
                    isObject: isObject
                });
            }
            else
            {
                var end = itm.lastIndexOf("]");

                if (end == -1)
                {
                    return console.log("Syntax error: closed brace ']' not found " + path);
                }

                var str = itm.substr(ind, end - ind);
                var num = parseInt(str);

                if (str == num.toString())
                {
                    field.list.push(
                    {
                        isArray: true,
                        isIndexInt: true,
                        name: itm.substr(0, ind),
                        index: num,
                        isObject: false
                    });
                }
                else
                {
                    field.list.push(
                    {
                        isArray: true,
                        isIndexInt: false,
                        isObject: false,
                        name: itm.substr(0, ind),
                        index: cool.createField(str, false)
                    });
                }
            }
        }

        return field;
    },

    // set field value
    setField: function(field, val)
    {
        var cur = window;

        for (var i = 0; i < field.list.length; ++i)
        {
            var itm = field.list[i];
            var last = i == field.list.length - 1;

            if (cur == null)
            {
                return console.log("The variable '" + itm.name + "' on path '" + field.path + " is underfined! Define it with js-set tag.");
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
                        // todo return console.log(here? or maybe create observe ?

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
                    // todo return console.log(here? or maybe create observe ?

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
    getField: function(field)
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
    gocField: function(field, isObject)
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
    applyField: function(field, obj)
    {
        var tar = cool.gocField(field);

        cool.applyFieldEx(obj, tar);
        cool.signalFieldChange(field.path, obj);
    },

    // only apply
    applyFieldEx: function(src, dst)
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

                    cool.applyFieldEx(src[p], dst[p]);
                }
                else
                {
                    dst[p] = src[p];
                }
            }
        }
    },

    // signal of change each object field
    signalFieldChange: function(path, obj)
    {
        for (var p in obj)
        {
            if (obj.hasOwnProperty(p))
            {
                if (typeof obj[p] == "object")
                {
                    cool.signalFieldChange(path + "." + p, obj[p]);
                }
                else
                {
                    cool.changed(path + "." + p);
                }
            }
        }
    },

    // call than property changed
    changed: function(path)
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
    addToObserve: function(path, obj)
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
                    if (cmd.length > 8 && cmd.substr(0, 6) == "parent" && cmd[7] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd: "1",
                            index: parseInt(cmd.substr(7, cmd.length - 8))
                        });
                    }
                    else
                    {
                        return console.log(err + cmd);
                    }

                    break;
                }
                case "c":
                {
                    if (cmd.length > 8 && cmd.substr(0, 6) == "chield" && cmd[7] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd: "3",
                            index: parseInt(cmd.substr(7, cmd.length - 8))
                        });
                    }
                    else
                    {
                        return console.log(err + cmd);
                    }

                    break;

                }
                case "b":
                {
                    if (cmd.length > 6 && cmd.substr(0, 4) == "back" && cmd[5] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd: "6",
                            index: parseInt(cmd.substr(5, cmd.length - 6))
                        });
                    }
                    else if (cmd.length > 11 && cmd.substr(0, 9) == "back-tree" && cmd[10] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd: "7",
                            index: parseInt(cmd.substr(10, cmd.length - 11))
                        });
                    }
                    else
                    {
                        return console.log(err + cmd);
                    }

                    break;

                }
                case "n":
                {
                    if (cmd.length > 6 && cmd.substr(0, 4) == "next" && cmd[5] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd: "f",
                            index: parseInt(cmd.substr(5, cmd.length - 6))
                        });
                    }
                    else if (cmd.length > 11 && cmd.substr(0, 9) == "next-tree" && cmd[10] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd: "g",
                            index: parseInt(cmd.substr(10, cmd.length - 11))
                        });
                    }
                    else
                    {
                        return console.log(err + cmd);
                    }

                    break;

                }
                case "l":
                {
                    if (cmd.length > 6 && cmd.substr(0, 4) == "last" && cmd[5] == "[" && cmd[cmd.length - 1] == "]")
                    {
                        ret.push(
                        {
                            cmd: "i",
                            index: parseInt(cmd.substr(5, cmd.length - 6))
                        });
                    }
                    else
                    {
                        return console.log(err + cmd);
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
                        return console.log(err + cmd);
                    }

                    break;

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
                    return console.log(tagName + ": The 'name' attribute is empty");
                }

                if (type == null || type == "")
                {
                    return console.log(tagName + ": The 'type' attribute is empty");
                }

                if (obj.childNodes.length > 0 && type != "object")
                {
                    return console.log(tagName + ": The 'type' must be 'object' than chields more one.");
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
                    return console.log(tagName + ": The 'name' attribute is empty");
                }

                if (value == null || value == "")
                {
                    return console.log(tagName + ": The 'value' attribute is empty");
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
    // Tree and Data

    // creating AVL tree
    createTree: function(comparer, isUniqure)
    {
        var tree = { root : null, isUniqure : isUniqure};

        // adding node to tree
        tree.add = function(obj)
        {
            if (this.root == null)
            {
                this.root = cool.createNode(obj, null, null);

                return;
            }

            var stack = [];
            var left = [];
            var cur = root;

            // adding
            while (true)
            {
                stack.push(cur);

                var cmp = comparer.compare(obj, cur);

                // left
                if (cmp < 0)
                {
                    if (cur.left == null)
                    {
                        cur.left = cool.createNode(obj, null, null);

                        break;
                    }
                    else
                    {
                        left.push(true);

                        cur = cur.left;
                    }
                }
                // right
                else if (cmp > 0)
                {
                    if (cur.right == null)
                    {
                        cur.right = cool.createNode(obj, null, null);

                        break;
                    }
                    else
                    {
                        left.push(false);

                        cur = cur.right;
                    }
                }
                // exist
                else
                {
                    if (this.isUniqure)
                    {
                        while (cur.next != null)
                        {
                            cur = cur.next;
                        }

                        cur.next = obj;
                    }

                    return;
                }
            }

            //balance
            for (var i = stack.length - 1; i >= 0; ++i)
            {
                var node = stack[i];

                if (left[i])
                {
                    node.balance--;
                }
                else
                {
                    node.balance++;
                }

                if (node.balance > 1)
                {
                    var rl = node.right.left;

                    if (node.right.balance < 0)
                    {
                        var rll = node.right.left.left;
                        var rlr = node.right.left.right;

                        if (this.root == node)
                        {
                            this.root = rl;
                        }
                        else
                        {
                            if (left[i])
                            {
                                stack[i - 1].left = rl;
                            }
                            else
                            {
                                stack[i - 1].right = rl;
                            }
                        }

                        if (rl.balance == 1)
                        {
                            node.balance = -1;
                            node.right.balance = 0;
                        }
                        else
                        {
                            node.balance = 0;
                            node.right.balance = 1;
                        }

                        rl.balance = 0;
                        rl.left = node;
                        rl.right = node.right;
                        node.right.left = rlr;
                        node.right = rll;
                    }
                    else
                    {
                        if (this.root == node)
                        {
                            this.root = node.right;
                        }
                        else
                        {
                            if (left[i])
                            {
                                stack[i - 1].left = node.right;
                            }
                            else
                            {
                                stack[i - 1].right = node.right;
                            }
                        }

                        node.balance = 0;
                        node.right.balance = 0;

                        node.right.left = node;
                        node.right = rl;
                    }

                    break;
                }
                else if (node.balance < -1)
                {
                    var lr = node.left.right;

                    if (node.left.balance < 0)
                    {
                        var lrr = node.left.right.right;
                        var lrl = node.left.right.left;

                        if (this.root == node)
                        {
                            this.root = lr;
                        }
                        else
                        {
                            if (left[i])
                            {
                                stack[i - 1].left = lr;
                            }
                            else
                            {
                                stack[i - 1].right = lr;
                            }
                        }

                        if (lr.balance == 1)
                        {
                            node.balance = -1;
                            node.left.balance = 0;
                        }
                        else
                        {
                            node.balance = 0;
                            node.left.balance = 1;
                        }

                        lr.balance = 0;
                        lr.right = node;
                        lr.left = node.left;
                        node.left.right = lrl;
                        node.left = lrr;
                    }
                    else
                    {
                        if (this.root == node)
                        {
                            this.root = node.left;
                        }
                        else
                        {
                            if (left[i])
                            {
                                stack[i - 1].left = node.left;
                            }
                            else
                            {
                                stack[i - 1].right = node.left;
                            }
                        }

                        node.balance = 0;
                        node.left.balance = 0;

                        node.left.right = node;
                        node.left = lr;
                    }

                    break;
                }
                else
                {
                    break;
                }
            }
        };

        // getting enumeration class
        tree.getEnum = function()
        {
            var obj =
            {
                t : this,
                cur : null,
                stack:[],
                next : function()
                {
                    if (this.cur == null)
                    {
                        this.cur = this.t.root;
                        this.stack.push(this.cur);

                        while (this.cur.left != null)
                        {
                            this.cur = this.cur.left;

                            this.stack.push(this.cur);
                        }
                    }
                    else
                    {
                        if (this.cur.right != null)
                        {
                            this.cur = this.cur.right;
                            this.stack.push(this.cur);

                            while (this.cur.left != null)
                            {
                                this.cur = this.cur.left;

                                this.stack.push(this.cur);
                            }
                        }
                        else
                        {
                            while (true)
                            {
                                this.cur = this.stack.pop();
                                var last = this.stack[this.stack.length - 1];

                                if (last.left == this.cur)
                                {
                                    this.cur = this.stack.pop();
                                    
                                    break;
                                }
                                else if (last == this.t.root)
                                {
                                    this.cur = null;

                                    break;
                                }
                            }
                        }
                    }

                    return this.cur;
                }
            };

            return obj;
        };
    },

    // 
    createNode: function(data, left, right)
    {
        return { data: data, left: left, right : right, balance : 0};
    },

    // clone object
    cloneObj: function(src)
    {
        var dst = {};

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

                    cool.applyFieldEx(src[p], dst[p]);
                }
                else
                {
                    dst[p] = src[p];
                }
            }
        }
    },

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // Helpers

    // split and insert
    splitAndInsert: function(arr, str)
    {
        var itm = arr[cool.outPos];
        var ind = itm.indexOf(str);
        var last = -1;
        var flug = false;

        if (itm == str)
        {
            cool.outPos++;

            return false;
        }

        if (ind == 0)
        {
            arr[cool.outPos++] = str;

            flug = true;
        }
        else if (ind > 0)
        {
            arr[cool.outPos++] = itm.substr(0, ind);
            arr.splice(cool.outPos++, 0, str);

            flug = true;
        }

        while (flug)
        {
            last = ind;
            ind = itm.indexOf(str, ind + 1);

            if (ind == -1)
            {
                break;
            }

            if (ind - last == 1)
            {
                arr.splice(cool.outPos++, 0, str);
            }
            else
            {
                arr.splice(cool.outPos++, 0, itm.substr(last + 1, ind - last - 1));
                arr.splice(cool.outPos++, 0, str);
            }
        }

        if (last > -1 && itm.length - last > 1)
        {
            arr.splice(cool.outPos++, 0, itm.substr(last + 1));

            flug = true;
        }

        return flug;
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
        var tmp = elm.querySelectorAll("js-set, js-query, js-load, js-page, js-if, js-ajax, js-several, js-event, js-style, js-attribute, [js-bind], [js-read], [js-write]");
        var code = elm.cooljs().hash;
        var ht = {}; 
        var i = 0;
        var itm = null;
        var name = "";

        ht[code] = elm;

        var arr = [];
        var atr = [];

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
                atr.push(
                {
                    itm: itm,
                    func: function()
                    {
                        cool.atrBind(this.itm, false, false);
                    }
                });
            }
            else if (itm.getAttribute("js-read") != null)
            {
                atr.push(
                {
                    itm: itm,
                    func: function()
                    {
                        cool.atrBind(this.itm, true, false);
                    }
                });
            }
            else if (itm.getAttribute("js-write") != null)
            {
                atr.push(
                {
                    itm: itm,
                    func: function()
                    {
                        cool.atrBind(this.itm, false, true);
                    }
                });
            }
        }

        // build tag tree
        for (i = arr.length - 1; i >= 0; --i)
        {
            itm = arr[i];

            var cur = itm.obj.parentNode;

            while (cur != null)
            {
                var tg = cur.tagName != null ? cur.tagName.toLowerCase() : "";

                if (tg == "js-query" || cur._cool == true)
                {
                    itm._cool = true;

                    break;
                }

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

        // build attributes
        var atr_run = [];

        for (i = 0; i < atr.length; ++i)
        {
            itm = atr[i].itm;

            while (itm.parentNode != null)
            {
                if (itm._cool != null)
                {
                    if (itm._cool != true && itm.tagName.toLowerCase() != "js-query")
                    {
                        atr_run.push(atr[i]);
                    }

                    break;
                }

                itm = itm.parentNode;
            }
        }

        // run init tags
        for (i = 0; i < arr.length; ++i)
        {
            itm = arr[i];

            cool.jsF[itm.name](itm.obj);
        }

        // run init atr's
        for (i = 0; i < atr_run.length; ++i)
        {
            itm = atr_run[i];

            itm.cooljs();
            itm.func();
        }

        delete ht;
        delete arr;
        delete tmp;
        delete atr;
        delete atr_run;
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
    if (this._cool == null || this._cool == true)
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