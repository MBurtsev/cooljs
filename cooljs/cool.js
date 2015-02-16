var cool =
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
            "js-page": cool.tagPage
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

    // js-ajax

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
                    });

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

            if (cool.obHt[itm.path] == null)
            {
                cool.obHt[itm.path] = itm;

                itm.list = [];
            }

            itm.list.push(obj);
        }

        obj.coolJs.conditional = con;
        obj.coolJs.last = null;

        var not = obj.getAttribute("not");

        if (not == null || not == "")
        {
            obj.coolJs.not = cool.buildSet("dom:style.display = 'none'");
        }
        else
        {
            obj.coolJs.not = cool.buildSet(not);
        }
        
        obj.coolJs.refresh = function(elm, path)
        {
            var flug = eval(elm.coolJs.conditional);

            if (flug != elm.coolJs.last)
            {
                elm.coolJs.not(elm);
            }
        };

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
        obj.send(data);

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
    // Helpers

    // init dom tree
    processElement : function(elm)
    {
        var arr = elm.querySelectorAll("js-if, js-load, js-page, js-ajax");
        var code = elm.cooljs().hash;
        var ht = {}; 
        var i = 0;
        var itm = null;
        
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

            var cur = itm.parentNode;

            while (cur != null)
            {
                if (cur.cool != null && ht[cur.cool.hash] != null)
                {
                    cur.cool.chields.push(itm);
                    itm.cool.parent = cur;

                    break;
                }

                cur = cur.parentNode;
            }
        }

        for (i = 0; i < arr.length; ++i)
        {
            itm = arr[i];
            var name = itm.tagName.toLowerCase();

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

    //
    changed : function(path)
    {
        if (cool.obHt[path] != null)
        {
            var ob = cool.obHt[path];

            for (var i = 0; i < ob.list.length; ++i)
            {
                var itm = ob.list[i];

                itm.coolJs.refresh(itm, path);
            }
        }
    },

    //
    refreshAll : function()
    {
        
    },

    // split string arr
    split: function(str, sep)
    {
        for (var i = 0; i < sep.length; ++i)
        {
           str =  str.split(sep[i]).join('▲');
        }

        var ret = [];
        var tmp = str.split('▲');

        for (var j = 0; j < tmp.length; ++j)
        {
            if (tmp[j] != "")
            {
                ret.push(tmp[j]);
            }
        }

        return ret;
    }
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

//cool.parseCon("map.hasFlug == true && map.age == some.getAge(wer - (web * 4) + 10) || arr[5] != 'test' || cash[n + 89] == ver.ss + 530");

/*

Проблема вложенных условий

- Каждое условие может иметь cancel экшен
- Если условие вложенное то оно должно вызвать внутри себя Cancel?
-- С одной стороны условие работает и не должно вызывать Cancel
-- С другой стороны родительское условие отменяет его действие
- Если предположить что дочерние условия будут вызывать свои Cancel то это будет иметь следующие последствия:
-- Не однозначность логики. Заключается в том что кодер должен был установить определенный атрибут именно в результате 
данного условия, и хотел бы что бы его вообще не касался экшен или отмена

Выход:
- Вложенные условия будут срабатывать только если их парент содержит свойство isActive
- Иначе они добавляют себя в список парента needList 
-- Э







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