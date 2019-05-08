var jsQueryTest =
{
    onlyFrom: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='user From jsQueryTest.users'>" +
                         "   <div>{{user.code}}</div><div>{{user.name}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        // raise action
        obj._cool.action({ initial: 0 });

        jsQueryTest.checkFrom(obj, "user", assert);

        h.checkData(jsQueryTest.createTestUserData(10), obj._cool.data, assert);

        jsQueryTest.checkGen(obj, obj._cool.data, ["code", "name"], assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete area._cool;
    },

    fromAndOrder: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='user From jsQueryTest.users Order !user.code'>" +
                         "   <div>{{user.code}}</div><div>{{user.name}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;
        
        // raise action
        obj._cool.action({initial : 0});

        jsQueryTest.checkFrom(obj, "user", assert);

        var tdata = jsQueryTest.createTestUserData(10).sort(function(a, b)
        {
            if (a.code > b.code)
            {
                return -1;
            }
            else if (a.code < b.code)
            {
                return 1;
            }

            return 0;
        });

        h.checkData(tdata, obj._cool.data, assert);

        jsQueryTest.checkGen(obj, obj._cool.data, ["code", "name"], assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete area._cool;
    },

    fromAndGroup: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='user From jsQueryTest.users Group user.group'>" +
                         "   <div>{{user.code}}</div><div>{{user.name}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];
        
        // raise action
        obj._cool.action({initial : 0});
                
        jsQueryTest.checkFrom(obj, "user", assert);

        var tdata = jsQueryTest.createTestUserData(10).slice(0, 3);
        
        h.checkData(tdata, obj._cool.data, assert);
        jsQueryTest.checkGen(obj, obj._cool.data, ["code", "name"], assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete area._cool;
    },

    fromAndWhereOnlyFirst: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='user From jsQueryTest.users Where user.code == 0'>" +
                         "   <div>{{user.code}}</div><div>{{user.name}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        // raise action
        obj._cool.action({initial : 0});

        jsQueryTest.checkFrom(obj, "user", assert);
        jsQueryTest.checkWhere(obj, assert);

        var tdata = jsQueryTest.createTestUserData(10).slice(0, 1);

        h.checkData(tdata, obj._cool.data, assert);
        jsQueryTest.checkGen(obj, obj._cool.data, ["code", "name"], assert);
        
        area.innerHTML = "";

        delete jsQueryTest.users;
        delete area._cool;
    },

    fromAndWhereOnlyLast: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='user From jsQueryTest.users Where user.code == 9'>" +
                         "   <div>{{user.code}}</div><div>{{user.name}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        // raise action
        obj._cool.action({initial : 0});

        jsQueryTest.checkFrom(obj, "user", assert);
        jsQueryTest.checkWhere(obj, assert);

        var tdata = jsQueryTest.createTestUserData(10).slice(9);

        h.checkData(tdata, obj._cool.data, assert);
        jsQueryTest.checkGen(obj, obj._cool.data, ["code", "name"], assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete area._cool;
    },

    fromOrderGroup: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='user From jsQueryTest.users  Order !user.code Group user.group'>" +
                         "   <div>{{user.code}}</div><div>{{user.name}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        // raise action
        obj._cool.action({ initial: 0 });

        jsQueryTest.checkFrom(obj, "user", assert);
        
        var tdata = jsQueryTest.createTestUserData(10).slice(0, 3).sort(function (a, b)
        {
            if (a.code > b.code)
            {
                return -1;
            }
            else if (a.code < b.code)
            {
                return 1;
            }

            return 0;
        });

        h.checkData(tdata, obj._cool.data, assert);
        jsQueryTest.checkGen(obj, obj._cool.data, ["code", "name"], assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete area._cool;
    },

    fromWhereOrderGroup: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='user From jsQueryTest.users Where user.code != 0 Order !user.code Group user.group'>" +
                         "   <div>{{user.code}}</div><div>{{user.name}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        // raise action
        obj._cool.action({initial : 0});

        jsQueryTest.checkFrom(obj, "user", assert);
        jsQueryTest.checkWhere(obj, assert);

        var tdata = jsQueryTest.createTestUserData(10).slice(1, 4).sort(function (a, b)
        {
            if (a.code > b.code)
            {
                return -1;
            }
            else if (a.code < b.code)
            {
                return 1;
            }

            return 0;
        });

        h.checkData(tdata, obj._cool.data, assert);
        jsQueryTest.checkGen(obj, obj._cool.data, ["code", "name"], assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete area._cool;
    },

    fromWhereExist: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);
        jsQueryTest.profiles = [0, 1, 2, 3, 4];

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='user From jsQueryTest.users Where cool.exist(user.code, jsQueryTest.profiles)'>" +
                         "   <div>{{user.code}}</div><div>{{user.name}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        // raise action
        obj._cool.action({initial : 0});
        
        jsQueryTest.checkFrom(obj, "user", assert);
        jsQueryTest.checkWhere(obj, assert);

        var tdata = jsQueryTest.createTestUserData(10).slice(0, 5);

        h.checkData(tdata, obj._cool.data, assert);
        jsQueryTest.checkGen(obj, obj._cool.data, ["code", "name"], assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete jsQueryTest.profiles;
        delete area._cool;
    },

    fromWhereNotExist: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);
        jsQueryTest.profiles = jsQueryTest.createTestProfileData(15).slice(5, 15);

        var area = document.querySelector("#testArea");
        
        area.innerHTML = "<js-query select='user From jsQueryTest.users Where !cool.exist(user.code, jsQueryTest.profiles, \"user\" )'>" +
                         "   <div>{{user.code}}</div><div>{{user.name}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        // raise action
        obj._cool.action({initial : 0});
        
        jsQueryTest.checkFrom(obj, "user", assert);
        jsQueryTest.checkWhere(obj, assert);

        var tdata = jsQueryTest.createTestUserData(10).slice(0, 5);

        h.checkData(tdata, obj._cool.data, assert);
        jsQueryTest.checkGen(obj, obj._cool.data, ["code", "name"], assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete jsQueryTest.profiles;
        delete area._cool;
    },


    fromJoin: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);
        jsQueryTest.profiles = jsQueryTest.createTestProfileData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='item.user From jsQueryTest.users Join jsQueryTest.profiles As profile On profile.user == user.code'>" +
                         "   <div>{{item.user.code}}</div><div>{{item.user.name}}</div><div>{{item.profile.money}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        // raise action
        obj._cool.action({initial : 0});

        jsQueryTest.checkFrom(obj, "item", assert);

        var tdata = [];

        var u = jsQueryTest.createTestUserData(10);
        var p = jsQueryTest.createTestProfileData(10);

        for (var i = 0; i < u.length; ++i)
        {
            tdata.push({ user: u[i], profile: p[i] });
        }

        h.checkData(tdata, obj._cool.data, assert);
        jsQueryTest.checkGen(obj, obj._cool.data, ["user.code", "user.name", "profile.money"], assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete jsQueryTest.profiles;
        delete area._cool;
    },

    fromJoinWhere: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);
        jsQueryTest.profiles = jsQueryTest.createTestProfileData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='item.user From jsQueryTest.users Join jsQueryTest.profiles As profile On profile.user == user.code Where user.code != 0'>" +
                         "   <div>{{item.user.code}}</div><div>{{item.user.name}}</div><div>{{item.profile.money}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        // raise action
        obj._cool.action({initial : 0});

        jsQueryTest.checkFrom(obj, "item", assert);
        jsQueryTest.checkWhere(obj, assert);

        var tdata = [];

        var u = jsQueryTest.createTestUserData(10).slice(1, 10);
        var p = jsQueryTest.createTestProfileData(10).slice(1, 10);

        for (var i = 0; i < u.length; ++i)
        {
            tdata.push({ user: u[i], profile: p[i] });
        }

        h.checkData(tdata, obj._cool.data, assert);
        jsQueryTest.checkGen(obj, obj._cool.data, ["user.code", "user.name", "profile.money"], assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete jsQueryTest.profiles;
        delete area._cool;
    },

    fromJoinGroup: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);
        jsQueryTest.profiles = jsQueryTest.createTestProfileData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='item.user From jsQueryTest.users Join jsQueryTest.profiles As profile On profile.user == user.code Group user.group'>" +
                         "   <div>{{item.user.code}}</div><div>{{item.user.name}}</div><div>{{item.profile.money}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        // raise action
        obj._cool.action({ initial: 0 });

        jsQueryTest.checkFrom(obj, "item", assert);
        
        var tdata = [];

        var u = jsQueryTest.createTestUserData(10).slice(0, 3);
        var p = jsQueryTest.createTestProfileData(10).slice(0, 3);

        for (var i = 0; i < u.length; ++i)
        {
            tdata.push({ user: u[i], profile: p[i] });
        }

        h.checkData(tdata, obj._cool.data, assert);
        jsQueryTest.checkGen(obj, obj._cool.data, ["user.code", "user.name", "profile.money"], assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete jsQueryTest.profiles;
        delete area._cool;
    },

    fromJoinOrder: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);
        jsQueryTest.profiles = jsQueryTest.createTestProfileData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='item.user From jsQueryTest.users Join jsQueryTest.profiles As profile On profile.user == user.code Order !user.code'>" +
                         "   <div>{{item.user.code}}</div><div>{{item.user.name}}</div><div>{{item.profile.money}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        // raise action
        obj._cool.action({initial : 0});

        jsQueryTest.checkFrom(obj, "item", assert);

        var tdata = [];

        var u = jsQueryTest.createTestUserData(10).sort(function (a, b)
        {
            if (a.code > b.code)
            {
                return -1;
            }
            else if (a.code < b.code)
            {
                return 1;
            }

            return 0;
        });
        var p = jsQueryTest.createTestProfileData(10).sort(function (a, b)
        {
            if (a.code > b.code)
            {
                return -1;
            }
            else if (a.code < b.code)
            {
                return 1;
            }

            return 0;
        });

        for (var i = 0; i < u.length; ++i)
        {
            tdata.push({ user: u[i], profile: p[i] });
        }

        h.checkData(tdata, obj._cool.data, assert);
        jsQueryTest.checkGen(obj, obj._cool.data, ["user.code", "user.name", "profile.money"], assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete jsQueryTest.profiles;
        delete area._cool;
    },

    fromJoinOrderGroup: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);
        jsQueryTest.profiles = jsQueryTest.createTestProfileData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='item.user From jsQueryTest.users Join jsQueryTest.profiles As profile On profile.user == user.code Order !user.code Group user.group'>" +
                         "   <div>{{item.user.code}}</div><div>{{item.user.name}}</div><div>{{item.profile.money}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        // raise action
        obj._cool.action({initial : 0});

        jsQueryTest.checkFrom(obj, "item", assert);

        var tdata = [];

        var u = jsQueryTest.createTestUserData(10).slice(0, 3).sort(function (a, b)
        {
            if (a.code > b.code)
            {
                return -1;
            }
            else if (a.code < b.code)
            {
                return 1;
            }

            return 0;
        });
        var p = jsQueryTest.createTestProfileData(10).slice(0, 3).sort(function (a, b)
        {
            if (a.code > b.code)
            {
                return -1;
            }
            else if (a.code < b.code)
            {
                return 1;
            }

            return 0;
        });

        for (var i = 0; i < u.length; ++i)
        {
            tdata.push({ user: u[i], profile: p[i] });
        }

        h.checkData(tdata, obj._cool.data, assert);
        jsQueryTest.checkGen(obj, obj._cool.data, ["user.code", "user.name", "profile.money"], assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete jsQueryTest.profiles;
        delete area._cool;
    },

    fromJoinWhereGroup: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);
        jsQueryTest.profiles = jsQueryTest.createTestProfileData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='item.user From jsQueryTest.users Join jsQueryTest.profiles As profile On profile.user == user.code Where user.code != 0 Group user.group'>" +
                         "   <div>{{item.user.code}}</div><div>{{item.user.name}}</div><div>{{item.profile.money}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        // raise action
        obj._cool.action({initial : 0});
        
        jsQueryTest.checkFrom(obj, "item", assert);
        jsQueryTest.checkWhere(obj, assert);

        var tdata = [];

        var u = jsQueryTest.createTestUserData(10).slice(1, 4);
        var p = jsQueryTest.createTestProfileData(10).slice(1, 4);

        for (var i = 0; i < u.length; ++i)
        {
            tdata.push({ user: u[i], profile: p[i] });
        }

        h.checkData(tdata, obj._cool.data, assert);
        jsQueryTest.checkGen(obj, obj._cool.data, ["user.code", "user.name", "profile.money"], assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete jsQueryTest.profiles;
        delete area._cool;
    },

    fromJoinWhereOrder: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);
        jsQueryTest.profiles = jsQueryTest.createTestProfileData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='item.user From jsQueryTest.users Join jsQueryTest.profiles As profile On profile.user == user.code Where user.code != 0 Order !user.code'>" +
                         "   <div>{{item.user.code}}</div><div>{{item.user.name}}</div><div>{{item.profile.money}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        // raise action
        obj._cool.action({initial : 0});
        
        jsQueryTest.checkFrom(obj, "item", assert);
        jsQueryTest.checkWhere(obj, assert);

        var tdata = [];

        var u = jsQueryTest.createTestUserData(10).slice(1, 10).sort(function (a, b)
        {
            if (a.code > b.code)
            {
                return -1;
            }
            else if (a.code < b.code)
            {
                return 1;
            }

            return 0;
        });
        var p = jsQueryTest.createTestProfileData(10).slice(1, 10).sort(function (a, b)
        {
            if (a.code > b.code)
            {
                return -1;
            }
            else if (a.code < b.code)
            {
                return 1;
            }

            return 0;
        });

        for (var i = 0; i < u.length; ++i)
        {
            tdata.push({ user: u[i], profile: p[i] });
        }

        h.checkData(tdata, obj._cool.data, assert);
        jsQueryTest.checkGen(obj, obj._cool.data, ["user.code", "user.name", "profile.money"], assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete jsQueryTest.profiles;
        delete area._cool;
    },

    fromJoinWhereOrderGroup: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);
        jsQueryTest.profiles = jsQueryTest.createTestProfileData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='item.user From jsQueryTest.users Join jsQueryTest.profiles As profile On profile.user == user.code Where user.code != 0 Order !user.code Group user.group'>" +
                         "   <div>{{item.user.code}}</div><div>{{item.user.name}}</div><div>{{item.profile.money}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        // raise action
        obj._cool.action({initial : 0});

        jsQueryTest.checkFrom(obj, "item", assert);
        jsQueryTest.checkWhere(obj, assert);

        var tdata = [];

        var u = jsQueryTest.createTestUserData(10).slice(1, 4).sort(function (a, b)
        {
            if (a.code > b.code)
            {
                return -1;
            }
            else if (a.code < b.code)
            {
                return 1;
            }

            return 0;
        });
        var p = jsQueryTest.createTestProfileData(10).slice(1, 4).sort(function (a, b)
        {
            if (a.code > b.code)
            {
                return -1;
            }
            else if (a.code < b.code)
            {
                return 1;
            }

            return 0;
        });

        for (var i = 0; i < u.length; ++i)
        {
            tdata.push({ user: u[i], profile: p[i] });
        }

        h.checkData(tdata, obj._cool.data, assert);
        jsQueryTest.checkGen(obj, obj._cool.data, ["user.code", "user.name", "profile.money"], assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete jsQueryTest.profiles;
        delete area._cool;
    },

    fromJoinNotEqual: function (assert)
    {
        var l = 10;

        jsQueryTest.users = jsQueryTest.createTestUserData(l);
        jsQueryTest.profiles = jsQueryTest.createTestProfileData(l);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='item.user From jsQueryTest.users Join jsQueryTest.profiles As profile On profile.user > user.code Order !user.code, !profile.code'>" +
                         "   <div>{{item.user.code}}</div><div>{{item.user.name}}</div><div>{{item.profile.money}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        // raise action
        obj._cool.action({initial : 0});

        jsQueryTest.checkFrom(obj, "item", assert);

        var tdata = [];

        var u = jsQueryTest.createTestUserData(l);
        var p = jsQueryTest.createTestProfileData(l);

        for (var j = 0; j < p.length; ++j)
        {
            for (var i = 0; i < u.length; ++i)
            {
                if (p[j].user > u[i].code)
                {
                    tdata.push({ user: u[i], profile: p[j] });
                }
            }
        }

        tdata = tdata.sort(function (a, b)
        {
            var c0 = 0;

            if (a.user.code > b.user.code)
            {
                c0 = -1;
            }
            else if (a.user.code < b.user.code)
            {
                c0 = 1;
            }

            var c1 = 0;

            if (a.profile.code > b.profile.code)
            {
                c1 = -1;
            }
            else if (a.profile.code < b.profile.code)
            {
                c1 = 1;
            }

            return (c0 << 1) + c1;
        });

        // full data check impossible
        h.checkData(tdata, obj._cool.data, assert);
        jsQueryTest.checkGen(obj, obj._cool.data, ["user.code", "user.name", "profile.money"], assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete jsQueryTest.profiles;
        delete area._cool;
    },
    
    fromJoinJoin: function (assert)
    {
        jsQueryTest.users = jsQueryTest.createTestUserData(10);
        jsQueryTest.profiles = jsQueryTest.createTestProfileData(10);
        jsQueryTest.files = jsQueryTest.createTestFileData(10);

        var area = document.querySelector("#testArea");

        area.innerHTML = "<js-query select='item.user From jsQueryTest.users Join jsQueryTest.profiles As profile On profile.user == user.code Join jsQueryTest.files As file On file.user == user.code'>" +
                         "   <div>{{item.user.code}}</div><div>{{item.user.name}}</div><div>{{item.profile.money}}</div><div>{{item.file.name}}</div>" +
                         "</js-query>";

        cool.processElement(area);

        assert.ok(area.childNodes.length == 1, "Chield count");

        var obj = area.childNodes[0];;

        // raise action
        obj._cool.action({initial : 0});

        jsQueryTest.checkFrom(obj, "item", assert);

        var tdata = [];

        var u = jsQueryTest.createTestUserData(10);
        var p = jsQueryTest.createTestProfileData(10);
        var f = jsQueryTest.createTestFileData(10);

        for (var i = 0; i < u.length; ++i)
        {
            tdata.push({ user: u[i], profile: p[i], file: f[i] });
        }

        h.checkData(tdata, obj._cool.data, assert);
        jsQueryTest.checkGen(obj, obj._cool.data, ["user.code", "user.name", "profile.money", "file.name"], assert);

        area.innerHTML = "";

        delete jsQueryTest.users;
        delete jsQueryTest.profiles;
        delete jsQueryTest.files;
        delete area._cool;
    },


    // check From operator
    checkFrom: function (obj, rootVar, assert)
    {
        initTest.check(obj, assert);

        if (obj == null)
        {
            assert.ok(false, "Getting element fail");

            return;
        }

        // check query init
        assert.ok(obj._cool.refresh != null, "Observe function defined");
        assert.ok(obj._cool.prog != null, "Query program defined");
        assert.ok(obj._cool.prog.from != null, "From operator defined");

        // main field
        fieldTest.check(obj._cool.prog.from.field, assert);

        // root var
        assert.ok(obj._cool.prog.root == rootVar, "Root var fine");
    },

    // check Where operator
    checkWhere: function (obj, assert)
    {
        // check query init
        assert.ok(obj._cool.prog.where != null, "From operator defined");

        // where conditional field
        fieldTest.check(obj._cool.prog.where.fieldCond != null, assert);

        // root var
        assert.ok(typeof document[obj._cool.prog.where.condFuncName] == "function", "Function for where conditional created.");
    },

    // creating users data
    createTestUserData : function(count)
    {
        var arr = [];

        for (var i = 0; i < count; ++i)
        {
            arr.push({ code: i, name: "name-" + i, group: i % 3 });
        }

        return arr;
    },

    // creating users profile data
    createTestProfileData: function (count)
    {
        var arr = [];

        for (var i = 0; i < count; ++i)
        {
            arr.push({ code: i + 44, user: i, money : 100 * i });
        }

        return arr;
    },

    // creating users files data
    createTestFileData: function (count)
    {
        var arr = [];

        for (var i = 0; i < count; ++i)
        {
            arr.push({ code: i + 133, user: i, name: "file_" + (111 * i) + ".jpg" });
        }

        return arr;
    },

    // check DOM elements generations
    checkGen: function(obj, data, map, assert)
    {
        var arr = obj.querySelectorAll("div");
        var ind = 0;

        for (var i = 0; i < data.length; ++i)
        {
            for (var j = 0; j < map.length; ++j)
            {
                var v1;

                eval("v1 = data[i]." + map[j]);

                if (arr[ind].innerHTML != v1.toString())
                {
                    assert.ok(false, "Template fill fail. div has value of " + map[j] + ": " + arr[ind].innerHTML + ", must be: " + v1);

                    return;
                }

                ind++;
            }
        }

        assert.ok(true, "Template fill done.");
    }
};

QUnit.module("js-query");

QUnit.test("Only From", jsQueryTest.onlyFrom);
QUnit.test("Where code == first", jsQueryTest.fromAndWhereOnlyFirst);
QUnit.test("Where code == last", jsQueryTest.fromAndWhereOnlyLast);
QUnit.test("Order", jsQueryTest.fromAndOrder);
QUnit.test("Group", jsQueryTest.fromAndGroup);
QUnit.test("From Order Group", jsQueryTest.fromOrderGroup);
QUnit.test("From Where Order Group", jsQueryTest.fromWhereOrderGroup);
QUnit.test("From Where Exist", jsQueryTest.fromWhereExist);
QUnit.test("From Where Not Exist and property path", jsQueryTest.fromWhereNotExist);

QUnit.test("From Join", jsQueryTest.fromJoin);
QUnit.test("From Join Where", jsQueryTest.fromJoinWhere);
QUnit.test("From Join Group", jsQueryTest.fromJoinGroup);
QUnit.test("From Join Order", jsQueryTest.fromJoinOrder);
QUnit.test("From Join Order Group", jsQueryTest.fromJoinOrderGroup);
QUnit.test("From Join Where Group", jsQueryTest.fromJoinWhereGroup);
QUnit.test("From Join Where Order", jsQueryTest.fromJoinWhereOrder);
QUnit.test("From Join Where Order Group", jsQueryTest.fromJoinWhereOrderGroup);
QUnit.test("From Join not equal conditional", jsQueryTest.fromJoinNotEqual);

QUnit.test("From Join Join", jsQueryTest.fromJoinJoin);



